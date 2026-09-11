import { useEffect } from "react";
import { useDisplayLanguage } from "@/lib/display-language";
import { translateKoHiVisibleText, type KoHiLanguage } from "@/lib/ko-hi-localization";

const TEXT_ORIGINAL = new WeakMap<Text, string>();
const TEXT_TRANSLATED = new WeakMap<Text, string>();
const ATTR_ORIGINAL = new WeakMap<Element, Map<string, string>>();
const ATTR_TRANSLATED = new WeakMap<Element, Map<string, string>>();
const ATTRS = ["aria-label", "title", "placeholder"] as const;
const SKIP_SELECTOR = "script,style,code,pre,textarea,[contenteditable='true'],[data-no-auto-localize]";

function shouldSkip(node: Node) {
  const parent = node instanceof Element ? node : node.parentElement;
  return Boolean(parent?.closest(SKIP_SELECTOR));
}

function localizeTextNode(node: Text, language: KoHiLanguage | null) {
  if (shouldSkip(node)) return;
  const current = node.nodeValue ?? "";
  const lastTranslated = TEXT_TRANSLATED.get(node);
  if (lastTranslated === undefined || current !== lastTranslated) TEXT_ORIGINAL.set(node, current);
  const original = TEXT_ORIGINAL.get(node) ?? current;
  const next = language ? translateKoHiVisibleText(original, language) : original;
  if (current !== next) node.nodeValue = next;
  TEXT_TRANSLATED.set(node, next);
}

function localizeAttributes(element: Element, language: KoHiLanguage | null) {
  if (shouldSkip(element)) return;
  let originals = ATTR_ORIGINAL.get(element);
  let translated = ATTR_TRANSLATED.get(element);
  if (!originals) { originals = new Map(); ATTR_ORIGINAL.set(element, originals); }
  if (!translated) { translated = new Map(); ATTR_TRANSLATED.set(element, translated); }

  for (const attr of ATTRS) {
    if (!element.hasAttribute(attr)) continue;
    const current = element.getAttribute(attr) ?? "";
    const last = translated.get(attr);
    if (last === undefined || current !== last) originals.set(attr, current);
    const original = originals.get(attr) ?? current;
    const next = language ? translateKoHiVisibleText(original, language) : original;
    if (current !== next) element.setAttribute(attr, next);
    translated.set(attr, next);
  }
}

function walk(root: Node, language: KoHiLanguage | null) {
  if (root instanceof Text) {
    localizeTextNode(root, language);
    return;
  }
  if (root instanceof Element) localizeAttributes(root, language);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
  let node: Node | null = walker.nextNode();
  while (node) {
    if (node instanceof Text) localizeTextNode(node, language);
    else if (node instanceof Element) localizeAttributes(node, language);
    node = walker.nextNode();
  }
}

/**
 * Korean/Hindi are presentation languages layered over the same deterministic
 * calculation engine. This bridge localises legacy customer-facing strings that
 * still branch on the engine locale (which is intentionally `en` for calculation).
 * It never calls a remote translation provider and never changes user-entered data.
 */
export function KoHiLocalizationBridge() {
  const language = useDisplayLanguage((state) => state.language);

  useEffect(() => {
    const target: KoHiLanguage | null = language === "ko" || language === "hi" ? language : null;
    const root = document.body;
    walk(root, target);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          if (mutation.target instanceof Text) localizeTextNode(mutation.target, target);
          continue;
        }
        if (mutation.type === "attributes") {
          if (mutation.target instanceof Element) localizeAttributes(mutation.target, target);
          continue;
        }
        for (const node of mutation.addedNodes) walk(node, target);
      }
    });
    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRS],
    });
    return () => observer.disconnect();
  }, [language]);

  return null;
}
