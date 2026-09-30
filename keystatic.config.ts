import { config, collection, fields } from "@keystatic/core";

export default config({
  storage: { kind: "local" },
  ui: {
    brand: { name: "Margins" },
    navigation: ["books", "notes"],
  },
  collections: {
    // content/books/<slug>.md — YAML frontmatter + overview body
    books: collection({
      label: "Books",
      slugField: "title",
      path: "content/books/*",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({
          name: { label: "Title" },
        }),
        author: fields.text({ label: "Author" }),
        year: fields.integer({ label: "Year published" }),
        cover: fields.text({
          label: "Cover image path",
          description: "Path under public/, e.g. /covers/aposd.jpg",
        }),
        status: fields.select({
          label: "Reading status",
          options: [
            { label: "Reading", value: "reading" },
            { label: "Finished", value: "finished" },
            { label: "Reference", value: "reference" },
          ],
          defaultValue: "reading",
        }),
        started: fields.date({ label: "Date started" }),
        summary: fields.text({
          label: "One-line summary",
          description: "Shown on the home page book card",
        }),
        content: fields.markdoc({ label: "Overview", extension: "md" }),
      },
    }),

    // content/notes/<book>/<note>.md — slug includes the book prefix, e.g. "aposd/04-modules-should-be-deep"
    notes: collection({
      label: "Notes",
      slugField: "title",
      path: "content/notes/**",
      format: { contentField: "content" },
      schema: {
        title: fields.slug({
          name: { label: "Note title" },
        }),
        book: fields.text({
          label: "Book slug",
          description: "Slug of the book this note belongs to, e.g. aposd",
        }),
        chapter: fields.integer({
          label: "Order",
          description: "Chapter number for ordering (use 90+ for appendices)",
        }),
        date: fields.date({ label: "Date" }),
        summary: fields.text({
          label: "One-line summary",
          description: "Shown in lists, the TOC, and search results",
        }),
        tags: fields.array(fields.text({ label: "Tag" }), {
          label: "Tags",
          itemLabel: (props) => props.value || "tag",
        }),
        content: fields.markdoc({ label: "Note", extension: "md" }),
      },
    }),
  },
});
