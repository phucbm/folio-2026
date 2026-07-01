import { defineConfig } from "tinacms";

const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

// ─── Shared block templates ────────────────────────────────────────────────────
const heroBlock = {
  name: "heroBlock",
  label: "Hero",
  fields: [
    { type: "string", name: "eyebrow", label: "Eyebrow (mono label above title)" },
    { type: "string", name: "title", label: "Title (h1)", ui: { component: "textarea" } },
    { type: "string", name: "body", label: "Body text", ui: { component: "textarea" } },
    { type: "string", name: "note", label: "Note (italic line below body)", ui: { component: "textarea" } },
  ],
};

const editorialBlock = {
  name: "editorialBlock",
  label: "Editorial",
  fields: [
    { type: "string", name: "kicker", label: "Kicker (left column label)" },
    { type: "rich-text", name: "content", label: "Body" },
  ],
};

const snapshotBlock = {
  name: "snapshotBlock",
  label: "Snapshot",
  fields: [
    { type: "string", name: "location", label: "Location" },
    { type: "string", name: "focus", label: "Focus" },
    { type: "string", name: "availability", label: "Availability" },
    { type: "string", name: "contact", label: "Contact email" },
  ],
};

const experienceBlock = {
  name: "experienceBlock",
  label: "Experience",
  fields: [
    {
      type: "object",
      name: "jobs",
      label: "Jobs",
      list: true,
      fields: [
        { type: "string", name: "role", label: "Role" },
        { type: "string", name: "company", label: "Company" },
        { type: "string", name: "dates", label: "Dates" },
        { type: "string", name: "body", label: "Description", ui: { component: "textarea" } },
      ],
    },
  ],
};

const pillListBlock = {
  name: "pillListBlock",
  label: "Pill List",
  fields: [
    { type: "string", name: "label", label: "Section label (e.g. Stack, Clients)" },
    { type: "string", name: "items", label: "Items", list: true },
  ],
};

const projectCardsBlock = {
  name: "projectCardsBlock",
  label: "Project Cards",
  fields: [
    {
      type: "string",
      name: "note",
      label: "Note (for editors — no rendered output)",
      ui: { component: "textarea" },
    },
  ],
};

const projectListBlock = {
  name: "projectListBlock",
  label: "Project List",
  fields: [
    {
      type: "string",
      name: "note",
      label: "Note (for editors — no rendered output)",
      ui: { component: "textarea" },
    },
  ],
};

const allBlocks = [
  heroBlock,
  editorialBlock,
  snapshotBlock,
  experienceBlock,
  pillListBlock,
  projectCardsBlock,
  projectListBlock,
];

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
      // ─── Site config (single doc) ──────────────────────────────────────────
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
          { type: "string", name: "footerCtaHeadline", label: "Footer CTA headline", ui: { component: "textarea" } },
          { type: "string", name: "footerCtaBody", label: "Footer CTA body", ui: { component: "textarea" } },
          { type: "string", name: "authorName", label: "Author name" },
          { type: "string", name: "authorRole", label: "Author role" },
          { type: "string", name: "footerCopyright", label: "Footer copyright text" },
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

      // ─── Pages (multi-doc, blocks-based) ──────────────────────────────────
      {
        name: "pages",
        label: "Pages",
        path: "content/pages",
        format: "md",
        ui: {
          router: ({ document }: { document: { slug?: string } }) =>
            document.slug ? `/${document.slug}` : "/",
          filename: {
            readonly: false,
            slugify: (values: Record<string, string>) =>
              values?.slug?.toLowerCase().replace(/\s+/g, "-") ?? "",
          },
        },
        fields: [
          { type: "string", name: "title", label: "Page title (browser tab)", isTitle: true, required: true },
          { type: "string", name: "slug", label: "Slug (URL path, empty = homepage)", required: false },
          { type: "string", name: "metaTitle", label: "Meta title" },
          { type: "string", name: "metaDescription", label: "Meta description", ui: { component: "textarea" } },
          {
            type: "object",
            name: "blocks",
            label: "Page sections",
            list: true,
            templates: allBlocks,
          },
        ],
      },

      // ─── Projects (list) ──────────────────────────────────────────────────
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
          { type: "string", name: "metaClient", label: "Meta: Client" },
          { type: "string", name: "metaIndustry", label: "Meta: Industry" },
          { type: "string", name: "metaRegion", label: "Meta: Region" },
          { type: "number", name: "order", label: "Display order" },
          {
            type: "object",
            name: "blocks",
            label: "Detail page sections",
            list: true,
            templates: allBlocks,
          },
          { type: "rich-text", name: "body", label: "Legacy content (deprecated)", isBody: true },
        ],
        ui: {
          router: ({ document }: { document: { slug?: string } }) =>
            document.slug ? `/work/${document.slug}` : "/work",
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
