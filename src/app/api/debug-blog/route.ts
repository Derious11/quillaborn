import fs from "fs";
import path from "path";

export const runtime = "nodejs"; // we just need fs, not edge

function contentDir() {
  // adjust if your posts live elsewhere
  return path.resolve(process.cwd(), "content", "blog");
}

function tryResolve(slug: string) {
  const dir = contentDir();
  const candidates = [
    path.join(dir, `${slug}.mdx`),
    path.join(dir, `${slug}.md`),
    path.join(dir, slug, "index.mdx"),
    path.join(dir, slug, "index.md"),
  ];
  const hits = candidates.filter((p) => fs.existsSync(p));
  return { dir, candidates, hits };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug") || "blog-1";

  const dir = contentDir();
  const exists = fs.existsSync(dir);
  const list = exists ? fs.readdirSync(dir, { withFileTypes: true }).map(e => ({
    name: e.name,
    type: e.isDirectory() ? "dir" : "file",
  })) : [];

  const probe = tryResolve(slug);

  return new Response(
    JSON.stringify({
      cwd: process.cwd(),
      contentDir: dir,
      contentDirExists: exists,
      listing: list,
      slug,
      probe,
    }, null, 2),
    { headers: { "content-type": "application/json" } }
  );
}
