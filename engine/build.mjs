// build.mjs — spec（データ定義ファイル）から単一ファイルのHTML資料を生成する
// 使い方: node engine/build.mjs <specのパス> [出力HTMLのパス]
// 例:      node engine/build.mjs engine/specs/sample/spec.js output/sample.html
//
// 出力は CSS・JS・データをすべて埋め込んだ1ファイル。
// Chrome で開き、Ctrl/Cmd + P →「PDFに保存」で 16:9 のスライドPDFになる。
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

const specArg = process.argv[2];
if (!specArg) {
  console.error("使い方: node engine/build.mjs <specのパス> [出力HTMLのパス]");
  process.exit(1);
}
const specPath = resolve(process.cwd(), specArg);
const spec = specPath.endsWith(".json")
  ? JSON.parse(readFileSync(specPath, "utf8"))
  : require(specPath);

const outPath = resolve(
  process.cwd(),
  process.argv[3] || `output/${basename(dirname(specPath))}.html`
);

// ---- 事前チェック（作りかけの spec でビルドしないための最低限） ----
const errors = [];
if (!Array.isArray(spec.slides) || spec.slides.length === 0) errors.push("spec.slides が空です");
const KNOWN = ["cover", "section", "agenda", "facts", "kpi", "cards", "table", "bands", "compare", "stats", "bullets", "timeline", "message", "cta"];
(spec.slides || []).forEach((s, i) => {
  if (!s || !s.type) errors.push(`slides[${i}]: type がありません`);
  else if (!KNOWN.includes(s.type)) errors.push(`slides[${i}]: 未定義の type "${s.type}"（使えるのは ${KNOWN.join(" / ")}）`);
});
if (errors.length) {
  console.error("spec にエラーがあります:\n - " + errors.join("\n - "));
  process.exit(1);
}
// ★★ が残っていたら警告（テンプレの穴埋め忘れ）
const rawSpec = readFileSync(specPath, "utf8");
if (rawSpec.includes("★★")) {
  console.warn("⚠ spec に ★★（未記入のプレースホルダ）が残っています。内容を確認してください。");
}

const css = readFileSync(resolve(HERE, "lib/theme.css"), "utf8");
const js = readFileSync(resolve(HERE, "lib/deck.js"), "utf8");
const title = (spec.meta && spec.meta.title) || (spec.slides[0] && spec.slides[0].title) || "資料";

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${String(title).replace(/[<>&]/g, "")}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
<style>
${css}
</style>
</head>
<body>
<div class="stage" id="stage"></div>
<div class="toolbar">
  <span id="pagecount"></span>
  <button onclick="window.print()">PDFで保存</button>
</div>
<script>
${js}
</script>
<script id="spec-data" type="application/json">
${JSON.stringify(spec).replace(/</g, "\\u003c")}
</script>
<script>
(function () {
  var spec = JSON.parse(document.getElementById("spec-data").textContent);
  renderDeck(spec, document.getElementById("stage"));
  document.getElementById("pagecount").textContent =
    document.querySelectorAll(".slide").length + " スライド";
})();
</script>
</body>
</html>
`;

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, html, "utf8");
console.log(`OK ${spec.slides.length} スライド -> ${outPath}`);
