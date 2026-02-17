// ================= Utilities =================
const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const pcToName = pc => noteNames[(pc + 12) % 12];

// ================= Piano =================
const whitePCs = [0, 2, 4, 5, 7, 9, 11];
const blackLayout = [{ pc: 1, left: 30 }, { pc: 3, left: 70 }, { pc: 6, left: 150 }, { pc: 8, left: 190 }, { pc: 10, left: 230 }];

const baseSet = new Set(), modeSet = new Set();
const modeOut = document.getElementById("modeOut");

let lastFinalColoring = [], lastBaseChord = [], lastChordSize = 0;

// ================= Build Keyboard =================
function buildKeyboard(whiteEl, blackEl, set) {
    whitePCs.forEach(pc => {
        const k = document.createElement("div"); k.className = "white-key"; k.dataset.pc = pc; k.onclick = () => toggle(k, pc, set); whiteEl.appendChild(k);
    });
    blackLayout.forEach(o => {
        const k = document.createElement("div"); k.className = "black-key"; k.style.left = o.left + "px"; k.dataset.pc = o.pc;
        k.onclick = e => { e.stopPropagation(); toggle(k, o.pc, set); }; blackEl.appendChild(k);
    });
}
buildKeyboard(baseWhiteKeys, baseBlackKeys, baseSet);
buildKeyboard(modeWhiteKeys, modeBlackKeys, modeSet);

// ================= Dynamic Color Count =================
const colorSelect = document.getElementById("colorCount");
function updateColorOptions() {
    const maxColor = Math.max(1, 7 - baseSet.size);
    colorSelect.innerHTML = "";
    for (let i = 1; i <= maxColor; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = i;
        colorSelect.appendChild(opt);
    }
    if (colorSelect.value > maxColor) colorSelect.value = maxColor;
}

// ================= Toggle Function =================
function toggle(el, pc, set) {
    if (set.has(pc)) {
        set.delete(pc);
        el.classList.remove("selected");
    } else {
        set.add(pc);
        el.classList.add("selected");
    }

    if (set === modeSet) {
        updateModeOut();  // just update display
        console.log("modeSet updated:", [...modeSet]);
    } else {
        updateColorOptions(); // update dropdown when base chord changes
        console.log("baseSet updated:", [...baseSet]);
    }
}


function updateModeOut() {
    const arr = [...modeSet].sort((a, b) => a - b);
    modeOut.textContent = "[" + arr.join(",") + "]";
}

// ================= Canvas =================
const canvas = circleCanvas, ctx = canvas.getContext("2d");
const cx = 260, cy = 260, R = 170;
function ang(pc) { return pc / 12 * 2 * Math.PI - Math.PI / 2; }
function drawBaseCircle() {
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.strokeStyle = "#ddd"; ctx.lineWidth = 1.5; ctx.stroke();
    for (let pc = 0; pc < 12; pc++) {
        const a = ang(pc), x = cx + Math.cos(a) * (R + 26), y = cy + Math.sin(a) * (R + 26) + 4;
        ctx.fillStyle = "#333"; ctx.font = "12px Arial"; ctx.fillText(pcToName(pc), x - 10, y);
    }
}

function drawNormalPolygon(onsets, offset = 0) {
    const pts = [];

    for (let k = 0; k < onsets; k++) {
        // shift by `offset` semitone ticks
        const tick = (k * 12 / onsets) + offset;
        const a = ang(tick);

        pts.push({
            x: cx + R * Math.cos(a),
            y: cy + R * Math.sin(a)
        });
    }

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath();

    ctx.fillStyle = "rgba(180,180,180,0.06)";
    ctx.strokeStyle = "rgba(120,120,120,0.45)";
    ctx.lineWidth = 1.6;
    ctx.fill();
    ctx.stroke();

    pts.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = "rgba(120,120,120,0.6)";
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
}




function drawChordPolygon(pcs, highlightPc = -1, highlightColor = null) {
    if (!pcs || !pcs.length) return;
    const pts = pcs.map(p => ({ pc: p, a: ang(p), x: cx + R * Math.cos(ang(p)), y: cy + R * Math.sin(ang(p)) })).sort((A, B) => A.a - B.a);
    ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.closePath(); ctx.fillStyle = "rgba(200,40,40,0.12)";
    ctx.strokeStyle = "rgba(200,40,40,0.95)"; ctx.lineWidth = 3; ctx.fill(); ctx.stroke();
    pts.forEach(p => {
        ctx.beginPath();
        ctx.fillStyle = (highlightPc === p.pc) ? highlightColor : "rgba(200,40,40,1)";
        ctx.arc(p.x, p.y, 7, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.font = "11px Arial"; ctx.fillText(p.pc, p.x - 6, p.y + 4);
    });
}
function drawAll(pcs, onsets, highlightPc = -1, highlightColor = null, offset) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBaseCircle(); drawNormalPolygon(onsets, offset); drawChordPolygon(pcs, highlightPc, highlightColor);
}

// ================= Server =================
function chordSize() {
    lastChordSize = (+colorCount.value) + lastBaseChord.length;
    return lastChordSize;
}

async function colorChord() {
    const base = [...baseSet];   // current base
    const mode = [...modeSet];   // current mode

    if (mode.length === 0) {
        alert("Please select a mode first!");
        return;
    }

    lastBaseChord = base.slice(); // for playback only

    // total onsets = base + selected number of color notes
    const totalOnsets = base.length + (+colorSelect.value);

    console.log("ColorChord called with base:", base, "mode:", mode, "onsets:", totalOnsets);

    const r = await fetch("/compute_chord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            baseChord: base,
            mode: mode,
            onsets: totalOnsets
        })
    });

    const d = await r.json();
    console.log("Server returned:", d);

    // store result
    lastFinalColoring = d.bestColoring || [];

    finalPCs.textContent = "[" + lastFinalColoring.join(",") + "]";
    finalNames.textContent = "[" + lastFinalColoring.map(pcToName).join(",") + "]";
    evennessOut.textContent = d.maxEvenness.toFixed(4);

    drawAll(lastFinalColoring, totalOnsets, -1, null, d.offset);
}




// ================= Audio =================
const AudioCtx = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioCtx();

function playNote(pc, oct, delay = 0) {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const midi = 60 + pc + 12 * (oct - 4);
    const freq = 440 * Math.pow(2, (midi - 69) / 12);
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, audioCtx.currentTime + delay);
    g.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.02 + delay);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8 + delay);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(audioCtx.currentTime + delay); osc.stop(audioCtx.currentTime + 0.9 + delay);
}

function highlightKey(pc, isBase) {
    const container = isBase ? "#basePiano" : "#modePiano";
    const color = isBase ? "lightup" : "lightup";
    document.querySelectorAll(`${container} [data-pc='${pc}']`).forEach(k => {
        k.classList.add(color);
        setTimeout(() => k.classList.remove(color), 200);
    });
}

// ================= Play Chord =================
function playChord() {
    if (!lastFinalColoring.length) return;

    const base = new Set(lastBaseChord);
    const arpeggio = arpeggioToggle.checked;

    const baseNotes = lastFinalColoring.filter(pc => base.has(pc)).sort((a, b) => a - b);
    const colorNotes = lastFinalColoring.filter(pc => !base.has(pc)).sort((a, b) => a - b);

    if (arpeggio) {
        const ordered = [...baseNotes, ...colorNotes];
        ordered.forEach((pc, i) => {
            const isBase = base.has(pc);
            playNote(pc, isBase ? 4 : 5, i * 0.25);
            setTimeout(() => highlightKey(pc, isBase), i * 250);
        });
    } else {
        lastFinalColoring.forEach(pc => {
            const isBase = base.has(pc);
            playNote(pc, isBase ? 4 : 5);
            highlightKey(pc, isBase);
        });
    }
}

// ================= Demo =================
function demoExample() {
    baseSet.clear(); modeSet.clear();
    [0, 7].forEach(p => baseSet.add(p));
    [0, 2, 4, 5, 7, 9, 11].forEach(p => modeSet.add(p));
    document.querySelectorAll(".white-key,.black-key").forEach(k => k.classList.remove("selected"));
    document.querySelectorAll("#basePiano [data-pc]").forEach(k => baseSet.has(+k.dataset.pc) && k.classList.add("selected"));
    document.querySelectorAll("#modePiano [data-pc]").forEach(k => modeSet.has(+k.dataset.pc) && k.classList.add("selected"));
    modeOut.textContent = "[0,2,4,5,7,9,11]";
    updateColorOptions();
    colorChord();
}

async function random() {
    baseSet.clear();
    modeSet.clear();

    // --- 1. Generate random 7-note mode ---
    const pcs = [...Array(12).keys()]; // [0..11]
    shuffle(pcs);

    const mode = pcs.slice(0, 7);
    mode.forEach(p => modeSet.add(p));

    // --- 2. Generate random base chord ---
    // Constraint: baseSize + onsetCount < 8
    const baseSize = randInt(1, 6);

    shuffle(mode);

    const base = mode.slice(0, baseSize);
    base.forEach(p => baseSet.add(p));

    // --- 3. Update UI ---
    document
        .querySelectorAll(".white-key,.black-key")
        .forEach(k => k.classList.remove("selected"));

    document
        .querySelectorAll("#basePiano [data-pc]")
        .forEach(k => baseSet.has(+k.dataset.pc) && k.classList.add("selected"));

    document
        .querySelectorAll("#modePiano [data-pc]")
        .forEach(k => modeSet.has(+k.dataset.pc) && k.classList.add("selected"));

    modeOut.textContent = `[${[...modeSet].sort((a, b) => a - b).join(",")}]`;

    min = 1
    if (baseSize === 1) {
        console.log("test")
        min = 2
    }
    updateColorOptions();
    colorSelect.value = randInt(min, 7 - baseSize)
    await colorChord();
    playChord();
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}



// ================= Init =================
window.onload = function () {
    updateColorOptions();
    demoExample();
}

