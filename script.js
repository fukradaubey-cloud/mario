
    let sound = document.querySelector(".lose-sound");
    // --- DOM Elements ---
    const player = document.getElementById('player');
    const gameContainer = document.getElementById('game-container');
    const platform = document.getElementById('platform');
    const leftBtn = document.getElementById('left-btn');
    const jumpBtn = document.getElementById('jump-btn');
    const rightBtn = document.getElementById('right-btn');
    
    // --- SCORE ELEMENT ---
    const scoreValueDisplay = document.getElementById('score-value');
    // --- GAME CONTROL ELEMENTS ---
    const gameOverScreen = document.getElementById('game-over-screen');
    const restartBtn = document.getElementById('restart-btn');
    let isGameRunning = false; 
    let moveInterval; 
    let insertInterval; 

    // --- GAME STATE VARIABLES ---
    let score = 0; // Initialized score
    let playerX = 100;
    let playerY = 30; 
    const playerWidth = 50; 
    const playerHeight = 50; 
    const playerSpeed = 5;

    // Double Jump Variables
    const MAX_JUMPS = 8; 
    let jumpsRemaining = MAX_JUMPS;

    // Physics
    let velocityY = 0;
    const gravity = 0.5; 
    const jumpStrength = 15; 
    let isOnGround = true;

    // Input state variables
    let isMovingLeft = false;
    let isMovingRight = false;
    
    // Animation Variables
    let currentFrame = 0;
    const totalRunningFrames = 4;
    const frameWidth = 30; 
    let animationTimer = 10;
    const framesPerPose = 6; 
    
    // Obstacle Constants
    const NUM_DIVS = 2;
    const DIV_WIDTH = 50;
    const GAP_BETWEEN_DIVS = 120;
    const START_X = 600; 
    const REMOVE_X = -50; 
    const MOVEMENT_STEP = 5; 
    const ANIMATION_INTERVAL_MS = 30; 
    const INSERTION_INTERVAL = 3000; 
    
    
    // --- GAME FLOW CONTROL FUNCTIONS ---
    
    function resetGame() {
        // Reset Player State
        playerX = 100;
        playerY = 30;
        velocityY = 0;
        isOnGround = true;
        jumpsRemaining = MAX_JUMPS;
        isMovingLeft = false;
        isMovingRight = false;
        
        // Reset Score
        score = 0;
        scoreValueDisplay.textContent = score;
        
        // Reset Visuals
        player.style.left = playerX + 'px';
        player.style.bottom = playerY + 'px';
        gameOverScreen.style.display = 'none'; 
        
        // Remove all obstacles
        gameContainer.querySelectorAll('.moving-div').forEach(div => div.remove());
    }
    
    function endGame() {
        if (!isGameRunning) return;
        
        isGameRunning = false;
        sound.play();
        clearInterval(moveInterval); 
        clearInterval(insertInterval); 
        
        gameOverScreen.style.display = 'flex';
        
    }

    function startGame() {
        if (isGameRunning) return;
        
        resetGame();
        isGameRunning = true;
        
        moveInterval = setInterval(moveDivs, ANIMATION_INTERVAL_MS);
        insertNewDivGroup(); 
        insertInterval = setInterval(insertNewDivGroup, INSERTION_INTERVAL);
    }

    // Attach restart listener
    restartBtn.addEventListener('click', startGame);

    // --- INPUT HANDLERS ---

    function setMovement (direction,isPressed) {
        if (!isGameRunning) return; 
        if (direction === 'left') {
            isMovingLeft = isPressed;
        } else if (direction === 'right') {
            isMovingRight = isPressed;
        }
    }

    leftBtn.addEventListener('touchstart', (e) => { e.preventDefault(); setMovement('left', true); }); 
    leftBtn.addEventListener('touchend', () => setMovement('left', false));

    rightBtn.addEventListener('touchstart', (e) => { e.preventDefault(); setMovement('right', true); });
    rightBtn.addEventListener('touchend', () => setMovement('right', false));

    function handleJump() {
        if (!isGameRunning) return;
        if (jumpsRemaining > 0) { 
            velocityY = jumpStrength;
            jumpsRemaining--;    
            isOnGround = false;  
        }
    }

    jumpBtn.addEventListener('touchstart', (e) => { 
        e.preventDefault();
        handleJump(); 
    });


    // --- GAME LOOP FUNCTIONS ---

    function update() {
        if (!isGameRunning) return; 

        // Animation Logic
        if (isMovingLeft || isMovingRight) {
            animationTimer++;
            if (animationTimer >= framesPerPose) {
                currentFrame = (currentFrame + 1) % totalRunningFrames; 
                animationTimer = 0; 
            }
        } else {
            currentFrame = 0; 
            animationTimer = 0; 
        }

        // Horizontal Movement
        if(isMovingRight) {
            playerX += playerSpeed;
        }
        if(isMovingLeft) {
            playerX -= playerSpeed;
        }

        const gameWidth = gameContainer.offsetWidth;
        if (playerX < 0) playerX = 0; 
        if (playerX > gameWidth - playerWidth) playerX = gameWidth - playerWidth; 
        
        // Gravity and Vertical Movement
        if(!isOnGround) {
            velocityY -= gravity; 
            playerY += velocityY;
        }

        // Ground/Platform Collision and Jump Reset
        const groundY = platform.offsetHeight;
        if(playerY < groundY) { 
            playerY = groundY;
            velocityY = 0;
            
            if (!isOnGround) {
                jumpsRemaining = MAX_JUMPS; 
            }
            
            isOnGround = true;
        }
    }

    function render() {
        if (!isGameRunning) return; 

        const xOffset = -(currentFrame * frameWidth) + 10;
        player.style.backgroundPositionX = xOffset + 'px';

        if (isMovingLeft) {
            player.style.transform = 'scaleX(-1)';
        } else if (isMovingRight) {
            player.style.transform = 'scaleX(1)';
        } else if(!isOnGround){
            player.style.backgroundPositionX = -190 + 'px'; 
        }

        player.style.left = playerX + 'px';
        player.style.bottom = playerY + 'px';
    }

    function gameLoop() {
        update();
        render();
        requestAnimationFrame(gameLoop);
    }
    
    gameLoop(); 

    
    // --- OBSTACLE FUNCTIONS ---

    function createRandomDiv(startX, index) {
        const randomHeight = Math.floor(Math.random() * 150) + 50; 
        const divLeft = startX + (DIV_WIDTH + GAP_BETWEEN_DIVS) * index;
        
        const div = document.createElement('div');
        div.className = 'moving-div';
        div.style.height = `${randomHeight}px`;
        div.style.left = `${divLeft}px`;
        
        const containerHeight = gameContainer.clientHeight;
        const platformHeight = 30; 
        const maxTop = containerHeight - randomHeight - platformHeight; 
        const minTop = 50; 
        
        const randomTop = (maxTop > minTop) 
            ? Math.floor(Math.random() * (maxTop - minTop)) + minTop
            : minTop; 

        div.style.top = `${randomTop}px`;

        return div;
    }

    function moveDivs() { 
        const allDivs = gameContainer.querySelectorAll('.moving-div');
        const containerHeight = gameContainer.clientHeight;

        allDivs.forEach(div => {
            let currentX = parseInt(div.style.left, 10);
            
            currentX -= MOVEMENT_STEP;
            div.style.left = `${currentX}px`;
            
            // --- COLLISION CHECK (AABB) ---
            let currentY = parseInt(div.style.top, 10);
            let obstacleHeight = parseInt(div.style.height, 10);

            const isTouching = (
                playerX < currentX + DIV_WIDTH &&
                playerX + playerWidth > currentX &&
                (containerHeight - playerY - playerHeight) < (currentY + obstacleHeight) &&
                (containerHeight - playerY) > currentY
            );

            if (isTouching) {
                console.log("GAME OVER! Pillar Hit!");
                endGame(); 
                return; 
            }

            if (currentX < REMOVE_X) {
                // --- SCORE INCREMENT ---
                score++;
                scoreValueDisplay.textContent = score;
                // --- END SCORE INCREMENT ---

                div.remove();
            }
        });
    }
    
    function insertNewDivGroup() {
         for (let i = 0; i < NUM_DIVS; i++) {
            const newDiv = createRandomDiv(START_X, i);
            gameContainer.appendChild(newDiv);
        }
    }
    
    // --- Initial Game Start ---
    startGame();

