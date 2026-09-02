/* =========================================================
   資料レンダラー — spec（データ定義）から16:9スライドHTMLを描く
   このファイルは共通部品です。個別案件では編集しないでください。
   使い方：renderDeck(spec, document.getElementById("stage"))
   スライドの種類とスキーマは engine/README.md を参照。
   ========================================================= */
(function (root) {
  "use strict";

  var COLORS = ["our", "accent", "digi", "navy", "user", "mute"];
  function cvar(key) {
    var k = String(key || "our").toLowerCase();
    return COLORS.indexOf(k) >= 0 ? "var(--c-" + k + ")" : "var(--c-our)";
  }
  function tint(key) {
    var k = String(key || "our").toLowerCase();
    var map = { our: "--c-our-t", user: "--c-user-t", digi: "--c-digi-t", accent: "--c-accent-t", navy: "--c-our-t", mute: "--c-light" };
    return "var(" + (map[k] || "--c-our-t") + ")";
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  // 改行を <br> に。**強調** を太字に。
  function rich(s) {
    return esc(s).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
  }
  function li(items, cls) {
    return (items || []).map(function (t) { return "<li" + (cls ? ' class="' + cls + '"' : "") + ">" + rich(t) + "</li>"; }).join("");
  }
  function cols(n) { return "repeat(" + n + ", 1fr)"; }

  // ─── 共通パーツ ───────────────────────────────
  function head(s) {
    if (!s.title && !s.kicker) return "";
    return '<div class="s-head">' +
      (s.kicker ? '<p class="s-kicker"' + (s.accent ? ' style="color:' + cvar(s.accent) + '"' : "") + ">" + esc(s.kicker) + "</p>" : "") +
      (s.title ? '<h2 class="s-title">' + rich(s.title) + "</h2>" : "") +
      "</div>";
  }
  function lead(s) { return s.lead ? '<p class="s-lead">' + rich(s.lead) + "</p>" : ""; }
  function note(s) { return s.note ? '<p class="s-note">' + rich(s.note) + "</p>" : ""; }
  function foot(ctx, dark) {
    var page = ctx.page == null ? "" : '<span class="s-page">' + String(ctx.page).padStart(2, "0") + "</span>";
    return '<div class="s-foot"><span>' + esc(ctx.credit || "") + "</span>" + page + "</div>";
  }
  function body(s, inner, style) {
    return '<div class="s-body' + (s.lead ? " has-lead" : "") + '"' + (style ? ' style="' + style + '"' : "") + ">" + inner + "</div>";
  }

  // ─── スライド種別 ─────────────────────────────
  var TYPES = {};

  // 表紙
  TYPES.cover = function (s, ctx) {
    return '<div class="slide dark">' +
      '<div style="position:absolute;left:var(--pad-x);top:140px;right:var(--pad-x)">' +
        (s.badge ? '<p class="cover-badge">' + esc(s.badge) + "</p>" : "") +
        '<h1 class="cover-title">' + rich(s.title) + "</h1>" +
        (s.subtitle ? '<p class="cover-sub">' + rich(s.subtitle) + "</p>" : "") +
        (s.client ? '<p class="cover-client">' + esc(s.client) + "</p>" : "") +
        (s.meta ? '<p class="cover-meta">' + rich(s.meta) + "</p>" : "") +
      "</div>" + foot({ credit: s.credit || ctx.credit, page: null }) + "</div>";
  };

  // 章扉
  TYPES.section = function (s, ctx) {
    return '<div class="slide dark">' +
      '<div style="position:absolute;left:var(--pad-x);top:210px;right:var(--pad-x)">' +
        (s.no ? '<p class="sec-no">' + esc(s.no) + "</p>" : "") +
        '<h2 class="sec-title">' + rich(s.title) + "</h2>" +
        (s.subtitle ? '<p class="sec-sub">' + rich(s.subtitle) + "</p>" : "") +
      "</div>" + foot(ctx) + "</div>";
  };

  // 目次
  TYPES.agenda = function (s, ctx) {
    var rows = (s.items || []).map(function (it, i) {
      return '<div class="agenda-row' + (s.highlight === i ? " on" : "") + '" style="height:' +
        Math.max(48, Math.min(78, Math.floor(470 / Math.max(1, s.items.length)) - 10)) + 'px">' +
        '<span class="agenda-no">' + esc(it[0]) + "</span>" +
        '<span class="agenda-t">' + rich(it[1]) + "</span>" +
        '<span class="agenda-d">' + rich(it[2] || "") + "</span></div>";
    }).join("");
    return '<div class="slide">' + head({ kicker: s.kicker || "AGENDA", title: s.title || "本日お話しすること" }) +
      lead(s) + body(s, rows) + note(s) + foot(ctx) + "</div>";
  };

  // 結論FACT（2〜4枚の数字カード）
  TYPES.facts = function (s, ctx) {
    var n = (s.cards || []).length || 1;
    var inner = '<div class="grid" style="grid-template-columns:' + cols(n) + '">' +
      (s.cards || []).map(function (f, i) {
        var c = cvar(f.c);
        return '<div class="card" style="padding:26px 24px 22px">' +
          '<span class="bar" style="background:' + c + '"></span>' +
          '<p class="fact-label" style="color:' + c + '">' + esc(f.label || "FACT 0" + (i + 1)) + "</p>" +
          '<p class="fact-n ' + (String(f.n || "").length > 5 ? "sm" : "lg") + '" style="color:' + c + '">' + rich(f.n) + "</p>" +
          '<p class="fact-t">' + rich(f.t) + "</p>" +
          '<p class="fact-b">' + rich(f.b) + "</p></div>";
      }).join("") + "</div>";
    return '<div class="slide">' + head(s) + lead(s) + body(s, inner) + note(s) + foot(ctx) + "</div>";
  };

  // KPI（指標カード + 読み取り）
  TYPES.kpi = function (s, ctx) {
    var n = (s.cards || []).length || 1;
    var cards = '<div class="grid" style="grid-template-columns:' + cols(n) + '">' +
      (s.cards || []).map(function (k, i) {
        var c = cvar(k.c);
        return '<div class="card" style="padding:24px 20px 20px">' +
          '<span class="bar" style="background:' + c + '"></span>' +
          '<div class="kpi-stage"><span class="kpi-num" style="background:' + c + '">' + (i + 1) + "</span>" + rich(k.stage) + "</div>" +
          '<p class="kpi-name">' + rich(k.kpi) + "</p>" +
          '<p class="kpi-value" style="color:' + c + '">' + rich(k.value) + "</p>" +
          (k.detail ? '<p class="kpi-detail">' + rich(k.detail) + "</p>" : "") + "</div>";
      }).join("") + "</div>";
    var read = (s.reading && s.reading.length)
      ? '<div class="readbox" style="margin-top:20px"><h4>' + esc(s.readingTitle || "読み取り") + "</h4><ul>" + li(s.reading) + "</ul></div>" : "";
    return '<div class="slide">' + head(s) + lead(s) + body(s, cards + read) + note(s) + foot(ctx) + "</div>";
  };

  // 汎用カード（2〜4枚）
  TYPES.cards = function (s, ctx) {
    var list = s.cards || [];
    var n = list.length || 1;
    var perRow = n > 4 ? 3 : n;
    var inner = '<div class="grid" style="grid-template-columns:' + cols(perRow) + '">' +
      list.map(function (p) {
        var c = cvar(p.c);
        return '<div class="card" style="padding:26px 24px 22px">' +
          '<span class="bar" style="background:' + c + '"></span>' +
          (p.tag ? '<span class="pill" style="background:' + tint(p.c) + ";color:" + c + '">' + esc(p.tag) + "</span>" : "") +
          '<p style="font-size:20px;font-weight:700;line-height:1.45;margin:' + (p.tag ? "14px" : "0") + ' 0 0">' + rich(p.t) + "</p>" +
          (p.value ? '<p style="font-size:29.5px;font-weight:700;color:' + c + ';margin:10px 0 0">' + rich(p.value) + "</p>" : "") +
          (p.b ? '<p style="font-size:14px;color:var(--c-sub);line-height:1.7;margin:12px 0 0">' + rich(p.b) + "</p>" : "") +
          "</div>";
      }).join("") + "</div>";
    return '<div class="slide">' + head(s) + lead(s) + body(s, inner) + note(s) + foot(ctx) + "</div>";
  };

  // 表
  TYPES.table = function (s, ctx) {
    var w = s.colW || [];
    var total = w.reduce(function (a, b) { return a + b; }, 0) || 1;
    var cg = w.length ? "<colgroup>" + w.map(function (x) { return '<col style="width:' + (x / total * 100).toFixed(2) + '%">'; }).join("") + "</colgroup>" : "";
    var th = (s.header || []).map(function (h) { return "<th>" + rich(h) + "</th>"; }).join("");
    var tb = (s.rows || []).map(function (r, i) {
      var hl = (s.highlightRow != null && s.highlightRow === i) ? ' class="hl"' : "";
      return "<tr" + hl + ">" + r.map(function (cell) { return "<td>" + rich(cell) + "</td>"; }).join("") + "</tr>";
    }).join("");
    var inner = '<table class="dt">' + cg + (th ? "<thead><tr>" + th + "</tr></thead>" : "") + "<tbody>" + tb + "</tbody></table>" +
      (s.takeaway ? '<p class="takeaway">' + rich(s.takeaway) + "</p>" : "");
    return '<div class="slide">' + head(s) + lead(s) + body(s, inner) + note(s) + foot(ctx) + "</div>";
  };

  // 帯（レイヤー説明など）
  TYPES.bands = function (s, ctx) {
    var inner = (s.rows || []).map(function (r) {
      return '<div class="band"><span class="band-label" style="background:' + cvar(r.c) + '">' + rich(r.label) + "</span>" +
        '<span class="band-desc">' + rich(r.desc) + "</span></div>";
    }).join("");
    return '<div class="slide">' + head(s) + lead(s) + body(s, inner) + note(s) + foot(ctx) + "</div>";
  };

  // 2カラム比較（強み / 弱み）
  TYPES.compare = function (s, ctx) {
    function colHtml(o, def) {
      if (!o) return "";
      var c = cvar(o.c || def);
      return '<div class="card cmp" style="padding:24px 26px;background:' + (o.tint === false ? "var(--c-white)" : tint(o.c || def)) + ';border-color:transparent;box-shadow:none">' +
        '<p class="cmp-h" style="color:' + c + '"><span class="dot" style="background:' + c + '"></span>' + rich(o.t) + "</p>" +
        "<ul>" + li(o.items) + "</ul></div>";
    }
    var top = '<div class="grid" style="grid-template-columns:1fr 1fr">' +
      colHtml(s.left, "our") + colHtml(s.right, "accent") + "</div>";
    var gap = s.gap ? '<div class="darkbox" style="margin-top:18px"><h4>' + esc(s.gap.t || "差分") + "</h4><p>" + (s.gap.items ? s.gap.items.map(rich).join("<br>") : rich(s.gap.body)) + "</p></div>" : "";
    return '<div class="slide">' + head(s) + lead(s) + body(s, top + gap) + note(s) + foot(ctx) + "</div>";
  };

  // 大きい数字（2〜4個）
  TYPES.stats = function (s, ctx) {
    var n = (s.stats || []).length || 1;
    var inner = '<div class="grid" style="grid-template-columns:' + cols(n) + ';align-content:start">' +
      (s.stats || []).map(function (t) {
        return '<div><p class="stat-n" style="color:' + cvar(t.c) + '">' + rich(t.n) + "</p>" +
          '<p class="stat-l">' + rich(t.label) + "</p>" +
          (t.source ? '<p class="stat-s">' + rich(t.source) + "</p>" : "") + "</div>";
      }).join("") + "</div>";
    var extra = s.takeaway ? '<p class="takeaway">' + rich(s.takeaway) + "</p>" : "";
    return '<div class="slide">' + head(s) + lead(s) + body(s, inner + extra) + note(s) + foot(ctx) + "</div>";
  };

  // 箇条書き（+ 補足ボックス）
  TYPES.bullets = function (s, ctx) {
    var inner = '<ul class="bullets">' + li(s.items) + "</ul>" +
      (s.box ? '<div class="darkbox" style="margin-top:8px"><h4>' + esc(s.box.title || "") + "</h4><p>" + rich(s.box.body) + "</p></div>" : "");
    return '<div class="slide">' + head(s) + lead(s) + body(s, inner) + note(s) + foot(ctx) + "</div>";
  };

  // ロードマップ / 時系列（2〜4列）
  TYPES.timeline = function (s, ctx) {
    var n = (s.cols || []).length || 1;
    var inner = '<div class="grid" style="grid-template-columns:' + cols(n) + '">' +
      (s.cols || []).map(function (c) {
        return '<div class="card tl" style="padding:20px 22px;background:var(--c-light)">' +
          '<p class="tl-h" style="background:' + cvar(c.c) + '">' + rich(c.t) + "</p>" +
          "<ul>" + li(c.items) + "</ul></div>";
      }).join("") + "</div>";
    return '<div class="slide">' + head(s) + lead(s) + body(s, inner) + note(s) + foot(ctx) + "</div>";
  };

  // 濃色1枚メッセージ
  TYPES.message = function (s, ctx) {
    return '<div class="slide dark">' +
      '<div style="position:absolute;left:var(--pad-x);right:var(--pad-x);top:50%;transform:translateY(-50%)">' +
      (s.kicker ? '<p class="s-kicker" style="color:var(--c-ice)">' + esc(s.kicker) + "</p>" : "") +
      '<h2 class="msg-title">' + rich(s.title) + "</h2>" +
      (s.body ? '<p class="msg-body">' + rich(s.body) + "</p>" : "") +
      "</div>" + foot(ctx) + "</div>";
  };

  // 最終CTA
  TYPES.cta = function (s, ctx) {
    return '<div class="slide dark">' +
      '<div style="position:absolute;left:var(--pad-x);right:var(--pad-x);top:140px">' +
      '<h2 class="cta-h">' + rich(s.headline || s.title) + "</h2>" +
      '<ul class="cta-list">' + li(s.points) + "</ul>" +
      "</div>" + foot(ctx) + "</div>";
  };

  // ─── メイン ───────────────────────────────────
  function renderDeck(spec, mount) {
    var meta = spec.meta || {};
    var slides = spec.slides || [];
    var page = 0;
    var html = slides.map(function (s) {
      var fn = TYPES[s.type];
      if (!fn) {
        return '<div class="slide"><div class="s-body"><p style="color:var(--c-accent);font-weight:700">' +
          "未定義のスライド種別: " + esc(s.type) + "（engine/README.md を確認）</p></div></div>";
      }
      if (s.type !== "cover") page += 1;
      return fn(s, { page: s.type === "cover" ? null : page, credit: meta.credit || "" });
    }).join("");

    if (mount) {
      mount.innerHTML = html;
      applyTheme(spec.theme);
      fitToWidth(mount);
    }
    return html;
  }

  // spec.theme の色を CSS 変数に反映
  function applyTheme(theme) {
    if (!theme || typeof document === "undefined") return;
    var map = {
      primary: "--c-our", light: "--c-user", dark: "--c-digi", deep: "--c-navy",
      accent: "--c-accent", ink: "--c-ink", grad1: "--c-dark1", grad2: "--c-dark2",
    };
    Object.keys(theme).forEach(function (k) {
      if (map[k]) document.documentElement.style.setProperty(map[k], theme[k]);
    });
  }

  // 画面幅に合わせてスライドを縮小表示（印刷時は等倍のまま）
  function fitToWidth(mount) {
    if (typeof window === "undefined") return;
    function fit() {
      var scale = Math.min(1, (window.innerWidth - 48) / 1280);
      Array.prototype.forEach.call(mount.querySelectorAll(".slide"), function (el) {
        el.style.transform = "scale(" + scale + ")";
        el.style.marginBottom = (720 * scale - 720) + "px";
      });
    }
    fit();
    window.addEventListener("resize", fit);
  }

  root.renderDeck = renderDeck;
  if (typeof module !== "undefined" && module.exports) module.exports = { renderDeck: renderDeck };
})(typeof window !== "undefined" ? window : globalThis);
