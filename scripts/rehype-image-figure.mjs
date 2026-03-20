import { visit } from "unist-util-visit";

const SIZES = {
  sm: "24rem",
  md: "32rem",
  lg: "48rem",
};

function parseAlt(raw) {
  if (!raw) return { caption: "", attrs: {} };

  const parts = raw.split("|").map((s) => s.trim());
  const caption = parts[0];
  const attrs = {};

  const FIT_VALUES = ["cover", "contain", "fill"];

  for (let i = 1; i < parts.length; i++) {
    const part = parts[i].trim();
    if (FIT_VALUES.includes(part)) {
      attrs.fit = part;
    } else {
      const [key, ...rest] = part.split("=");
      if (key && rest.length) {
        attrs[key.trim()] = rest.join("=").trim();
      }
    }
  }

  return { caption, attrs };
}

export default function rehypeImageFigure() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (!parent || index === undefined) return;

      if (node.tagName !== "p") return;

      const children = node.children.filter(
        (c) => !(c.type === "text" && c.value.trim() === ""),
      );
      if (children.length !== 1) return;

      const img = children[0];
      if (img.type !== "element" || img.tagName !== "img") return;

      const { caption, attrs } = parseAlt(img.properties?.alt);

      // Set clean alt text
      img.properties.alt = caption;

      // Wrap img in a media div
      const mediaStyles = [];
      const imgStyles = [];

      if (attrs.ratio) {
        mediaStyles.push(`aspect-ratio: ${attrs.ratio}`);
        mediaStyles.push("position: relative");
        mediaStyles.push("overflow: hidden");
        imgStyles.push("position: absolute");
        imgStyles.push("inset: 0");
        imgStyles.push("width: 100%");
        imgStyles.push("height: 100%");
        imgStyles.push(`object-fit: ${attrs.fit || "cover"}`);
      } else if (attrs.fit) {
        imgStyles.push(`object-fit: ${attrs.fit}`);
      }

      if (imgStyles.length) {
        img.properties.style = imgStyles.join("; ");
      }

      const mediaDiv = {
        type: "element",
        tagName: "div",
        properties: {
          class: "figure-media",
          ...(mediaStyles.length ? { style: mediaStyles.join("; ") } : {}),
        },
        children: [img],
      };

      const classes = [];
      if (attrs.size && SIZES[attrs.size]) {
        classes.push(`figure-${attrs.size}`);
      }

      const figure = {
        type: "element",
        tagName: "figure",
        properties: classes.length ? { class: classes.join(" ") } : {},
        children: [mediaDiv],
      };

      if (caption) {
        figure.children.push({
          type: "element",
          tagName: "figcaption",
          properties: {},
          children: [{ type: "text", value: caption }],
        });
      }

      parent.children[index] = figure;
    });
  };
}
