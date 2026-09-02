# spec（データ定義）スキーマ — 資料作成エンジン

`engine/build.mjs` が読む spec は、資料1本分の中身を持つ JS オブジェクト（`module.exports = { ... }`）。
**新規作成は `engine/specs/_TEMPLATE/spec.js` をコピーして `engine/specs/<資料名>/spec.js` を作る。**
完成例は `engine/specs/sample/spec.js`。

ビルド：

```bash
node engine/build.mjs "engine/specs/<資料名>/spec.js" "output/<資料名>.html"
```

出力はCSS・JS・データを埋め込んだ**単一HTML**。Chromeで開き、`Ctrl/Cmd + P` →「PDFに保存」で
16:9（960×540pt）のスライドPDFになる。用紙サイズと余白はCSSで指定済みなので、印刷設定は既定のままでよい。

---

## トップレベル

| キー | 型 | 内容 |
|---|---|---|
| `meta.title` | string | ブラウザのタブに出る資料名 |
| `meta.credit` | string | 全スライド左下のクレジット（例：`社名 ｜ CONFIDENTIAL`）。空なら非表示 |
| `theme` | object? | 色の上書き。`primary` / `light` / `dark` / `deep` / `accent` / `ink` / `grad1` / `grad2` |
| `slides` | array | スライドの配列。**この順番がそのままページ順**になる |

ページ番号は `cover` 以外に自動採番される。使わないスライドは要素ごと削除してよい。

## 共通プロパティ（ほぼ全種類で使える）

| キー | 内容 |
|---|---|
| `kicker` | タイトル上の小見出し（英大文字や「現状分析①」など） |
| `title` | スライドの主見出し。**1行（全角30字前後）に収める** |
| `lead` | タイトル下の1文リード（省略可） |
| `note` | 左下の脚注。出典・前提・🔵観測/🟡推定のラベルに使う |
| `accent` | kicker の色キー |

本文テキストは `\n` で改行、`**強調**` で太字になる。HTMLタグは書けない（自動エスケープされる）。

## 色キー（`c`）

`our`=メイン紫（主張・自社）／`accent`=オレンジ（警告・即効・CTA）／`digi`=濃紫／
`navy`=強調・濃色カード／`user`=明るい紫／`mute`=灰

**暖色は accent だけ。** 1枚のスライドで色を4つ以上使わない。

---

## スライド種別（14種）

| type | 用途 | 主なキー |
|---|---|---|
| `cover` | 表紙（濃色） | `badge` `title` `subtitle` `client` `meta` `credit` |
| `section` | 章扉（濃色） | `no` `title` `subtitle` |
| `agenda` | 目次 | `items: [[番号, 見出し, 説明]]` `highlight`（強調する行の番号・0始まり） |
| `facts` | 結論の数字カード（2〜4枚） | `cards: [{n, t, b, c, label}]` |
| `kpi` | 指標カード（2〜5枚）＋読み取り | `cards: [{stage, kpi, value, detail, c}]` `reading: []` `readingTitle` |
| `cards` | 汎用カード（2〜4枚。5枚以上は3列で折返し） | `cards: [{tag, t, value, b, c}]` |
| `table` | 表（5〜7行まで） | `colW: []`（相対幅） `header: []` `rows: [[]]` `highlightRow` `takeaway` |
| `bands` | 全幅の帯（フロー・レイヤー） | `rows: [{label, desc, c}]` |
| `compare` | 2カラム比較 | `left`/`right`: `{t, items: [], c}` `gap: {t, items: []}` |
| `stats` | 大きい数字（2〜4個） | `stats: [{n, label, source, c}]` `takeaway` |
| `bullets` | 箇条書き＋補足ボックス | `items: []` `box: {title, body}` |
| `timeline` | ロードマップ（2〜4列） | `cols: [{t, items: [], c}]` |
| `message` | 濃色1枚メッセージ | `title` `body` |
| `cta` | 最終CTA（濃色） | `headline` `points: []` |

## 分量の目安（はみ出さないための上限）

| 場所 | 目安 |
|---|---|
| `title` | 全角30字・1行 |
| `facts.cards[].b` / `cards[].b` | 全角60〜80字 |
| `table.rows` | 5〜7行。超える場合はスライドを2枚に割る |
| `bullets.items` | 4項目・各50字まで |
| `kpi.reading` | 2〜3項目 |
| 全体 | 10〜20枚。それ以上は章を削る |

CSSで自動縮小はしないため、**入れすぎるとカード内で文字があふれる**。
ビルド後は必ずブラウザで全ページを目視確認すること。

## 編集してよい場所 / いけない場所

- 編集してよい：`engine/specs/<資料名>/`（案件ごとのspec）、`output/`
- 編集しない：`engine/lib/`（デザインシステム共通部品）、`engine/build.mjs`、`engine/specs/_TEMPLATE/`、`engine/specs/sample/`

デザインを変えたいときは `lib/` を書き換えず、まず `theme` での色上書きで足りるかを検討する。
