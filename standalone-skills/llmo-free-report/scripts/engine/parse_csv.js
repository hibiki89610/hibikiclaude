// parse_csv.js — 元データ（Dify出力CSV）フォルダを読み、ブランド別の登場率を集計する補助ツール
// 使い方: node parse_csv.js <元データフォルダのパス>
// 例:      node parse_csv.js "../02_データ/タイムズ24様/元データ"
// 出力: 各CSV（＝1メインプロンプト＋関連自動展開）ごとの、ブランド別 登場率（合計・エンジン別）
// ※Shift-JIS / UTF-8 両対応。ここで出た数値を spec の funnels/facts に転記する。
const fs = require("fs");
const path = require("path");

function readCsv(fp) {
  const buf = fs.readFileSync(fp);
  let txt = new TextDecoder("utf-8", { fatal: false }).decode(buf);
  if (txt.includes("�")) txt = new TextDecoder("shift_jis").decode(buf); // 文字化けならSJISで再デコード
  const lines = txt.trim().split(/\r?\n/).filter(Boolean);
  const header = lines[0].split(",");
  const brands = header.slice(2);
  const rows = lines.slice(1).map(l => { const c = l.split(","); return { q: c[0], eng: c[1], vals: c.slice(2) }; });
  return { brands, rows };
}

const dir = process.argv[2];
if (!dir) { console.error("使い方: node parse_csv.js <元データフォルダ>"); process.exit(1); }
const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith(".csv")).sort();
if (!files.length) { console.error("CSVが見つかりません: " + dir); process.exit(1); }

console.log("元データ: " + dir + "\n");
for (const f of files) {
  const { brands, rows } = readCsv(path.join(dir, f));
  const nQ = new Set(rows.map(r => r.q)).size;
  console.log("■ " + f + "  （関連プロンプト " + nQ + "問 × エンジン = " + rows.length + "観測）");
  brands.forEach((b, bi) => {
    let hit = 0, tot = 0; const eng = {};
    rows.forEach(r => {
      tot++; const v = r.vals[bi] === "○"; if (v) hit++;
      eng[r.eng] = eng[r.eng] || [0, 0]; eng[r.eng][1]++; if (v) eng[r.eng][0]++;
    });
    const pct = tot ? Math.round(hit / tot * 100) : 0;
    const engStr = Object.entries(eng).map(([k, v]) => `${k} ${v[0]}/${v[1]}`).join("  ");
    console.log("   " + b.padEnd(14) + " 合計 " + hit + "/" + tot + " (" + pct + "%)  | " + engStr);
  });
  console.log("");
}
