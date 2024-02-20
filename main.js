document.addEventListener('DOMContentLoaded', () => {
    const game = document.getElementById('game');
    const startGameButton = document.getElementById('startGameButton');
    const playerNameInput = document.getElementById('playerNameInput');
    const mapSelect = document.getElementById('mapSelect');
    const login = document.getElementById('login');
    const displayName = document.getElementById('displayName');
    let playerLives = document.getElementById('playerLives');
    const finishPoint = document.createElement('div');
    let isPaused = false;
    let gameTimer, monsterSpawnTimer;
    finishPoint.className = 'finish';
    let lives = 5;
    let gameActive = false;
    let monsterCollisions = 0;
    let trapCollisions = 0;
    let startTime;

    const player = document.createElement('div');
    player.className = 'player';
    player.style.top = '0px';
    player.style.left = '0px';

    finishPoint.style.position = 'absolute';
    finishPoint.style.width = '80px';
    finishPoint.style.height = '80px';

    finishPoint.style.top = '380px'; 
    finishPoint.style.left = '580px';

    mapSelect.addEventListener('change', function() {
        document.body.className = ''; 
        document.body.classList.add(this.value); 
    });

    startGameButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        if (!playerName) {
            alert('введите имя.');
            return;
        }
        document.body.className = mapSelect.value;
        displayName.textContent = playerName;
        playerLives.textContent = lives;
        login.style.display = 'none';
        game.appendChild(player);
        game.appendChild(finishPoint);

        game.style.display = 'block';
        gameActive = true;
        startGame();
    });

    function startGame() {
        document.addEventListener('keydown', movePlayer);
        spawnMonstersAndTraps();
        updateCurrentTime();
        moveMonsters();
        startTime = Date.now();
        gameTimer = setInterval(updateGameTime, 1000); 
        monsterSpawnTimer = setInterval(spawnMonstersAndTraps, 3000); 
    }

    function pauseGame() {
        clearInterval(gameTimer);
        clearInterval(monsterSpawnTimer);
        
        isPaused = true;
        alert('Игра приостановлена');
    }

    function resumeGame() {
        updateGameTime();
        gameTimer = setInterval(updateGameTime, 1000); 
        monsterSpawnTimer = setInterval(spawnMonstersAndTraps, 3000); 
        isPaused = false;
        alert('Игра возобновлена');
    }

    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape") {
            isPaused ? resumeGame() : pauseGame();
        }
    });

    let playerPosition = { x: 0, y: 0 };

    function movePlayer(e) {
        if (!gameActive || isPaused) return;
        const step = 20; 
        switch (e.key) {
            case 'ArrowUp': playerPosition.y = Math.max(0, playerPosition.y - step); break;
            case 'ArrowDown': playerPosition.y = Math.min(game.offsetHeight - 20, playerPosition.y + step); break;
            case 'ArrowLeft': playerPosition.x = Math.max(0, playerPosition.x - step); break;
            case 'ArrowRight': playerPosition.x = Math.min(game.offsetWidth - 20, playerPosition.x + step); break;
        }
        updatePlayerPosition();
    }

    function updateGameTime() {
        const delta = Date.now() - startTime; 
        const seconds = Math.floor(delta / 1000) % 60;
        const minutes = Math.floor(delta / 60000);
        document.getElementById('gameElapsedTime').textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    function updateCurrentTime() {
        setInterval(() => {
            const now = new Date();
            document.getElementById("currentSystemTime").textContent = now.toTimeString().substring(0, 8);
        }, 1000);
    }

    function updatePlayerPosition() {
        player.style.top = `${playerPosition.y}px`;
        player.style.left = `${playerPosition.x}px`;
        checkCollisions();
        checkWinCondition();
    }

    let monsters = [];
    let traps = [];


    
    function moveMonsters() {
        monsters.forEach(monster => {
            const randomDirection = Math.floor(Math.random() * 4); 
            const step = 20; 
            switch (randomDirection) {
                case 0:
                    monster.style.top = Math.max(0, monster.offsetTop - step) + 'px';
                    break;
                case 1:
                    monster.style.top = Math.min(game.offsetHeight - 20, monster.offsetTop + step) + 'px';
                    break;
                case 2:
                    monster.style.left = Math.max(0, monster.offsetLeft - step) + 'px';
                    break;
                case 3:
                    monster.style.left = Math.min(game.offsetWidth - 20, monster.offsetLeft + step) + 'px';
                    break;
            }
            if (monster.offsetTop < 0 || monster.offsetTop > game.offsetHeight - 20 ||
                monster.offsetLeft < 0 || monster.offsetLeft > game.offsetWidth - 20) {
                game.removeChild(monster);
                monsters.splice(monsters.indexOf(monster), 1);
            }
        });
    }
    
    function spawnMonstersAndTraps() {
        monsters.forEach(monster => game.removeChild(monster));
        monsters = [];
    
        traps.forEach(trap => game.removeChild(trap));
        traps = [];
    
        for (let i = 0; i < 10; i++) {
            const monster = document.createElement('div');
            monster.className = 'monster';
            monster.style.top = `${Math.random() * (game.offsetHeight - 20)}px`;
            monster.style.left = `${Math.random() * (game.offsetWidth - 20)}px`;
            game.appendChild(monster);
            monsters.push(monster);

        }
    
        for (let i = 0; i < 2; i++) {
            const trap = document.createElement('div');
            trap.className = 'trap';
            const trapX = Math.random() * (game.offsetWidth - 20);
            const trapY = Math.random() * (game.offsetHeight - 20);
            trap.style.top = `${trapY}px`;
            trap.style.left = `${trapX}px`;
            game.appendChild(trap);
            
        }
    }
    

    function checkCollisions() {
        monsters.forEach((monster, index) => {
            if (isCollide(player, monster)) {
                game.removeChild(monster);
                monsters.splice(index, 1); 
                lives -= 1; 
                playerLives.textContent = lives; 
                monsterCollisions++; 
                if (lives <= 0) {
                    alert("Вы проиграли!");
                    gameActive = false;
                    pauseGameEnd();
                    showResults();
                }
            }
        });
    
        traps.forEach((trap, index) => {
            if (isCollide(player, trap)) {
                game.removeChild(trap);
                traps.splice(index, 1);
                lives -= 1; 
                playerLives.textContent = lives; 
                trapCollisions++; 
                if (lives <= 0) {
                    alert("Вы проиграли!");
                    gameActive = false;
                    pauseGameEnd();
                    showResults();
                }
            }
        });
    }

    function checkWinCondition() {
        if (isCollide(player, finishPoint)) {
            alert("Вы выиграли!");
            gameActive = false;
            showResults();
        }
    }

    function isCollide(a, b) {
        const aRect = a.getBoundingClientRect();
        const bRect = b.getBoundingClientRect();
        return !(
            ((aRect.top + aRect.height) < (bRect.top)) ||
            (aRect.top > (bRect.top + bRect.height)) ||
            ((aRect.left + aRect.width) < bRect.left) ||
            (aRect.left > (bRect.left + bRect.width))
        );
    }

    function checkWinCondition() {
        if (isCollide(player, finishPoint)) {
            showResults(true); 
            gameActive = false; 
            pauseGameEnd(); 
        }
    }
    
    function showResults(playerWon) {
        const elapsedTime = Date.now() - startTime;
        const seconds = Math.floor((elapsedTime / 1000) % 60);
        const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
    
        resultTime.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        resultMonsters.textContent = monsterCollisions;
        resultTraps.textContent = trapCollisions;
        resultLives.textContent = lives;
    
        result.style.display = 'block';
    
        if (playerWon) {
            gameActive = false; 
            pauseGameEnd(); 
        }
    }
    
    function pauseGameEnd() {
        clearInterval(gameTimer);
        clearInterval(monsterSpawnTimer);
        
        isPaused = true;
    }

    document.getElementById('restartGameButton').addEventListener('click', () => {
        document.location.reload(); 
    });
});
