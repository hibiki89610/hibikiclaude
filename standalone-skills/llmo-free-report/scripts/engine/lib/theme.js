// 共通デザインシステム — EmmaTools Design System 準拠
// 紫1軸(#8541DC) + CTAオレンジ(#F57527)、Noto Sans JP、pill形状、影にも紫
// LAYOUT_WIDE: 13.333 x 7.5 inch

const C = {
  INK: "222222",       // 本文（純黒は使わない）
  SUB: "555A63",       // サブテキスト
  MUTE: "8A8F98",      // 補足・メタ
  // 紫1軸（Voiceの3円もこの濃淡で表現）
  OUR: "8541DC",       // Company Voice = アクセント紫（メイン）
  USER: "A970E8",      // User Voice = 明るい紫
  DIGI: "6A2FB8",      // Digital Voice = 濃い紫
  OUR_T: "F0E6FC",     // Company 淡背景
  USER_T: "F5EFFD",    // User 淡背景
  DIGI_T: "E9DEF9",    // Digital 淡背景
  NAVY: "4A1F87",      // 強調・見出しキッカー・濃紫カード（旧NAVY相当の強い色）
  ICE: "D9CBF2",       // 濃紫背景上のサブテキスト（ラベンダー）
  LIGHT: "F5F5F7",     // ライトカード背景（オフホワイト）
  LINE: "E5E5EA",      // 罫線
  WHITE: "FFFFFF",
  ACCENT: "F57527",    // CTA・唯一の暖色（オレンジ）
  ACCENT_T: "FDE9DA",  // CTA淡背景
  PALE: "ECE1FB",      // 極淡紫
  DARKBG: "2A1655",    // 濃紫（グラデ画像で代替）
};

const F = "Noto Sans JP";
const PAGE = { W: 13.333, H: 7.5 };
const path = require("path");
const BG_DOTS = path.join(__dirname, "bg_dots.png");       // 白地＋薄紫ドット（コンテンツ用）
const BG_GRAD = path.join(__dirname, "bg_grad_dots.png");  // 紫グラデ＋薄ドット（表紙・章扉・CTA用）

function newPres(pptxgen, title) {
  const p = new pptxgen();
  p.layout = "LAYOUT_WIDE";
  p.author = "EXIDEA Inc.";
  p.title = title;
  return p;
}

// ─── 共通パーツ ───────────────────────────────

// フッター（ページ番号 + クレジット）
function footer(slide, pageNum, opts = {}) {
  const dark = opts.dark || false;
  slide.addText(opts.credit || "© EXIDEA Inc.  |  CONFIDENTIAL", {
    x: 0.55, y: 7.08, w: 6.5, h: 0.3, margin: 0,
    fontFace: F, fontSize: 8, color: dark ? "B9A7E0" : "9AA0AA", align: "left",
  });
  if (pageNum != null) {
    slide.addText(String(pageNum).padStart(2, "0"), {
      x: 12.35, y: 7.08, w: 0.45, h: 0.3, margin: 0,
      fontFace: F, fontSize: 8, bold: true, color: dark ? "B9A7E0" : "9AA0AA", align: "right",
    });
  }
}

// コンテンツスライドのヘッダー（キッカー + タイトル）
function header(slide, kicker, title, opts = {}) {
  const kickColor = opts.kickerColor || C.OUR;
  slide.addText(kicker, {
    x: 0.55, y: 0.34, w: 12.2, h: 0.3, margin: 0,
    fontFace: F, fontSize: 11, bold: true, color: kickColor, charSpacing: 2,
  });
  slide.addText(title, {
    x: 0.55, y: 0.62, w: 12.2, h: 0.78, margin: 0,
    fontFace: F, fontSize: 25, bold: true, color: C.INK, lineSpacingMultiple: 1.08,
  });
}

// 章扉（濃紫グラデ）
function sectionDivider(slide, chapterNo, title, subtitle, pageNum) {
  slide.background = { path: BG_GRAD };
  vennMotif(slide, 11.3, 5.6, 0.62, 0.32, true);
  slide.addText(chapterNo, {
    x: 0.9, y: 2.1, w: 5, h: 0.9, margin: 0,
    fontFace: F, fontSize: 40, bold: true, color: "8E76C8",
  });
  slide.addText(title, {
    x: 0.9, y: 3.05, w: 11.4, h: 1.0, margin: 0,
    fontFace: F, fontSize: 33, bold: true, color: C.WHITE, lineSpacingMultiple: 1.1,
  });
  if (subtitle) slide.addText(subtitle, {
    x: 0.92, y: 4.15, w: 10.8, h: 0.9, margin: 0,
    fontFace: F, fontSize: 14, color: C.ICE, lineSpacingMultiple: 1.35,
  });
  footer(slide, pageNum, { dark: true });
}

// トリプルボイスのベン図モチーフ（3円・紫濃淡）
function vennMotif(slide, cx, cy, r, alphaScale, onDark) {
  const t = Math.round(100 - alphaScale * 100); // transparency %
  const d = r * 1.15;
  // 濃紫グラデ背景上では白系の円で見せる
  const cols = onDark ? ["FFFFFF", "D9CBF2", "B49AE6"] : [C.OUR, C.USER, C.DIGI];
  const pos = [
    { x: cx - d / 2, y: cy - d * 0.42, c: cols[0] },
    { x: cx - d,     y: cy + d * 0.38, c: cols[1] },
    { x: cx,         y: cy + d * 0.38, c: cols[2] },
  ];
  pos.forEach(p => {
    slide.addShape("ellipse", {
      x: p.x, y: p.y, w: r * 2, h: r * 2,
      fill: { color: p.c, transparency: t },
    });
  });
}

// 番号つき丸
function numCircle(slide, x, y, n, color, size = 0.42) {
  slide.addShape("ellipse", { x, y, w: size, h: size, fill: { color }});
  slide.addText(String(n), {
    x: x - 0.06, y: y - 0.02, w: size + 0.12, h: size + 0.04, margin: 0,
    fontFace: F, fontSize: size >= 0.4 ? 15 : 12, bold: true, color: C.WHITE, align: "center", valign: "middle",
  });
}

// 大きな数字コールアウト
function statCallout(slide, x, y, w, num, label, source, color) {
  slide.addText(num, {
    x, y, w, h: 0.95, margin: 0,
    fontFace: F, fontSize: 44, bold: true, color: color || C.OUR, align: "left",
  });
  slide.addText(label, {
    x, y: y + 0.98, w, h: 0.65, margin: 0,
    fontFace: F, fontSize: 12.5, bold: true, color: C.INK, lineSpacingMultiple: 1.2,
  });
  if (source) slide.addText(source, {
    x, y: y + 1.62, w, h: 0.5, margin: 0,
    fontFace: F, fontSize: 8.5, color: C.MUTE, lineSpacingMultiple: 1.15,
  });
}

// 角丸カード（大きめ角丸・影にも紫）
function card(slide, x, y, w, h, opts = {}) {
  slide.addShape("roundRect", {
    x, y, w, h, rectRadius: 0.11,
    fill: { color: opts.fill || C.LIGHT },
    line: opts.line ? { color: opts.line, width: 1 } : undefined,
    shadow: opts.shadow ? { type: "outer", color: "8541DC", opacity: 0.18, blur: 8, offset: 3, angle: 90 } : undefined,
  });
}

// Voiceタグ（pill）
function pill(slide, x, y, w, text, bg, fg) {
  slide.addShape("roundRect", { x, y, w, h: 0.34, rectRadius: 0.17, fill: { color: bg }});
  slide.addText(text, {
    x: x - 0.05, y: y - 0.02, w: w + 0.1, h: 0.38, margin: 0,
    fontFace: F, fontSize: 10.5, bold: true, color: fg, align: "center", valign: "middle",
  });
}

// 全幅の帯（左ラベル＋説明）
function bandRow(slide, y, label, labelColor, desc, opts = {}) {
  card(slide, 0.55, y, 12.23, 0.92, { fill: opts.fill || C.LIGHT, line: opts.line || C.LINE });
  slide.addShape("roundRect", { x: 0.8, y: y + 0.26, w: 2.75, h: 0.4, rectRadius: 0.2, fill: { color: labelColor } });
  slide.addText(label, { x: 0.75, y: y + 0.25, w: 2.85, h: 0.42, margin: 0, fontFace: F, fontSize: 11, bold: true, color: C.WHITE, align: "center", valign: "middle" });
  slide.addText(desc, { x: 3.75, y: y + 0.13, w: 8.7, h: 0.68, margin: 0, fontFace: F, fontSize: 10.5, color: C.INK, valign: "middle", lineSpacingMultiple: 1.25 });
}

// 3列のVoiceカラム（needMap / coverMap 共通）
function voiceCols(slide, y, rows) {
  const xs = [0.55, 4.73, 8.91];
  rows.forEach((r, i) => {
    const x = xs[i];
    card(slide, x, y, 3.87, 1.98, { fill: r.bg });
    slide.addText(r.t, { x: x + 0.24, y: y + 0.16, w: 3.4, h: 0.62, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: r.c, lineSpacingMultiple: 1.15 });
    slide.addText(r.b, { x: x + 0.24, y: y + 0.78, w: 3.4, h: 1.05, margin: 0, fontFace: F, fontSize: 10, color: C.INK, lineSpacingMultiple: 1.28 });
  });
}

// 1枚絵①：LLMO対策の全体像（必要なこと）
function llmoNeedMap(slide, pageNum) {
  header(slide, "THE FULL PICTURE", "LLMO対策の全体像 — AIに選ばれるために必要なこと");
  card(slide, 0.55, 1.58, 12.23, 0.52, { fill: C.NAVY });
  slide.addText("ゴール：AIの回答に、正しい文脈で引用・推薦される（＝LLMOの成果）", { x: 0.8, y: 1.63, w: 11.7, h: 0.42, margin: 0, fontFace: F, fontSize: 13, bold: true, color: C.WHITE, valign: "middle" });
  voiceCols(slide, 2.24, [
    { t: "Company Voice｜自社発信", b: "正しい文脈のコンテンツと、AIが認識できるエンティティを自社側で形成する", c: C.OUR, bg: C.OUR_T },
    { t: "User Voice｜実際の声", b: "ユーザーの本音（選ぶ理由・不満）を把握し、デジタル上に流通させる", c: C.USER, bg: C.USER_T },
    { t: "Digital Voice｜外部引用", b: "第三者メディア・動画・UGCで、狙った文脈での言及・引用を獲得する", c: C.DIGI, bg: C.DIGI_T },
  ]);
  bandRow(slide, 4.38, "基盤", C.NAVY, "内部要因（構造化データ・E‑E‑A‑T・サイト/情報設計）が、SEOとLLMOの両方に耐える土台になっていること");
  bandRow(slide, 5.42, "計測・文脈管理", C.DIGI, "AIでの「言われ方」を継続的に測り、3つの声の文脈を一貫させ続けること");
  slide.addText("どれか1つでは効かない — 全レイヤーの“一貫性”が、LLMOの成否を分ける。", { x: 0.55, y: 6.55, w: 12.23, h: 0.4, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.ACCENT, align: "center" });
  footer(slide, pageNum);
}

// 1枚絵②：EXIDEAのカバレッジ
function llmoCoverMap(slide, pageNum) {
  header(slide, "OUR COVERAGE", "全体像に重ねる、EXIDEAのサービス — 分析から実行まで一貫提供");
  card(slide, 0.55, 1.58, 12.23, 0.52, { fill: C.NAVY });
  slide.addText("全レイヤーを1社で。だから“分析で終わらない”——実行して勝たせるところまで。", { x: 0.8, y: 1.63, w: 11.7, h: 0.42, margin: 0, fontFace: F, fontSize: 13, bold: true, color: C.WHITE, valign: "middle" });
  voiceCols(slide, 2.24, [
    { t: "Company Voice", b: "Emma SEO / Emma Quick\n自社文脈×クエリファンアウトのAIコンテンツ ＋ CEOブランディング", c: C.OUR, bg: C.OUR_T },
    { t: "User Voice", b: "HonNe インサイトキャンペーン\n実購入者の本音を、獲得しながら収集", c: C.USER, bg: C.USER_T },
    { t: "Digital Voice", b: "Emma LLMO 外部メディア買付BPaaS（要見積）\n＋ ポジショニングYouTube", c: C.DIGI, bg: C.DIGI_T },
  ]);
  bandRow(slide, 4.38, "基盤", C.NAVY, "基盤整理コンサル（内部要因）— SEO/LLMO両対応の土台を分析・設計｜50万円×3ヶ月 or レポートのみ1回50万円");
  bandRow(slide, 5.42, "計測・文脈", C.DIGI, "BrandBase LLMO Insight 診断（無料分析／有料ショット分析 30万円〜）＋ Brand Base（文脈の原本管理）");
  slide.addText("①基盤整理 → ②LLMO分析（無料→有料）→ ③自社発信 Emma Quick → ④クエリファンアウト対策 Emma SEO を一貫提供。", { x: 0.55, y: 6.55, w: 12.23, h: 0.4, margin: 0, fontFace: F, fontSize: 12, bold: true, color: C.ACCENT, align: "center" });
  footer(slide, pageNum);
}

module.exports = { C, F, PAGE, BG_DOTS, BG_GRAD, newPres, footer, header, sectionDivider, vennMotif, numCircle, statCallout, card, pill, bandRow, voiceCols, llmoNeedMap, llmoCoverMap };
