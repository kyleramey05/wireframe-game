// Water Drop Catcher Game Logic
let ctx, animationId;
let bucket, drops, score, missed, gameActive, gamePaused;

function initGame() {
    const canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    bucket = { x: 140, y: 440, width: 40, height: 20, speed: 6 };
    drops = [];
    score = 0;
    missed = 0;
    gameActive = false;
    gamePaused = false;
    updateScoreboard();
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
}

function pauseGame() {
    if (!gameActive) return;
    gamePaused = !gamePaused;
    if (!gamePaused) animate();
}

function resetGame() {
    cancelAnimationFrame(animationId);
    initGame();
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
    // Check collision
    for (let i = drops.length - 1; i >= 0; i--) {
        if (isColliding(bucket, drops[i])) {
            drops.splice(i, 1);
            score++;
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
