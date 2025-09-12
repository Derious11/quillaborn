"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableItem from "./SortableItem";
import Droppable from "./Droppable";
import CardDetailsModal from "./CardDetailsModal";

type BoardList = {
  id: string;
  name: string;
  position: number;
  cards: CardItem[];
};

type CardItem = {
  id: string;
  title: string;
  description?: string;
  created_by: string;
  board_list_id: string;
  position: number;
};

function computeNewPosition(cards: CardItem[], destIndex: number): number {
  if (cards.length === 0) return 100;
  if (destIndex === 0) return cards[0].position / 2;
  if (destIndex >= cards.length) return cards[cards.length - 1].position + 100;
  const prev = cards[destIndex - 1].position;
  const next = cards[destIndex].position;
  return (prev + next) / 2;
}

export default function Board() {
  const { supabase } = useSupabase();
  const { slug } = useParams<{ slug: string }>();

  const [lists, setLists] = useState<BoardList[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [activeList, setActiveList] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } })
  );

  const listIds = useMemo(() => new Set(lists.map((l) => l.id)), [lists]);

  useEffect(() => {
    async function fetchListsAndCards() {
      setLoading(true);

      const { data: project } = await supabase
        .from("projects")
        .select("id")
        .eq("slug", slug)
        .single();
      if (!project) return setLoading(false);

      const { data: board } = await supabase
        .from("boards")
        .select("id")
        .eq("project_id", project.id)
        .eq("is_default", true)
        .single();
      if (!board) return setLoading(false);

      const { data: listData } = await supabase
        .from("board_lists")
        .select("id, name, position")
        .eq("board_id", board.id)
        .order("position");

      const listsWithCards: BoardList[] = [];
      for (const list of listData || []) {
        const { data: cardData } = await supabase
          .from("cards")
          .select("id, title, description, created_by, board_list_id, position")
          .eq("board_list_id", list.id)
          .order("position");

        listsWithCards.push({ ...list, cards: cardData || [] });
      }

      setLists(listsWithCards);
      setLoading(false);
    }

    if (slug) fetchListsAndCards();
  }, [supabase, slug]);

  function findCardLocation(cardId: string): { listIndex: number; cardIndex: number } | null {
    for (let li = 0; li < lists.length; li++) {
      const ci = lists[li].cards.findIndex((c) => c.id === cardId);
      if (ci !== -1) return { listIndex: li, cardIndex: ci };
    }
    return null;
  }

  function getCardById(cardId: string | null): CardItem | null {
    if (!cardId) return null;
    for (const l of lists) {
      const c = l.cards.find((x) => x.id === cardId);
      if (c) return c;
    }
    return null;
  }

  async function handleAddCard(listId: string) {
    if (!newCardTitle.trim()) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const targetList = lists.find((l) => l.id === listId);

    if (!targetList) {
      console.error("Target list not found:", listId);
      return;
    }
    const nextPos =
      targetList.cards.length > 0
        ? targetList.cards[targetList.cards.length - 1].position + 100
        : 100;

    await supabase.from("cards").insert([
      {
        board_list_id: listId,
        title: newCardTitle,
        created_by: user?.id,
        position: nextPos,
      },
    ]);

    setNewCardTitle("");
    setActiveList(null);

    const { data: cardData } = await supabase
      .from("cards")
      .select("id, title, description, created_by, board_list_id, position")
      .eq("board_list_id", listId)
      .order("position");

    setLists((prev) =>
      prev.map((l) => (l.id === listId ? { ...l, cards: cardData || [] } : l))
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveCardId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const sourceLoc = findCardLocation(activeId);
    if (!sourceLoc) return;

    let destListIndex = -1;
    let destIndex = -1;

    if (listIds.has(overId)) {
      destListIndex = lists.findIndex((l) => l.id === overId);
      destIndex = lists[destListIndex].cards.length;
    } else {
      lists.forEach((l, li) => {
        const ci = l.cards.findIndex((c) => c.id === overId);
        if (ci !== -1) {
          destListIndex = li;
          destIndex = ci;
        }
      });
    }
    if (destListIndex === -1) return;

    const { listIndex: sourceListIndex, cardIndex: sourceCardIndex } = sourceLoc;
    if (sourceListIndex === destListIndex && sourceCardIndex === destIndex) return;

    let insertIndex = destIndex;
    if (sourceListIndex === destListIndex && sourceCardIndex < destIndex) insertIndex -= 1;

    setLists((prev) => {
      const next = prev.map((l) => ({ ...l, cards: [...l.cards] }));
      const [moved] = next[sourceListIndex].cards.splice(sourceCardIndex, 1);
      next[destListIndex].cards.splice(insertIndex, 0, { ...moved, board_list_id: next[destListIndex].id });
      return next;
    });
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) {
      setActiveCardId(null);
      return;
    }

    const activeCardId = String(active.id);
    const overId = String(over.id);

    let sourceListIndex = -1;
    let sourceCardIndex = -1;

    lists.forEach((list, li) => {
      const ci = list.cards.findIndex((c) => c.id === activeCardId);
      if (ci !== -1) {
        sourceListIndex = li;
        sourceCardIndex = ci;
      }
    });
    if (sourceListIndex === -1) {
      setActiveCardId(null);
      return;
    }

    let destListIndex = -1;
    let destIndex = -1;

    if (listIds.has(overId)) {
      destListIndex = lists.findIndex((l) => l.id === overId);
      destIndex = lists[destListIndex].cards.length;
    } else {
      lists.forEach((list, li) => {
        const ci = list.cards.findIndex((c) => c.id === overId);
        if (ci !== -1) {
          destListIndex = li;
          destIndex = ci;
        }
      });
    }
    if (destListIndex === -1) {
      setActiveCardId(null);
      return;
    }

    const source = lists[sourceListIndex];
    const dest = lists[destListIndex];

    if (
      sourceListIndex === destListIndex &&
      sourceCardIndex !== -1 &&
      sourceCardIndex < destIndex
    ) {
      destIndex -= 1;
    }
    const [moved] = source.cards.splice(sourceCardIndex, 1);

    const newPos = computeNewPosition(dest.cards, destIndex);
    const updatedCard: CardItem = {
      ...moved,
      board_list_id: dest.id,
      position: newPos,
    };
    dest.cards.splice(destIndex, 0, updatedCard);

    setLists((prev) =>
      prev.map((l, i) =>
        i === sourceListIndex
          ? { ...l, cards: source.cards }
          : i === destListIndex
          ? { ...l, cards: dest.cards }
          : l
      )
    );

    await supabase
      .from("cards")
      .update({ board_list_id: dest.id, position: newPos })
      .eq("id", moved.id);

    setActiveCardId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-green-400" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className="
            flex gap-6 overflow-x-auto
            flex-col sm:flex-row sm:flex-nowrap
            scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900
          "
        >
          {lists.map((list) => (
            <div key={list.id} className="w-full sm:w-72 flex-shrink-0">
              <Card className="bg-gray-900 border border-gray-700 rounded-2xl shadow-lg">
                <CardContent className="p-5">
                  <h3 className="text-lg font-bold text-green-400 mb-4">
                    {list.name}
                  </h3>

                  <SortableContext
                    items={list.cards.map((c) => c.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <Droppable className="space-y-3 min-h-[60px]" id={list.id}>
                      {list.cards.length === 0 && (
                        <p className="text-sm text-gray-400 italic">
                          No cards in this list
                        </p>
                      )}
                      {list.cards.map((card) => (
                        <SortableItem key={card.id} id={card.id}>
                          <div
                            className="bg-gray-800 border border-gray-700 rounded-xl p-3 shadow hover:shadow-green-400/30 transition cursor-pointer touch-none select-none"
                            draggable={false}
                            onClick={() => setSelectedCard(card.id)}
                          >
                            <p className="font-medium text-white">
                              {card.title}
                            </p>
                            {card.description && (
                              <p className="text-xs text-gray-400 mt-1">
                                {card.description}
                              </p>
                            )}
                          </div>
                        </SortableItem>
                      ))}
                    </Droppable>
                  </SortableContext>

                  {activeList === list.id ? (
                    <div className="mt-4 flex gap-2">
                      <Input
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        placeholder="New card title"
                        className="bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                      />
                      <Button
                        size="icon"
                        onClick={() => handleAddCard(list.id)}
                        disabled={!newCardTitle.trim()}
                        className="bg-green-500 hover:bg-green-600 text-gray-900 rounded-full"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4 w-full border-gray-700 text-gray-300 hover:text-green-400 hover:border-green-400 rounded-full"
                      onClick={() => setActiveList(list.id)}
                    >
                      + Add Card
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {(() => {
            const card = getCardById(activeCardId);
            if (!card) return null;
            return (
              <div className="bg-gray-800 border border-green-400/60 rounded-xl p-3 shadow-xl cursor-grabbing opacity-95">
                <p className="font-medium text-white">{card.title}</p>
                {card.description && (
                  <p className="text-xs text-gray-300 mt-1">{card.description}</p>
                )}
              </div>
            );
          })()}
        </DragOverlay>
      </DndContext>

      <CardDetailsModal
        cardId={selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </div>
  );
}
