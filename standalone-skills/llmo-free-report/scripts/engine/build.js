// build.js — spec（データ定義ファイル）から LLMO無料分析レポート(pptx)を生成する
// 使い方: node build.js <specファイルのパス> <出力pptxのパス>
// 例:      node build.js "specs/サンプル_EmmaTools/spec.js" "../サンプル/EmmaTools_LLMO無料分析.pptx"
const path = require("path");
const pptxgen = require("pptxgenjs");
const P = require("./lib/parts");
const { renderFreeReport } = require("./lib/render_free");

const specArg = process.argv[2];
const outArg = process.argv[3];
if (!specArg || !outArg) {
  console.error("使い方: node build.js <specパス> <出力pptxパス>");
  process.exit(1);
}
const D = require(path.resolve(specArg));
const pres = P.T.newPres(pptxgen, (D.cover && D.cover.client ? D.cover.client + " " : "") + "LLMO無料分析");
const api = P.mkApi(pres);
renderFreeReport(pres, api, D);
pres.writeFile({ fileName: path.resolve(outArg) }).then(() => console.log("OK " + api.st.pg + " slides -> " + outArg));
