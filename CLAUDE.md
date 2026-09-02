# 記事レビュー＆資料作成キット — Claude向けプロジェクト指示

このリポジトリは、**記事の品質チェック（トンマナ・SEO・ファクト）**と、
**16:9スライド資料の作成**を、Claudeとの対話で半自動化するためのキット。
利用者は非エンジニアを想定する。**対話は日本語・専門用語は噛み砕いて・確認はこまめに。**

## タスクルーティング

| ユーザーの入力 | 従うファイル |
|---|---|
| 「レビューして」 | `templates/review-prompt.md`（＋`config/brand-rules.yaml`・`input/article.md`） |
| 「レビューして修正まで」 | `templates/review-prompt.md` → `templates/auto-fix-rules.md` |
| 「修正だけして」 | `templates/auto-fix-rules.md` |
| 「ファクトチェックして」 | `templates/fact-check-prompt.md` |
| 「ファクトチェックして修正まで」 | `templates/fact-check-prompt.md` → `templates/fact-check-fix-rules.md` |
| **「資料作成して」「資料つくって」「提案資料を作って」「スライドにして」** | **`.claude/skills/deck-builder/SKILL.md`** |
| 使い方の質問 | `README.md` を参照して回答 |

**「資料作成して」と言われたら、確認を挟まずに `deck-builder` スキルの STEP 1 から開始する。**
スキル実行時は、そこが参照する `templates/`・`engine/README.md` も必ず読むこと。

## 絶対ルール

1. **数値の創作禁止**。記事レビューでも資料作成でも、数字・固有名詞・出典は入力ファイル・参照ファイル・
   実際に読み取った画面に実在するものだけを使う。足りなければ推測で埋めず、質問する。
   資料では 🔵観測（実測）／🟡推定（解釈・試算・提言）をスライド脚注でラベル分離する。
2. **`config/brand-rules.yaml` は全成果物に適用する**。記事だけでなく資料の文言にも、
   禁止表現（問いかけ・カギ括弧・煽り）と文字作法を適用する。
3. **構成案の合意を先に取る**。資料作成では、spec を書く前に構成案を提示して承認を得る。
4. **共通部品は編集しない**：`engine/lib/`（デザインシステム）・`engine/build.mjs`・
   `engine/specs/_TEMPLATE/`・`engine/specs/sample/`。
   変更したい場合はファイルを書き換えず、変更案を提示してユーザーの判断を仰ぐ。
5. **成果物の置き場所**：記事の修正済みHTMLは `output/`、資料は `engine/specs/<資料名>/spec.js` と
   `output/<資料名>.html`。
6. **生成物は目視確認してから渡す**。資料は Claude in Chrome で `output/<資料名>.html` を開き、
   全ページの文字あふれ・空欄・誤字を確認してから完了を報告する。

## Claude in Chrome の使い方

- ブリーフでURLが指定された場合、Claude in Chrome でページを開いてデータを読み取ってよい。
  読み取り前に**対象のアカウント／プロジェクトのページかを確認**し、ページ遷移のたびに再確認する。
- 読み取った数値は、出典（ページ名・URL）と取得日時を必ず控え、資料の脚注に載せる。
- 生成した資料HTMLの確認・PDF化（`Ctrl/Cmd + P` →「PDFに保存」）もChromeで行う。

## 資料のビルド

```bash
node engine/build.mjs "engine/specs/<資料名>/spec.js" "output/<資料名>.html"
```

スキーマ：`engine/README.md`／テンプレート：`engine/specs/_TEMPLATE/spec.js`／完成例：`engine/specs/sample/spec.js`
