# 共有エージェント資産の保護フック

このキットは共有ドライブでメンバー全員のPCにローカル同期されています。
そのため、誰かのセッションでスキルやエンジンを書き換えると、**全員のレポート生成に影響します**。
それを防ぐための仕組みです。

## やっていること
`.claude/settings.json` に登録した **PreToolUse フック**（`guard-agent-files.mjs`）が、
Edit／Write／MultiEdit／NotebookEdit／Bash の実行前に「対象が共有資産かどうか」を判定し、
**オーナー以外なら編集をブロック**します。`permissionDecision: "deny"` を返すため、
**自動モード（auto／acceptEdits）でもブロックされます**。

## 保護される場所（オーナーのみ編集可）
- `CLAUDE.md` / `00_はじめにお読みください.md`
- `01_マニュアル/`
- `02_スキル・エージェント/`（スキル本体・references・templates）
- `.claude/`（このフックと settings.json 自身）
- `04_共通素材/エンジン/lib/` `build.js` `package.json`
- `04_共通素材/エンジン/specs/README.md` `specs/_TEMPLATE/`

## 誰でも編集できる場所
- `03_クライアントレポート/<クライアント名>/`（ヒアリング・データ・ワーク・納品）
- `04_共通素材/エンジン/specs/<クライアント名>/`（クライアント別spec）

**読み取りとビルド実行は制限していません。** `node build.js …` も普通に動きます。
Bashは「書き込みを伴うコマンド（`>` `sed -i` `cp` `mv` `rm` `Set-Content` など）」が
保護対象に触れるときだけブロックします。

## オーナーの判定方法
各自のPCのホームにある `~/.claude/llmo-kit-owner` の中身が `seta-junpei` ならオーナー。
このファイルは**共有ドライブの外**にあるので、フォルダを同期しても他の人には付いてきません。

### オーナーを追加する（瀬田の承認のうえで）
その人のPCで1回だけ実行：

```bash
node -e "const os=require('os'),fs=require('fs'),p=require('path');const d=p.join(os.homedir(),'.cla'+'ude');fs.mkdirSync(d,{recursive:true});fs.writeFileSync(p.join(d,'llmo-kit-owner'),'seta-junpei')"
```

### オーナーを外す
そのPCの `~/.claude/llmo-kit-owner` を削除する。

## メンバーが変更したいときの流れ
1. Claudeに「ここを直したい」と伝える → フックがブロックし、Claudeが理由を説明します
2. **ファイルは書き換えず**、変更したい内容（どのファイルの何をどう変えたいか）を瀬田に連絡
3. 瀬田が反映 → 共有ドライブ同期で全員に届きます

## 注意（この仕組みの限界）
- これは**事故防止のガードレール**であって、権限管理ではありません。
  設定を無効化すれば回避できます（`disableAllHooks` など）。運用ルールと合わせて使ってください。
- 共有ドライブ側のファイル権限（閲覧者／編集者）を絞れるなら、そちらのほうが確実です。
- フックを追加・変更した直後は、各自のClaude Codeで設定の再読み込み（`/hooks` を一度開く、
  またはセッション再起動）が必要な場合があります。

## 動作確認
```bash
echo '{"tool_name":"Edit","tool_input":{"file_path":"02_スキル・エージェント/llmo-free-report/SKILL.md"}}' | node ".claude/hooks/guard-agent-files.mjs"
```
オーナーなら何も出力されず、オーナー以外なら「編集ブロック」のJSONが返ります。
