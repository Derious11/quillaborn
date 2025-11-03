"use client";

import { useEffect, useState, useRef } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileDropZone } from "@/components/projects/FileDropZone";
import { Modal } from "@/components/ui/modal";
import type { TablesInsert } from "@/types/database";

// ---------------------------
// Type definitions
// ---------------------------
interface ProjectFile {
  id: string;
  path: string;
  size_bytes: number;
  mime: string;
  created_at: string;
  updated_at?: string;
  file_name?: string;
  file_type?: string;
  file_category?: string;
  description?: string;
  tags?: string[];
  version?: number;
  visibility?: string;
  uploader: { username?: string | null; display_name?: string | null } | null;
}

// ---------------------------
// Category configuration
// ---------------------------
const CATEGORY_OPTIONS = [
  "Concept Art",
  "Character Design",
  "Environment Design",
  "Storyboards",
  "Script / Draft",
  "Lore / Notes",
  "Reference Material",
  "Final Artwork",
  "Cover / Poster",
  "Audio / Voice",
  "Video / Animation",
  "Project Asset / Export",
];

// Color mapping for category badges
const categoryColor = (category?: string) => {
  const colors: Record<string, string> = {
    "Concept Art": "bg-blue-600/20 text-blue-300",
    "Character Design": "bg-purple-600/20 text-purple-300",
    "Environment Design": "bg-teal-600/20 text-teal-300",
    "Storyboards": "bg-yellow-600/20 text-yellow-300",
    "Script / Draft": "bg-orange-600/20 text-orange-300",
    "Lore / Notes": "bg-amber-600/20 text-amber-300",
    "Reference Material": "bg-gray-600/20 text-gray-300",
    "Final Artwork": "bg-green-600/20 text-green-300",
    "Cover / Poster": "bg-pink-600/20 text-pink-300",
    "Audio / Voice": "bg-indigo-600/20 text-indigo-300",
    "Video / Animation": "bg-red-600/20 text-red-300",
    "Project Asset / Export": "bg-slate-600/20 text-slate-300",
  };
  return colors[category || ""] || "bg-gray-700/20 text-gray-300";
};

// ---------------------------
// Main Component
// ---------------------------
export default function FileManager() {
  const { supabase, user } = useSupabase();
  const { toast } = useToast();
  const params = useParams<{ slug: string }>();

  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<{ id: string; name: string } | null>(null);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editVisibility, setEditVisibility] = useState("team");
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ---------------------------
  // Resolve project from slug
  // ---------------------------
  useEffect(() => {
    async function getProject() {
      if (!params?.slug) return;
      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("slug", params.slug)
        .single();
      if (error) {
        toast({
          title: "Error loading project",
          description: error.message,
          variant: "destructive",
        });
      } else setProject(data);
    }
    getProject();
  }, [params?.slug, supabase, toast]);

  // ---------------------------
  // Load files
  // ---------------------------
  async function loadFiles() {
    if (!project?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("project_files")
      .select(`
        id,
        path,
        size_bytes,
        mime,
        created_at,
        updated_at,
        file_name,
        file_type,
        file_category,
        description,
        tags,
        version,
        visibility,
        uploader:profiles(display_name, username)
      `)
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error loading files",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setFiles((data as ProjectFile[]) || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (project?.id) loadFiles();
  }, [project?.id]);

  // ---------------------------
  // Generate previews for image/video
  // ---------------------------
  useEffect(() => {
    async function fetchPreviews() {
      if (!files.length) return;
      const newPreviews: Record<string, string> = {};
      for (const file of files) {
        if (file.file_type === "image" || file.file_type === "video") {
          const { data, error } = await supabase.storage
            .from("project-files")
            .createSignedUrl(file.path, 300);
          if (!error && data?.signedUrl) {
            newPreviews[file.id] = data.signedUrl;
          }
        }
      }
      setPreviews(newPreviews);
    }
    fetchPreviews();
  }, [files, supabase]);

  // ---------------------------
  // Upload
  // ---------------------------
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !project?.id) return;
    setUploading(true);
    try {
      const filePath = `${project.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("project-files")
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      if (!user?.id) {
        throw new Error("You must be signed in to upload files.");
      }

      const fileType = file.type.startsWith("image/")
        ? "image"
        : file.type.startsWith("video/")
        ? "video"
        : file.type.startsWith("audio/")
        ? "audio"
        : "document";

      const insertPayload: TablesInsert<"project_files"> = {
        project_id: project.id,
        uploader_id: user.id,
        path: filePath,
        size_bytes: file.size,
        mime: file.type,
        file_name: file.name,
        file_type: fileType,
        visibility: "team",
        version: 1,
      };

      const { error: dbError } = await supabase.from("project_files").insert(insertPayload);
      if (dbError) throw dbError;

      toast({ title: "Upload complete", description: file.name,
        duration: 2500, });
      loadFiles();
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  // ---------------------------
  // Delete
  // ---------------------------
  async function handleDelete(file: ProjectFile) {
    if (!confirm(`Delete ${file.file_name || file.path.split("/").pop()}?`)) return;
    try {
      const { error: storageError } = await supabase.storage
        .from("project-files")
        .remove([file.path]);
      if (storageError) throw storageError;
      const { error: dbError } = await supabase
        .from("project_files")
        .delete()
        .eq("id", file.id);
      if (dbError) throw dbError;
      toast({ title: "File deleted", description: file.file_name, duration: 2500, });
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err: any) {
      toast({
        title: "Error deleting file",
        description: err.message,
        variant: "destructive",
      });
    }
  }

  // ---------------------------
  // Download
  // ---------------------------
  async function handleDownload(file: ProjectFile) {
    const { data, error } = await supabase.storage
      .from("project-files")
      .createSignedUrl(file.path, 60);
    if (error) {
      toast({
        title: "Error generating link",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    window.open(data.signedUrl, "_blank");
  }

  // ---------------------------
  // Save File Details (Metadata)
  // ---------------------------
  async function handleSaveMetadata() {
    if (!selectedFile) return;
    setSaving(true);
    const { error } = await supabase
      .from("project_files")
      .update({
        file_category: editCategory,
        description: editDescription,
        tags: editTags
          ? editTags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        visibility: editVisibility,
      })
      .eq("id", selectedFile.id);
    setSaving(false);
    if (!error) {
      toast({ title: "File updated", description: selectedFile.file_name, duration: 2500, });
      setSelectedFile(null);
      loadFiles();
    } else {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  function openDetailsModal(file: ProjectFile) {
    setSelectedFile(file);
    setEditDescription(file.description || "");
    setEditCategory(file.file_category || "");
    setEditTags(file.tags?.join(", ") || "");
    setEditVisibility(file.visibility || "team");
  }

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white truncate">
          Project Files {project?.name ? `— ${project.name}` : ""}
        </h2>

        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !project?.id}
          className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 rounded-xl bg-green-600 text-white hover:bg-green-700 transition-all"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" /> Upload
            </>
          )}
        </Button>
        <label htmlFor="file-upload" className="sr-only">
          Upload file
        </label>
        <input
          id="file-upload"
          type="file"
          className="hidden"
          ref={fileInputRef}
          onChange={handleUpload}
        />
      </div>

      {/* Drop Zone */}
      <FileDropZone
        onFiles={(acceptedFiles) => {
          if (!acceptedFiles.length) return;
          const fakeEvent = { target: { files: acceptedFiles } } as any;
          handleUpload(fakeEvent);
        }}
        uploading={uploading}
      />

      {/* File List */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl p-4 sm:p-6 text-gray-200">
        {loading ? (
          <p className="text-gray-400 text-center py-6">Loading files...</p>
        ) : files.length === 0 ? (
          <p className="text-gray-400 text-center py-6">
            No files uploaded yet. Drop or click “Upload” to add files.
          </p>
        ) : (
          <ul className="divide-y divide-gray-700">
            {files.map((file) => (
              <li
                key={file.id}
                className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-gray-750/50 rounded-lg px-3 transition-colors"
              >
                <div className="flex items-start gap-3 w-full sm:w-auto">
                  {/* Thumbnail or icon */}
                  <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-green-100/5 flex items-center justify-center overflow-hidden">
                    {file.file_type === "image" && previews[file.id] ? (
                      <img
                        src={previews[file.id]}
                        alt={file.file_name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    ) : file.file_type === "video" && previews[file.id] ? (
                      <video
                        src={previews[file.id]}
                        muted
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <FileText className="w-5 h-5 text-green-400" />
                    )}
                  </div>

                  {/* File info */}
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-gray-100 text-sm truncate">
                        {file.file_name || file.path.split("/").pop()}
                      </p>
                      {file.version && (
                        <span className="text-xs text-gray-400">v{file.version}</span>
                      )}
                      {file.file_category && (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${categoryColor(
                            file.file_category
                          )}`}
                        >
                          {file.file_category}
                        </span>
                      )}
                    </div>

                    {file.description && (
                      <p className="text-xs text-gray-400 line-clamp-1">
                        {file.description}
                      </p>
                    )}

                    <p className="text-xs text-gray-500">
                      {file.uploader?.display_name ||
                        file.uploader?.username ||
                        "Unknown"}{" "}
                      •{" "}
                      {new Date(file.updated_at || file.created_at).toLocaleDateString()} •{" "}
                      {(file.size_bytes / 1024).toFixed(1)} KB{" "}
                      {file.visibility === "public" && "🌐"}
                      {file.visibility === "team" && "👥"}
                      {file.visibility === "private" && "🔒"}
                    </p>

                    {file.tags?.length ? (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {file.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-300"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2 w-full sm:w-auto items-center justify-end">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 text-white"
                    onClick={() => handleDownload(file)}
                  >
                    Open
                  </Button>

                  <div className="relative group">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1 sm:flex-none bg-green-700 hover:bg-green-600 text-white"
                      onClick={() => openDetailsModal(file)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-black/80 text-xs text-white px-2 py-1 rounded">
                      View or Edit File Details
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleDelete(file)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* File Details Modal */}
      <Modal isOpen={!!selectedFile} onClose={() => setSelectedFile(null)}>
        {selectedFile && (
          <div className="relative w-full max-w-lg max-h-[85vh] rounded-xl border border-gray-700 bg-[#0f172a] text-gray-100 shadow-lg flex flex-col">
            <header className="px-5 pt-4 pb-2">
              <h2 className="text-base font-semibold text-white leading-tight">
                {selectedFile.file_name}
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Uploaded by{" "}
                {selectedFile.uploader?.display_name ||
                  selectedFile.uploader?.username ||
                  "Unknown"}{" "}
                • {new Date(selectedFile.created_at).toLocaleString()}{" "}
                {selectedFile.version && `• v${selectedFile.version}`}
              </p>
            </header>

            {/* Scrollable Body */}
            <section className="flex-1 overflow-y-auto px-5 py-2">
              <div className="space-y-3">
                <div>
                  <label
                    htmlFor="file-category"
                    className="block text-sm font-medium mb-1 text-gray-300"
                  >
                    Category
                  </label>
                  <select
                    id="file-category"
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 text-white p-2 focus:ring-2 focus:ring-green-400"
                  >
                    <option value="">Uncategorized</option>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="file-description"
                    className="block text-sm font-medium mb-1 text-gray-300"
                  >
                    Description
                  </label>
                  <textarea
                    id="file-description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Notes or purpose..."
                    className="w-full rounded-md border border-gray-700 bg-gray-800 text-white p-2 focus:ring-2 focus:ring-green-400"
                    rows={3}
                  />
                </div>

                <div>
                  <label
                    htmlFor="file-tags"
                    className="block text-sm font-medium mb-1 text-gray-300"
                  >
                    Tags (comma-separated)
                  </label>
                  <input
                    id="file-tags"
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="character, scene2"
                    className="w-full rounded-md border border-gray-700 bg-gray-800 text-white p-2 focus:ring-2 focus:ring-green-400"
                  />
                </div>

                <div>
                  <label
                    htmlFor="file-visibility"
                    className="block text-sm font-medium mb-1 text-gray-300"
                  >
                    Visibility
                  </label>
                  <select
                    id="file-visibility"
                    value={editVisibility}
                    onChange={(e) => setEditVisibility(e.target.value)}
                    className="w-full rounded-md border border-gray-700 bg-gray-800 text-white p-2 focus:ring-2 focus:ring-green-400"
                  >
                    <option value="team">Team</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="px-5 py-3 flex justify-end gap-3">
              <button
                onClick={() => setSelectedFile(null)}
                className="px-4 py-1.5 rounded-md bg-gray-700 text-gray-200 hover:bg-gray-600 transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMetadata}
                disabled={saving}
                className="px-4 py-1.5 rounded-md bg-green-600 text-white hover:bg-green-700 transition text-sm"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </footer>
          </div>
        )}
      </Modal>
    </div>
  );
}

