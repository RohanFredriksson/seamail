/**
 * A small, dependency-free CSS rewriter for modelling email-client
 * sanitisation. It understands just enough CSS structure (rules, grouping
 * at-rules like @media/@supports, declarations, strings, comments and
 * balanced parentheses) to let an environment declare *policy* - which
 * declarations, selectors and at-rules a client drops - without each
 * environment hand-rolling regexes that mangle things like
 * `background-position` when stripping `position`.
 */

export interface CssPolicy {
  /** Return true to drop this declaration. `prop` is lower-cased, vendor prefix kept. */
  dropDeclaration?(prop: string, value: string): boolean;
  /** Return true to drop the entire rule (CSS invalidates a whole selector list). */
  dropSelector?(selector: string): boolean;
  /** Like dropSelector, but sees the whole comma-separated list (e.g. for "grouping"). */
  dropSelectorList?(selectors: string[]): boolean;
  /** Return true to drop an at-rule (and everything inside it). `name` excludes "@". */
  dropAtRule?(name: string, prelude: string, body: string | null): boolean;
  /** Remove nested rules (CSS nesting) from style rule bodies, keeping their declarations. */
  dropNesting?: boolean;
}

const GROUPING_AT_RULES = new Set(["media", "supports", "layer", "container", "document"]);

/** Splits `text` on `sep` at nesting depth 0, respecting strings and (), [] pairs. */
function splitTopLevel(text: string, sep: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(" || ch === "[") depth++;
    else if (ch === ")" || ch === "]") depth = Math.max(0, depth - 1);
    else if (ch === sep && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts;
}

interface Block {
  prelude: string;
  /** null for statement at-rules such as `@import ...;` */
  body: string | null;
}

/** Parses a stylesheet (or block body) into top-level blocks / statements. */
function parseBlocks(css: string): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  let quote: string | null = null;
  let parens = 0;
  let preludeStart = 0;
  while (i < css.length) {
    const ch = css[i];
    if (quote) {
      if (ch === "\\") i++;
      else if (ch === quote) quote = null;
    } else if (ch === '"' || ch === "'") quote = ch;
    else if (ch === "(") parens++;
    else if (ch === ")") parens = Math.max(0, parens - 1);
    else if (parens === 0 && ch === ";") {
      const prelude = css.slice(preludeStart, i).trim();
      if (prelude) blocks.push({ prelude, body: null });
      preludeStart = i + 1;
    } else if (parens === 0 && ch === "{") {
      const prelude = css.slice(preludeStart, i).trim();
      let depth = 1;
      let j = i + 1;
      let q: string | null = null;
      for (; j < css.length && depth > 0; j++) {
        const c = css[j];
        if (q) {
          if (c === "\\") j++;
          else if (c === q) q = null;
        } else if (c === '"' || c === "'") q = c;
        else if (c === "{") depth++;
        else if (c === "}") depth--;
      }
      blocks.push({ prelude, body: css.slice(i + 1, j - 1) });
      i = j - 1;
      preludeStart = j;
    }
    i++;
  }
  return blocks;
}

function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, "");
}

/** Filters a declaration list (`a: b; c: d`) and returns the surviving declarations. */
function filterDeclarationList(decls: string, policy: CssPolicy): string[] {
  const kept: string[] = [];
  for (const raw of splitTopLevel(decls, ";")) {
    const decl = raw.trim();
    if (!decl) continue;
    const colon = decl.indexOf(":");
    if (colon === -1) continue;
    const prop = decl.slice(0, colon).trim().toLowerCase();
    const value = decl.slice(colon + 1).trim();
    if (policy.dropDeclaration?.(prop, value)) continue;
    kept.push(decl);
  }
  return kept;
}

/** Sanitises the contents of an inline `style="..."` attribute. */
export function sanitizeInlineStyle(style: string, policy: CssPolicy): string {
  return filterDeclarationList(stripComments(style), policy).join("; ");
}

function sanitizeBlocks(blocks: Block[], policy: CssPolicy): string {
  const out: string[] = [];
  for (const { prelude, body } of blocks) {
    if (prelude.startsWith("@")) {
      const name = /^@([\w-]+)/.exec(prelude)?.[1]?.toLowerCase() ?? "";
      const params = prelude.slice(name.length + 1).trim();
      if (policy.dropAtRule?.(name, params, body)) continue;
      if (body === null) {
        out.push(`${prelude};`);
      } else if (GROUPING_AT_RULES.has(name)) {
        const inner = sanitizeBlocks(parseBlocks(body), policy);
        if (inner) out.push(`${prelude} {\n${inner}\n}`);
      } else {
        out.push(`${prelude} {${body}}`);
      }
      continue;
    }
    if (body === null) continue;
    const selectors = splitTopLevel(prelude, ",").map((s) => s.trim());
    if (policy.dropSelector && selectors.some((s) => policy.dropSelector!(s))) continue;
    if (policy.dropSelectorList?.(selectors)) continue;
    let declBody = body;
    if (body.includes("{")) {
      // Nested rules: split them from the declarations that precede/surround them.
      const nested = parseBlocks(body);
      const flat = nested.filter((b) => b.body === null).map((b) => b.prelude);
      declBody = policy.dropNesting ? flat.join(";") : body; // nested rules are kept untouched when the client supports nesting
    }
    if (declBody === body && body.includes("{")) {
      out.push(`${prelude} {${body}}`);
      continue;
    }
    const decls = filterDeclarationList(declBody, policy);
    if (decls.length) out.push(`${prelude} { ${decls.join("; ")}; }`);
  }
  return out.join("\n");
}

/** Sanitises the text of a `<style>` element. */
export function sanitizeStylesheet(css: string, policy: CssPolicy): string {
  return sanitizeBlocks(parseBlocks(stripComments(css)), policy);
}
