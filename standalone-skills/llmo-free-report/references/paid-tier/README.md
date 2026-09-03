# 有償版向け参考資料（無料版レポートの自動生成には使わない）

このフォルダは、無料分析の先にある**有償のLLMOコンサルティング**で使う、より深い分析手法の参考資料。
旧版キット（v3・Dify CSV方式）から、汎用的に使える方法論部分だけを移植したもの。

**無料版のレポート（llmo-free-report本体のSTEP 1〜5）を作る際は、このフォルダの内容は使わない。**
無料版のスコープ（サンプルのみ・対策は方向性まで）を超えるため。使うのは以下のような場面：

- ユーザー（営業・CSメンバー）から「有償のコンサルではどんなことをするのか」と聞かれたとき、説明の参考にする
- 実際に有償契約に進んだ案件で、深掘り分析の手順を知りたいとき

## 中身

| ファイル | 内容 |
|---|---|
| [observed-vs-generated.md](observed-vs-generated.md) | 🔵観測／🟡推定／⚪要確認 の3区分ラベルと確信度（確実／おそらく／仮説）の付け方。無料版の🔵/🟡ラベルより厳密な版 |
| [collection-mode.md](collection-mode.md) | Difyなど生データがある場合（Dモード）と、Claudeが実際にAIへ聞きに行く場合（Bモード）の判定・実行手順、引用URLの実在確認 |
| [funnel-analysis-deepdive.md](funnel-analysis-deepdive.md) | ジャーニー段階×カテゴリでの計測プロンプト設計、段階別の登場率の読み方 |
| [ai-voice-entity.md](ai-voice-entity.md) | AIが自社を「何者」と語っているか（AI Voice）、参照ソースの特定、競合KBF（選ばれる理由）抽出 |
| [company-voice-crawl.md](company-voice-crawl.md) | 自社サイトを実クロールしての強み資産抽出・LLM可読性の技術診断・所見生成（Company Voice）。「3つの声（Company・User・AI）」の突き合わせ |

## Dify CSVの取り込みについて

CSVから登場率を集計するツール自体（`scripts/engine/parse_csv.js`）は、無料版のSTEP 2でも**データ取得経路の1つ**として使ってよい
（本体SKILL.mdのSTEP 2参照）。これは単なるデータ入力方法の追加であり、有償版特有の分析手法（KBF・AI Voice・Company Voiceの深掘り）とは別。
