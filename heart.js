function startHeartAnimation() {

    /* ===============================
       REQUEST ANIMATION FRAME FIX
    =============================== */
    window.requestAnimationFrame =
        window.__requestAnimationFrame ||
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };

    /* ===============================
       DEVICE CHECK
    =============================== */
    window.isDevice =
        (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
            (navigator.userAgent || navigator.vendor || window.opera).toLowerCase()
        ));

    const canvas = document.getElementById("heart");
    const ctx = canvas.getContext("2d");
    const koef = window.isDevice ? 0.5 : 1;

    function resize() {
        canvas.width = koef * window.innerWidth;
        canvas.height = koef * window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    ctx.fillStyle = "rgba(0,0,0,1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* ===============================
       HEART MATH
    =============================== */
    const heartPosition = (rad) => [
        Math.pow(Math.sin(rad), 3),
        -(15 * Math.cos(rad)
            - 5 * Math.cos(2 * rad)
            - 2 * Math.cos(3 * rad)
            - Math.cos(4 * rad))
    ];

    const scaleAndTranslate = (pos, sx, sy, dx, dy) => [
        dx + pos[0] * sx,
        dy + pos[1] * sy
    ];

    /* ===============================
       HEART SHAPE (BIGGER + MORE LAYERS)
    =============================== */
    let pointsOrigin = [];
    let dr = window.isDevice ? 0.28 : 0.085;

    for (let i = 0; i < Math.PI * 2; i += dr)
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 260, 16, 0, 0));
    for (let i = 0; i < Math.PI * 2; i += dr)
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 200, 12, 0, 0));
    for (let i = 0; i < Math.PI * 2; i += dr)
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 140, 9, 0, 0));
    for (let i = 0; i < Math.PI * 2; i += dr)
        pointsOrigin.push(scaleAndTranslate(heartPosition(i), 80, 6, 0, 0));

    const heartPointsCount = pointsOrigin.length;
    let targetPoints = [];

    const pulse = (kx, ky) => {
        for (let i = 0; i < pointsOrigin.length; i++) {
            targetPoints[i] = [
                kx * pointsOrigin[i][0] + canvas.width / 2,
                ky * pointsOrigin[i][1] + canvas.height / 2
            ];
        }
    };

    /* ===============================
       PARTICLES (DENSER + RICHER)
    =============================== */
    let particles = [];
    let traceCount = window.isDevice ? 30 : 75;

    for (let i = 0; i < heartPointsCount; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;

        particles[i] = {
            vx: 0,
            vy: 0,
            speed: Math.random() * 1.5 + 5.5,
            q: ~~(Math.random() * heartPointsCount),
            D: 2 * (i % 2) - 1,
            force: 0.2 * Math.random() + 0.75,
            f: `hsla(0, ${~~(40 * Math.random() + 60)}%, ${~~(60 * Math.random() + 20)}%, .35)`,
            trace: []
        };

        for (let k = 0; k < traceCount; k++)
            particles[i].trace[k] = { x, y };
    }

    /* ===============================
       ANIMATION LOOP
    =============================== */
    let time = 0;

    (function loop() {

        let n = -Math.cos(time);
        pulse((1 + n) * 0.5, (1 + n) * 0.5);
        time += 0.012;

        ctx.fillStyle = "rgba(0,0,0,.12)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = particles.length; i--;) {
            let p = particles[i];
            let q = targetPoints[p.q];

            let dx = p.trace[0].x - q[0];
            let dy = p.trace[0].y - q[1];
            let dist = Math.sqrt(dx * dx + dy * dy) || 1;

            p.vx += -dx / dist * p.speed;
            p.vy += -dy / dist * p.speed;

            p.trace[0].x += p.vx;
            p.trace[0].y += p.vy;

            p.vx *= p.force;
            p.vy *= p.force;

            for (let k = 0; k < p.trace.length - 1; k++) {
                let T = p.trace[k];
                let N = p.trace[k + 1];
                N.x -= 0.45 * (N.x - T.x);
                N.y -= 0.45 * (N.y - T.y);
            }

            ctx.fillStyle = p.f;
            for (let k = 0; k < p.trace.length; k++) {
                ctx.fillRect(p.trace[k].x, p.trace[k].y, 1, 1);
            }
        }

        requestAnimationFrame(loop);
    })();
}
