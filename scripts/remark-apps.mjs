import { visit } from "unist-util-visit";
import yaml from "js-yaml";

const APP_ICONS = {
  app: '<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M41 98.9323C41.5943 95.5064 45.6986 87.5464 55.8296 60.3982C61.2059 45.9913 64.6825 33.7836 67.0702 29.2127C67.4277 28.5283 68.9023 29.6301 69.8245 30.61C71.7429 32.6484 74.4409 41.9634 78.2989 56.1232C80.8381 67.3531 83.1606 78.473 85.4495 88.7975C86.3668 92.9719 86.7884 94.9841 87.4688 98.7721M48.4258 71.8425C51.8741 71.3114 60.6098 69.4854 68.3681 67.8987C73.9069 67.3841 77.91 66.8021 80.0657 66.22C81.3073 66.0221 82.8491 66.0221 84.4375 66.0221" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>',
  browser: '<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M38.7617 33.1526C47.7284 29.9575 72.0949 23.4631 85.5686 23.0052C91.3833 22.8076 94.347 28.2544 95.7783 31.0232C96.4431 32.3092 96.1861 33.6928 95.6032 34.8584C89.0757 47.9117 63.1992 53.1869 65.4846 53.7412C77.1844 56.5791 88.0185 54.5039 91.328 55.4479C94.2228 56.2737 96.12 58.4289 97.4888 60.9205C98.979 63.6331 99.0586 66.7755 98.9162 69.6006C98.5391 77.0783 87.6077 83.7569 79.0902 88.2659C63.3217 92.1844 40.6007 94.1064 33.6693 93.3115C32.6049 92.9571 31.5027 92.457 30 91.2815M48.0664 24.8714C48.0664 24.9332 48.0664 24.9951 47.536 38.0949C47.0055 51.1938 45.9447 77.3272 44.8518 104.253L44.8516 104.258" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>',
  fence: '<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M56.6016 102.957C56.6016 102.261 56.6016 83.7279 56.5526 54.8224C56.5036 44.0914 56.4056 41.3548 56.2649 39.4216C56.1242 37.4884 55.9438 36.4417 55.1797 32.7461M37 32.7461H38.4814C39.5064 32.7461 41.3214 32.7461 50.2015 31.633C59.0817 30.5199 74.972 28.2937 91.8047 26M61.8398 65.5547H64.1775C65.3343 65.5547 67.0398 65.5547 70.8961 65.2988C74.7523 65.0429 80.7078 64.5312 86.8438 64.0039" stroke="white" stroke-width="4" stroke-linecap="round"/></svg>',
};

function makeIconHtml(name) {
  const key = name.toLowerCase();
  if (APP_ICONS[key]) return APP_ICONS[key];
  return name.charAt(0).toUpperCase();
}

function normalizeApps(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (!entry) return null;
      const name = typeof entry === "string" ? entry : entry.name;
      if (!name) return null;
      const href =
        (typeof entry === "object" && entry.href) || `/${name.toLowerCase()}`;
      return { name, href };
    })
    .filter(Boolean);
}

function parseAppsBlock(text) {
  const data = yaml.load(text);
  return normalizeApps(data);
}

function buildAppsHtml(apps) {
  const icons = apps
    .map(
      ({ name, href }) =>
        `<a href="${href}" class="app-icon"><div class="app-icon-img">${makeIconHtml(name)}</div><span>${name}</span></a>`,
    )
    .join("");
  return `<div class="app-icons"><time class="clock" id="clock"></time><div class="app-icons-grid">${icons}</div></div>`;
}

function buildHeroHtml(text) {
  const data = yaml.load(text) || {};
  const image = typeof data.image === "string" ? data.image : "";
  const apps = normalizeApps(data.apps);
  const imgHtml = image ? `<img src="${image}" alt="" />` : "";
  const iconsHtml = apps.length ? buildAppsHtml(apps) : "";

  return `<div class="hero">${imgHtml}${iconsHtml}</div>`;
}

export default function remarkApps() {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (!parent || index === undefined) return;

      if (node.lang === "apps") {
        const apps = parseAppsBlock(node.value);
        parent.children[index] = {
          type: "html",
          value: buildAppsHtml(apps),
        };
      } else if (node.lang === "hero") {
        parent.children[index] = {
          type: "html",
          value: buildHeroHtml(node.value),
        };
      }
    });
  };
}
