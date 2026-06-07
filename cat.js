// 1. Grab UI Elements from the HTML
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('start-btn');
const boxes = document.querySelectorAll('.grid-box');
const gameGrid = document.getElementById('game-grid');
const cats = document.querySelectorAll('.character');
const rats = document.querySelectorAll('.rat');

// HUD Asset Elements
const batteryImg = document.getElementById('battery');
const clockImg = document.getElementById('clock');
const timeLeftDisplay = document.getElementById('time-left');

// 2. Game Settings & Variables
let score = 0;
let gameActive = false;
let currentActiveCat = null;
let spawnTimer = null;
let countdownTimer = null; // Holds the 1-second ticking clock
let clockFrame = 1;       // Current clock animation frame
let lives = 4;            // Battery acts as health/lives
const gameDuration = 70;   // Game length in seconds

// 3. Random Engine: Select a box space
function getRandomBox() {
    const randomIndex = Math.floor(Math.random() * boxes.length);
    return boxes[randomIndex];
}

// 4. Spawn Loop Engine
function spawnCat() {
    if (!gameActive) return;

    // Hide the previous active target if it's still up
    if (currentActiveCat) {
        currentActiveCat.classList.remove('active-cat', 'active-rat');
    }

    // Pick a box and determine whether it is a cat or a rat
    const targetBox = getRandomBox();
    const isRat = Math.random() < 0.2; // 20% chance for a rat
    const targetElement = isRat ? targetBox.querySelector('.rat') : targetBox.querySelector('.character');

    attachClickListener(targetElement);
    targetElement.classList.add(isRat ? 'active-rat' : 'active-cat');
    currentActiveCat = targetElement;
}

function attachClickListener(element) {
    if (!element || element.hasListenerAttached) return;
    element.addEventListener('click', handleWhack);
    element.hasListenerAttached = true;
}

// 5. Click Handler (Whacking the Cat or Rat)
function handleWhackTarget(clicked) {
    if (!gameActive || !clicked) {
        return;
    }

    if (!clicked.classList.contains('active-cat') && !clicked.classList.contains('active-rat')) {
        return;
    }

    if (clicked.classList.contains('active-rat')) {
        loseLife();
    } else {
        score += 10;
        scoreDisplay.textContent = score;
    }

    clicked.classList.remove('active-cat', 'active-rat');
    currentActiveCat = null;
    spawnCat();
}

function handleWhack(event) {
    handleWhackTarget(event.currentTarget);
}

function handleGridClick(event) {
    const clicked = event.target.closest('.character.active-cat, .rat.active-rat');
    if (!clicked) return;
    handleWhackTarget(clicked);
}

// 6. Battery now acts as player health/lives
function updateBatteryDisplay() {
    batteryImg.src = `./battery-${lives}.png`;
}

function loseLife() {
    if (!gameActive) return;

    lives = Math.max(0, lives - 1);
    updateBatteryDisplay();

    if (lives === 0) {
        clearInterval(spawnTimer);
        clearInterval(countdownTimer);
        gameActive = false;

        if (currentActiveCat) {
            currentActiveCat.classList.remove('active-cat', 'active-rat');
            currentActiveCat = null;
        }

        alert(`GAME OVER! You scored ${score} points!`);
    }
}

// 7. Core Start Button Listener
startButton.addEventListener('click', () => {
    if (gameActive) return; // Prevent spamming while playing

    // Reset game states
    gameActive = true;
    score = 0;
    scoreDisplay.textContent = score;
    let timeLeft = gameDuration;
    timeLeftDisplay.textContent = timeLeft;
    clockFrame = 1;

    // Reset HUD assets to full/starting states
    lives = 4;
    updateBatteryDisplay();
    clockImg.src = "./clock-1.png";

    // Fire initial spawns
    spawnCat();
    spawnTimer = setInterval(spawnCat, 1000); // New cat every second

    // Main Countdown Engine
    countdownTimer = setInterval(() => {
        timeLeft--;
        timeLeftDisplay.textContent = timeLeft;

        // Cycle clock frame every second
        clockFrame = clockFrame === 4 ? 1 : clockFrame + 1;
        const clockFiles = [
            './clock-1.png',
            './clock-2-.png',
            './clock-3-.png',
            './clock-4-.png'
        ];
        clockImg.src = clockFiles[clockFrame - 1];

        // Battery is now managed via lives/loseLife()

        // Check if game is over
        if (timeLeft <= 0) {
            // Stop all intervals
            clearInterval(spawnTimer);
            clearInterval(countdownTimer);
            gameActive = false;

            // Clear any stray cat still sticking up on screen
            if (currentActiveCat) {
                currentActiveCat.classList.remove('active-cat');
                currentActiveCat = null;
            }

            // Announce Score!
            alert(`GAME OVER! You scored ${score} points!`);
        }
    }, 1000);
});

// 8. Bind click event handlers directly to your cats and rats
cats.forEach((cat) => {
    cat.addEventListener('click', handleWhack);
    cat.addEventListener('pointerdown', handleWhack);
});
rats.forEach((rat) => {
    rat.addEventListener('click', handleWhack);
    rat.addEventListener('pointerdown', handleWhack);
});

gameGrid.addEventListener('click', handleGridClick);
gameGrid.addEventListener('pointerdown', handleGridClick);