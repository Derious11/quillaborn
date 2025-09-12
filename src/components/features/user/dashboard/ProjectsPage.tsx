// src/app/projects/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type Project = {
  id: string;
  slug: string;
  name: string;
  description?: string;
  summary?: string;
  archived?: boolean;
  created_at?: string;
};

type ProjectIdRow = {
  project_id: string;
};

export default function ProjectsPage() {
  const { supabase } = useSupabase();
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [membersByProject, setMembersByProject] = useState<Record<string, { id: string; name: string; avatar_key?: string; role?: string }[]>>({});

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);

      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Use RPC to get user’s project IDs
      const { data: ids } = await supabase.rpc("get_user_project_ids", {
        p_user: user.id,
      });

      if (!ids || ids.length === 0) {
        setActiveProjects([]);
        setArchivedProjects([]);
        setLoading(false);
        return;
      }

      // Explicitly type ids so r: ProjectIdRow
      const projectIds = (ids as ProjectIdRow[]).map((r) => r.project_id);

      // Fetch projects
      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .in("id", projectIds)
        .order("created_at", { ascending: false });

      const active = (projectData || []).filter((p) => !p.archived);
      const archived = (projectData || []).filter((p) => p.archived);

      setActiveProjects(active);
      setArchivedProjects(archived);

      // Fetch project members and their profiles to display avatars on cards
      const { data: membersRaw } = await supabase
        .from("project_members")
        .select("project_id, user_id, role")
        .in("project_id", projectIds);

      const userIds = Array.from(new Set((membersRaw || []).map((m) => m.user_id)));
      let profiles: { id: string; display_name?: string; username?: string; avatar_key?: string }[] = [];
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, display_name, username, avatar_key")
          .in("id", userIds);
        profiles = profs || [];
      }

      const map: Record<string, { id: string; name: string; avatar_key?: string; role?: string }[]> = {};
      (membersRaw || []).forEach((m) => {
        const profile = profiles.find((p) => p.id === m.user_id);
        const member = {
          id: m.user_id as string,
          name: (profile?.display_name || profile?.username || "Unknown") as string,
          avatar_key: profile?.avatar_key,
          role: m.role as string | undefined,
        };
        if (!map[m.project_id]) map[m.project_id] = [];
        map[m.project_id].push(member);
      });
      setMembersByProject(map);
      setLoading(false);
    }

    fetchProjects();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (
    (!activeProjects || activeProjects.length === 0) &&
    (!archivedProjects || archivedProjects.length === 0)
  ) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
        <p className="text-muted-foreground">No projects yet</p>
        <Link href="/projects/new">
          <Button className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-gray-900">
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Projects</h1>
        <Link href="/projects/new">
          <Button className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-gray-900">
            <Plus className="h-4 w-4" />
            Create Project
          </Button>
        </Link>
      </div>
      {/* Active Projects */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Active Projects</h2>
        {activeProjects.length === 0 ? (
          <div className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-md px-3 py-2">
            <p className="text-muted-foreground">No active projects</p>
            <Link href="/projects/new">
              <Button size="sm" className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-gray-900">
                <Plus className="h-4 w-4" />
                New
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeProjects.map((project) => (
              <Link key={project.id} href={`/p/${project.slug}`}>
                <Card className="relative overflow-hidden rounded-2xl border border-gray-700 bg-gradient-to-br from-green-500/15 via-slate-900 to-emerald-700/20 hover:from-green-500/20 transition-colors cursor-pointer shadow-lg">
                  <CardContent className="p-5 sm:p-6 h-40">
                    <div className="absolute top-4 right-4 flex items-center gap-3">
                      {/* Single lead avatar with double ring */}
                      {(() => {
                        const lead = (membersByProject[project.id] || [])[0];
                        const src = lead?.avatar_key && lead.avatar_key.trim().length > 0
                          ? `/avatars/presets/${lead.avatar_key}`
                          : "/avatars/presets/qb-avatar-00-quill.svg";
                        return (
                          <div className="rounded-full p-1.5 bg-green-500/40">
                            <div className="rounded-full p-0.5 bg-gray-900">
                              <Image
                                src={src}
                                alt={lead?.name || "Member"}
                                width={36}
                                height={36}
                                className="rounded-full border-2 border-green-300 shadow"
                              />
                            </div>
                          </div>
                        );
                      })()}
                      <span className="px-4 py-1.5 bg-green-500 hover:bg-green-600 text-gray-900 font-semibold text-sm rounded-full">
                        + Invite
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-6">
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{project.name}</h3>
                      <p className="text-sm sm:text-base text-gray-300">
                        {project.summary || project.description || "No description"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Archived Projects */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Archived Projects</h2>
        {archivedProjects.length === 0 ? (
          <p className="text-muted-foreground">No archived projects</p>
        ) : (
          <div className="space-y-3">
            {archivedProjects.map((project) => (
              <Card
                key={project.id}
                className="relative overflow-hidden rounded-2xl border border-gray-700 bg-gradient-to-br from-green-500/10 via-slate-900 to-emerald-700/10 hover:from-green-500/15 transition-colors"
              >
                <CardContent className="p-5 sm:p-6 h-36">
                  <div className="absolute top-4 right-4 flex items-center gap-3 opacity-80">
                    {(() => {
                      const lead = (membersByProject[project.id] || [])[0];
                      const src = lead?.avatar_key && lead.avatar_key.trim().length > 0
                        ? `/avatars/presets/${lead.avatar_key}`
                        : "/avatars/presets/qb-avatar-00-quill.svg";
                      return (
                        <div className="rounded-full p-1.5 bg-green-500/30">
                          <div className="rounded-full p-0.5 bg-gray-900">
                            <Image
                              src={src}
                              alt={lead?.name || "Member"}
                              width={32}
                              height={32}
                              className="rounded-full border-2 border-green-300 shadow"
                            />
                          </div>
                        </div>
                      );
                    })()}
                    <span className="px-4 py-1.5 bg-green-500/80 text-gray-900 font-semibold text-sm rounded-full">
                      + Invite
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-6">
                    <h3 className="text-xl font-extrabold text-white">{project.name}</h3>
                    <p className="text-sm text-gray-300">
                      {project.summary || project.description || "No description"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
