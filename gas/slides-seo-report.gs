/**
 * SEOコラム分析レポート — Googleスライド生成スクリプト
 *
 * 使い方:
 *  1. script.google.com で新規プロジェクトを作成し、このコードを貼り付け
 *  2. （任意）下の IMAGES に波型画像・ロゴのURL（Google Drive の公開URL等）を設定
 *  3. （任意）列幅を正確に反映したい場合は、拡張サービス「Google Slides API」をONにする
 *     エディタ左「サービス」＋ → Google Slides API → 識別子 Slides で追加
 *     ※OFFのままでも動作します（その場合、表の列幅は均等になります）
 *  4. buildDeck() を実行 → 実行ログに作成されたスライドのURLが出ます
 *
 * ページサイズは Google スライド標準の 16:9（720 x 405 pt）を前提にしています。
 */

var W = 720, H = 405;

var C = {
  violet:  '#7247CF',  // 見出し
  purple:  '#7F6BAD',  // 表ヘッダー・番号
  blob:    '#8A72C4',  // 円・アクセント
  lav:     '#F5F1FD',  // 淡い面
  lav2:    '#FAF8FF',
  line:    '#E4DFF0',
  ink:     '#3A3A44',
  sub:     '#6B6678',
  mute:    '#8B8699',
  foot:    '#A9A4B5',
  white:   '#FFFFFF'
};

// 画像URL（空文字なら図形・テキストで代用）
var IMAGES = {
  wave:   '',  // 表紙・扉の下部の波型画像
  emma:   '',  // EmmaTools ロゴ
  exidea: ''   // EXIDEA ロゴ
};

var FONT = 'Noto Sans JP';

// 表の列幅リクエストを貯めておき、最後に Slides API でまとめて適用する
var PENDING_TABLE_LAYOUT = [];

/* ============================ 共通ヘルパー ============================ */

/**
 * テキストボックスを追加する。
 * 空文字は insertTextBox がエラーになるため、半角スペースに置き換える。
 */
function txt(slide, x, y, w, h, text, o) {
  o = o || {};
  var body = (text === null || text === undefined) ? '' : String(text);
  if (body === '') { body = ' '; }

  var box = slide.insertTextBox(body, x, y, w, h);
  var t = box.getText();

  t.getTextStyle()
   .setFontFamily(FONT)
   .setFontSize(o.size || 12)
   .setBold(!!o.bold)
   .setItalic(!!o.italic)
   .setForegroundColor(o.color || C.ink);

  var p = t.getParagraphs();
  for (var i = 0; i < p.length; i++) {
    p[i].getRange().getParagraphStyle()
      .setParagraphAlignment(o.align || SlidesApp.ParagraphAlignment.START)
      .setLineSpacing(o.lineSpacing || 115)
      .setSpaceBelow(o.spaceBelow || 0);
  }
  box.setContentAlignment(o.valign || SlidesApp.ContentAlignment.TOP);
  return box;
}

function rect(slide, x, y, w, h, fill) {
  var r = slide.insertShape(SlidesApp.ShapeType.RECTANGLE, x, y, w, h);
  if (fill) { r.getFill().setSolidFill(fill); } else { r.getFill().setTransparent(); }
  r.getBorder().setTransparent();
  return r;
}

function circle(slide, x, y, d, fill) {
  var c = slide.insertShape(SlidesApp.ShapeType.ELLIPSE, x, y, d, d);
  c.getFill().setSolidFill(fill);
  c.getBorder().setTransparent();
  return c;
}

function blank(pres) {
  return pres.appendSlide(SlidesApp.PredefinedLayout.BLANK);
}

/** 画像は取得に失敗することがあるので、失敗しても処理を止めない */
function image(slide, url, x, y, w, h) {
  if (!url) { return null; }
  try {
    return slide.insertImage(url, x, y, w, h);
  } catch (e) {
    Logger.log('画像の挿入に失敗しました: ' + url + ' / ' + e.message);
    return null;
  }
}

/** 下部の波型（画像がなければ帯で代用） */
function waveBand(slide) {
  if (IMAGES.wave && image(slide, IMAGES.wave, 0, H - 105, W, 105)) { return; }
  rect(slide, 0, H - 95, W, 95, C.blob);
  rect(slide, 0, H - 108, W, 30, '#B7A8DB');
}

/** 右下の丸（本文スライドの装飾） */
function cornerBlob(slide) {
  circle(slide, W - 62, H - 42, 98, C.blob);
}

function footer(slide, pageNo) {
  txt(slide, W / 2 - 80, H - 26, 160, 16, '©ＥＸＩＤＥＡ inc.',
    { size: 8, color: C.foot, align: SlidesApp.ParagraphAlignment.CENTER });
  txt(slide, W - 60, H - 26, 40, 16, String(pageNo),
    { size: 8, color: C.foot, align: SlidesApp.ParagraphAlignment.END });
}

/** ページ番号は「現在のスライド枚数」から自動で振る（枚数を変えてもズレない） */
function footerAuto(pres, slide) {
  footer(slide, pres.getSlides().length);
}

function notes(slide, text) {
  if (!text) { return; }
  var shape = slide.getNotesPage().getSpeakerNotesShape();
  if (!shape) { return; }   // レイアウトによっては存在しない
  shape.getText().setText(text);
}

/* ============================ レイアウト ============================ */

/** 本文スライドの見出し（丸数字＋タイトル＋URL/クエリ） */
function head(slide, num, title, meta) {
  var label = num ? num + '　' + title : title;
  txt(slide, 40, 34, W - 80, 34, label,
    { size: 21, bold: true, color: C.violet, align: SlidesApp.ParagraphAlignment.CENTER });
  if (meta) {
    txt(slide, 40, 66, W - 80, 18, meta,
      { size: 9.5, color: C.mute, align: SlidesApp.ParagraphAlignment.CENTER });
  }
}

/** 現状課題の帯 */
function issueBar(slide, y, text) {
  rect(slide, 45, y, W - 90, 46, C.lav);
  txt(slide, 60, y + 9, 70, 20, '現状課題', { size: 12, bold: true, color: C.violet });
  txt(slide, 128, y + 8, W - 200, 34, text, { size: 12, color: C.ink });
}

/** ● 箇条書き */
function bullets(slide, y, items, gap) {
  gap = gap || 46;
  items.forEach(function (s, i) {
    txt(slide, 48, y + i * gap, 14, 20, '●', { size: 11, color: C.blob });
    txt(slide, 66, y + i * gap, W - 116, gap, s, { size: 12, color: C.ink });
  });
}

/** ネクストアクション行（ラベル＋本文） */
function actionRows(slide, y, rows) {
  var cy = y;
  rows.forEach(function (r, i) {
    var lw = r.label.length > 3 ? 80 : 44;
    var textW = W - 120 - lw;

    // 1行あたりの概算文字数からブロックの高さを見積もる
    var charsPerLine = Math.max(10, Math.floor(textW / 13));
    var lines = Math.max(1, Math.ceil(r.text.length / charsPerLine));
    var h = Math.max(30, lines * 20);

    rect(slide, 48, cy, lw, 24, r.own === 'us' ? '#F0EAFC' : C.blob);
    txt(slide, 48, cy + 4, lw, 18, r.label,
      { size: 10.5, bold: true, color: r.own === 'us' ? C.violet : C.white,
        align: SlidesApp.ParagraphAlignment.CENTER });
    txt(slide, 48 + lw + 16, cy - 2, textW, h + 12, r.text, { size: 12.5, color: C.ink });

    if (i < rows.length - 1) {
      rect(slide, 48, cy + h + 14, W - 96, 1.2, C.line);
    }
    cy += h + 30;
  });
  return cy;
}

/**
 * 表を追加する。
 * 空セルは半角スペースに置き換える（空のセルに書式を当てると
 * "The object ... has no text." エラーになるため）。
 */
function table(slide, x, y, colW, rows, opt) {
  opt = opt || {};
  var totalW = colW.reduce(function (a, b) { return a + b; }, 0);
  var totalH = opt.h || (rows.length * 30);

  var t = slide.insertTable(rows.length, colW.length, x, y, totalW, totalH);

  for (var r = 0; r < rows.length; r++) {
    for (var c = 0; c < colW.length; c++) {
      var raw = rows[r][c];
      var value = (raw === null || raw === undefined) ? '' : String(raw);
      if (value === '') { value = ' '; }

      var cell = t.getCell(r, c);
      cell.getFill().setSolidFill(r === 0 ? C.purple : (r % 2 === 0 ? C.lav2 : C.white));

      var tr = cell.getText();
      tr.setText(value);
      tr.getTextStyle()
        .setFontFamily(FONT)
        .setFontSize(opt.size || 10)
        .setBold(r === 0 || (opt.boldCols || []).indexOf(c) >= 0)
        .setForegroundColor(r === 0 ? C.white : ((opt.violetCols || []).indexOf(c) >= 0 ? C.violet : C.ink));
      cell.setContentAlignment(SlidesApp.ContentAlignment.MIDDLE);
    }
  }

  // SlidesApp には列幅の setter がないため、あとで Slides API に流す
  PENDING_TABLE_LAYOUT.push({ objectId: t.getObjectId(), widths: colW });
  return t;
}

/**
 * 貯めておいた列幅を Google Slides API でまとめて適用する。
 * 拡張サービスが無効でも落とさない（列幅は均等のままになる）。
 */
function applyTableLayout(presentationId) {
  if (!PENDING_TABLE_LAYOUT.length) { return; }
  if (typeof Slides === 'undefined') {
    Logger.log('拡張サービス「Google Slides API」が無効のため、表の列幅は均等になります。');
    return;
  }

  var requests = [];
  PENDING_TABLE_LAYOUT.forEach(function (item) {
    item.widths.forEach(function (w, i) {
      requests.push({
        updateTableColumnProperties: {
          objectId: item.objectId,
          columnIndices: [i],
          tableColumnProperties: { columnWidth: { magnitude: w, unit: 'PT' } },
          fields: 'columnWidth'
        }
      });
    });
  });

  try {
    Slides.Presentations.batchUpdate({ requests: requests }, presentationId);
  } catch (e) {
    Logger.log('列幅の適用に失敗しました（表示上の影響のみ）: ' + e.message);
  }
}

/* ============================ 本体 ============================ */

function buildDeck() {
  PENDING_TABLE_LAYOUT = [];

  var pres = SlidesApp.create('SEOコラム分析レポート');
  var presId = pres.getId();
  var url = pres.getUrl();

  // 既定の1枚目を削除
  pres.getSlides()[0].remove();

  /* 1. 表紙 */
  var s = blank(pres);
  waveBand(s);
  txt(s, 55, 95, 420, 24, 'SEOコラム 分析レポート', { size: 12, bold: true, color: C.purple });
  txt(s, 55, 122, 460, 90, '流入は増えても\nCVが増えない理由', { size: 30, bold: true, color: '#2F2B38', lineSpacing: 130 });
  txt(s, 55, 218, 460, 24, '対象5クエリの分析結果と、記事別の改善方針', { size: 13, color: C.sub });
  image(s, IMAGES.emma, 520, 90, 130, 104);
  notes(s, '5クエリの分析結果と、記事別の改善方針をご報告します。');

  /* 2. INDEX */
  s = blank(pres);
  txt(s, 40, 42, W - 80, 34, 'INDEX', { size: 22, bold: true, color: C.violet, align: SlidesApp.ParagraphAlignment.CENTER });
  var idx = ['前提 ― CVが増えない構造', '記事別の分析とネクストアクション', '全体のネクストアクション（優先順位）'];
  idx.forEach(function (label, i) {
    txt(s, 150, 130 + i * 46, 50, 24, '0' + (i + 1) + '.', { size: 16, bold: true, italic: true, color: C.purple });
    txt(s, 205, 132 + i * 46, 400, 24, label, { size: 15, color: C.ink });
  });
  footerAuto(pres, s);
  notes(s, '前提、記事別分析、全体のアクションの3部構成です。');

  /* 3. 扉 01 */
  sectionSlide(pres, '01', '前提 ― CVが増えない構造', 'まず、なぜこの現象が起きるのかを整理します。');

  /* 4. 距離の表 */
  s = blank(pres);
  cornerBlob(s);
  head(s, '', '検索キーワードには「距離」がある');
  txt(s, 40, 68, W - 80, 18, '同じ検索でも、申込までの距離がまったく違う',
    { size: 11, color: C.sub, align: SlidesApp.ParagraphAlignment.CENTER });
  table(s, 45, 100, [150, 220, 260], [
    ['距離', '検索例', '読者の気持ち'],
    ['遠い（情報収集）', '「IF関数 使い方」', '今この作業を終わらせたいだけ'],
    ['中くらい（比較検討）', '「パソコン資格 おすすめ」', 'どれを取るか迷っている'],
    ['近い（申込直前）', '「パソコン教室 ○○市」', '通う場所を探している']
  ], { size: 11, boldCols: [0], h: 132 });
  txt(s, 45, 255, W - 90, 40, '今回の5記事は、5本すべてが「遠い」または「中くらい」に位置しています。',
    { size: 13.5, bold: true, color: '#4A4458' });
  footerAuto(pres, s);
  notes(s, '検索キーワードには申込までの距離があります。今回の5記事はすべて遠い〜中くらいです。');

  /* 5. 地域ビジネス */
  s = blank(pres);
  cornerBlob(s);
  head(s, '', 'パソコン教室は「地域ビジネス」である');
  rect(s, 45, 96, 305, 92, C.lav);
  txt(s, 62, 108, 270, 20, 'コラムの読者', { size: 11.5, bold: true, color: C.violet });
  txt(s, 62, 132, 275, 50, '日本全国から読まれる。検索する人の大半は、教室のない地域に住んでいる。', { size: 12.5 });
  rect(s, 370, 96, 305, 92, C.lav);
  txt(s, 387, 108, 270, 20, '教室に通える顧客', { size: 11.5, bold: true, color: C.violet });
  txt(s, 387, 132, 275, 50, '近くに教室がなければ、どれだけ読まれても物理的に申込はできない。', { size: 12.5 });
  txt(s, 45, 200, W - 90, 24, '全国どこからでも申し込める通信講座（ユーキャン等）との決定的な違いです。', { size: 12.5, color: C.sub });
  rect(s, 45, 240, W - 90, 2, C.purple);
  txt(s, 45, 252, W - 90, 60,
    '現状は「記事が悪い」のではなく、集めている読者と、教室に通える顧客が別の人になっているという構造の問題。',
    { size: 15, bold: true, color: '#3A3548' });
  footerAuto(pres, s);
  notes(s, 'コラムは全国から読まれますが、近くに教室がなければ申込はできません。');

  /* 6. 扉 02 */
  sectionSlide(pres, '02', '記事別の分析とネクストアクション', 'ここから記事別に見ていきます。');

  /* 7. 5記事サマリー */
  s = blank(pres);
  cornerBlob(s);
  head(s, '', '5記事の位置づけ');
  table(s, 40, 90, [38, 180, 300, 112], [
    ['', '記事', '現状', '優先度'],
    ['①', 'パソコン資格おすすめ', '最も申込に近い読者が集まるがCVなし', '★★★'],
    ['②', 'MOS難易度', '書き方が独学を後押ししている恐れ', '★★★'],
    ['③', 'パソコン趣味おすすめ', '顧客層と最も近いが活かせていない', '★★☆'],
    ['④', 'Excel IF関数', '構造的にCVが最も出にくい集客記事', '★☆☆'],
    ['⑤', 'Canva無料', '5記事の中で最もCVから遠い', '★☆☆']
  ], { size: 10.5, boldCols: [0, 3], violetCols: [0, 3], h: 190 });
  footerAuto(pres, s);
  notes(s, '5記事のCV距離と優先度の一覧です。');

  /* 8–17. 記事別 */
  ARTICLES.forEach(function (a) {
    // 分析
    var sa = blank(pres);
    cornerBlob(sa);
    head(sa, a.num, a.title, a.meta);
    issueBar(sa, 96, a.issue);
    bullets(sa, 160, a.points, 52);
    footerAuto(pres, sa);
    notes(sa, a.note);

    // ネクストアクション
    var sb = blank(pres);
    cornerBlob(sb);
    head(sb, a.num, a.title + '｜ネクストアクション');
    var endY = actionRows(sb, 110, a.actions);
    if (a.memo) {
      rect(sb, 45, endY + 6, W - 90, 44, C.lav);
      txt(sb, 62, endY + 18, W - 120, 24, a.memo, { size: 12.5 });
    }
    footerAuto(pres, sb);
    notes(sb, a.actionNote);
  });

  /* 18. 扉 03 */
  sectionSlide(pres, '03', '全体のネクストアクション（優先順位）', '最後に、全体の優先順位を整理します。');

  /* 19. 優先順位 */
  s = blank(pres);
  cornerBlob(s);
  head(s, '', '全体のネクストアクション');
  table(s, 40, 90, [90, 430, 120], [
    ['優先度', '内容', 'ご対応'],
    ['★★★', '資格系2記事（①②）の強化用データ提供（合格実績・受講生の声・独学でつまずく点）', 'クライアント様'],
    ['★★★', '記事から「近くの教室を探す」導線を強化してよいかのご確認', 'クライアント様'],
    ['★★☆', '趣味・実用系の開講中講座一覧のご提供（③用）', 'クライアント様'],
    ['★★☆', '体験申込より手前の軽い窓口（スキル診断・資料請求）設置のご検討', 'クライアント様'],
    ['★☆☆', '記事ごとのKPI分担（集客記事／CV記事）のご承認', 'クライアント様']
  ], { size: 10.5, boldCols: [0], violetCols: [0], h: 200 });
  footerAuto(pres, s);
  notes(s, '上から順にご対応をお願いします。');

  /* 20. クロージング */
  s = blank(pres);
  circle(s, -45, -45, 100, C.blob);
  cornerBlob(s);
  if (!image(s, IMAGES.exidea, W / 2 - 110, 130, 220, 44)) {
    txt(s, 40, 140, W - 80, 30, 'EXIDEA', { size: 22, bold: true, align: SlidesApp.ParagraphAlignment.CENTER });
  }
  image(s, IMAGES.emma, W / 2 - 55, 200, 110, 88);
  txt(s, 40, 300, W - 80, 20, 'https://emma.tools/contacts/',
    { size: 11, color: C.mute, align: SlidesApp.ParagraphAlignment.CENTER });
  notes(s, 'ご不明点はお問い合わせください。');

  // ここまでの編集を確定させてから、Slides API で列幅を整える
  pres.saveAndClose();
  applyTableLayout(presId);

  Logger.log(url);
  return url;
}

function sectionSlide(pres, num, title, note) {
  var s = blank(pres);
  waveBand(s);
  circle(s, W / 2 - 43, 95, 86, C.blob);
  txt(s, W / 2 - 43, 118, 86, 40, num,
    { size: 26, bold: true, italic: true, color: C.white, align: SlidesApp.ParagraphAlignment.CENTER });
  txt(s, 60, 200, W - 120, 30, title,
    { size: 19, bold: true, color: C.violet, align: SlidesApp.ParagraphAlignment.CENTER });
  notes(s, note);
  return s;
}

/* ============================ 記事データ ============================ */

var ARTICLES = [
  {
    num: '①', title: 'パソコン資格おすすめ',
    meta: '/column/computer_qualification/　｜　クエリ：パソコン資格 おすすめ／パソコン資格 どれがいい',
    issue: '最も申込に近い読者が集まっているにもかかわらず、CVが発生していない。最優先で手を入れるべき記事。',
    points: [
      '検索する人は「資格を取りたい」と決めており、読後は必ず「じゃあ、どう勉強するか」を考える。ここが教室の出番。',
      '現在の記事は「資格10選の紹介」で完結し、次に抱く「独学でいけるのか？」に答えていない。答えがないので別サイトへ移動する。',
      '上位はユーキャン・Winスクールなど、すべて講座を売っている会社。記事中で自然に自社講座へ接続しており、その一手間がCVの差になっている。'
    ],
    note: '最優先で手を入れるべき記事です。',
    actions: [
      { own: 'client', label: 'クライアント様', text: '記事に掲載する「初心者から合格された方の実績データ・受講生の声」をご提供ください。' },
      { own: 'client', label: 'クライアント様', text: '「MOS・サーティファイは教室で対策から受験まで完結できる」という御社独自の強みを掲載してよいか、表現内容をご確認ください。' },
      { own: 'us', label: '弊社', text: '記事の改修案・追加記事案は弊社で作成します。' }
    ],
    actionNote: 'クライアント様にご対応いただきたい点です。'
  },
  {
    num: '②', title: 'MOS難易度',
    meta: '/column/mos-certification-exam-tips/　｜　クエリ：MOS 難易度／MOS 合格率',
    issue: '「受験を検討中の人」が集まるCVポテンシャルの高い記事。ただし現在の書き方が独学を後押しする内容になっている恐れがある。',
    points: [
      '「難易度」を調べる人は受験を迷っている段階。つまり「勉強方法を探し始める直前」の、教室にとって最高のタイミングの読者。',
      '一方でこの記事も競合も「合格率は約80%」「難易度は高くない」と伝える。事実だが、読者は「じゃあ独学でいいか」に着地する。安心させて帰してしまっている。',
      '上位の競合は同じ難易度の話から「独学でつまずく理由」「最短で合格するステップ」へつなげ、教室の必要性に着地させている。ここが分岐点。'
    ],
    note: '①と並んでCVポテンシャルの高い記事です。',
    actions: [
      { own: 'client', label: 'クライアント様', text: '「独学だとつまずきやすいポイント」をインストラクターの方からヒアリングし、ご共有ください（例：模擬試験の環境が用意できない、バージョンの違いで混乱する 等）。' },
      { own: 'client', label: 'クライアント様', text: '「教室で受験できる（全教室がサーティファイ認定校）」ことを記事上で訴求してよいか、ご確認をお願いします。' }
    ],
    memo: 'これは教室にしか書けない一次情報で、Googleからの評価も上がります。',
    actionNote: '現場の一次情報がそのまま評価につながります。'
  },
  {
    num: '③', title: 'パソコン趣味おすすめ',
    meta: '/column/pc-hobby-16ideas/　｜　クエリ：パソコン 趣味 おすすめ',
    issue: '記事の読者層と教室の顧客層（シニア・初心者）が最も近いにもかかわらず、活かせていない。',
    points: [
      '「パソコンで何かしたい」と検索する方は、主要顧客であるシニア層・初心者層と重なる。5記事の中で最も“顧客像とのズレ”が小さい。',
      '記事は「16のアイデア紹介」で終わっており、「やってみたいけど、一人では操作できない」という不安に触れていない。教室の価値そのものを素通りしている。',
      '競合は、趣味そのものを教室の講座（作品づくり講座）として打ち出している。'
    ],
    note: '顧客像とのズレが最も小さい記事です。',
    actions: [
      { own: 'client', label: 'クライアント様', text: '趣味に関連する講座（写真整理、年賀状、動画、Excelでの記録づくり等）で現在開講中のものの一覧をご提供ください。記事内の各アイデアと講座を紐づけます。' },
      { own: 'client', label: 'クライアント様', text: '「シニアの方も通われている（最高97歳の受講生など）」といった安心材料を掲載してよいか、ご確認ください。' }
    ],
    actionNote: 'アイデアと講座を紐づけます。'
  },
  {
    num: '④', title: 'Excel IF関数',
    meta: '/column/data-analysis-if/　｜　クエリ：Excel IF関数 使い方',
    issue: 'アクセスは稼げるが、構造的にCVが最も出にくいタイプの記事。CV記事として期待するのは無理がある。',
    points: [
      '大半は仕事中に手が止まって調べている人。答えが分かった瞬間に離脱するのが正常な行動で、教室を検討する余地がない。滞在時間も短くなる。',
      '操作解説はGoogleのAI回答（AIO）で完結しやすく、今後クリック自体が減っていく可能性が高い領域。',
      'ただし「Excelが苦手」という悩みの入り口ではあるため、その悩みを拾う設計に変えれば意味が出る。'
    ],
    note: 'CV記事として期待するのは無理があります。',
    actions: [
      { own: 'us', label: 'ご提案', text: 'この記事は「CVを取る記事」ではなく「サイト全体の評価を高める集客記事」と位置づけを変えることをご提案します（KPIを分けて評価してください）。' },
      { own: 'client', label: 'クライアント様', text: 'そのうえで「Excelを基礎から学び直したい方へ」という軽い案内で資格系記事へ誘導する設計に変更します。導線文言のご確認をお願いします。' }
    ],
    actionNote: 'KPIを分けて評価いただく提案です。'
  },
  {
    num: '⑤', title: 'Canva無料',
    meta: '/column/canva-free-features/　｜　クエリ：Canva 無料／Canva 無料版 できること',
    issue: '5記事の中で最もCVから遠い記事。CVが出ていないのは想定内と考えてよい。',
    points: [
      '「無料」で検索している人は、お金をかけずに済ませたい心理。有料の教室に申し込む意欲が構造的に低い。',
      'Canvaは主力講座（Word・Excel・資格対策）と距離があり、読んだ人に案内できる商品がない。',
      '機能紹介はAIOや公式サイトで完結しやすく、比較検討につながりにくい。'
    ],
    note: 'CVが出ていないのは想定内と考えてよい記事です。',
    actions: [
      { own: 'client', label: 'クライアント様', text: 'Canva関連の講座が現在あるかどうかをご確認ください。ある場合は専用ページへの導線を作ります。ない場合は集客専用と割り切り、CV評価の対象から外すことをご提案します。' }
    ],
    actionNote: '講座の有無で対応が分かれます。'
  }
];
