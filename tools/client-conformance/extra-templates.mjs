/**
 * Fixture templates for Can I Email features that matter to Gmail / Apple Mail
 * but are not Outlook "gimmicks" (so they have no entry in
 * ../outlook-ground-truth/fixture-templates.mjs).
 */
export const EXTRA_TEMPLATES = {
  "css-at-import": {
    head: `<style>@import url("https://example.com/missing.css"); .imp { color: #e11d48; font-weight: bold; }</style>`,
    body: `<p class="imp">@import stylesheet test.</p>`,
  },
  "css-cursor": {
    body: `<div style="cursor:pointer;background:#f1f5f9;padding:12px;border:1px solid #cbd5e1;">cursor: pointer</div>`,
  },
  "css-pseudo-class-link": {
    head: `<style>a:link { color: #e11d48; }</style>`,
    body: `<p><a href="https://example.com">:link pseudo-class</a></p>`,
  },
  "css-text-indent": {
    body: `<p style="text-indent:40px;">text-indent: 40px. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>`,
  },
  "css-word-break": {
    body: `<div style="width:120px;word-break:break-all;background:#f1f5f9;">Supercalifragilisticexpialidocious</div>`,
  },
  "html-base": {
    head: `<base href="https://example.com/" />`,
    body: `<p><a href="page">Relative link under &lt;base&gt;</a></p>`,
  },
  "html-body": {
    body: `<p style="background:#f1f5f9;padding:8px;">Content inside &lt;body&gt; (styled body tag test).</p>`,
  },
  "html-link": {
    head: `<link rel="stylesheet" href="https://example.com/style.css" />`,
    body: `<p style="color:#2563eb;">&lt;link&gt; element test.</p>`,
  },
};
