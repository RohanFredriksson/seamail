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
    bodyStyle: "background:#f1f5f9;padding:8px;",
    body: `<p style="background:#f1f5f9;padding:8px;">Content inside &lt;body&gt; (styled body tag test).</p>`,
  },
  "html-link": {
    head: `<link rel="stylesheet" href="https://example.com/style.css" />`,
    body: `<p style="color:#2563eb;">&lt;link&gt; element test.</p>`,
  },

  // ---- fixtures for features that are not Outlook gimmicks ------------
  // (mostly broadly-supported basics: these guard against over-stripping)
  "css-background-color": {
    body: `<div style="background-color:#2563eb;color:#ffffff;padding:12px;">background-color</div>`,
  },
  "css-border-collapse": {
    body: `<table style="border-collapse:collapse;"><tr><td style="border:2px solid #333;padding:6px;">A</td><td style="border:2px solid #333;padding:6px;">B</td></tr></table>`,
  },
  "css-comments": {
    head: `<style>/* a comment */ .cm { color: #e11d48; font-weight: bold; /* inline comment */ }</style>`,
    body: `<p class="cm">CSS comments test.</p>`,
  },
  "css-direction": {
    body: `<div style="direction:rtl;background:#f1f5f9;padding:8px;">direction: rtl text</div>`,
  },
  "css-font": {
    body: `<p style="font: italic bold 20px/1.5 Georgia, serif;">font shorthand</p>`,
  },
  "css-list-style-type": {
    body: `<ul style="list-style-type:square;"><li>One</li><li>Two</li></ul>`,
  },
  "css-selector-class": {
    head: `<style>.sc-class { color: #e11d48; font-weight: bold; }</style>`,
    body: `<p class="sc-class">Class selector.</p>`,
  },
  "css-selector-descendant": {
    head: `<style>.sd-outer span { color: #2563eb; font-weight: bold; }</style>`,
    body: `<div class="sd-outer"><span>Descendant selector.</span></div>`,
  },
  "css-selector-grouping": {
    head: `<style>.sg-a, .sg-b { color: #e11d48; font-weight: bold; }</style>`,
    body: `<p class="sg-a">Group A.</p><p class="sg-b">Group B.</p>`,
  },
  "css-selector-id": {
    head: `<style>#sid-box { background: #10b981; color: #ffffff; padding: 8px; }</style>`,
    body: `<div id="sid-box">ID selector.</div>`,
  },
  "css-selector-type": {
    head: `<style>h2 { color: #e11d48; }</style>`,
    body: `<h2>Type selector.</h2>`,
  },
  "css-unit-cm": { body: `<div style="width:3cm;background:#2563eb;color:#fff;">3cm</div>` },
  "css-unit-em": { body: `<div style="width:12em;background:#2563eb;color:#fff;">12em</div>` },
  "css-unit-ex": { body: `<div style="width:20ex;background:#2563eb;color:#fff;">20ex</div>` },
  "css-unit-in": { body: `<div style="width:2in;background:#2563eb;color:#fff;">2in</div>` },
  "css-unit-mm": { body: `<div style="width:40mm;background:#2563eb;color:#fff;">40mm</div>` },
  "css-unit-pc": { body: `<div style="width:12pc;background:#2563eb;color:#fff;">12pc</div>` },
  "css-unit-percent": {
    body: `<div style="width:50%;background:#2563eb;color:#fff;">50%</div>`,
  },
  "css-unit-pt": { body: `<div style="font-size:18pt;background:#f1f5f9;">18pt</div>` },
  "css-unit-px": { body: `<div style="width:200px;background:#2563eb;color:#fff;">200px</div>` },
  "css-vertical-align": {
    body: `<table><tr><td style="height:60px;vertical-align:bottom;background:#f1f5f9;">bottom</td></tr></table>`,
  },
  "html-address": { body: `<address>123 Example Street</address>` },
  "html-align": {
    body: `<div align="center" style="background:#f1f5f9;">align=center</div>`,
  },
  "html-anchor-links": {
    body: `<p><a href="#target">Jump</a></p><p id="target" style="margin-top:40px;">Anchor target</p>`,
  },
  "html-aria-hidden": {
    body: `<span aria-hidden="true" style="color:#e11d48;font-weight:bold;">aria-hidden text</span>`,
  },
  "html-aria-label": {
    body: `<a href="https://example.com" aria-label="Example link" style="color:#2563eb;">aria-label link</a>`,
  },
  "html-blockquote": { body: `<blockquote>Quoted text in a blockquote.</blockquote>` },
  "html-cellpadding": {
    body: `<table cellpadding="12" border="1"><tr><td>cellpadding=12</td></tr></table>`,
  },
  "html-cellspacing": {
    body: `<table cellspacing="12" border="1"><tr><td>A</td><td>B</td></tr></table>`,
  },
  "html-code": { body: `<p>Inline <code>code element</code>.</p>` },
  "html-comments": {
    body: `<!-- html comment --><p>Text after an HTML comment.</p>`,
  },
  "html-del": { body: `<p><del>deleted</del> <ins>inserted</ins></p>` },
  "html-div": { body: `<div style="background:#f1f5f9;padding:8px;">div element</div>` },
  "html-h1-h6": {
    body: `<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>`,
  },
  "html-hr": { body: `<p>Above</p><hr /><p>Below</p>` },
  "html-image-maps": {
    body: `<img src="data:image/gif;base64,R0lGODlhAQABAIAAAOMeEQAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="120" height="60" usemap="#m" alt="map" /><map name="m"><area shape="rect" coords="0,0,60,60" href="https://example.com" alt="a" /></map>`,
  },
  "html-img": {
    body: `<img src="data:image/gif;base64,R0lGODlhAQABAIAAAOMeEQAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==" width="120" height="60" alt="image" style="display:block;" />`,
  },
  "html-lang": { body: `<p lang="fr">Bonjour le monde (lang attribute).</p>` },
  "html-mailto-links": { body: `<p><a href="mailto:someone@example.com">mailto link</a></p>` },
  "html-p": { body: `<p>Paragraph one.</p><p>Paragraph two.</p>` },
  "html-pre": { body: `<pre>preformatted   text\n  keeps spacing</pre>` },
  "html-role": {
    body: `<table role="presentation"><tr><td style="background:#f1f5f9;padding:8px;">role=presentation</td></tr></table>`,
  },
  "html-small": { body: `<p>Normal <small>small text</small></p>` },
  "html-span": {
    body: `<p>A <span style="color:#e11d48;font-weight:bold;">span element</span>.</p>`,
  },
  "html-strike": { body: `<p><strike>strike element</strike> <s>s element</s></p>` },
  "html-strong": { body: `<p><strong>strong</strong> and <em>em</em> and <b>b</b></p>` },
  "html-table": {
    body: `<table width="300" border="1"><tr><th>H</th><td>Cell</td></tr></table>`,
  },
  "html-valign": {
    body: `<table><tr><td valign="bottom" height="60" style="background:#f1f5f9;">valign=bottom</td></tr></table>`,
  },
};
