(() => {
  "use strict";

  // ---------------------------------------------------------------
  // 1. 路線データ（丸ノ内線本線・池袋→荻窪、全25駅）
  // ---------------------------------------------------------------
  const STATIONS = [
    { kanji: "池袋", kana: "いけぶくろ", romaji: "ikebukuro" },
    { kanji: "新大塚", kana: "しんおおつか", romaji: "shinootsuka" },
    { kanji: "茗荷谷", kana: "みょうがだに", romaji: "myougadani" },
    { kanji: "後楽園", kana: "こうらくえん", romaji: "kourakuen" },
    { kanji: "本郷三丁目", kana: "ほんごうさんちょうめ", romaji: "hongousanchoume" },
    { kanji: "御茶ノ水", kana: "おちゃのみず", romaji: "ochanomizu" },
    { kanji: "淡路町", kana: "あわじちょう", romaji: "awajichou" },
    { kanji: "大手町", kana: "おおてまち", romaji: "ootemachi" },
    { kanji: "東京", kana: "とうきょう", romaji: "toukyou" },
    { kanji: "銀座", kana: "ぎんざ", romaji: "ginza" },
    { kanji: "霞ケ関", kana: "かすみがせき", romaji: "kasumigaseki" },
    { kanji: "国会議事堂前", kana: "こっかいぎじどうまえ", romaji: "kokkaigijidoumae" },
    { kanji: "赤坂見附", kana: "あかさかみつけ", romaji: "akasakamitsuke" },
    { kanji: "四ツ谷", kana: "よつや", romaji: "yotsuya" },
    { kanji: "四谷三丁目", kana: "よつやさんちょうめ", romaji: "yotsuyasanchoume" },
    { kanji: "新宿御苑前", kana: "しんじゅくぎょえんまえ", romaji: "shinjukugyoenmae" },
    { kanji: "新宿三丁目", kana: "しんじゅくさんちょうめ", romaji: "shinjukusanchoume" },
    { kanji: "新宿", kana: "しんじゅく", romaji: "shinjuku" },
    { kanji: "西新宿", kana: "にししんじゅく", romaji: "nishishinjuku" },
    { kanji: "中野坂上", kana: "なかのさかうえ", romaji: "nakanosakaue" },
    { kanji: "新中野", kana: "しんなかの", romaji: "shinnakano" },
    { kanji: "東高円寺", kana: "ひがしこうえんじ", romaji: "higashikouenji" },
    { kanji: "新高円寺", kana: "しんこうえんじ", romaji: "shinkouenji" },
    { kanji: "南阿佐ヶ谷", kana: "みなみあさがや", romaji: "minamiasagaya" },
    { kanji: "荻窪", kana: "おぎくぼ", romaji: "ogikubo" },
  ];
  const N = STATIONS.length;

  // ---------------------------------------------------------------
  // 2. 路線図上の固定座標（池袋=0 ... 荻窪=N-1、常にこの並びで固定）
  // ---------------------------------------------------------------
  const VIEW_W = 1000;
  const VIEW_H = 160;
  const MARGIN_X = 40;

  const points = [];
  for (let i = 0; i < N; i++) {
    const x = MARGIN_X + ((VIEW_W - MARGIN_X * 2) * i) / (N - 1);
    const y = VIEW_H / 2 + 42 * Math.sin(i * 0.5);
    points.push({ x, y });
  }

  function catmullRomToBezier(pts) {
    const segs = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i - 1] || pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2] || p2;
      const cp1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
      const cp2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
      segs.push({ p1, cp1, cp2, p2 });
    }
    return segs;
  }
  const segments = catmullRomToBezier(points);

  // ---------------------------------------------------------------
  // 3. 路線図・駅マーカーの描画
  // ---------------------------------------------------------------
  const lineSvg = document.getElementById("lineSvg");
  const stationsLayer = document.getElementById("stations");
  const trainEl = document.getElementById("train");

  document.getElementById("lineBase").remove();
  document.getElementById("lineProgress").remove();

  const segmentPaths = segments.map((seg) => {
    const d = `M ${seg.p1.x} ${seg.p1.y} C ${seg.cp1.x} ${seg.cp1.y}, ${seg.cp2.x} ${seg.cp2.y}, ${seg.p2.x} ${seg.p2.y}`;
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("class", "line-seg");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "var(--track-gray)");
    path.setAttribute("stroke-width", "6");
    path.setAttribute("stroke-linecap", "round");
    lineSvg.appendChild(path);
    return path;
  });

  const dotEls = [];
  const labelEls = [];
  points.forEach((p, i) => {
    const dot = document.createElement("div");
    dot.className = "station-dot";
    dot.style.left = (p.x / VIEW_W) * 100 + "%";
    dot.style.top = (p.y / VIEW_H) * 100 + "%";
    stationsLayer.appendChild(dot);
    dotEls.push(dot);

    const label = document.createElement("div");
    label.className = "station-label";
    label.textContent = STATIONS[i].kanji;
    label.style.left = (p.x / VIEW_W) * 100 + "%";
    const below = i % 2 === 0;
    label.style.top = below ? (p.y / VIEW_H) * 100 + 6 + "%" : (p.y / VIEW_H) * 100 - 16 + "%";
    stationsLayer.appendChild(label);
    labelEls.push(label);
  });

  function placeTrain(index) {
    const p = points[index];
    trainEl.style.left = (p.x / VIEW_W) * 100 + "%";
    trainEl.style.top = (p.y / VIEW_H) * 100 + "%";
  }

  // ---------------------------------------------------------------
  // 4. サウンド（Web Audio API で合成生成）
  // ---------------------------------------------------------------
  let audioCtx = null;
  let muted = false;

  function getAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  function playTone(freq, startOffset, duration, type, peakGain) {
    if (muted) return;
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;
    const t0 = ctx.currentTime + startOffset;
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(peakGain, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  function playCorrectSound() {
    playTone(880, 0, 0.09, "sine", 0.22);
    playTone(1318.5, 0.06, 0.12, "sine", 0.22);
  }

  function playMistypeSound() {
    playTone(180, 0, 0.06, "square", 0.06);
  }

  function playClearFanfare() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => playTone(f, i * 0.14, 0.22, "triangle", 0.2));
  }

  const muteBtn = document.getElementById("muteBtn");
  muteBtn.addEventListener("click", () => {
    muted = !muted;
    muteBtn.textContent = muted ? "🔇" : "🔊";
  });

  // ---------------------------------------------------------------
  // 5. ゲーム状態
  // ---------------------------------------------------------------
  const state = {
    reverse: false,
    playOrder: [],
    step: 0,
    typed: "",
    missCount: 0,
    startTime: null,
    timerId: null,
    finished: false,
  };

  const progressText = document.getElementById("progressText");
  const timeText = document.getElementById("timeText");
  const missText = document.getElementById("missText");
  const stationKanji = document.getElementById("stationKanji");
  const stationKana = document.getElementById("stationKana");
  const romajiDisplay = document.getElementById("romajiDisplay");
  const bestTimeItem = document.getElementById("bestTimeItem");
  const bestTimeText = document.getElementById("bestTimeText");
  const clearModal = document.getElementById("clearModal");
  const reverseBtn = document.getElementById("reverseBtn");

  function bestTimeKey() {
    return state.reverse ? "marunouchi-best-reverse" : "marunouchi-best-forward";
  }

  function loadBestTime() {
    const v = localStorage.getItem(bestTimeKey());
    if (v) {
      bestTimeItem.hidden = false;
      bestTimeText.textContent = Number(v).toFixed(1) + "秒";
      return Number(v);
    }
    bestTimeItem.hidden = true;
    return null;
  }

  function saveBestTimeIfBetter(elapsed) {
    const current = localStorage.getItem(bestTimeKey());
    if (!current || elapsed < Number(current)) {
      localStorage.setItem(bestTimeKey(), String(elapsed));
      return true;
    }
    return false;
  }

  function buildPlayOrder() {
    const order = [];
    for (let i = 0; i < N; i++) order.push(i);
    if (state.reverse) order.reverse();
    state.playOrder = order;
  }

  function currentStationData() {
    const visualIndex = state.playOrder[state.step];
    return STATIONS[visualIndex];
  }

  function updateLineVisuals() {
    for (let i = 0; i < dotEls.length; i++) {
      dotEls[i].classList.remove("passed", "current");
      labelEls[i].classList.remove("current");
    }
    const clampedStep = Math.min(state.step, N - 1);
    const currentVisual = state.playOrder[clampedStep];
    for (let s = 0; s < clampedStep; s++) {
      const a = state.playOrder[s];
      const b = state.playOrder[s + 1];
      const segIndex = Math.min(a, b);
      segmentPaths[segIndex].classList.add("passed-seg");
      dotEls[a].classList.add("passed");
    }
    dotEls[currentVisual].classList.add("current");
    labelEls[currentVisual].classList.add("current");
    placeTrain(currentVisual);
  }

  function renderQuiz() {
    const st = currentStationData();
    stationKanji.textContent = st.kanji;
    stationKana.textContent = st.kana;
    renderRomaji();
  }

  function renderRomaji() {
    const st = currentStationData();
    const typed = state.typed;
    const remaining = st.romaji.slice(typed.length);
    romajiDisplay.innerHTML =
      `<span class="typed">${typed}</span>` + `<span class="remaining">${remaining}</span>`;
  }

  function shakeFeedback() {
    romajiDisplay.classList.remove("shake");
    // force reflow so the animation can restart
    void romajiDisplay.offsetWidth;
    romajiDisplay.classList.add("shake");
  }

  function updateStatus() {
    progressText.textContent = `${state.step + 1} / ${N}駅`;
    missText.textContent = String(state.missCount);
  }

  function formatElapsed(sec) {
    return sec.toFixed(1) + "秒";
  }

  function startTimer() {
    state.startTime = performance.now();
    state.timerId = setInterval(() => {
      const elapsed = (performance.now() - state.startTime) / 1000;
      timeText.textContent = formatElapsed(elapsed);
    }, 100);
  }

  function stopTimer() {
    if (state.timerId) {
      clearInterval(state.timerId);
      state.timerId = null;
    }
  }

  function resetGame() {
    stopTimer();
    buildPlayOrder();
    state.step = 0;
    state.typed = "";
    state.missCount = 0;
    state.startTime = null;
    state.finished = false;
    timeText.textContent = "0.0秒";
    clearModal.hidden = true;
    updateStatus();
    updateLineVisuals();
    renderQuiz();
    loadBestTime();
  }

  function advanceStation() {
    playCorrectSound();
    state.step++;
    state.typed = "";
    if (state.step >= N) {
      finishGame();
      return;
    }
    updateStatus();
    updateLineVisuals();
    renderQuiz();
  }

  function finishGame() {
    state.finished = true;
    updateLineVisuals();
    stopTimer();
    const elapsed = (performance.now() - state.startTime) / 1000;
    timeText.textContent = formatElapsed(elapsed);
    playClearFanfare();

    const isBest = saveBestTimeIfBetter(elapsed);
    const best = Number(localStorage.getItem(bestTimeKey()));
    const score = Math.max(0, Math.round(10000 - elapsed * 10 - state.missCount * 50));

    document.getElementById("clearStationName").textContent = currentGoalName();
    document.getElementById("resultTime").textContent = formatElapsed(elapsed);
    document.getElementById("resultMiss").textContent = String(state.missCount);
    document.getElementById("resultScore").textContent = String(score);
    document.getElementById("resultBest").textContent =
      formatElapsed(best) + (isBest ? "（更新！）" : "");

    clearModal.hidden = false;
  }

  function currentGoalName() {
    const lastVisual = state.playOrder[N - 1];
    return STATIONS[lastVisual].kanji;
  }

  // ---------------------------------------------------------------
  // 6. キー入力処理
  // ---------------------------------------------------------------
  window.addEventListener("keydown", (e) => {
    if (!clearModal.hidden || state.finished) return;
    const key = e.key;
    if (key.length !== 1 || !/^[a-zA-Z]$/.test(key)) return;

    if (state.startTime === null) startTimer();

    const st = currentStationData();
    const nextChar = st.romaji[state.typed.length];
    if (key.toLowerCase() === nextChar) {
      state.typed += nextChar;
      if (state.typed.length === st.romaji.length) {
        advanceStation();
      } else {
        renderRomaji();
      }
    } else {
      state.missCount++;
      updateStatus();
      shakeFeedback();
      playMistypeSound();
    }
  });

  // ---------------------------------------------------------------
  // 7. ボタン操作
  // ---------------------------------------------------------------
  document.getElementById("restartBtn").addEventListener("click", () => {
    resetGame();
  });

  reverseBtn.addEventListener("click", () => {
    state.reverse = !state.reverse;
    reverseBtn.classList.toggle("active", state.reverse);
    reverseBtn.textContent = state.reverse ? "↔ 逆走行中（荻窪→池袋）" : "↔ 逆走行";
    resetGame();
  });

  // ---------------------------------------------------------------
  // 8. 初期化
  // ---------------------------------------------------------------
  resetGame();
})();
