import { visit } from "unist-util-visit";
import { fromHtml } from "hast-util-from-html";

const APP_ICONS = {
  app: '<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M41 98.9323C41.5943 95.5064 45.6986 87.5464 55.8296 60.3982C61.2059 45.9913 64.6825 33.7836 67.0702 29.2127C67.4277 28.5283 68.9023 29.6301 69.8245 30.61C71.7429 32.6484 74.4409 41.9634 78.2989 56.1232C80.8381 67.3531 83.1606 78.473 85.4495 88.7975C86.3668 92.9719 86.7884 94.9841 87.4688 98.7721M48.4258 71.8425C51.8741 71.3114 60.6098 69.4854 68.3681 67.8987C73.9069 67.3841 77.91 66.8021 80.0657 66.22C81.3073 66.0221 82.8491 66.0221 84.4375 66.0221" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>',
  browser: '<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M38.7617 33.1526C47.7284 29.9575 72.0949 23.4631 85.5686 23.0052C91.3833 22.8076 94.347 28.2544 95.7783 31.0232C96.4431 32.3092 96.1861 33.6928 95.6032 34.8584C89.0757 47.9117 63.1992 53.1869 65.4846 53.7412C77.1844 56.5791 88.0185 54.5039 91.328 55.4479C94.2228 56.2737 96.12 58.4289 97.4888 60.9205C98.979 63.6331 99.0586 66.7755 98.9162 69.6006C98.5391 77.0783 87.6077 83.7569 79.0902 88.2659C63.3217 92.1844 40.6007 94.1064 33.6693 93.3115C32.6049 92.9571 31.5027 92.457 30 91.2815M48.0664 24.8714C48.0664 24.9332 48.0664 24.9951 47.536 38.0949C47.0055 51.1938 45.9447 77.3272 44.8518 104.253L44.8516 104.258" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>',
  fence: '<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M56.6016 102.957C56.6016 102.261 56.6016 83.7279 56.5526 54.8224C56.5036 44.0914 56.4056 41.3548 56.2649 39.4216C56.1242 37.4884 55.9438 36.4417 55.1797 32.7461M37 32.7461H38.4814C39.5064 32.7461 41.3214 32.7461 50.2015 31.633C59.0817 30.5199 74.972 28.2937 91.8047 26M61.8398 65.5547H64.1775C65.3343 65.5547 67.0398 65.5547 70.8961 65.2988C74.7523 65.0429 80.7078 64.5312 86.8438 64.0039" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>',
};

function makeIconContent(name) {
  const key = name.toLowerCase();
  if (APP_ICONS[key]) {
    const tree = fromHtml(APP_ICONS[key], { fragment: true });
    return tree.children[0];
  }
  // Fallback: first letter in Times
  return { type: "text", value: name.charAt(0).toUpperCase() };
}

function parseAppsBlock(text) {
  return text
    .trim()
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+/);
      const name = parts[0];
      const href = parts[1] || `/${name.toLowerCase()}`;
      return { name, href };
    });
}

function buildAppIcons(apps) {
  return {
    type: "element",
    tagName: "div",
    properties: { class: "app-icons" },
    children: apps.map(({ name, href }) => ({
      type: "element",
      tagName: "a",
      properties: { href, class: "app-icon" },
      children: [
        {
          type: "element",
          tagName: "div",
          properties: { class: "app-icon-img" },
          children: [makeIconContent(name)],
        },
        {
          type: "element",
          tagName: "span",
          properties: {},
          children: [{ type: "text", value: name }],
        },
      ],
    })),
  };
}

function extractText(node) {
  if (node.type === "text") return node.value;
  if (node.children) return node.children.map(extractText).join("");
  return "";
}

export default function rehypeApps() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (!parent || index === undefined) return;
      if (node.tagName !== "pre") return;

      // Match either: Shiki output (data-language="apps") or standard (language-apps class)
      const code = node.children.find(
        (c) => c.type === "element" && c.tagName === "code",
      );

      const isApps =
        node.properties?.dataLanguage === "apps" ||
        (code &&
          Array.isArray(code.properties?.className) &&
          code.properties.className.includes("language-apps"));

      if (!isApps) return;

      const text = extractText(code || node);
      const apps = parseAppsBlock(text);
      parent.children[index] = buildAppIcons(apps);
    });
  };
}
