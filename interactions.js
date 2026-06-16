const canvas = document.getElementById("ren");
const ctx = canvas.getContext("2d");

const xor1 = document.getElementById("xor1");
const xor2 = document.getElementById("xor2");
const xor3 = document.getElementById("xor3");

const playBtn = document.querySelector(".pl");
const randBtn = document.querySelector(".Rand");
const updBtn = document.querySelector(".Upd");

// --------------------
// STATE
// --------------------
let audioCtx = null;
let node = null;
let playing = false;
let t = 0;

// --------------------
// RESIZE
// --------------------
function resizeCanvas() {
    canvas.width = canvas.clientWidth || 900;
    canvas.height = canvas.clientHeight || 300;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// --------------------
// FIXED BYTEBEAT (NO RAMPS, REAL OSCILLATION)
// --------------------
function bytebeat(t) {
    return (
        (t >> Number(xor1.value)) ^
        (t >> Number(xor2.value)) ^
        (t >> Number(xor3.value)) ^
        (t * 5)
    ) & 255;
}

// --------------------
// AUDIO ENGINE
// --------------------
function createBytebeatNode(ctx) {
    const bufferSize = 1024;

    const scriptNode = ctx.createScriptProcessor(bufferSize, 0, 1);

    scriptNode.onaudioprocess = (e) => {

        const output = e.outputBuffer.getChannelData(0);

        // 👇 THIS is your audio loop
        for (let i = 0; i < output.length; i++) {

            output[i] = (sample(t) - 128) / 128;

            t++; // 🔥 advance global time
        }
    };

    return scriptNode;
}

//---------------------
//Functions
//---------------------
function sample(t) {
    return (
        (t >> xor1.value) ^
        (t >> xor2.value) ^
        (t >> xor3.value)
    ) & 255;
}

function currentTime() {
    return t;
}
// --------------------
// VISUALIZER (SYNCED)
// --------------------
function render() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const midY = canvas.height / 2;
    const centerX = canvas.width / 2;
    const zoom = 20;

    ctx.strokeStyle = "#00ff88";
    ctx.beginPath();

for (let x = 0; x < canvas.width; x++) {

    const time = t + x * 10;
    const value = sample(time);

    const y = canvas.height / 2 + (value - 128);

    if (x === 0) {
        ctx.moveTo(x, y);   // start line
    } else {
        ctx.lineTo(x, y);   // continue line
    }
}

ctx.stroke();

ctx.strokeStyle = "red";
ctx.beginPath();
ctx.moveTo(canvas.width/2, canvas.height);
ctx.lineTo(canvas.width/2, -canvas.height);
ctx.stroke();
}

// --------------------
// LOOP
// --------------------
function loop() {
    render();
    requestAnimationFrame(loop);
}
loop();

// --------------------
// PLAY / STOP
// --------------------
playBtn.addEventListener("click", async () => {
    playing = !playing;

    if (playing) {
        playBtn.textContent = "Stop";

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        node = createBytebeatNode(audioCtx);
        node.connect(audioCtx.destination);

        await audioCtx.resume();
    } 
    else {
        playBtn.textContent = "Play";

        if (node) node.disconnect();
        if (audioCtx) audioCtx.close();

        node = null;
        audioCtx = null;
    }
});

// --------------------
// RANDOMIZE
// --------------------
randBtn.addEventListener("click", () => {
    const r = () => Math.floor(Math.random() * 9);

    xor1.value = r();
    xor2.value = r();
    xor3.value = r();
});

// --------------------
// RESET TIME
// --------------------
updBtn.addEventListener("click", () => {
    t = 0;
});