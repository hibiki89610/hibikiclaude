#!/usr/bin/env node
/**
 * LLMO無料分析キット｜共有エージェント資産の保護フック（PreToolUse）
 *
 * このフォルダは共有ドライブでメンバー全員にローカル同期されている。
 * スキル・マニュアル・レンダリングエンジンなど「全員の成果物に影響する共通ファイル」を、
 * オーナー（瀬田）以外の環境から書き換えられないようにする。
 *
 * オーナー判定：ホームの ~/.claude/llmo-kit-owner の中身が OWNER_TOKEN と一致すればオーナー。
 *   このマーカーは共有ドライブの外＝各自のPCにあるので、フォルダを同期しても他の人には付いてこない。
 *
 * オーナー以外の場合は permissionDecision: "deny" を返して編集を止める。
 * PreToolUse の deny は auto モード／acceptEdits でも有効。
 *
 * 対象外（誰でも編集できる）：03_クライアントレポート/ と 04_共通素材/エンジン/specs/<クライアント名>/
 *
 * オーナーを増やすとき：その人のPCで1回だけ実行する
 *   node -e "const os=require('os'),fs=require('fs'),p=require('path');const d=p.join(os.homedir(),'.cla'+'ude');fs.mkdirSync(d,{recursive:true});fs.writeFileSync(p.join(d,'llmo-kit-owner'),'seta-junpei')"
 */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const OWNER_TOKEN = "seta-junpei";
const MARKER = path.join(os.homedir(), ".claude", "llmo-kit-owner");
// このスクリプトは <プロジェクト>/.claude/hooks/ にあるので、2つ上がプロジェクトルート
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

/** 保護対象（プロジェクトルートからの相対パス。ディレクトリはその配下すべて） */
const PROTECTED = [
  "CLAUDE.md",
  "00_はじめにお読みください.md",
  "01_マニュアル",
  "02_スキル・エージェント",
  ".claude",
  "04_共通素材/エンジン/lib",
  "04_共通素材/エンジン/build.js",
  "04_共通素材/エンジン/package.json",
  "04_共通素材/エンジン/specs/README.md",
  "04_共通素材/エンジン/specs/_TEMPLATE",
];

/** 書き込みを行うコマンドの目印（読み取り・ビルド実行は止めない） */
const WRITE_CMDS = [
  /(^|[;|&(]\s*)(cp|mv|rm|touch|mkdir|truncate|tee|rsync|install)\s/i,
  /\bsed\s+(-[a-z]*i|--in-place)/i,
  /\b(writeFileSync|appendFileSync|rmSync|unlinkSync|renameSync|copyFileSync|mkdirSync|createWriteStream)\b/,
  /\b(Set-Content|Out-File|Add-Content|New-Item|Remove-Item|Copy-Item|Move-Item)\b/i,
];

function isOwner() {
  try {
    return fs.readFileSync(MARKER, "utf8").trim() === OWNER_TOKEN;
  } catch {
    return false;
  }
}

/** パス1件を判定。プロジェクト内かつ保護対象配下なら、その相対パスを返す */
function hitPath(p) {
  if (!p || typeof p !== "string") return null;
  const cleaned = p.replace(/^["']|["']$/g, "").trim();
  if (!cleaned) return null;
  let abs;
  try {
    abs = path.isAbsolute(cleaned) ? cleaned : path.resolve(PROJECT_ROOT, cleaned);
  } catch {
    return null;
  }
  const rel = path.relative(PROJECT_ROOT, abs).replace(/\\/g, "/").toLowerCase();
  if (!rel || rel.startsWith("..")) return null; // プロジェクト外は対象外
  for (const prot of PROTECTED) {
    const pn = prot.toLowerCase();
    if (rel === pn || rel.startsWith(pn + "/")) return prot;
  }
  return null;
}

/** コマンド文字列からパスらしきトークンを抜き出す */
function tokens(cmd) {
  const out = [];
  const re = /"([^"]+)"|'([^']+)'|([^\s;|&()<>]+)/g;
  let m;
  while ((m = re.exec(cmd)) !== null) out.push(m[1] || m[2] || m[3]);
  return out;
}

/** Bash：書き込み意図があり、かつ保護対象に触れる場合のみブロック */
function bashHit(cmd) {
  if (!cmd) return null;
  // 1) リダイレクト先（2>/dev/null などのノイズは対象外になる）
  const redir = /(?:^|\s)\d?>>?\s*("[^"]+"|'[^']+'|[^\s;|&]+)/g;
  let m;
  while ((m = redir.exec(cmd)) !== null) {
    const h = hitPath(m[1]);
    if (h) return h;
  }
  // 2) 書き込み系コマンド＋保護対象パス
  if (WRITE_CMDS.some((re) => re.test(cmd))) {
    for (const t of tokens(cmd)) {
      const h = hitPath(t);
      if (h) return h;
    }
  }
  return null;
}

function deny(target, extra = "") {
  const reason =
    `【編集ブロック】${target} は LLMO無料分析キットの共有エージェント資産です。` +
    `このフォルダは全メンバーに同期されているため、オーナー（瀬田）以外の環境からは編集できません。` +
    `ファイルを書き換えず、変更したい内容を瀬田に伝えて依頼してください（内容の提案・下書きの提示は可）。` +
    `クライアント別フォルダ（03_クライアントレポート/…）と specs/<クライアント名>/ は通常どおり編集できます。` + extra;
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: reason,
    },
    systemMessage: `共有エージェント資産のため編集をブロックしました（${target}）。変更は瀬田に依頼してください。`,
  }));
  process.exit(0);
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (c) => (raw += c));
process.stdin.on("end", () => {
  let input = {};
  try { input = JSON.parse(raw || "{}"); } catch { process.exit(0); }

  if (isOwner()) process.exit(0); // オーナーは従来どおり

  const tool = input.tool_name || "";
  const ti = input.tool_input || {};

  if (tool === "Bash") {
    const h = bashHit(ti.command || "");
    if (h) deny(h, "（読み取り・ビルド実行は制限していません。書き込みを伴うコマンドのみブロックします）");
    process.exit(0);
  }

  const h = hitPath(ti.file_path || ti.notebook_path || ti.path || "");
  if (h) deny(h);
  process.exit(0);
});
