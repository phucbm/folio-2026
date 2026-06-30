import { defineConfig } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },

  media: {
    tina: {
      mediaRoot: "images",
      publicFolder: "public",
    },
  },

  schema: {
    collections: [
      // ─── Site config (single doc) ───────────────────────────────
      {
        name: "siteConfig",
        label: "Site Config",
        path: "content/site",
        format: "md",
        match: { include: "config" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "name", label: "Site name" },
          { type: "string", name: "title", label: "Meta title" },
          { type: "string", name: "description", label: "Meta description", ui: { component: "textarea" } },
          { type: "string", name: "email", label: "Email" },
          { type: "string", name: "authorName", label: "Author name" },
          { type: "string", name: "authorRole", label: "Author role" },
          { type: "image", name: "ogImage", label: "OG image" },
          { type: "string", name: "keywords", label: "Keywords", list: true },
          {
            type: "object",
            name: "navLinks",
            label: "Nav links",
            list: true,
            fields: [
              { type: "string", name: "href", label: "Path" },
              { type: "string", name: "label", label: "Label" },
            ],
          },
          {
            type: "object",
            name: "socialLinks",
            label: "Social links",
            list: true,
            fields: [
              { type: "string", name: "href", label: "URL" },
              { type: "string", name: "label", label: "Label" },
            ],
          },
        ],
      },

      // ─── Hero (single doc) ──────────────────────────────────────
      {
        name: "hero",
        label: "Homepage Hero",
        path: "content/hero",
        format: "md",
        match: { include: "index" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "headline", label: "Headline", ui: { component: "textarea" } },
          { type: "string", name: "subtext", label: "Subtext", ui: { component: "textarea" } },
          { type: "string", name: "note", label: "Note (italic line)", ui: { component: "textarea" } },
        ],
      },

      // ─── About (single doc) ─────────────────────────────────────
      {
        name: "about",
        label: "About Page",
        path: "content/about",
        format: "md",
        match: { include: "index" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "heroTitle", label: "Hero title", ui: { component: "textarea" } },
          { type: "string", name: "heroText", label: "Hero text", ui: { component: "textarea" } },
          {
            type: "object",
            name: "sections",
            label: "Editorial sections",
            list: true,
            fields: [
              { type: "string", name: "kicker", label: "Section kicker" },
              { type: "string", name: "body", label: "Body", ui: { component: "textarea" } },
            ],
          },
        ],
      },

      // ─── Resume (single doc) ────────────────────────────────────
      {
        name: "resume",
        label: "Resume Page",
        path: "content/resume",
        format: "md",
        match: { include: "index" },
        ui: { allowedActions: { create: false, delete: false } },
        fields: [
          { type: "string", name: "heroTitle", label: "Hero title", ui: { component: "textarea" } },
          { type: "string", name: "heroText", label: "Hero text", ui: { component: "textarea" } },
          { type: "string", name: "location", label: "Location" },
          { type: "string", name: "focus", label: "Focus" },
          { type: "string", name: "availability", label: "Availability" },
          { type: "string", name: "contact", label: "Contact email" },
          {
            type: "object",
            name: "experience",
            label: "Experience",
            list: true,
            fields: [
              { type: "string", name: "role", label: "Role" },
              { type: "string", name: "company", label: "Company" },
              { type: "string", name: "dates", label: "Dates" },
              { type: "string", name: "body", label: "Description", ui: { component: "textarea" } },
            ],
          },
          { type: "string", name: "stack", label: "Stack", list: true },
          { type: "string", name: "clients", label: "Clients", list: true },
        ],
      },

      // ─── Projects (list) ────────────────────────────────────────
      {
        name: "projects",
        label: "Work Projects",
        path: "content/projects",
        format: "md",
        fields: [
          { type: "string", name: "name", label: "Project name", isTitle: true, required: true },
          { type: "string", name: "slug", label: "Slug (URL path)", required: true },
          { type: "string", name: "title", label: "Card title", ui: { component: "textarea" } },
          { type: "string", name: "description", label: "Card description", ui: { component: "textarea" } },
          {
            type: "string",
            name: "background",
            label: "Card background color",
            options: ["lime", "cyan", "lavender", "mint"],
          },
          {
            type: "string",
            name: "variant",
            label: "Card image variant",
            options: ["desktop", "split", "mobile", "board"],
          },
          { type: "image", name: "image", label: "Project image" },
          { type: "string", name: "alt", label: "Image alt text" },
          { type: "string", name: "imageClass", label: "Image CSS class" },
          { type: "string", name: "caseTitle", label: "Case study headline", ui: { component: "textarea" } },
          { type: "string", name: "caseText", label: "Case study subtext", ui: { component: "textarea" } },
          { type: "string", name: "metaClient", label: "Meta: Client" },
          { type: "string", name: "metaIndustry", label: "Meta: Industry" },
          { type: "string", name: "metaRegion", label: "Meta: Region" },
          { type: "number", name: "order", label: "Display order" },
          { type: "rich-text", name: "body", label: "Case study content (optional)", isBody: true },
        ],
        ui: {
          filename: {
            readonly: false,
            slugify: (values: Record<string, string>) =>
              values?.slug?.toLowerCase().replace(/\s+/g, "-") ?? "",
          },
        },
      },
    ],
  },
});
