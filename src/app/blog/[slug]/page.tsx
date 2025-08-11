// src/app/blog/[slug]/page.tsx
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Prose from "@/components/blog/Prose";
import { mdxComponents } from "@/components/blog/mdx-components";

const CONTENT_DIR = path.resolve(process.cwd(), "content", "blog");

type Frontmatter = {
  title?: string;
  excerpt?: string;
  description?: string;
  date?: string;           // "YYYY-MM-DD" preferred
  category?: string;       // e.g. "Build Log"
  tags?: string[];
  cover?: string;          // e.g. "/blog/cover-1.jpg" for hero bg
  og?: string;
  ogSubtitle?: string;
};

function fileList(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  return fs.readdirSync(CONTENT_DIR).filter((f) => /\.mdx?$/i.test(f));
}

function resolvePostPath(slug: string): string | null {
  const candidates = [
    path.join(CONTENT_DIR, `${slug}.mdx`),
    path.join(CONTENT_DIR, `${slug}.md`),
    path.join(CONTENT_DIR, slug, "index.mdx"),
    path.join(CONTENT_DIR, slug, "index.md"),
  ];
  for (const p of candidates) if (fs.existsSync(p)) return p;

  // Case-insensitive fallback
  if (!fs.existsSync(CONTENT_DIR)) return null;
  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  const dir = entries.find((e) => e.isDirectory() && e.name.toLowerCase() === slug.toLowerCase());
  if (dir) {
    for (const n of ["index.mdx", "index.md"]) {
      const p = path.join(CONTENT_DIR, dir.name, n);
      if (fs.existsSync(p)) return p;
    }
  }
  const file = entries.find((e) => {
    if (!e.isFile()) return false;
    const ext = path.extname(e.name).toLowerCase();
    if (ext !== ".md" && ext !== ".mdx") return false;
    return path.basename(e.name, ext).toLowerCase() === slug.toLowerCase();
  });
  return file ? path.join(CONTENT_DIR, file.name) : null;
}

function readPost(slug: string) {
  const filePath = resolvePostPath(slug);
  if (!filePath) return null;
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = matter(raw) as { content: string; data: Frontmatter };
  return { slug, filePath, ...parsed };
}

function listPostsMeta() {
  return fileList()
    .map((filename) => {
      const slug = filename.replace(/\.mdx?$/i, "");
      const raw = fs.readFileSync(path.join(CONTENT_DIR, filename), "utf-8");
      const { data } = matter(raw) as { data: Frontmatter };
      return { slug, ...data };
    })
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
}

function getRelatedPosts(currentSlug: string, take = 3) {
  return listPostsMeta()
    .filter((p) => p.slug !== currentSlug)
    .slice(0, take);
}

export async function generateStaticParams() {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  const params: { slug: string }[] = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      if (
        fs.existsSync(path.join(CONTENT_DIR, e.name, "index.mdx")) ||
        fs.existsSync(path.join(CONTENT_DIR, e.name, "index.md"))
      ) {
        params.push({ slug: e.name });
      }
    } else if (e.isFile()) {
      const ext = path.extname(e.name).toLowerCase();
      if (ext === ".md" || ext === ".mdx") params.push({ slug: path.basename(e.name, ext) });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = readPost(params.slug);
  if (!post) return {};
  const { data } = post;
  const title = data.title ?? params.slug;
  const description = data.excerpt ?? data.description ?? "";

  // Prefer static OG if provided; else dynamic with blog title/subtitle
  const ogImage =
    data.og ||
    `/api/og?title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(
      data.ogSubtitle ?? "Quillaborn • Blog"
    )}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/blog/${params.slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = readPost(params.slug);
  if (!post) notFound();

  const { content, data } = post;
  const title = data.title ?? params.slug;
  const date = data.date ?? "";
  const category = data.category ?? "Build Log";
  const cover = data.cover || "/og-image.jpg"; // fallback to your site OG bg

  const related = getRelatedPosts(params.slug, 3);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        {/* Background image */}
        <Image
          src={cover}
          alt=""
          priority
          fill
          className="object-cover object-center opacity-60"
        />
        {/* Dark gradient overlay to match landing page feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-gray-900/80 to-gray-900/95" />
        {/* Content */}
        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-14 lg:pt-32">
          {/* Breadcrumb */}
          <nav className="mb-4 text-sm text-gray-300">
            <Link href="/" className="hover:text-green-400">Home</Link>
            <span className="mx-2 opacity-60">/</span>
            <Link href="/blog" className="hover:text-green-400">Blog</Link>
            <span className="mx-2 opacity-60">/</span>
            <span className="text-gray-400">{title}</span>
          </nav>
          {/* Category + date pills */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center rounded-full bg-green-500/20 border border-green-500/30 px-3 py-1 text-sm text-green-300">
              {category}
            </span>
            {date && (
              <span className="inline-flex items-center rounded-full bg-gray-800 border border-gray-700 px-3 py-1 text-sm text-gray-300">
                {date}
              </span>
            )}
          </div>
          {/* Title */}
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight">
            <span className="text-white">{title}</span>
          </h1>
          {data.excerpt && (
            <p className="mt-4 text-lg text-gray-300 max-w-3xl">{data.excerpt}</p>
          )}
        </div>
      </section>

      {/* ARTICLE */}
      <article className="relative">
        <div className="max-w-3xl mx-auto px-6">
          <Prose>
            {/* date shown above; keep here minimal */}
            <MDXRemote source={content} components={mdxComponents as any} />
          </Prose>

          {/* Mid-article CTA (matches landing buttons) */}
          <div className="my-12 flex items-center justify-center">
            <Link
              href="/signup"
              className="bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-4 rounded-full font-bold transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
            >
              Join Early Access
            </Link>
          </div>
        </div>
      </article>

      {/* RELATED POSTS */}
      {related.length > 0 && (
        <section className="py-16 lg:py-24 bg-gray-800 mt-8">
          <div className="max-w-6xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">
              More from the <span className="text-green-400">build</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="group bg-gray-900 p-6 rounded-2xl hover:bg-gray-700 transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="mb-4">
                    <span className="inline-flex items-center rounded-full bg-green-500/20 border border-green-500/30 px-3 py-1 text-xs text-green-300">
                      {p.category || "Build Log"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold mb-2 group-hover:text-green-400">
                    {p.title || p.slug}
                  </h3>
                  {p.date && <p className="text-sm text-gray-400 mb-3">{p.date}</p>}
                  {p.excerpt && <p className="text-gray-300 line-clamp-3">{p.excerpt}</p>}
                  <span className="mt-4 inline-block text-sm text-green-400 group-hover:underline">
                    Read more →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FOOTER CTA */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-green-900/20 to-gray-900">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h3 className="text-3xl md:text-4xl font-extrabold mb-4">
            Ready to join the <span className="text-green-400">community</span>?
          </h3>
          <p className="text-lg text-gray-300 mb-8">
            We’re in early access. Join the waitlist or sign up to be part of the first wave.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-green-500 hover:bg-green-600 text-gray-900 px-8 py-4 rounded-full font-bold transition-all duration-200 transform hover:scale-105"
            >
              Sign Up
            </Link>
            <Link
              href="/#waitlist"
              className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full font-bold transition-all duration-200"
            >
              Join Waitlist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
