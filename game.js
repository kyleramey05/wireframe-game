// Water Drop Catcher Game Logic
let ctx, animationId;
let bucket, drops, score, missed, gameActive, gamePaused, timer, timeLeft;

function initGame() {
    const canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    bucket = { x: 140, y: 440, width: 40, height: 20, speed: 6 };
    drops = [];
    score = 0;
    missed = 0;
    timeLeft = 30; // 30 seconds per game
    gameActive = false;
    gamePaused = false;
    updateScoreboard();
    updateTimer();
    clearCanvas();
    drawBucket();
}

function startGame() {
    if (gameActive) return;
    gameActive = true;
    gamePaused = false;
    document.getElementById('gameCanvas').focus();
    spawnDrop();
    animate();
    timer = setInterval(() => {
        if (!gameActive || gamePaused) return;
        timeLeft--;
        updateTimer();
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function pauseGame() {
    if (!gameActive) return;
    gamePaused = !gamePaused;
    if (!gamePaused) animate();
}

function resetGame() {
    cancelAnimationFrame(animationId);
    clearInterval(timer);
    initGame();
}

function endGame() {
    gameActive = false;
    clearInterval(timer);
    cancelAnimationFrame(animationId);
    updateTimer();
    showConfetti();
    setTimeout(() => {
        alert('Time is up! Your final score is: ' + score);
    }, 100);
}

function showConfetti() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const confettiCount = 120;
    const confetti = [];
    for (let i = 0; i < confettiCount; i++) {
        confetti.push({
            x: Math.random() * canvas.width,
            y: Math.random() * -canvas.height,
            r: Math.random() * 6 + 4,
            d: Math.random() * 40 + 10,
            color: `hsl(${Math.random()*360}, 80%, 60%)`,
            tilt: Math.random() * 10 - 10
        });
    }
    let angle = 0;
    let confettiAnimation;
    function drawConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < confetti.length; i++) {
            const c = confetti[i];
            ctx.beginPath();
            ctx.ellipse(c.x, c.y, c.r, c.r/2, c.tilt, 0, 2 * Math.PI);
            ctx.fillStyle = c.color;
            ctx.fill();
        }
        updateConfetti();
        confettiAnimation = requestAnimationFrame(drawConfetti);
    }
    function updateConfetti() {
        angle += 0.01;
        for (let i = 0; i < confetti.length; i++) {
            const c = confetti[i];
            c.y += (Math.cos(angle + c.d) + 2 + c.r / 2) * 0.8;
            c.x += Math.sin(angle) * 2;
            c.tilt += Math.sin(angle) * 0.3;
            if (c.y > canvas.height + 20) {
                c.x = Math.random() * canvas.width;
                c.y = -10;
            }
        }
    }
    drawConfetti();
    setTimeout(() => {
        cancelAnimationFrame(confettiAnimation);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        draw(); // redraw game state
    }, 2500);
}

function animate() {
    if (!gameActive || gamePaused) return;
    update();
    draw();
    animationId = requestAnimationFrame(animate);
}

function update() {
    // Move drops
    for (let drop of drops) {
        drop.y += drop.speed;
    }
    // Remove drops that are out of bounds
    for (let i = drops.length - 1; i >= 0; i--) {
        if (drops[i].y > 480) {
            drops.splice(i, 1);
            missed++;
            updateScoreboard();
        }
    }
    // Check collision with bucket
    for (let i = drops.length - 1; i >= 0; i--) {
        if (isColliding(bucket, drops[i])) {
            drops.splice(i, 1);
            // No score for bucket collision in this version
            updateScoreboard();
        }
    }
    // Spawn new drops
    if (Math.random() < 0.03) spawnDrop();
}

function draw() {
    clearCanvas();
    drawBucket();
    for (let drop of drops) drawDrop(drop);
}

function clearCanvas() {
    ctx.clearRect(0, 0, 320, 480);
}

function drawBucket() {
    ctx.fillStyle = '#0077ff';
    ctx.fillRect(bucket.x, bucket.y, bucket.width, bucket.height);
}

function drawDrop(drop) {
    ctx.beginPath();
    ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#00bfff';
    ctx.fill();
    ctx.closePath();
}

function spawnDrop() {
    drops.push({ x: Math.random() * 300 + 10, y: -10, radius: 10, speed: 3 + Math.random() * 2 });
}

function isColliding(bucket, drop) {
    return (
        drop.x > bucket.x &&
        drop.x < bucket.x + bucket.width &&
        drop.y + drop.radius > bucket.y &&
        drop.y - drop.radius < bucket.y + bucket.height
    );
}

function updateScoreboard() {
    document.getElementById('score').textContent = score;
    document.getElementById('missed').textContent = missed;
}

function updateTimer() {
    let timerLabel = document.getElementById('timerLabel');
    if (!timerLabel) {
        timerLabel = document.createElement('span');
        timerLabel.id = 'timerLabel';
        timerLabel.style.marginLeft = '1em';
        document.querySelector('.scoreboard').appendChild(timerLabel);
    }
    timerLabel.textContent = 'Time: ' + timeLeft + 's';
}

// Canvas click to pop drops for points
window.addEventListener('load', function() {
    const canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.addEventListener('click', function(e) {
            if (!gameActive || gamePaused) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            for (let i = drops.length - 1; i >= 0; i--) {
                const drop = drops[i];
                const dx = x - drop.x;
                const dy = y - drop.y;
                if (Math.sqrt(dx * dx + dy * dy) < drop.radius) {
                    drops.splice(i, 1);
                    score += 10;
                    updateScoreboard();
                    break;
                }
            }
        });
    }
});

// Keyboard controls
window.addEventListener('keydown', function(e) {
    if (!gameActive || gamePaused) return;
    if (e.key === 'ArrowLeft') {
        bucket.x = Math.max(0, bucket.x - bucket.speed);
    } else if (e.key === 'ArrowRight') {
        bucket.x = Math.min(320 - bucket.width, bucket.x + bucket.speed);
    }
});

// Toggle menu function
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    const navToggle = document.querySelector('.nav-toggle');
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navMenu.hidden = expanded;
    navToggle.setAttribute('aria-expanded', String(!expanded));
    if (!expanded) {
        // Focus first menu item for accessibility
        setTimeout(() => {
            const firstLink = navMenu.querySelector('a');
            if (firstLink) firstLink.focus();
        }, 100);
    }
}

// Initialize game on load
window.onload = function() {
    initGame();
};
