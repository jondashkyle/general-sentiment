import { visit } from "unist-util-visit";

export default function rehypeMediaUrl() {
  const base = process.env.PUBLIC_MEDIA_BASE_URL;
  if (!base) return () => {};

  const prefix = base.replace(/\/$/, "");

  return (tree) => {
    visit(tree, "element", (node) => {
      if (
        node.tagName === "img" &&
        typeof node.properties?.src === "string" &&
        node.properties.src.startsWith("/media/")
      ) {
        node.properties.src = node.properties.src.replace("/media", prefix);
      }
    });
  };
}
