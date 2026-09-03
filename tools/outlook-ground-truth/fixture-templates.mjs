/**
 * Hand-crafted minimal, isolated test fixtures for all 236 Can I Email gimmick features.
 * Each entry provides optional `<head>` additions (e.g. `<style>`) and body markup (`<body>`).
 */

export const FIXTURE_TEMPLATES = {
  // HTML Gimmicks
  "html-abbr": {
    body: `<p><abbr title="HyperText Markup Language">HTML</abbr> abbreviation test.</p>`
  },
  "html-acronym": {
    body: `<p><acronym title="World Wide Web">WWW</acronym> acronym test.</p>`
  },
  "html-aria-describedby": {
    body: `<button aria-describedby="desc1">Action</button> <span id="desc1" style="color:#64748b;margin-left:8px;">This text describes the button.</span>`
  },
  "html-aria-labelledby": {
    body: `<div aria-labelledby="header-id"><h3 id="header-id" style="margin:0;color:#e11d48;">Section Title</h3><p style="margin-top:4px;">Section content bound to title.</p></div>`
  },
  "html-aria-live": {
    body: `<div aria-live="polite" style="background:#f1f5f9;padding:10px;border:1px solid #cbd5e1;">Aria live region content.</div>`
  },
  "html-audio": {
    body: `<audio controls><source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg">Audio playback not supported.</audio>`
  },
  "html-background": {
    body: `<table background="https://via.placeholder.com/300x100/2563eb/ffffff?text=HTML+Background" width="300" height="100"><tr><td style="color:#ffffff;font-weight:bold;text-align:center;">Table background attribute test</td></tr></table>`
  },
  "html-bdi": {
    body: `<p>User <bdi>إبراهيم</bdi>: 5 points</p>`
  },
  "html-button-reset": {
    body: `<form><input type="text" value="Default Value" /> <button type="reset" style="padding:4px 12px;margin-left:8px;">Reset Button</button></form>`
  },
  "html-button-submit": {
    body: `<form action="#"><button type="submit" style="background:#2563eb;color:#ffffff;padding:6px 16px;border:none;border-radius:4px;">Submit Button</button></form>`
  },
  "html-command-attribute": {
    body: `<button command="show-modal" commandfor="my-dialog">Command attribute button</button>`
  },
  "html-dfn": {
    body: `<p>A <dfn id="html-def">HTML</dfn> specification definition test.</p>`
  },
  "html-dialog": {
    body: `<dialog open style="border:2px solid #2563eb;padding:15px;background:#f8fafc;"><p style="margin:0;font-weight:bold;">Open HTML Dialog Element</p></dialog>`
  },
  "html-dir": {
    body: `<dir><li>Directory Item 1</li><li>Directory Item 2</li></dir>`
  },
  "html-doctype": {
    body: `<div style="background:#e11d48;color:#ffffff;padding:12px;font-weight:bold;">Doctype HTML test element</div>`
  },
  "html-form": {
    body: `<form action="#" method="post" style="border:1px solid #cbd5e1;padding:12px;background:#f8fafc;"><label>Form Text: <input type="text" name="sample" value="Form value" /></label> <input type="submit" value="Submit" /></form>`
  },
  "html-height": {
    body: `<img src="https://via.placeholder.com/100x100/2563eb/ffffff?text=Height" height="150" alt="Height test" />`
  },
  "html-hidden": {
    body: `<div hidden style="background:#e11d48;color:#ffffff;padding:10px;">Hidden element content (should not render)</div><div style="background:#10b981;color:#ffffff;padding:10px;margin-top:5px;">Visible element content</div>`
  },
  "html-input-checkbox": {
    body: `<label><input type="checkbox" checked /> Checked Checkbox Input</label>`
  },
  "html-input-hidden": {
    body: `<form><input type="hidden" name="token" value="abc123secret" />Hidden input present (text only visible)</form>`
  },
  "html-input-radio": {
    body: `<label><input type="radio" name="opt" checked /> Radio A</label> <label><input type="radio" name="opt" /> Radio B</label>`
  },
  "html-input-reset": {
    body: `<form><input type="text" value="Text to reset" /> <input type="reset" value="Reset Input" style="margin-left:8px;" /></form>`
  },
  "html-input-submit": {
    body: `<form action="#"><input type="submit" value="Submit Input Button" style="background:#2563eb;color:#ffffff;padding:6px 14px;border:none;" /></form>`
  },
  "html-input-text": {
    body: `<input type="text" value="Sample Text Field" style="padding:6px;border:1px solid #94a3b8;" />`
  },
  "html-lists": {
    body: `<ul><li>Unordered list item</li></ul><ol><li>Ordered list item</li></ol><dl><dt>Term</dt><dd>Definition text</dd></dl>`
  },
  "html-loading-attribute": {
    body: `<img src="https://via.placeholder.com/200x100/2563eb/ffffff?text=Lazy+Image" loading="lazy" width="200" height="100" alt="Lazy image" />`
  },
  "html-marquee": {
    body: `<marquee style="background:#f1f5f9;padding:8px;border:1px solid #cbd5e1;color:#e11d48;font-weight:bold;">Scrolling Marquee Text</marquee>`
  },
  "html-meta-color-scheme": {
    head: `<meta name="color-scheme" content="light dark">`,
    body: `<div style="padding:12px;background:#f0f0f0;">Meta color-scheme tag present in head</div>`
  },
  "html-meter": {
    body: `<meter value="0.75" min="0" max="1.0">75%</meter>`
  },
  "html-object": {
    body: `<object data="https://via.placeholder.com/200x100/2563eb/ffffff?text=Object+Data" type="image/png" width="200" height="100">Object fallback text</object>`
  },
  "html-picture": {
    body: `<picture><source srcset="https://via.placeholder.com/200x80/2563eb/ffffff?text=Picture+Source" media="(min-width: 100px)"><img src="https://via.placeholder.com/200x80/e11d48/ffffff?text=Picture+Fallback" alt="Picture tag test" /></picture>`
  },
  "html-popover": {
    body: `<button popovertarget="demo-popover">Toggle Popover</button><div id="demo-popover" popover style="padding:10px;background:#f8fafc;border:1px solid #333;">Popover content</div>`
  },
  "html-progress": {
    body: `<progress value="65" max="100" style="width:200px;">65%</progress>`
  },
  "html-required": {
    body: `<form><input type="text" required placeholder="Required Field" /> <input type="submit" value="Send" /></form>`
  },
  "html-rp": {
    body: `<ruby>漢<rp>(</rp><rt>かん</rt><rp>)</rp></ruby>`
  },
  "html-rt": {
    body: `<ruby>字<rt>じ</rt></ruby>`
  },
  "html-ruby": {
    body: `<ruby>明日 <rp>(</rp><rt>あした</rt><rp>)</rp></ruby>`
  },
  "html-select": {
    body: `<select style="padding:4px 8px;"><option>Option A</option><option selected>Option B (Selected)</option><option>Option C</option></select>`
  },
  "html-semantics": {
    body: `<header style="background:#e2e8f0;padding:8px;">Header</header><main style="padding:8px;"><article>Article</article><section>Section</section><aside>Aside</aside></main><footer style="background:#e2e8f0;padding:8px;">Footer</footer>`
  },
  "html-srcset": {
    body: `<img src="https://via.placeholder.com/200x100/e11d48/ffffff?text=Fallback" srcset="https://via.placeholder.com/200x100/2563eb/ffffff?text=Srcset+1x 1x, https://via.placeholder.com/400x200/2563eb/ffffff?text=Srcset+2x 2x" alt="Srcset test" />`
  },
  "html-style": {
    head: `<style>.style-tag-test { background:#2563eb; color:#ffffff; padding:12px; font-weight:bold; }</style>`,
    body: `<div class="style-tag-test">HTML Style Tag Test</div>`
  },
  "html-svg": {
    body: `<svg width="140" height="60"><rect width="140" height="60" fill="#e11d48" rx="6" /><text x="70" y="35" fill="#ffffff" font-size="14" text-anchor="middle" font-family="sans-serif">Inline SVG</text></svg>`
  },
  "html-target": {
    body: `<a href="https://example.com" target="_blank" style="color:#2563eb;font-weight:bold;">Link with target="_blank"</a>`
  },
  "html-textarea": {
    body: `<textarea rows="3" cols="30" style="padding:6px;">Sample Textarea Content</textarea>`
  },
  "html-video": {
    body: `<video width="240" height="120" controls><source src="movie.mp4" type="video/mp4">Video playback unsupported</video>`
  },
  "html-wbr": {
    body: `<p style="width:100px;word-break:normal;border:1px solid #ccc;padding:5px;">VeryLongWord<wbr>ThatCan<wbr>BreakHere</p>`
  },
  "html-width": {
    body: `<img src="https://via.placeholder.com/100x100/2563eb/ffffff?text=Width" width="200" alt="Width test" />`
  },

  // CSS Gimmicks
  "css-accent-color": {
    body: `<input type="checkbox" checked style="accent-color:#e11d48;" /> <label style="accent-color:#e11d48;font-weight:bold;">Accent Color Checkbox (#e11d48)</label>`
  },
  "css-align-items": {
    body: `<div style="display:flex; align-items:center; height:80px; background:#f1f5f9; border:1px solid #cbd5e1;"><div style="background:#e11d48; color:#ffffff; padding:8px 16px;">Aligned Center Item</div></div>`
  },
  "css-animation": {
    head: `<style>@keyframes test-anim { from { background-color: #2563eb; } to { background-color: #e11d48; } } .anim-box { animation: test-anim 1s infinite alternate; padding: 12px; color: #ffffff; width: 180px; font-weight: bold; }</style>`,
    body: `<div class="anim-box">CSS Animation Test</div>`
  },
  "css-aspect-ratio": {
    body: `<div style="aspect-ratio: 16 / 9; width: 200px; background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">16 / 9 Aspect Ratio Box</div>`
  },
  "css-at-font-face": {
    head: `<style>@font-face { font-family: 'TestFontFace'; src: url('https://fonts.gstatic.com/s/roboto/v30/KFOmCnCnViYB9K2FR8Xn4gjI.woff2') format('woff2'); } .font-face-box { font-family: 'TestFontFace', 'Times New Roman', serif; font-size: 20px; color: #2563eb; font-weight: bold; }</style>`,
    body: `<div class="font-face-box">@font-face Loaded Font Test</div>`
  },
  "css-at-keyframes": {
    head: `<style>@keyframes kf-test { 0% { opacity: 0.2; } 100% { opacity: 1.0; } } .kf-box { animation: kf-test 2s infinite; background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold; }</style>`,
    body: `<div class="kf-box">@keyframes Rule Test</div>`
  },
  "css-at-media": {
    head: `<style>@media all { .media-box { background: #2563eb; color: #ffffff; padding: 12px; font-weight: bold; } } @media screen and (min-width: 100px) { .media-box { background: #e11d48; } }</style>`,
    body: `<div class="media-box">@media Query Test (Red if min-width matches, Blue otherwise)</div>`
  },
  "css-at-media-device-pixel-ratio": {
    head: `<style>@media (-webkit-device-pixel-ratio: 1), (min-resolution: 96dpi) { .dpr-box { background: #e11d48 !important; } }</style>`,
    body: `<div class="dpr-box" style="background:#2563eb;color:#ffffff;padding:12px;font-weight:bold;">Device Pixel Ratio Media Query</div>`
  },
  "css-at-media-hover": {
    head: `<style>@media (hover: hover) { .hover-media { background: #10b981 !important; } }</style>`,
    body: `<div class="hover-media" style="background:#e11d48;color:#ffffff;padding:12px;font-weight:bold;">@media (hover: hover) Test</div>`
  },
  "css-at-media-orientation": {
    head: `<style>@media (orientation: landscape) { .orient-box { background: #2563eb !important; } }</style>`,
    body: `<div class="orient-box" style="background:#e11d48;color:#ffffff;padding:12px;font-weight:bold;">@media (orientation: landscape) Test</div>`
  },
  "css-at-media-prefers-color-scheme": {
    head: `<style>@media (prefers-color-scheme: dark) { .dark-box { background: #0f172a !important; color: #f8fafc !important; border: 1px solid #38bdf8; } }</style>`,
    body: `<div class="dark-box" style="background:#f8fafc;color:#0f172a;padding:12px;border:1px solid #94a3b8;font-weight:bold;">@media (prefers-color-scheme: dark) Test</div>`
  },
  "css-at-media-prefers-reduced-motion": {
    head: `<style>@media (prefers-reduced-motion: reduce) { .prm-box { background: #10b981 !important; } }</style>`,
    body: `<div class="prm-box" style="background:#e11d48;color:#ffffff;padding:12px;font-weight:bold;">@media (prefers-reduced-motion: reduce) Test</div>`
  },
  "css-at-supports": {
    head: `<style>@supports (display: grid) { .supports-box { background: #10b981 !important; } }</style>`,
    body: `<div class="supports-box" style="background:#e11d48;color:#ffffff;padding:12px;font-weight:bold;">@supports (display: grid) Test</div>`
  },
  "css-backdrop-filter": {
    body: `<div style="background: linear-gradient(45deg, #2563eb, #e11d48); padding: 20px;"><div style="backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); background: rgba(255,255,255,0.4); padding: 15px; color: #000000; font-weight: bold;">Backdrop Filter Blur Test</div></div>`
  },
  "css-background": {
    body: `<div style="background: #2563eb url('https://via.placeholder.com/100x50/e11d48/ffffff?text=BG') no-repeat right center; color: #ffffff; padding: 15px; font-weight: bold;">Shorthand background property</div>`
  },
  "css-background-blend-mode": {
    body: `<div style="background-image: url('https://via.placeholder.com/200x100/2563eb/ffffff?text=Pattern'), linear-gradient(#e11d48, #10b981); background-blend-mode: multiply; color: #ffffff; padding: 20px; font-weight: bold;">Background Blend Mode Multiply</div>`
  },
  "css-background-clip": {
    body: `<div style="background: #e11d48; background-clip: content-box; padding: 15px; border: 5px dashed #2563eb; color: #ffffff; font-weight: bold;">Background Clip Content-Box</div>`
  },
  "css-background-image": {
    body: `<div style="background-image: url('https://via.placeholder.com/200x60/2563eb/ffffff?text=BG+Image'); height: 60px; width: 200px; color: #ffffff; font-weight: bold; padding: 10px;">Background Image Test</div>`
  },
  "css-background-origin": {
    body: `<div style="background-image: url('https://via.placeholder.com/50x50/e11d48/ffffff'); background-origin: content-box; background-repeat: no-repeat; padding: 20px; border: 5px solid #2563eb; font-weight: bold;">Background Origin Content-Box</div>`
  },
  "css-background-position": {
    body: `<div style="background-image: url('https://via.placeholder.com/40x40/e11d48/ffffff'); background-position: right bottom; background-repeat: no-repeat; background-color: #f1f5f9; height: 80px; width: 200px; border: 1px solid #cbd5e1; padding: 5px; font-weight: bold;">Background Position Right Bottom</div>`
  },
  "css-background-repeat": {
    body: `<div style="background-image: url('https://via.placeholder.com/30x30/2563eb/ffffff'); background-repeat: repeat-x; background-color: #f8fafc; height: 50px; border: 1px solid #cbd5e1; padding: 5px; font-weight: bold;">Background Repeat X</div>`
  },
  "css-background-size": {
    body: `<div style="background-image: url('https://via.placeholder.com/100x100/2563eb/ffffff?text=Tile'); background-size: contain; background-repeat: no-repeat; background-color: #f1f5f9; height: 100px; width: 200px; border: 1px solid #cbd5e1; font-weight: bold; padding: 5px;">Background Size Contain</div>`
  },
  "css-block-inline-size": {
    body: `<div style="block-size: 60px; inline-size: 180px; background: #e11d48; color: #ffffff; padding: 10px; font-weight: bold;">Block Size 60px, Inline Size 180px</div>`
  },
  "css-border": {
    body: `<div style="border: 3px solid #e11d48; padding: 12px; background: #f8fafc; font-weight: bold;">Border Shorthand 3px Solid Red</div>`
  },
  "css-border-image": {
    body: `<div style="border: 10px solid transparent; border-image: linear-gradient(to right, #2563eb, #e11d48) 1; padding: 10px; font-weight: bold;">Border Image Gradient</div>`
  },
  "css-border-inline-block": {
    body: `<div style="border-block: 3px solid #e11d48; border-inline: 3px solid #2563eb; padding: 10px; font-weight: bold;">Border Block & Inline Shorthand</div>`
  },
  "css-border-inline-block-individual": {
    body: `<div style="border-block-start: 3px solid #e11d48; border-inline-end: 3px solid #2563eb; padding: 10px; font-weight: bold;">Border Block Start & Inline End</div>`
  },
  "css-border-inline-block-longhand": {
    body: `<div style="border-block-start-color: #e11d48; border-block-start-style: solid; border-block-start-width: 4px; padding: 10px; font-weight: bold;">Border Block Start Longhand</div>`
  },
  "css-border-radius": {
    body: `<div style="border-radius: 12px; background: #2563eb; color: #ffffff; padding: 12px; width: 160px; font-weight: bold;">Border Radius 12px</div>`
  },
  "css-border-radius-logical": {
    body: `<div style="border-start-start-radius: 16px; border-end-end-radius: 16px; background: #e11d48; color: #ffffff; padding: 12px; width: 160px; font-weight: bold;">Logical Border Radius</div>`
  },
  "css-border-spacing": {
    body: `<table style="border-collapse: separate; border-spacing: 15px; background: #f1f5f9;"><tr><td style="background:#2563eb;color:#ffffff;padding:8px;">Cell A</td><td style="background:#e11d48;color:#ffffff;padding:8px;">Cell B (15px spacing)</td></tr></table>`
  },
  "css-box-shadow": {
    body: `<div style="box-shadow: 4px 4px 10px rgba(0,0,0,0.3); background: #ffffff; border: 1px solid #cbd5e1; padding: 15px; width: 160px; font-weight: bold;">Box Shadow Test</div>`
  },
  "css-box-sizing": {
    body: `<div style="box-sizing: border-box; width: 150px; padding: 20px; border: 5px solid #2563eb; background: #f1f5f9; font-weight: bold;">Box Sizing Border-Box</div>`
  },
  "css-caption-side": {
    body: `<table border="1" style="width: 200px;"><caption style="caption-side: bottom; color: #e11d48; font-weight: bold;">Caption on Bottom</caption><tr><td>Table Data Cell</td></tr></table>`
  },
  "css-clear": {
    body: `<div><div style="float: left; width: 80px; height: 40px; background: #2563eb; color: #ffffff; padding: 4px;">Float Left</div><div style="clear: both; background: #e11d48; color: #ffffff; padding: 8px; font-weight: bold;">Clear Both Element</div></div>`
  },
  "css-clip-path": {
    body: `<div style="clip-path: polygon(50% 0%, 100% 100%, 0% 100%); background: #e11d48; width: 100px; height: 100px; color: #ffffff; font-weight: bold; text-align: center; line-height: 140px;">Triangle</div>`
  },
  "css-color-scheme": {
    head: `<style>:root { color-scheme: light dark; }</style>`,
    body: `<div style="padding:12px;background:#f0f0f0;font-weight:bold;">CSS color-scheme root declaration test</div>`
  },
  "css-column-count": {
    body: `<div style="column-count: 2; column-gap: 15px; background: #f8fafc; padding: 10px;"><p style="margin:0;">Column 1 text flowing smoothly into Column 2 if multi-column CSS is rendered.</p></div>`
  },
  "css-column-layout-properties": {
    body: `<div style="columns: 2 100px; column-rule: 2px solid #e11d48; column-gap: 20px;"><p style="margin:0;">Multi-column layout with column-rule and gap formatting test.</p></div>`
  },
  "css-conic-gradient": {
    body: `<div style="background: conic-gradient(#2563eb, #e11d48, #10b981, #2563eb); width: 120px; height: 120px; border-radius: 50%;"></div>`
  },
  "css-display": {
    body: `<div style="display: inline-block; background: #2563eb; color: #ffffff; padding: 8px; font-weight: bold;">Inline-Block 1</div> <div style="display: inline-block; background: #e11d48; color: #ffffff; padding: 8px; font-weight: bold;">Inline-Block 2</div>`
  },
  "css-display-flex": {
    body: `<div style="display: flex; justify-content: space-between; background: #f1f5f9; padding: 10px;"><div style="background: #2563eb; color: #ffffff; padding: 8px; font-weight: bold;">Flex Item A</div><div style="background: #e11d48; color: #ffffff; padding: 8px; font-weight: bold;">Flex Item B</div></div>`
  },
  "css-display-grid": {
    body: `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;"><div style="background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">Grid Item 1</div><div style="background: #e11d48; color: #ffffff; padding: 10px; font-weight: bold;">Grid Item 2</div></div>`
  },
  "css-display-none": {
    body: `<div style="display: none; background: #e11d48; color: #ffffff; padding: 10px;">Hidden element (display: none)</div><div style="background: #10b981; color: #ffffff; padding: 10px; font-weight: bold;">Visible element</div>`
  },
  "css-empty-cells": {
    body: `<table border="1" style="empty-cells: hide;"><tr><td>Filled Cell</td><td></td></tr></table>`
  },
  "css-filter": {
    body: `<div style="filter: blur(2px) grayscale(80%); -webkit-filter: blur(2px) grayscale(80%); background: #e11d48; color: #ffffff; padding: 15px; width: 160px; font-weight: bold;">CSS Filter Test</div>`
  },
  "css-flex-direction": {
    body: `<div style="display: flex; flex-direction: column-reverse; background: #f1f5f9; padding: 10px;"><div style="background: #2563eb; color: #ffffff; padding: 6px; font-weight: bold;">First Code (Bottom)</div><div style="background: #e11d48; color: #ffffff; padding: 6px; font-weight: bold;">Second Code (Top)</div></div>`
  },
  "css-flex-wrap": {
    body: `<div style="display: flex; flex-wrap: wrap; width: 140px; background: #f1f5f9; gap: 5px;"><div style="width: 80px; background: #2563eb; color: #ffffff; padding: 5px;">Item 1</div><div style="width: 80px; background: #e11d48; color: #ffffff; padding: 5px;">Item 2</div></div>`
  },
  "css-float": {
    body: `<div><div style="float: left; background: #2563eb; color: #ffffff; padding: 10px; width: 80px; font-weight: bold;">Float Left</div><p style="margin:0; overflow:hidden;">Text content wrapping around floated element block.</p></div>`
  },
  "css-font-kerning": {
    body: `<div style="font-size: 24px; font-kerning: normal;">AV To WA font-kerning normal</div>`
  },
  "css-font-size": {
    body: `<div style="font-size: 24px; font-weight: bold; color: #2563eb;">font-size: 24px text</div>`
  },
  "css-font-size-adjust": {
    body: `<div style="font-size-adjust: 0.5; font-size: 20px;">font-size-adjust 0.5 test</div>`
  },
  "css-font-stretch": {
    body: `<div style="font-stretch: ultra-expanded; font-size: 18px; font-weight: bold;">Ultra Expanded Font Stretch</div>`
  },
  "css-font-weight": {
    body: `<div style="font-weight: 800; font-size: 18px; color: #e11d48;">Font Weight 800 Bold Text</div>`
  },
  "css-function-clamp": {
    body: `<div style="font-size: clamp(12px, 4vw, 28px); background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">clamp(12px, 4vw, 28px) Text</div>`
  },
  "css-function-light-dark": {
    head: `<style>:root { color-scheme: light dark; } .ld-box { background: light-dark(#2563eb, #e11d48); color: #ffffff; padding: 12px; font-weight: bold; }</style>`,
    body: `<div class="ld-box">light-dark() Color Function Test</div>`
  },
  "css-function-max": {
    body: `<div style="width: max(50%, 150px); background: #e11d48; color: #ffffff; padding: 10px; font-weight: bold;">max(50%, 150px) Width Box</div>`
  },
  "css-function-min": {
    body: `<div style="width: min(100%, 180px); background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">min(100%, 180px) Width Box</div>`
  },
  "css-gap": {
    body: `<div style="display: flex; gap: 20px; background: #f1f5f9; padding: 10px;"><div style="background: #2563eb; color: #ffffff; padding: 8px; font-weight: bold;">Box A</div><div style="background: #e11d48; color: #ffffff; padding: 8px; font-weight: bold;">Box B (20px gap)</div></div>`
  },
  "css-grid-template": {
    body: `<div style="display: grid; grid-template-columns: 80px 120px; gap: 10px;"><div style="background: #2563eb; color: #ffffff; padding: 8px; font-weight: bold;">80px</div><div style="background: #e11d48; color: #ffffff; padding: 8px; font-weight: bold;">120px</div></div>`
  },
  "css-height": {
    body: `<div style="height: 60px; background: #e11d48; color: #ffffff; padding: 10px; font-weight: bold;">Explicit Height 60px</div>`
  },
  "css-hyphenate-character": {
    body: `<p style="hyphens: auto; hyphenate-character: '≈'; width: 80px; border: 1px solid #cbd5e1; padding: 4px;">Supercalifragilisticexpialidocious</p>`
  },
  "css-hyphenate-limit-chars": {
    body: `<p style="hyphens: auto; hyphenate-limit-chars: 6 3 3; width: 80px; border: 1px solid #cbd5e1; padding: 4px;">Supercalifragilisticexpialidocious</p>`
  },
  "css-hyphens": {
    body: `<p style="hyphens: auto; width: 90px; border: 1px solid #cbd5e1; padding: 5px;">An extraordinarily long word for hyphens test.</p>`
  },
  "css-important": {
    head: `<style>.imp-test { color: #2563eb !important; }</style>`,
    body: `<div class="imp-test" style="color: #e11d48; font-weight: bold;">!important Override Test (Blue if supported, Red if inline wins)</div>`
  },
  "css-inert-attribute": {
    body: `<div inert style="background: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1;"><button>Inert Container Button</button></div>`
  },
  "css-inline-size": {
    body: `<div style="inline-size: 160px; background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">Inline Size 160px</div>`
  },
  "css-inset": {
    body: `<div style="position: relative; width: 200px; height: 80px; background: #f1f5f9;"><div style="position: absolute; inset: 10px 20px; background: #e11d48; color: #ffffff; padding: 5px; font-weight: bold;">Inset 10px 20px</div></div>`
  },
  "css-intrinsic-size": {
    body: `<div style="width: fit-content; background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">width: fit-content</div>`
  },
  "css-justify-content": {
    body: `<div style="display: flex; justify-content: space-around; background: #f1f5f9; padding: 10px;"><div style="background: #2563eb; color: #ffffff; padding: 6px; font-weight: bold;">A</div><div style="background: #e11d48; color: #ffffff; padding: 6px; font-weight: bold;">B</div></div>`
  },
  "css-left-right-top-bottom": {
    body: `<div style="position: relative; width: 200px; height: 80px; background: #f1f5f9;"><div style="position: absolute; top: 10px; left: 30px; background: #2563eb; color: #ffffff; padding: 6px; font-weight: bold;">Top 10px Left 30px</div></div>`
  },
  "css-letter-spacing": {
    body: `<div style="letter-spacing: 4px; font-weight: bold; color: #2563eb; font-size: 18px;">Letter Spacing 4px</div>`
  },
  "css-line-height": {
    body: `<div style="line-height: 2.5; background: #f1f5f9; padding: 5px; font-weight: bold;">Line 1 with 2.5 line-height<br>Line 2 with 2.5 line-height</div>`
  },
  "css-linear-gradient": {
    body: `<div style="background: linear-gradient(135deg, #2563eb, #e11d48); color: #ffffff; padding: 20px; font-weight: bold;">Linear Gradient 135deg</div>`
  },
  "css-list-style": {
    body: `<ul style="list-style: square inside; color: #e11d48; font-weight: bold;"><li>Square inside list style</li></ul>`
  },
  "css-list-style-image": {
    body: `<ul style="list-style-image: url('https://via.placeholder.com/12x12/e11d48/e11d48');"><li>List style image bullet</li></ul>`
  },
  "css-list-style-position": {
    body: `<ul style="list-style-position: inside; background: #f1f5f9; padding: 10px; font-weight: bold;"><li>List style position inside</li></ul>`
  },
  "css-margin": {
    body: `<div style="margin: 20px; background: #e11d48; color: #ffffff; padding: 10px; font-weight: bold;">Margin 20px surrounding box</div>`
  },
  "css-margin-block-start-end": {
    body: `<div style="margin-block-start: 20px; margin-block-end: 20px; background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">Margin Block Start & End 20px</div>`
  },
  "css-margin-inline-block": {
    body: `<div style="margin-inline: 30px; background: #e11d48; color: #ffffff; padding: 10px; font-weight: bold;">Margin Inline 30px</div>`
  },
  "css-margin-inline-start-end": {
    body: `<div style="margin-inline-start: 40px; background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">Margin Inline Start 40px</div>`
  },
  "css-mask-image": {
    body: `<div style="mask-image: linear-gradient(black, transparent); -webkit-mask-image: linear-gradient(black, transparent); background: #e11d48; color: #ffffff; padding: 20px; font-weight: bold;">Mask Image Gradient Fade</div>`
  },
  "css-max-block-size": {
    body: `<div style="max-block-size: 40px; overflow: hidden; background: #2563eb; color: #ffffff; padding: 5px; font-weight: bold;">Max Block Size 40px overflow hidden</div>`
  },
  "css-max-height": {
    body: `<div style="max-height: 35px; overflow: hidden; background: #e11d48; color: #ffffff; padding: 5px; font-weight: bold;">Max Height 35px overflow hidden content</div>`
  },
  "css-max-inline-size": {
    body: `<div style="max-inline-size: 140px; background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">Max Inline Size 140px box</div>`
  },
  "css-max-width": {
    body: `<div style="max-width: 150px; background: #e11d48; color: #ffffff; padding: 10px; font-weight: bold;">Max Width 150px box</div>`
  },
  "css-min-block-size": {
    body: `<div style="min-block-size: 70px; background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">Min Block Size 70px</div>`
  },
  "css-min-height": {
    body: `<div style="min-height: 80px; background: #e11d48; color: #ffffff; padding: 10px; font-weight: bold;">Min Height 80px</div>`
  },
  "css-min-inline-size": {
    body: `<div style="min-inline-size: 200px; display: inline-block; background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">Min Inline Size 200px</div>`
  },
  "css-min-width": {
    body: `<div style="min-width: 220px; display: inline-block; background: #e11d48; color: #ffffff; padding: 10px; font-weight: bold;">Min Width 220px</div>`
  },
  "css-mix-blend-mode": {
    body: `<div style="background: #2563eb; padding: 15px;"><div style="mix-blend-mode: difference; background: #ffffff; color: #000000; padding: 10px; font-weight: bold;">Mix Blend Mode Difference</div></div>`
  },
  "css-modern-color": {
    body: `<div style="background: oklch(0.6 0.25 25); color: #ffffff; padding: 15px; font-weight: bold;">oklch() Modern Color Format</div>`
  },
  "css-nesting": {
    head: `<style>.nest-parent { background: #f1f5f9; padding: 10px; & .nest-child { background: #e11d48; color: #ffffff; padding: 8px; font-weight: bold; } }</style>`,
    body: `<div class="nest-parent"><div class="nest-child">CSS Native Nesting Test</div></div>`
  },
  "css-object-fit": {
    body: `<img src="https://via.placeholder.com/300x150/2563eb/ffffff?text=Object+Fit" style="object-fit: cover; width: 120px; height: 120px; border: 2px solid #333;" alt="Object Fit Cover" />`
  },
  "css-object-position": {
    body: `<img src="https://via.placeholder.com/300x150/e11d48/ffffff?text=Object+Pos" style="object-fit: cover; object-position: right bottom; width: 120px; height: 120px; border: 2px solid #333;" alt="Object Position" />`
  },
  "css-opacity": {
    body: `<div style="opacity: 0.35; background: #2563eb; color: #ffffff; padding: 15px; font-weight: bold;">Opacity 0.35 Semi-transparent</div>`
  },
  "css-orphans": {
    body: `<div style="orphans: 3; columns: 2;"><p>Testing orphans property across multi-column layout text blocks.</p></div>`
  },
  "css-outline": {
    body: `<div style="outline: 3px solid #e11d48; padding: 12px; background: #f8fafc; font-weight: bold;">Outline 3px Solid Red</div>`
  },
  "css-outline-offset": {
    body: `<div style="outline: 2px solid #2563eb; outline-offset: 6px; padding: 10px; background: #f1f5f9; margin: 10px; font-weight: bold;">Outline Offset 6px</div>`
  },
  "css-overflow": {
    body: `<div style="overflow: scroll; width: 150px; height: 50px; border: 1px solid #cbd5e1; background: #f8fafc; padding: 4px;">Overflow scroll container with text content exceeding box bounds.</div>`
  },
  "css-overflow-wrap": {
    body: `<p style="overflow-wrap: break-word; width: 100px; border: 1px solid #cbd5e1; padding: 5px;">SupercalifragilisticexpialidociousOverflowWrap</p>`
  },
  "css-padding": {
    body: `<div style="padding: 25px; background: #2563eb; color: #ffffff; font-weight: bold;">Padding 25px Box</div>`
  },
  "css-padding-block-start-end": {
    body: `<div style="padding-block-start: 20px; padding-block-end: 20px; background: #e11d48; color: #ffffff; font-weight: bold;">Padding Block Start & End 20px</div>`
  },
  "css-padding-inline-block": {
    body: `<div style="padding-inline: 30px; background: #2563eb; color: #ffffff; font-weight: bold;">Padding Inline 30px</div>`
  },
  "css-padding-inline-start-end": {
    body: `<div style="padding-inline-start: 35px; background: #e11d48; color: #ffffff; font-weight: bold;">Padding Inline Start 35px</div>`
  },
  "css-position": {
    body: `<div style="position: relative; width: 200px; height: 80px; background: #f1f5f9;"><div style="position: absolute; top: 15px; right: 15px; background: #e11d48; color: #ffffff; padding: 6px; font-weight: bold;">Absolute Position</div></div>`
  },
  "css-pseudo-class-active": {
    head: `<style>.act-btn:active { background: #e11d48 !important; }</style>`,
    body: `<button class="act-btn" style="background:#2563eb;color:#ffffff;padding:8px 16px;">Active Pseudo Class Button</button>`
  },
  "css-pseudo-class-checked": {
    head: `<style>input:checked + label { color: #e11d48; font-weight: bold; }</style>`,
    body: `<input type="checkbox" id="chk1" checked /> <label for="chk1">:checked Label Style (Red)</label>`
  },
  "css-pseudo-class-default": {
    head: `<style>input:default { outline: 2px solid #2563eb; }</style>`,
    body: `<form><input type="submit" value="Default Button" /></form>`
  },
  "css-pseudo-class-first-child": {
    head: `<style>.fc-list li:first-child { color: #e11d48; font-weight: bold; }</style>`,
    body: `<ul class="fc-list"><li>First Child (Red)</li><li>Second Child</li></ul>`
  },
  "css-pseudo-class-first-of-type": {
    head: `<style>.fot-div p:first-of-type { color: #2563eb; font-weight: bold; }</style>`,
    body: `<div class="fot-div"><h1>Header</h1><p>First paragraph of type (Blue)</p><p>Second paragraph</p></div>`
  },
  "css-pseudo-class-focus": {
    head: `<style>.foc-input:focus { border-color: #e11d48; background: #fff1f2; }</style>`,
    body: `<input type="text" class="foc-input" value="Focus Test Input" style="padding:6px;border:2px solid #cbd5e1;" />`
  },
  "css-pseudo-class-focus-visible": {
    head: `<style>.fv-btn:focus-visible { outline: 3px solid #e11d48; }</style>`,
    body: `<button class="fv-btn" style="padding:8px 16px;">Focus Visible Button</button>`
  },
  "css-pseudo-class-focus-within": {
    head: `<style>.fw-box:focus-within { background: #fee2e2; border-color: #ef4444; }</style>`,
    body: `<div class="fw-box" style="padding:10px;border:1px solid #cbd5e1;"><input type="text" placeholder="Focus within container" /></div>`
  },
  "css-pseudo-class-has": {
    head: `<style>.has-box:has(input:checked) { background: #dcfce7; border-color: #22c55e; }</style>`,
    body: `<div class="has-box" style="padding:10px;border:1px solid #cbd5e1;"><label><input type="checkbox" checked /> :has() Parent Style Target</label></div>`
  },
  "css-pseudo-class-hover": {
    head: `<style>.hvr-box:hover { background: #e11d48 !important; }</style>`,
    body: `<div class="hvr-box" style="background:#2563eb;color:#ffffff;padding:12px;width:150px;font-weight:bold;">Hover Over Me</div>`
  },
  "css-pseudo-class-lang": {
    head: `<style>p:lang(fr) { color: #2563eb; font-style: italic; font-weight: bold; }</style>`,
    body: `<p lang="fr">Ceci est un texte en français (:lang test).</p>`
  },
  "css-pseudo-class-last-child": {
    head: `<style>.lc-list li:last-child { color: #e11d48; font-weight: bold; }</style>`,
    body: `<ul class="lc-list"><li>First Item</li><li>Last Child Item (Red)</li></ul>`
  },
  "css-pseudo-class-last-of-type": {
    head: `<style>.lot-div p:last-of-type { color: #2563eb; font-weight: bold; }</style>`,
    body: `<div class="lot-div"><p>Paragraph 1</p><p>Last Paragraph of Type (Blue)</p><h1>Footer Heading</h1></div>`
  },
  "css-pseudo-class-not": {
    head: `<style>.not-list li:not(.skip) { color: #e11d48; font-weight: bold; }</style>`,
    body: `<ul class="not-list"><li>Match :not (Red)</li><li class="skip">Skipped Class</li></ul>`
  },
  "css-pseudo-class-nth-child": {
    head: `<style>.nth-list li:nth-child(2) { color: #2563eb; font-weight: bold; }</style>`,
    body: `<ul class="nth-list"><li>Item 1</li><li>Item 2 (nth-child 2 Blue)</li><li>Item 3</li></ul>`
  },
  "css-pseudo-class-nth-last-child": {
    head: `<style>.nlc-list li:nth-last-child(1) { color: #e11d48; font-weight: bold; }</style>`,
    body: `<ul class="nlc-list"><li>Item A</li><li>Item B (nth-last-child 1 Red)</li></ul>`
  },
  "css-pseudo-class-nth-last-of-type": {
    head: `<style>.nlot-div p:nth-last-of-type(1) { color: #2563eb; font-weight: bold; }</style>`,
    body: `<div class="nlot-div"><p>Para 1</p><p>Para 2 (nth-last-of-type 1 Blue)</p></div>`
  },
  "css-pseudo-class-nth-of-type": {
    head: `<style>.not-div p:nth-of-type(odd) { color: #e11d48; font-weight: bold; }</style>`,
    body: `<div class="not-div"><p>Para 1 (Odd - Red)</p><p>Para 2 (Even)</p><p>Para 3 (Odd - Red)</p></div>`
  },
  "css-pseudo-class-only-child": {
    head: `<style>.oc-box span:only-child { color: #2563eb; font-weight: bold; }</style>`,
    body: `<div class="oc-box"><span>Only Child Span (Blue)</span></div>`
  },
  "css-pseudo-class-only-of-type": {
    head: `<style>.oot-box p:only-of-type { color: #e11d48; font-weight: bold; }</style>`,
    body: `<div class="oot-box"><h1>Title</h1><p>Only Paragraph of Type (Red)</p></div>`
  },
  "css-pseudo-class-target": {
    head: `<style>:target { background: #fee2e2; border: 2px solid #ef4444; }</style>`,
    body: `<div id="target-sec" style="padding:10px;">Target Section (:target pseudo-class)</div><a href="#target-sec">Jump to Target</a>`
  },
  "css-pseudo-class-visited": {
    head: `<style>a:visited { color: #7c3aed; }</style>`,
    body: `<a href="#" style="color:#2563eb;font-weight:bold;">Visited Link Test</a>`
  },
  "css-pseudo-element-after": {
    head: `<style>.p-after::after { content: ' [AFTER PSEUDO]'; color: #e11d48; font-weight: bold; }</style>`,
    body: `<div class="p-after">Base Content</div>`
  },
  "css-pseudo-element-before": {
    head: `<style>.p-before::before { content: '[BEFORE PSEUDO] '; color: #2563eb; font-weight: bold; }</style>`,
    body: `<div class="p-before">Base Content</div>`
  },
  "css-pseudo-element-first-letter": {
    head: `<style>.p-fl::first-letter { font-size: 32px; color: #e11d48; font-weight: bold; float: left; margin-right: 4px; }</style>`,
    body: `<p class="p-fl">First letter pseudo-element test paragraph content.</p>`
  },
  "css-pseudo-element-first-line": {
    head: `<style>.p-fline::first-line { color: #2563eb; font-weight: bold; }</style>`,
    body: `<p class="p-fline" style="width:150px;">First line pseudo element styling test wrapping onto second line.</p>`
  },
  "css-pseudo-element-marker": {
    head: `<style>li::marker { color: #e11d48; font-size: 20px; }</style>`,
    body: `<ul><li>Custom ::marker list item</li></ul>`
  },
  "css-pseudo-element-placeholder": {
    head: `<style>::placeholder { color: #2563eb; font-style: italic; }</style>`,
    body: `<input type="text" placeholder="Custom Placeholder Style" style="padding:6px;width:200px;" />`
  },
  "css-radial-gradient": {
    body: `<div style="background: radial-gradient(circle, #2563eb, #e11d48); width: 140px; height: 100px; color: #ffffff; padding: 10px; font-weight: bold;">Radial Gradient</div>`
  },
  "css-resize": {
    body: `<textarea style="resize: both; width: 150px; height: 60px;">Resizable Textarea (resize: both)</textarea>`
  },
  "css-rgb": {
    body: `<div style="background: rgb(225, 29, 72); color: rgb(255, 255, 255); padding: 12px; font-weight: bold;">rgb(225, 29, 72) Color</div>`
  },
  "css-rgba": {
    body: `<div style="background: rgba(37, 99, 235, 0.7); color: #ffffff; padding: 12px; font-weight: bold;">rgba(37, 99, 235, 0.7) Semi-transparent</div>`
  },
  "css-scroll-snap": {
    head: `<style>.snap-container { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; width: 180px; gap: 10px; } .snap-child { flex: 0 0 160px; scroll-snap-align: start; padding: 15px; color: #ffffff; font-weight: bold; } .sc1 { background: #2563eb; } .sc2 { background: #e11d48; }</style>`,
    body: `<div class="snap-container"><div class="snap-child sc1">Snap Item 1</div><div class="snap-child sc2">Snap Item 2</div></div>`
  },
  "css-selector-adjacent-sibling": {
    head: `<style>h3 + p { color: #e11d48; font-weight: bold; }</style>`,
    body: `<h3>Header</h3><p>Adjacent Sibling Paragraph (Red)</p>`
  },
  "css-selector-attribute": {
    head: `<style>[data-test="highlight"] { background: #2563eb; color: #ffffff; padding: 8px; font-weight: bold; }</style>`,
    body: `<div data-test="highlight">Attribute Selector [data-test="highlight"]</div>`
  },
  "css-selector-chaining": {
    head: `<style>.box.primary.active { background: #e11d48; color: #ffffff; padding: 8px; font-weight: bold; }</style>`,
    body: `<div class="box primary active">Chained Class Selector .box.primary.active</div>`
  },
  "css-selector-child": {
    head: `<style>.parent-div > p { color: #2563eb; font-weight: bold; }</style>`,
    body: `<div class="parent-div"><p>Direct Child Paragraph (Blue)</p><div><p>Nested Paragraph (Normal)</p></div></div>`
  },
  "css-selector-general-sibling": {
    head: `<style>h3 ~ p { color: #e11d48; font-weight: bold; }</style>`,
    body: `<h3>Header</h3><div>Div in between</div><p>General Sibling Paragraph (Red)</p>`
  },
  "css-selector-universal": {
    head: `<style>.univ-box * { border: 1px dashed #2563eb; padding: 4px; margin: 2px; display: inline-block; }</style>`,
    body: `<div class="univ-box"><span>Universal * Child 1</span><span>Child 2</span></div>`
  },
  "css-shape-margin": {
    body: `<div style="shape-outside: circle(50%); shape-margin: 15px; float: left; width: 60px; height: 60px; background: #e11d48; border-radius: 50%;"></div><p>Shape margin text wrapping around circular float.</p>`
  },
  "css-shape-outside": {
    body: `<div style="shape-outside: circle(50%); float: left; width: 60px; height: 60px; background: #2563eb; border-radius: 50%;"></div><p>Shape outside circle text wrapping around float shape.</p>`
  },
  "css-sytem-ui": {
    body: `<div style="font-family: system-ui, ui-sans-serif, sans-serif; font-size: 18px; font-weight: bold;">system-ui Font Family Test</div>`
  },
  "css-tab-size": {
    body: `<pre style="tab-size: 4; -moz-tab-size: 4; background: #f1f5f9; padding: 10px; font-weight: bold;">&#9;Tabbed content with tab-size: 4</pre>`
  },
  "css-table-layout": {
    body: `<table style="table-layout: fixed; width: 200px; border: 1px solid #cbd5e1;"><tr><td style="width: 50px; background: #2563eb; color: #ffffff; padding: 4px;">50px</td><td style="width: 150px; background: #e11d48; color: #ffffff; padding: 4px;">150px</td></tr></table>`
  },
  "css-text-align": {
    body: `<div style="text-align: center; background: #f1f5f9; padding: 10px; font-weight: bold; color: #2563eb;">Text Align Center</div>`
  },
  "css-text-align-last": {
    body: `<p style="text-align: justify; text-align-last: center; width: 200px; background: #f8fafc; padding: 8px; font-weight: bold;">Multi-line justified text with the last line centered using text-align-last.</p>`
  },
  "css-text-decoration": {
    body: `<div style="text-decoration: underline double #e11d48; font-size: 18px; font-weight: bold;">Text Decoration Double Underline Red</div>`
  },
  "css-text-decoration-color": {
    body: `<div style="text-decoration: underline; text-decoration-color: #2563eb; font-size: 18px; font-weight: bold;">Text Decoration Color Blue</div>`
  },
  "css-text-decoration-line": {
    body: `<div style="text-decoration-line: line-through; font-size: 18px; color: #e11d48; font-weight: bold;">Text Decoration Line-Through</div>`
  },
  "css-text-decoration-skip-ink": {
    body: `<div style="text-decoration: underline; text-decoration-skip-ink: none; font-size: 20px; font-weight: bold;">p g q j y text decoration skip ink none</div>`
  },
  "css-text-decoration-style": {
    body: `<div style="text-decoration: underline; text-decoration-style: wavy; font-size: 18px; color: #2563eb; font-weight: bold;">Text Decoration Wavy Style</div>`
  },
  "css-text-decoration-thickness": {
    body: `<div style="text-decoration: underline; text-decoration-thickness: 4px; font-size: 18px; color: #e11d48; font-weight: bold;">Text Decoration Thickness 4px</div>`
  },
  "css-text-emphasis": {
    body: `<div style="text-emphasis: triangle #2563eb; -webkit-text-emphasis: triangle #2563eb; font-size: 18px; font-weight: bold;">Text Emphasis Triangles</div>`
  },
  "css-text-emphasis-position": {
    body: `<div style="text-emphasis: dot #e11d48; text-emphasis-position: under right; -webkit-text-emphasis: dot #e11d48; font-size: 18px; font-weight: bold;">Text Emphasis Under Right</div>`
  },
  "css-text-justify": {
    body: `<p style="text-align: justify; text-justify: inter-word; width: 180px; background: #f1f5f9; padding: 8px;">Text justify inter-word mode content wrapping in box.</p>`
  },
  "css-text-orientation": {
    body: `<div style="writing-mode: vertical-rl; text-orientation: upright; height: 100px; background: #f8fafc; padding: 10px; font-weight: bold;">Upright Text</div>`
  },
  "css-text-overflow": {
    body: `<div style="text-overflow: ellipsis; overflow: hidden; white-space: nowrap; width: 140px; background: #f1f5f9; padding: 6px; border: 1px solid #cbd5e1; font-weight: bold;">Very Long Text Truncated With Ellipsis</div>`
  },
  "css-text-shadow": {
    body: `<div style="text-shadow: 2px 2px 4px rgba(0,0,0,0.5); font-size: 22px; font-weight: bold; color: #2563eb;">Text Shadow Test</div>`
  },
  "css-text-transform": {
    body: `<div style="text-transform: uppercase; font-weight: bold; color: #e11d48;">uppercase text transform test</div>`
  },
  "css-text-underline-offset": {
    body: `<div style="text-decoration: underline; text-underline-offset: 8px; font-size: 18px; color: #2563eb; font-weight: bold;">Text Underline Offset 8px</div>`
  },
  "css-text-underline-position": {
    body: `<div style="text-decoration: underline; text-underline-position: under; font-size: 18px; color: #e11d48; font-weight: bold;">Text Underline Position Under</div>`
  },
  "css-text-wrap": {
    body: `<p style="text-wrap: balance; width: 180px; background: #f1f5f9; padding: 8px; font-weight: bold;">Balanced text wrapping title headline test.</p>`
  },
  "css-transform": {
    body: `<div style="transform: rotate(5deg) scale(1.05); background: #2563eb; color: #ffffff; padding: 12px; width: 150px; font-weight: bold;">Transform Rotate 5deg</div>`
  },
  "css-transition": {
    head: `<style>.trans-box { transition: background-color 0.5s ease; background: #2563eb; color: #ffffff; padding: 10px; width: 150px; font-weight: bold; } .trans-box:hover { background: #e11d48; }</style>`,
    body: `<div class="trans-box">CSS Transition Test</div>`
  },
  "css-unit-calc": {
    body: `<div style="width: calc(100% - 40px); background: #e11d48; color: #ffffff; padding: 10px; font-weight: bold;">Width calc(100% - 40px)</div>`
  },
  "css-unit-ch": {
    body: `<div style="width: 20ch; background: #2563eb; color: #ffffff; padding: 10px; font-family: monospace; font-weight: bold;">Width 20ch Monospace</div>`
  },
  "css-unit-initial": {
    body: `<div style="color: initial; background: #f1f5f9; padding: 10px; font-weight: bold;">Color initial property value</div>`
  },
  "css-unit-rem": {
    body: `<div style="font-size: 1.5rem; padding: 1rem; background: #e11d48; color: #ffffff; font-weight: bold;">1.5rem Font Size & 1rem Padding</div>`
  },
  "css-unit-vh": {
    body: `<div style="height: 15vh; background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">Height 15vh</div>`
  },
  "css-unit-vmax": {
    body: `<div style="width: 20vmax; background: #e11d48; color: #ffffff; padding: 10px; font-weight: bold;">Width 20vmax</div>`
  },
  "css-unit-vmin": {
    body: `<div style="width: 20vmin; background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">Width 20vmin</div>`
  },
  "css-unit-vw": {
    body: `<div style="width: 40vw; background: #e11d48; color: #ffffff; padding: 10px; font-weight: bold;">Width 40vw</div>`
  },
  "css-user-select": {
    body: `<div style="user-select: none; -webkit-user-select: none; background: #f1f5f9; padding: 10px; border: 1px solid #cbd5e1; font-weight: bold;">Unselectable Text (user-select: none)</div>`
  },
  "css-variables": {
    head: `<style>:root { --test-bg: #2563eb; --test-fg: #ffffff; } .var-box { background: var(--test-bg); color: var(--test-fg); padding: 12px; font-weight: bold; }</style>`,
    body: `<div class="var-box">CSS Custom Properties var() Test</div>`
  },
  "css-visibility": {
    body: `<div style="visibility: hidden; background: #e11d48; color: #ffffff; padding: 10px;">Invisible (visibility: hidden)</div><div style="background: #10b981; color: #ffffff; padding: 10px; font-weight: bold;">Visible Below</div>`
  },
  "css-white-space": {
    body: `<pre style="white-space: pre-wrap; background: #f1f5f9; padding: 10px; font-weight: bold;">White   space   pre-wrap   preserves   spaces.</pre>`
  },
  "css-white-space-collapse": {
    body: `<div style="white-space-collapse: preserve; background: #f8fafc; padding: 10px; font-weight: bold;">White   space   collapse   preserve test.</div>`
  },
  "css-widows": {
    body: `<div style="widows: 3; columns: 2;"><p style="margin:0;">Widows 3 multi-column text test.</p></div>`
  },
  "css-width": {
    body: `<div style="width: 180px; background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">Explicit Width 180px</div>`
  },
  "css-word-spacing": {
    body: `<div style="word-spacing: 12px; font-weight: bold; color: #e11d48; font-size: 18px;">Word Spacing 12px Test</div>`
  },
  "css-word-wrap": {
    body: `<div style="word-wrap: break-word; width: 100px; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 5px; font-weight: bold;">SupercalifragilisticexpialidociousWordWrap</div>`
  },
  "css-writing-mode": {
    body: `<div style="writing-mode: vertical-rl; height: 120px; background: #2563eb; color: #ffffff; padding: 10px; font-weight: bold;">Vertical Writing Mode</div>`
  },
  "css-z-index": {
    body: `<div style="position: relative; height: 60px;"><div style="position: absolute; z-index: 1; top: 0; left: 0; background: #2563eb; color: #ffffff; padding: 15px; width: 100px; font-weight: bold;">Z-Index 1</div><div style="position: absolute; z-index: 2; top: 10px; left: 20px; background: #e11d48; color: #ffffff; padding: 15px; width: 100px; font-weight: bold;">Z-Index 2</div></div>`
  }
};
