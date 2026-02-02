/* =========================================
   SCREEN 1 – IMAGE VORTEX → REAL IMAGE (FIXED)
========================================= */

const eyeCanvas = document.getElementById("eyeCanvas");
const ctxEye = eyeCanvas.getContext("2d");

function resizeEyeCanvas() {
    eyeCanvas.width = window.innerWidth;
    eyeCanvas.height = window.innerHeight;
}
resizeEyeCanvas();
window.addEventListener("resize", resizeEyeCanvas);

const img = new Image();
img.src = "eye2.jpg";

let particles = [];
let animationFinished = false;

img.onload = () => {
    createParticles();
    requestAnimationFrame(animateVortex);
};

function createParticles() {
    const temp = document.createElement("canvas");
    const tctx = temp.getContext("2d");

    temp.width = img.width;
    temp.height = img.height;

    tctx.drawImage(img, 0, 0);
    const data = tctx.getImageData(0, 0, temp.width, temp.height).data;

    const gap = 6;
    const scaleX = eyeCanvas.width / temp.width;
    const scaleY = eyeCanvas.height / temp.height;

    particles = [];

    for (let y = 0; y < temp.height; y += gap) {
        for (let x = 0; x < temp.width; x += gap) {
            const i = (x + y * temp.width) * 4;
            if (data[i + 3] > 0) {
                particles.push({
                    x: Math.random() * eyeCanvas.width,
                    y: Math.random() * eyeCanvas.height,
                    tx: x * scaleX,
                    ty: y * scaleY,
                    r: data[i],
                    g: data[i + 1],
                    b: data[i + 2],
                    angle: Math.random() * Math.PI * 2,
                    force: 1
                });
            }
        }
    }
}

function animateVortex() {
    ctxEye.fillStyle = "rgba(0,0,0,0.25)";
    ctxEye.fillRect(0, 0, eyeCanvas.width, eyeCanvas.height);

    let settled = 0;

    particles.forEach(p => {
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (dist < 40) p.force *= 0.92;

        p.angle += 0.05 * p.force;

        p.x += dx * 0.08 + Math.cos(p.angle) * p.force;
        p.y += dy * 0.08 + Math.sin(p.angle) * p.force;

        if (dist < 1) settled++;

        ctxEye.fillStyle = `rgb(${p.r},${p.g},${p.b})`;
        ctxEye.fillRect(p.x, p.y, 2, 2);
    });

    if (!animationFinished && settled > particles.length * 0.97) {
        animationFinished = true;

        ctxEye.clearRect(0, 0, eyeCanvas.width, eyeCanvas.height);
        ctxEye.drawImage(img, 0, 0, eyeCanvas.width, eyeCanvas.height);

        document
            .getElementById("introText")
            .classList.replace("hidden", "visible");

        return;
    }

    requestAnimationFrame(animateVortex);
}

/* =========================================
   NO BUTTON – INFINITE DRAMA ENGINE
========================================= */

let noCount = 0;

const dramaStages = [
    [
        "Are you sure? 🥹",
        "Really sure? 😢",
        "Think again 😭",
        "Please reconsider 💔",
        "Just one YES? 🥺"
    ],
    [
        "My heart is hurting now 💔",
        "Why would you do this to me 😞",
        "This hurts more than you think 😭",
        "Still no? 💔"
    ],
    [
        "I’ll cry myself to sleep tonight 😭",
        "This is officially tragic 💔",
        "Even the stars are sad 🌑",
        "My heart can’t take this 🫀💔",
        "Please… 😢"
    ],
    [
        "Okay that was rude 😤",
        "You’re testing my patience 😠",
        "Still clicking NO huh 😒",
        "Wow. Just wow 😑",
        "Try YES once 😌"
    ],
    [
        "We both know the answer 😏",
        "Stop lying to yourself 😌❤️",
        "Your YES is inevitable 💍",
        "Destiny says YES ✨",
        "Go ahead… click YES 😌"
    ]
];

/* ===============================
   BACKGROUND MUSIC CONTROLLER
=============================== */

const bgMusic = new Audio();
bgMusic.loop = true;
bgMusic.volume = 0.6;

const musicMap = {
    1: "music/intro.mp3",
    2: "music/valentine.mp3",
    3: "music/forever.mp3",
    4: "music/final.mp3"
};

function playMusic(screenNumber) {
    const newSrc = musicMap[screenNumber];
    if (!newSrc) return;

    if (bgMusic.src.includes(newSrc)) return;

    bgMusic.pause();
    bgMusic.src = newSrc;
    bgMusic.load();

    bgMusic.play().catch(() => {});
}

/* ===============================
   MUTED AUTOPLAY INTRO (LEGAL)
=============================== */

bgMusic.muted = true;
bgMusic.src = "music/intro.mp3";
bgMusic.play().catch(() => {});

document.addEventListener("click", () => {
    bgMusic.muted = false; // 🔊 sound turns on instantly
}, { once: true });


/* 🔑 INTRO MUSIC FIX (FIRST USER CLICK) */
let introStarted = false;

document.addEventListener("click", () => {
    if (!introStarted) {
        playMusic(1);   // Screen 1 intro music
        introStarted = true;
    }
}, { once: true });

/* =========================================
   SCREEN NAVIGATION
========================================= */

function nextScreen(n) {
    document.querySelectorAll(".screen").forEach(s =>
        s.classList.remove("active")
    );

    document.getElementById(`screen${n}`).classList.add("active");

    playMusic(n);

    if (n === 3) {
        setTimeout(startHeartAnimation, 200);
    }

    if (n === 4) {
        setTimeout(() => {
            document.getElementById("screen4").classList.add("open");
            document.getElementById("finalContent").classList.remove("hidden");
        }, 800);
    }
}

/* =========================================
   HANDLE NO – NEVER ENDS
========================================= */

function handleNo() {
    const stage = Math.floor(noCount / 5) % dramaStages.length;
    const index = noCount % dramaStages[stage].length;

    document.getElementById("noText").innerText =
        dramaStages[stage][index];

    noCount++;
}

/* =========================================
   FINAL SCREEN
========================================= */

function finalScreen() {
    nextScreen(4);

    const screen4 = document.getElementById("screen4");
    const content = document.getElementById("finalContent");

    setTimeout(() => {
        screen4.classList.add("open");
    }, 200);

    setTimeout(() => {
        content.classList.replace("hidden", "visible");
    }, 2000);
}

/* =========================================
   RUNAWAY NO BUTTON (SCREEN 3)
========================================= */

const runaway = document.getElementById("runaway");

runaway.addEventListener("mouseover", () => {
    const pad = 30;
    const x = Math.random() * (window.innerWidth - runaway.offsetWidth - pad);
    const y = Math.random() * (window.innerHeight - runaway.offsetHeight - pad);

    runaway.style.position = "absolute";
    runaway.style.left = x + "px";
    runaway.style.top = y + "px";
});

window.addEventListener("beforeunload", function (e) {
    const message = "Please don’t leave yet 🥺❤️ I have something important for you…";
    e.preventDefault();
    e.returnValue = message;
    return message;
});