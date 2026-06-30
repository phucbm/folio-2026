import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";

function readFrontmatter(relPath: string): Record<string, unknown> {
  const abs = join(process.cwd(), relPath);
  const raw = readFileSync(abs, "utf-8");
  const match = raw.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  return (parse(match[1]) as Record<string, unknown>) ?? {};
}

export function getSiteConfig() {
  return readFrontmatter("content/site/config.md") as {
    name: string;
    title: string;
    description: string;
    email: string;
    authorName: string;
    authorRole: string;
    ogImage: string;
    keywords: string[];
    navLinks: { href: string; label: string }[];
    socialLinks: { href: string; label: string }[];
  };
}

export function getHero() {
  return readFrontmatter("content/hero/index.md") as {
    headline: string;
    subtext: string;
    note: string;
  };
}

export function getAbout() {
  return readFrontmatter("content/about/index.md") as {
    heroTitle: string;
    heroText: string;
    sections: { kicker: string; body: string }[];
  };
}

export function getResume() {
  return readFrontmatter("content/resume/index.md") as {
    heroTitle: string;
    heroText: string;
    location: string;
    focus: string;
    availability: string;
    contact: string;
    experience: { role: string; company: string; dates: string; body: string }[];
    stack: string[];
    clients: string[];
  };
}

export function getProjects() {
  const dir = join(process.cwd(), "content/projects");
  const files = readdirSync(dir).filter((f) => f.endsWith(".md"));
  const projects = files.map((f) =>
    readFrontmatter(`content/projects/${f}`) as {
      name: string;
      slug: string;
      title: string;
      description: string;
      background: string;
      variant: string;
      image: string;
      alt: string;
      imageClass: string;
      caseTitle: string;
      caseText: string;
      metaClient: string;
      metaIndustry: string;
      metaRegion: string;
      order: number;
    }
  );
  return projects.sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));
}

export function getProject(slug: string) {
  return getProjects().find((p) => p.slug === slug);
}
