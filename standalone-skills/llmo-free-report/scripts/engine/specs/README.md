# spec（データ定義）スキーマ — 無料分析版

`build.js` が読む spec は、1レポート分の中身を持つ JS オブジェクト（`module.exports = { ... }`）。
**新規クライアントは `_TEMPLATE/spec.js` をコピーして `specs/<クライアント名>/spec.js` を作る**。完成例は `サンプル_EmmaTools/spec.js`。

ビルド:
```
node build.js "specs/<クライアント名>/spec.js" "<出力先>.pptx"
```

## トップレベル項目
| キー | 型 | 内容 | データ源 |
|---|---|---|---|
| `cover` | {badge,titleLines,client,meta,credit?} | 表紙 | ヒアリング |
| `agenda` | [[no,title,desc]...] | 目次（6項目） | 固定でOK |
| `scope` | {title,note,colW,rowH,header,rows,footnote} | 計測プロンプト表（無料版＝限定本数と明記） | ツール設定 |
| `facts` | [{n,t,b,c}]×3 | 結論FACT（🔵実測から） | 4分析の総合 |
| `factsNote` | string | FACT出典脚注 | — |
| `funnelKpi` | {subtitle,cards[4],reading[],note} | **現状分析① ファネルKPI**。cards={stage,kpi,value,detail,c} | `/monitoring` |
| `brandPosition` | {subtitle,stats[[k,v]...],strong[],weak[],gap[],note} | **現状分析② ブランド認識**。gap=ヒアリングとの差分（🟡） | `/brand-listening`＋ヒアリング |
| `citations` | {subtitle,stats[{n,label}]×3,sampleTitle?,sample{colW,header,rows},takeaway,note} | **現状分析③ サイテーション**。sample行は3〜4行まで（無料版） | `/citation-list` |
| `citationsDetail` | null or [{title,subtitle,lead?,table?,box?,takeaway?,note?}] | **任意：サイテーションの追加スライド**（1要素＝1枚）。掲載ギャップを5件ずつ出すなど、標準の1枚に収まらない場合に使う。table={colW,header,rows,rowH}／box={title,body,h}（濃紺の補足バンド） | `/citation-list`＋実地確認 |
| `siteAudit` | null or {subtitle,avg,pages,avgNote,dist[{g,label,count,c}]×4,findings[],note} | **現状分析④ サイト診断要約**（診断未実行なら `null` でスキップ可） | `/site-audit` |
| `aivoice` | null or {obs[],issues[],band[]} | 任意：AIが自社をどう語るか | 補足調査 |
| `strategy` | [{n,t,b,tag,c}]×4 | 対策の方向性（🟡・タスク分解しない） | 分析結果 |
| `strategyNote` | string | 「方向性のみ／タスク設計はコンサルで」脚注 | 固定でOK |
| `roadmap` | null or [{t,c,items[]}]×3 | 任意：ロードマップ概観 | — |
| `salesMode` | "b2c" \| "b2b" | 「05 AI経由売上の測り方」の文面切替 | ヒアリング |
| `services` | {} or {scopeNote,plans[],brandNote} | 「06 ご支援メニュー」の文言上書き（通常は`{}`） | 固定でOK |
| `pricing` | 省略 or null or {…} | **任意：料金・対応範囲2枚の上書き**。省略＝既定の2枚を表示（推奨）／`null`＝非表示。行や文言を差し替える場合のみオブジェクトを渡す（scopeRows／priceRows／priceAxes／priceNote など） | 営業資料（料金案xlsx） |
| `cta` | {headline,points[]} | 最終CTA | 固定ベース |

## 色キー（`c`）
`OUR`=紫(メイン・自社の強み) / `ACCENT`=オレンジ(警告・即効) / `DIGI`=濃紫 / `NAVY`=強調 / `USER`=明紫 / `MUTE`=灰

## 固定パート（specに書かない＝全クライアント共通）
- 「01 LLMOの考え方」8枚（`lib/parts.js` の `addKangaekata`）
- 「05 AI経由売上の測り方」2枚（`lib/parts.js` の `addSalesAttribution`。`salesMode`で切替）
- 「06 ここから先のご支援」1枚＋**「対応範囲」「料金の考え方とサンプル料金」2枚**（`lib/render_free.js` の `addPricingDetail`。ツール／モニタリング／コンサルの差分と、本数従量・AIエンジン数によるサンプル料金。`pricing: null` で非表示）
- 「06 ここから先のご支援」1枚（`lib/render_free.js` の `addServiceMenu`。既定＝コンサル月60万円〜／ツール契約／レポーティング＋助言 月1回、＋ブランド定義見直し支援）

## 鉄則（旧版から継承）
- **KPI・順位・掲載状況などの数値は、ツールの実測（🔵）のみ**。無い数値を創作しない。
- **ヒアリング差分・方向性・所見の解釈は 🟡（推定・提言）** としてラベル分離する。
- **無料版のスコープを必ず明記**：プロンプト限定・メディアリストはサンプルのみ・対策は方向性まで。
- 引用URL・媒体名を事実として載せる場合は、ツール画面で実在を確認したものだけを使う。
