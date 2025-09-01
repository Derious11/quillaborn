// src/app/blog/page.tsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import Image from "next/image";

type PostMeta = {
  slug: string;
  title: string;
  excerpt?: string;
  date?: string; // ISO recommended: YYYY-MM-DD
  category?: string;
  cover?: string;
};

const CONTENT_DIR = path.join(process.cwd(), "content/blog");

export const dynamic = "error"; // ensure static generation (optional)

export default function BlogIndexPage() {
  const files = fs.existsSync(CONTENT_DIR)
    ? fs.readdirSync(CONTENT_DIR).filter((f) => /\.mdx?$/.test(f))
    : [];

  const posts: PostMeta[] = files
    .map((filename) => {
      const filePath = path.join(CONTENT_DIR, filename);
      const raw = fs.readFileSync(filePath, "utf-8");
      const { data } = matter(raw);
      return {
        slug: filename.replace(/\.mdx?$/, ""),
        title: data.title ?? filename,
        excerpt: data.excerpt ?? "",
        date: data.date ?? "",
        category: data.category ?? "Build Log",
        cover: data.cover || "/og-image.jpg",
      } as PostMeta;
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <Image
          src="/og-image.jpg"
          alt=""
          priority
          fill
          className="object-cover object-center opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900/80 to-gray-900/95" />
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-14 lg:pt-32">
          <nav className="mb-4 text-sm text-gray-300">
            <Link href="/" className="hover:text-green-400">Home</Link>
            <span className="mx-2 opacity-60">/</span>
            <span className="text-gray-400">Blog</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold">Insights & Build Log</h1>
          <p className="mt-3 text-gray-300 max-w-2xl">
            Updates from the Quillaborn team: progress notes, design ideas, and deep dives.
          </p>
        </div>
      </section>

      {/* LIST */}
      <section className="py-12 lg:py-16">
        <div className="max-w-6xl mx-auto px-6">
          {posts.length === 0 && (
            <p className="text-gray-300">No posts yet — check back soon.</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-gray-800 rounded-2xl overflow-hidden hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative h-40 w-full">
                  <Image
                    src={post.cover!}
                    alt=""
                    fill
                    className="object-cover object-center opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
                </div>
                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-flex items-center rounded-full bg-green-500/20 border border-green-500/30 px-3 py-1 text-xs text-green-300">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold mb-1 group-hover:text-green-400">{post.title}</h2>
                  {post.date && (
                    <p className="text-sm text-gray-400 mb-2">{post.date}</p>
                  )}
                  {post.excerpt && (
                    <p className="text-gray-300 line-clamp-3">{post.excerpt}</p>
                  )}
                  <span className="mt-4 inline-block text-sm text-green-400 group-hover:underline">
                    Read more
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

