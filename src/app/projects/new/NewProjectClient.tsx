"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createProject } from "../actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function NewProjectClient() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const { slug } = await createProject(formData);
      router.push(`/p/${slug}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
      <Card className="bg-gray-800 border border-green-500/30">
        <CardHeader>
          <CardTitle className="text-xl text-white">Create Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Project Name</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder="e.g. Quillaborn"
                className="text-white border-green-500/30 placeholder:text-gray-400 focus-visible:ring-green-500 focus-visible:border-green-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary" className="text-gray-300">Summary</Label>
              <Textarea
                id="summary"
                name="summary"
                placeholder="A short description of your project"
                className="text-white border-green-500/30 placeholder:text-gray-400 focus-visible:ring-green-500 focus-visible:border-green-500"
              />
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}

            <div className="flex items-center justify-end gap-2">
              <Button type="button" asChild className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600">
                <Link href="/dashboard/projects">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading} className="bg-green-500 hover:bg-green-600 text-white">
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
