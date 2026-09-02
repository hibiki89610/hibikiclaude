// 共通部品：EmmaToolsデザインの「LLMOの考え方」教育セクション＋分析用ヘルパー
// theme.js は同じ lib/ 内のバンドル版を参照（自己完結）。
const T = require("./theme");
const { C, F, BG_DOTS, BG_GRAD, footer, header, sectionDivider, vennMotif, numCircle, statCallout, card, pill, llmoNeedMap } = T;

// スライド生成API（ページ番号管理）
function mkApi(pres) {
  const st = { pg: 0 };
  const slide = () => { st.pg++; const s = pres.addSlide(); s.background = { path: BG_DOTS }; return s; };
  const gradeSlide = () => { st.pg++; const s = pres.addSlide(); s.background = { path: BG_GRAD }; return s; };
  return { st, slide, gradeSlide };
}
const bl = (items, size = 12, color = C.INK) => items.map((t, i) => ({ text: t, options: { bullet: { code: "2022", indent: 12 }, breakLine: i < items.length - 1, fontFace: F, fontSize: size, color, paraSpaceAfter: 7, lineSpacingMultiple: 1.28 } }));
function bar(s, x, y, color, w) {
  if (w) s.addShape("roundRect", { x, y, w, h: 0.09, rectRadius: 0.04, fill: { color } });
  else s.addShape("roundRect", { x, y: y + 0.28, w: 0.09, h: 1.5, rectRadius: 0.04, fill: { color } });
}

// スタイル付きデータテーブル（NAVYヘッダ・ゼブラ・自社行ハイライト）
function dataTable(s, x, y, colW, headerRow, rows, opts = {}) {
  const hi = opts.highlightRow; // 自社行のindex（0始まり, rows内）
  const head = headerRow.map(h => ({ text: h, options: { fontFace: F, fontSize: 10.5, bold: true, color: "FFFFFF", fill: { color: C.NAVY }, align: "center", valign: "middle" } }));
  const body = rows.map((r, ri) => r.map((cval, ci) => {
    const isHi = ri === hi;
    return { text: String(cval), options: {
      fontFace: F, fontSize: isHi ? 11 : 10, bold: isHi || ci === 0, valign: "middle",
      color: isHi ? C.OUR : C.INK, align: ci === 0 ? "left" : "center",
      fill: { color: isHi ? C.OUR_T : (ri % 2 ? "FFFFFF" : "F6F1FC") },
    } };
  }));
  s.addTable([head, ...body], { x, y, w: colW.reduce((a, b) => a + b, 0), colW, border: { type: "solid", color: C.LINE, pt: 0.75 }, rowH: opts.rowH || 0.4, margin: 0.05, autoPage: false });
}

// 横バー1本（登場率）
function rateBar(s, x, y, w, label, pct, color, note) {
  s.addText(label, { x, y, w: 2.3, h: 0.34, margin: 0, fontFace: F, fontSize: 10.5, bold: true, color: C.INK, valign: "middle" });
  const bx = x + 2.4, bw = w - 2.4 - 1.2;
  s.addShape("roundRect", { x: bx, y: y + 0.03, w: bw, h: 0.28, rectRadius: 0.04, fill: { color: "E7DBF7" } });
  s.addShape("roundRect", { x: bx, y: y + 0.03, w: Math.max(0.03, bw * pct / 100), h: 0.28, rectRadius: 0.04, fill: { color } });
  s.addText(pct + "%" + (note ? "  " + note : ""), { x: bx + bw + 0.1, y, w: 1.1, h: 0.34, margin: 0, fontFace: F, fontSize: 10, bold: true, color, valign: "middle" });
}

// ─── 「当社のLLMOの考え方」教育セクション（8枚） ───
function addKangaekata(pres, api) {
  const { slide } = api;
  const st = api.st;

  { // 生成AIは情報インフラ
    const s = slide();
    header(s, "ADOPTION — 生成AIの普及", "生成AIは、1年で“情報インフラ”になった");
    statCallout(s, 0.7, 2.05, 3.9, "51%", "日本の生成AI利用率（1年で27%→51%・1.9倍）", "NTTドコモ モバイル社会研究所 2026", C.OUR);
    statCallout(s, 4.85, 2.05, 3.9, "57%", "商品推薦で生成AIを主要ツールに（16%→57%）", "Capgemini 2025", C.OUR);
    statCallout(s, 9.0, 2.05, 3.8, "44%", "購買判断の主要情報源1位＝AI検索（従来検索31%）", "McKinsey", C.ACCENT);
    card(s, 0.55, 4.35, 12.23, 2.25, { fill: C.LIGHT });
    s.addText("要するに", { x: 0.95, y: 4.58, w: 11.4, h: 0.4, margin: 0, fontFace: F, fontSize: 14, bold: true, color: C.OUR });
    s.addText(bl(["商品・サービス選びの入口が、検索エンジンからAIへ移りつつある", "検索順位ではなく“AI上での選定率”が、問い合わせ・売上を左右する", "AIに出てこない＝比較の土俵に乗っていない、という状態になりうる"], 12), { x: 0.95, y: 5.05, w: 11.4, h: 1.4, margin: 0 });
    footer(s, st.pg);
  }
  { // AIが売上を左右
    const s = slide();
    header(s, "SALES IMPACT — 売上への直撃", "AIは、すでに“候補選び”を変えている");
    statCallout(s, 0.7, 2.05, 3.9, "89%", "BtoB買い手が購買で生成AIを利用（95%が今後も継続）", "Forrester", C.OUR);
    statCallout(s, 4.85, 2.05, 3.9, "50%+", "AIによって“従来より多く/異なる候補”を検討に入れた", "Forrester", C.OUR);
    statCallout(s, 9.0, 2.05, 3.8, "90〜95%", "AIが評価で参照する“外部情報源”の比率（自社サイトは5〜10%）", "McKinsey", C.ACCENT);
    card(s, 0.55, 4.35, 12.23, 2.25, { fill: C.NAVY });
    s.addText("だから“自社サイト改善だけ”では、AI評価は動かない", { x: 0.95, y: 4.6, w: 11.4, h: 0.4, margin: 0, fontFace: F, fontSize: 14, bold: true, color: C.ICE });
    s.addText("AIは「他人がどう言っているか（第三者情報）」を強く参照する。比較検討の段階で、AIの回答の中で候補が絞られている。自社発信に加え、第三者メディア・クチコミでの“言われ方”を設計する必要がある。", { x: 0.95, y: 5.05, w: 11.4, h: 1.4, margin: 0, fontFace: F, fontSize: 12.5, color: C.WHITE, lineSpacingMultiple: 1.4 });
    footer(s, st.pg);
  }
  { // AI推奨後、後から訪れる
    const s = slide();
    header(s, "REVISIT — AI推奨後の行動", "AIで見た後、顧客は“後から”訪れる");
    card(s, 0.55, 1.75, 12.23, 1.35, { fill: C.OUR_T });
    statCallout(s, 0.95, 1.72, 3.2, "2.5倍", "", "", C.OUR);
    s.addText([{ text: "7日以内のサイト訪問可能性\n", options: { bold: true, fontSize: 13, color: C.OUR, breakLine: true } }, { text: "AIで推奨された後、7日以内に公式サイトを訪問する可能性が通常時より2.5倍に高まる。効果は“直接流入”だけでは測れない。", options: { fontSize: 11.5, color: C.INK, breakLine: false } }], { x: 4.4, y: 1.95, w: 8.1, h: 1.0, margin: 0, fontFace: F, lineSpacingMultiple: 1.35 });
    const steps = ["AIで推奨される", "その場ではクリックしない", "後日ブランド名で検索", "公式サイトを訪問"];
    steps.forEach((t, i) => {
      const x = 0.55 + i * 3.12;
      card(s, x, 3.5, 2.92, 1.5, { fill: C.WHITE, line: C.LINE });
      numCircle(s, x + 0.25, 3.72, i + 1, C.OUR, 0.42);
      s.addText(t, { x: x + 0.22, y: 4.2, w: 2.55, h: 0.7, margin: 0, fontFace: F, fontSize: 11.5, bold: true, color: C.INK, lineSpacingMultiple: 1.15 });
      if (i < 3) s.addText("▶", { x: x + 2.82, y: 4.0, w: 0.35, h: 0.4, margin: 0, fontFace: F, fontSize: 15, color: C.OUR, align: "center" });
    });
    card(s, 0.55, 5.35, 12.23, 1.15, { fill: C.NAVY });
    s.addText("LLMOだけでも、SEOだけでもダメ。AIで“認識・推奨”された後、Webで“適切に流入・獲得”できて初めて売上になる。", { x: 0.95, y: 5.62, w: 11.4, h: 0.6, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.WHITE, valign: "middle", lineSpacingMultiple: 1.3 });
    footer(s, st.pg);
  }
  { // 当社のLLMOの考え方（原則）
    const s = slide();
    header(s, "OUR APPROACH — 当社のLLMOの考え方", "分析で終わらせない。“背骨”で貫くのが当社の考え方");
    const ps = [
      { t: "CEP → KBF → 参照先 → RTB で逆算", b: "AIが「どんな質問で」「何を基準に」「どこを根拠に」語るかを分解し、置くべき証拠まで設計する", c: C.OUR },
      { t: "引用は“数”でなく“役割”", b: "認知＝メンション／比較＝推奨／意思決定＝整合性。ファネルごとに果たす役割を設計する", c: C.DIGI },
      { t: "3つの声を一致させる", b: "Company（自社発信）× User（本音）× AI（語られ方）のズレを解消し、AIの認識を正す", c: C.USER },
      { t: "着手は必ず診断から", b: "現状を可視化してから投資判断。分析だけで終わらせず、実行して勝たせるところまで伴走する", c: C.NAVY },
    ];
    ps.forEach((p, i) => {
      const x = 0.55 + (i % 2) * 6.28, y = 1.85 + Math.floor(i / 2) * 2.35;
      card(s, x, y, 5.95, 2.1, { fill: C.WHITE, line: C.LINE, shadow: true });
      bar(s, x, y, p.c);
      s.addText(p.t, { x: x + 0.35, y: y + 0.28, w: 5.3, h: 0.6, margin: 0, fontFace: F, fontSize: 14, bold: true, color: C.INK, lineSpacingMultiple: 1.1 });
      s.addText(p.b, { x: x + 0.35, y: y + 0.95, w: 5.3, h: 1.0, margin: 0, fontFace: F, fontSize: 11, color: C.SUB, lineSpacingMultiple: 1.3 });
    });
    s.addText([
      { text: "用語　", options: { bold: true, color: C.OUR, fontSize: 9.5 } },
      { text: "CEP＝AIに想起されたい“質問の文脈”／KBF（Key Buying Factor）＝顧客が選ぶ際に重視する判断軸＝AIが“選ばれる理由”として語る軸／RTB＝それを裏づける証拠。", options: { color: C.MUTE, fontSize: 9.5 } },
    ], { x: 0.55, y: 6.5, w: 12.23, h: 0.42, margin: 0, fontFace: F, valign: "middle", lineSpacingMultiple: 1.15 });
    footer(s, st.pg);
  }
  { const s = slide(); llmoNeedMap(s, st.pg); } // 3つの声
  { // 3フェーズ9工程
    const s = slide();
    header(s, "OUR METHODOLOGY — 支援の全体像", "診断から改善まで — 3フェーズ・9工程で一気通貫");
    const phases = [
      { ph: "PHASE 1｜診断", c: C.USER, items: ["① 現在地の診断（AIでの言われ方）", "② AIカスタマージャーニー設計", "③ エンティティ・参照先の特定"] },
      { ph: "PHASE 2｜実装", c: C.OUR, items: ["④ サイト・技術基盤の整備", "⑤ ブランドナレッジベース構築", "⑥ ウェブ全体のプレゼンス形成", "⑦ コンバージョン出口の整備"] },
      { ph: "PHASE 3｜計測・改善", c: C.DIGI, items: ["⑧ AIモニタリングと継続改善", "⑨ AI経由売上の計測"] },
    ];
    const xs = [0.55, 4.73, 8.91];
    phases.forEach((p, i) => {
      const x = xs[i];
      card(s, x, 1.85, 3.87, 4.35, { fill: C.WHITE, line: C.LINE });
      bar(s, x, 1.85, p.c, 3.87);
      s.addText(p.ph, { x: x + 0.25, y: 2.1, w: 3.4, h: 0.45, margin: 0, fontFace: F, fontSize: 13.5, bold: true, color: p.c });
      p.items.forEach((it, j) => s.addText(it, { x: x + 0.25, y: 2.7 + j * 0.72, w: 3.4, h: 0.66, margin: 0, fontFace: F, fontSize: 10.8, color: C.INK, valign: "middle", lineSpacingMultiple: 1.15 }));
    });
    s.addText("本無料分析は PHASE 1（診断）に相当します。ここで現状と機会を可視化し、次の一手を設計します。", { x: 0.55, y: 6.4, w: 12.23, h: 0.4, margin: 0, fontFace: F, fontSize: 12, bold: true, color: C.ACCENT, align: "center" });
    footer(s, st.pg);
  }
  { // ファネル×KPI 3層
    const s = slide();
    header(s, "FUNNEL & KPI — ファネルとKPI", "ファネルで捉え、KPIは“3層”で立てる");
    const stages = [
      { n: "認知", st: "AIでカテゴリを調べている → 名前が挙がる", k: "KPI：メンション率 / AI上シェア", c: C.USER },
      { n: "比較・検討", st: "複数ブランドを比較 → 推奨され“選ばれる理由”が示される", k: "KPI：推奨率 / 比較勝率 / 推奨理由", c: C.OUR },
      { n: "意思決定", st: "問い合わせ・予約前の確認 → 信頼を獲得しCV", k: "KPI：信頼情報の充足 / 否定要因", c: C.DIGI },
    ];
    stages.forEach((g, i) => {
      const y = 1.8 + i * 0.86;
      card(s, 0.55 + i * 0.5, y, 12.23 - i * 0.5, 0.76, { fill: C.LIGHT });
      numCircle(s, 0.75 + i * 0.5, y + 0.18, i + 1, g.c, 0.4);
      s.addText(g.n, { x: 1.3 + i * 0.5, y: y + 0.07, w: 2.2, h: 0.6, margin: 0, fontFace: F, fontSize: 13, bold: true, color: C.INK, valign: "middle" });
      s.addText(g.st, { x: 3.4 + i * 0.5, y: y + 0.05, w: 5.2, h: 0.64, margin: 0, fontFace: F, fontSize: 10, color: C.SUB, valign: "middle", lineSpacingMultiple: 1.2 });
      s.addText(g.k, { x: 8.8, y: y + 0.05, w: 3.8, h: 0.64, margin: 0, fontFace: F, fontSize: 10.5, bold: true, color: g.c, valign: "middle" });
    });
    card(s, 0.55, 4.5, 12.23, 0.48, { fill: C.NAVY }); s.addText("最上位：事業成果（AI認知・AI検討関与・AI経由の問い合わせ/予約）", { x: 0.85, y: 4.52, w: 11.6, h: 0.44, margin: 0, fontFace: F, fontSize: 11, bold: true, color: C.WHITE, valign: "middle" });
    card(s, 0.55, 5.05, 12.23, 0.48, { fill: C.OUR_T }); s.addText("中間：AI上の成果（メンション率 / 推奨率 / 比較勝率 / AI上シェア）", { x: 0.85, y: 5.07, w: 11.6, h: 0.44, margin: 0, fontFace: F, fontSize: 11, bold: true, color: C.OUR, valign: "middle" });
    card(s, 0.55, 5.6, 12.23, 0.48, { fill: C.LIGHT }); s.addText("基盤：Webプレゼンス（第三者言及 / 比較掲載 / レビュー / 参照ドメイン）", { x: 0.85, y: 5.62, w: 11.6, h: 0.44, margin: 0, fontFace: F, fontSize: 11, bold: true, color: C.INK, valign: "middle" });
    s.addText("“順位・クリック”から“AI上の言及・推薦”へ。測る指標を変える。", { x: 0.55, y: 6.35, w: 12.23, h: 0.4, margin: 0, fontFace: F, fontSize: 12, bold: true, color: C.ACCENT, align: "center" });
    footer(s, st.pg);
  }
}

// ─── AI経由売上貢献の算定（PDF p12準拠）2枚 ───
function addSalesAttribution(pres, api, mode) {
  const { slide, st } = api;
  const isB2B = mode === "b2b";
  { // 算定の考え方＋計測方法
    const s = slide();
    header(s, "MEASUREMENT — AI経由売上貢献の算定", "露出で終わらせない。“AIが貢献した売上”を金額で示す");
    card(s, 0.55, 1.7, 6.05, 3.15, { fill: C.LIGHT });
    s.addText(isB2B ? "計測方法：問い合わせフォームに2問追加" : "計測方法：予約／利用後アンケート（3問）", { x: 0.85, y: 1.9, w: 5.4, h: 0.4, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.OUR });
    const q = isB2B
      ? ["Q1. 当社をどこで知ったか（検索／生成AI／比較・一括請求サイト／紹介 等）", "Q2. 検討に生成AIを使ったか（はい／いいえ）"]
      : ["Q1. このサービスを最初に何で知ったか（検索／生成AI／比較／SNS 等）", "Q2. 予約先の比較に生成AIを使ったか（はい／いいえ）", "Q3. AIはどの場面で役立ったか（認知／比較／不安解消／最終確認）"];
    s.addText(bl(q, 11, C.INK), { x: 0.85, y: 2.4, w: 5.5, h: 1.7, margin: 0 });
    s.addText(isB2B ? "→ 回答を AI新規認知／AI検討関与／AI非関与 に分類" : "→ 謝礼（クーポン等）で回収率を上げ、継続的に回収する", { x: 0.85, y: 4.2, w: 5.5, h: 0.5, margin: 0, fontFace: F, fontSize: 10.5, bold: true, color: C.NAVY, lineSpacingMultiple: 1.2 });
    card(s, 6.85, 1.7, 5.93, 3.15, { fill: C.WHITE, line: C.LINE });
    s.addText("回答の分類", { x: 7.15, y: 1.9, w: 5.4, h: 0.4, margin: 0, fontFace: F, fontSize: 12.5, bold: true, color: C.DIGI });
    const cls = [
      ["AI新規認知", "AIがきっかけで知った", "貢献度 100%", C.OUR],
      ["AI検討関与", "既知だが検討でAIを使った", "貢献係数（初期50%）", C.USER],
      ["AI非関与", "AIを使っていない", "対象外", C.MUTE],
    ];
    cls.forEach((c, i) => {
      const y = 2.4 + i * 0.78;
      s.addShape("roundRect", { x: 7.15, y, w: 2.0, h: 0.6, rectRadius: 0.08, fill: { color: c[3] } });
      s.addText(c[0], { x: 7.1, y: y - 0.02, w: 2.1, h: 0.64, margin: 0, fontFace: F, fontSize: 10.5, bold: true, color: C.WHITE, align: "center", valign: "middle" });
      s.addText([{ text: c[1] + "\n", options: { fontSize: 9.5, color: C.INK, breakLine: true } }, { text: c[2], options: { fontSize: 10, bold: true, color: c[3] } }], { x: 9.3, y: y - 0.04, w: 3.3, h: 0.66, margin: 0, fontFace: F, valign: "middle", lineSpacingMultiple: 1.1 });
    });
    card(s, 0.55, 5.05, 12.23, 0.95, { fill: C.NAVY });
    s.addText("AI売上貢献額 ＝ AI新規認知の売上 × 100% ＋ AI検討関与の売上 × 貢献係数（初期50%）", { x: 0.85, y: 5.12, w: 11.6, h: 0.5, margin: 0, fontFace: F, fontSize: 13.5, bold: true, color: C.WHITE, valign: "middle" });
    s.addText("※係数はデータ蓄積後に30〜70%で見直し。粗利が分かれば“AI粗利貢献額”で評価する。", { x: 0.85, y: 5.6, w: 11.6, h: 0.35, margin: 0, fontFace: F, fontSize: 10, color: C.ICE, valign: "middle" });
    card(s, 0.55, 6.15, 12.23, 0.72, { fill: C.OUR_T });
    s.addText([{ text: "16%　", options: { bold: true, fontSize: 15, color: C.ACCENT } }, { text: "AI検索の成果を体系的に追跡できているブランドはわずか16%（McKinsey）。＝“先行優位”を取るチャンス。", options: { fontSize: 11, color: C.INK, bold: true } }], { x: 0.85, y: 6.2, w: 11.6, h: 0.62, margin: 0, fontFace: F, valign: "middle" });
    footer(s, st.pg);
  }
  { // 試算例
    const s = slide();
    header(s, "MEASUREMENT — 試算例", "AI経由売上貢献額の試算（イメージ）");
    const rows = isB2B ? [
      ["問い合わせ", "20件", "20件"],
      ["成約（成約率20%）", "4件", "4件"],
      ["年間収益（@60万円/件）", "240万円", "240万円"],
      ["AI貢献度", "100%", "50%"],
      ["AI売上貢献額", "240万円", "120万円"],
    ] : [
      ["AI経由の新規利用者", "300人", "300人"],
      ["年間利用額（LTV @8,000円）", "240万円", "240万円"],
      ["AI貢献度", "100%", "50%"],
      ["AI売上貢献額", "240万円", "120万円"],
    ];
    dataTable(s, 0.55, 1.9, [4.63, 3.8, 3.8], ["指標", "AI新規認知", "AI検討関与"], rows, { highlightRow: rows.length - 1, rowH: 0.55 });
    const totalY = 1.9 + (rows.length + 1) * 0.55 + 0.35;
    card(s, 0.55, totalY, 12.23, 0.85, { fill: C.NAVY });
    s.addText("合計 AI売上貢献額", { x: 0.85, y: totalY + 0.1, w: 7, h: 0.6, margin: 0, fontFace: F, fontSize: 15, bold: true, color: C.ICE, valign: "middle" });
    s.addText("＝ 年間 360万円", { x: 7.5, y: totalY + 0.05, w: 5.0, h: 0.7, margin: 0, fontFace: F, fontSize: 24, bold: true, color: C.WHITE, align: "right", valign: "middle" });
    s.addText("※数値は仮のイメージです。実際は貴社の問い合わせ/予約数・成約率・単価に置き換えて算出します（初回はアンケート設計から）。", { x: 0.55, y: totalY + 1.05, w: 12.23, h: 0.4, margin: 0, fontFace: F, fontSize: 9.5, color: C.MUTE });
    footer(s, st.pg);
  }
}

module.exports = { T, C, F, BG_DOTS, BG_GRAD, footer, header, sectionDivider, vennMotif, numCircle, statCallout, card, pill, llmoNeedMap, mkApi, bl, bar, dataTable, rateBar, addKangaekata, addSalesAttribution };
