"use client";

import { useEffect, useState, useRef } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileDropZone } from "@/components/projects/FileDropZone";

interface ProjectFile {
  id: string;
  path: string;
  size_bytes: number;
  mime: string;
  created_at: string;
  uploader: { username?: string | null; display_name?: string | null } | null;
}

export default function FileManager() {
  const { supabase, user } = useSupabase();
  const { toast } = useToast();
  const params = useParams<{ slug: string }>();

  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [project, setProject] = useState<{ id: string; name: string } | null>(null);

  // ✅ Step 1: Resolve slug → project UUID
  useEffect(() => {
    async function getProjectFromSlug() {
      if (!params?.slug) return;

      const { data, error } = await supabase
        .from("projects")
        .select("id, name")
        .eq("slug", params.slug)
        .single();

      if (error) {
        console.error("Error fetching project ID:", error);
        toast({
          title: "Error loading project",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setProject(data);
      }
    }

    getProjectFromSlug();
  }, [params?.slug, supabase, toast]);

  // ✅ Step 2: Load files once project.id is ready
  async function loadFiles() {
    if (!project?.id) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("project_files")
      .select(
        `
        id,
        path,
        size_bytes,
        mime,
        created_at,
        uploader:profiles(display_name, username)
      `
      )
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading files:", error);
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

  // ✅ Step 3: Upload
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !project?.id) return;

    setUploading(true);

    try {
      const filePath = `${project.id}/${Date.now()}-${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("project-files") // ✅ correct bucket
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase.from("project_files").insert({
        project_id: project.id,
        uploader_id: user?.id,
        path: filePath,
        size_bytes: file.size,
        mime: file.type,
      });

      if (dbError) throw dbError;

      toast({ title: "Upload complete", description: file.name });
      loadFiles();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  // ✅ Step 4: Delete
  async function handleDelete(file: ProjectFile) {
    if (!confirm(`Delete ${file.path.split("/").pop()}?`)) return;

    try {
      console.log("Deleting file path:", file.path);
     
      const { error: storageError } = await supabase.storage
        .from("project-files")
        .remove([file.path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("project_files")
        .delete()
        .eq("id", file.id);

      if (dbError) throw dbError;

      toast({ title: "File deleted", description: file.path });
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Error deleting file",
        description: err.message,
        variant: "destructive",
      });
    }
  }

  // ✅ Step 5: Download
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
        Upload a file
      </label>
      <input
        id="file-upload"
        type="file"
        className="hidden"
        ref={fileInputRef}
        onChange={handleUpload}
      />
    </div>

    {/* Drop zone */}
    <FileDropZone
      onFiles={(acceptedFiles) => {
        if (!acceptedFiles.length) return;
        const fakeEvent = { target: { files: acceptedFiles } } as any;
        handleUpload(fakeEvent);
      }}
      uploading={uploading}
    />

    {/* File list */}
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
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-100 text-sm truncate">
                    {file.path.split("/").pop()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {file.uploader?.display_name ||
                      file.uploader?.username ||
                      "Unknown"}{" "}
                    • {new Date(file.created_at).toLocaleDateString()} •{" "}
                    {(file.size_bytes / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:flex-none bg-gray-700 hover:bg-gray-600 text-white"
                  onClick={() => handleDownload(file)}
                >
                  Open
                </Button>
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
  </div>
);
}