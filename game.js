const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 20,
    speed: 5,
    color: 'blue',
    bullets: [],
    bulletSpeed: 7,
    health: 5
};

let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

document.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.code)) {
        keys[e.code] = false;
    }
});

document.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    shootBullet(mouseX, mouseY);
});

function movePlayer() {
    if (keys.ArrowUp && player.y > 0) player.y -= player.speed;
    if (keys.ArrowDown && player.y < canvas.height - player.size) player.y += player.speed;
    if (keys.ArrowLeft && player.x > 0) player.x -= player.speed;
    if (keys.ArrowRight && player.x < canvas.width - player.size) player.x += player.speed;
}

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);

    // Draw player health bar
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y - 10, player.size, 5);
    ctx.fillStyle = 'green';
    ctx.fillRect(player.x, player.y - 10, player.size * (player.health / 5), 5);
}

function shootBullet(mouseX, mouseY) {
    const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
    player.bullets.push({
        x: player.x + player.size / 2,
        y: player.y + player.size / 2,
        size: 5,
        speed: player.bulletSpeed,
        dx: Math.cos(angle) * player.bulletSpeed,
        dy: Math.sin(angle) * player.bulletSpeed
    });
}

function moveBullets() {
    player.bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        bullet.y += bullet.dy;
        if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
            player.bullets.splice(index, 1);
        }
    });
}

function drawBullets() {
    player.bullets.forEach(bullet => {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullet.x, bullet.y, bullet.size, bullet.size);
    });
}

let enemies = [];
let enemySpeed = 2;
let enemySpawnRate = 2000; // Spawn a new enemy every 2 seconds
let maxEnemies = 10; // Maximum number of enemies on screen
let enemySpawnTimer = 0;
let enemiesKilled = 0;

function spawnEnemy() {
    if (enemies.length < maxEnemies) {
        let enemy = {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: 20,
            color: 'red',
            alive: true,
            health: 3
        };
        enemies.push(enemy);
    }
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        let dx = player.x - enemy.x;
        let dy = player.y - enemy.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < player.size + enemy.size) {
            enemy.alive = false;
            enemiesKilled++;
            player.health--;
            if (player.health <= 0) {
                alert("Game Over");
                document.location.reload();
            }
        } else {
            enemy.x += (dx / distance) * enemySpeed;
            enemy.y += (dy / distance) * enemySpeed;
        }
    });
    enemies = enemies.filter(enemy => enemy.alive);
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.size, enemy.size);

        // Draw enemy health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.size, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(enemy.x, enemy.y - 10, enemy.size * (enemy.health / 3), 5);
    });
}

function checkBulletCollisions() {
    player.bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            let dx = bullet.x - enemy.x;
            let dy = bullet.y - enemy.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < bullet.size + enemy.size) {
                enemy.health--;
                player.bullets.splice(bIndex, 1);
                if (enemy.health <= 0) {
                    enemy.alive = false;
                    enemiesKilled++;
                }
            }
        });
    });
}

let boss = null;
let bossHealth = 100;

function spawnBoss() {
    boss = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 50,
        color: 'purple',
        health: bossHealth
    };
}

function moveBoss() {
    if (boss) {
        let dx = player.x - boss.x;
        let dy = player.y - boss.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        boss.x += (dx / distance) * (enemySpeed / 2);
        boss.y += (dy / distance) * (enemySpeed / 2);
    }
}

function drawBoss() {
    if (boss) {
        ctx.fillStyle = boss.color;
        ctx.fillRect(boss.x, boss.y, boss.size, boss.size);

        // Draw boss health bar
        ctx.fillStyle = 'red';
        ctx.fillRect(boss.x, boss.y - 10, boss.size, 5);
        ctx.fillStyle = 'green';
        ctx.fillRect(boss.x, boss.y - 10, boss.size * (boss.health / bossHealth), 5);
    }
}

function checkBossCollisions() {
    if (boss) {
        player.bullets.forEach((bullet, bIndex) => {
            let dx = bullet.x - boss.x;
            let dy = bullet.y - boss.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < bullet.size + boss.size) {
                boss.health--;
                player.bullets.splice(bIndex, 1);
                if (boss.health <= 0) {
                    boss = null;
                    enemiesKilled = 0; // Reset the kill count for the next boss
                }
            }
        });
    }
}

function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    movePlayer();
    moveEnemies();
    if (enemiesKilled >= 50 && !boss) spawnBoss();
    if (boss) moveBoss();

    moveBullets();

    checkBulletCollisions();
    checkBossCollisions();

    drawPlayer();
    drawEnemies();
    drawBullets();
    drawBoss();

    enemySpawnTimer += timestamp;
    if (enemySpawnTimer > enemySpawnRate) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }

    requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
