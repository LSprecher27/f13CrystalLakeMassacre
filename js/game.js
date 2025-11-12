// ---------------------------------
// Game Manager Module (Central Core)
// ---------------------------------

// --- 1. Imports from Modules ---
import { 
    jason, 
    handlePlayerMovement, 
    initializePlayerInput,
    JASON_ANIMATIONS 
} from './player.js'; 

import { 
    createCounselors, 
    updateCounselor,
    COUNSELOR_SIZE 
} from './counselor.js'; 


// --- 2. Global Game State and Constants ---
let canvas;
let ctx;

const MAP_WIDTH = 800;
const MAP_HEIGHT = 800;

let isGameRunning = false;
let counselors = []; // Array to hold all AI counselors

// Asset Storage
let jasonSpriteImage;


// --- 3. Asset Loading ---

/**
 * Loads all necessary game assets before starting.
 */
function loadAssets() {
    return new Promise((resolve) => {
        jasonSpriteImage = new Image();
        // IMPORTANT: Use the file name of your uploaded spritesheet
        jasonSpriteImage.src = 'jason-base-spritesheet.jpg'; 
        jasonSpriteImage.onload = () => {
            resolve();
        };
        jasonSpriteImage.onerror = () => {
            console.error("Failed to load Jason spritesheet. Check filename and path.");
            // Resolve anyway to allow game to start, but drawing will fail gracefully
            resolve(); 
        }
    });
}


// --- 4. Menu and Screen Functions (Called by index.html buttons) ---

/**
 * Hides all screens and shows the one specified by ID.
 * @param {string} id - The ID of the screen div to show.
 */
window.showScreen = function(id) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
    });
    const screenToShow = document.getElementById(id);
    if (screenToShow) {
        screenToShow.style.display = 'flex';
    }
}

/**
 * Starts the game, initializes the canvas, and begins the game loop.
 * @param {number} jasonId - The ID of the selected Jason model.
 */
window.startGame = async function(jasonId) {
    // 1. Ensure assets are loaded before game start
    await loadAssets();

    // 2. Update Game State
    jason.currentJasonId = jasonId;
    isGameRunning = true;
    
    // 3. Initialize Canvas
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    canvas.width = MAP_WIDTH;
    canvas.height = MAP_HEIGHT;
    
    // 4. Initialize Counselors
    // Creates 7 counselors in random locations outside the cabin
    counselors = createCounselors(7, MAP_WIDTH, MAP_HEIGHT);

    // 5. Show Game Screen
    window.showScreen('game-screen');
    
    // 6. Start the Game Loop
    gameLoop();
}

// --- 5. Core Game Logic (Update) ---

function update() {
    if (!isGameRunning) return;

    // 1. Handle Player Input and Movement (Delegated to Player Module)
    handlePlayerMovement(MAP_WIDTH, MAP_HEIGHT); 

    // 2. Handle AI movement
    counselors.forEach(counselor => {
        updateCounselor(counselor, MAP_WIDTH, MAP_HEIGHT);
    });

    // 3. Update UI
    updateUI();
}

// --- 6. Drawing and Rendering ---

function drawJason() {
    if (!jasonSpriteImage || !jasonSpriteImage.complete) return; 

    // Get the current frame coordinates from the player module
    const animation = JASON_ANIMATIONS[jason.direction];
    if (!animation) return; // Fallback check

    const frameData = animation[jason.currentFrame];
    const sx = frameData.sx; // Source X (on spritesheet)
    const sy = frameData.sy; // Source Y (on spritesheet)
    const sw = jason.frameWidth; // Source Width
    const sh = jason.frameHeight; // Source Height
    
    const dx = jason.x; // Destination X (on canvas)
    const dy = jason.y; // Destination Y (on canvas)
    const dw = jason.size; // Destination Width (scaled up for canvas)
    const dh = jason.size * (jason.frameHeight / jason.frameWidth); // Destination Height (scaled to maintain aspect ratio)

    // Draw the image frame
    ctx.drawImage(
        jasonSpriteImage,
        sx, sy, sw, sh,
        dx, dy, dw, dh
    );
}

function drawCounselors() {
    counselors.forEach(counselor => {
        if (counselor.isAlive) {
            // Simple drawn counselor shape
            ctx.fillStyle = '#4B8BFF'; // Blue shirt color
            ctx.fillRect(counselor.x, counselor.y, COUNSELOR_SIZE, COUNSELOR_SIZE);

            ctx.fillStyle = '#FFC300'; // Blonde/bright hair
            const headSize = COUNSELOR_SIZE / 2;
            ctx.fillRect(counselor.x + COUNSELOR_SIZE / 4, counselor.y, headSize, headSize);
        }
    });
}

function drawMap() {
    // Clear the canvas
    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
    
    // Draw the basic map background (Forest)
    ctx.fillStyle = '#2c4a2a'; // Moss/Forest background
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Draw Jason's Cabin (Starting area)
    const cabinW = 150;
    const cabinH = 150;
    const cabinX = (MAP_WIDTH / 2) - (cabinW / 2);
    const cabinY = (MAP_HEIGHT / 2) - (cabinH / 2);
    ctx.fillStyle = '#4a342a'; // Wood/Cabin color
    ctx.fillRect(cabinX, cabinY, cabinW, cabinH);
    
    // Cabin Text Overlay
    ctx.font = '16px "Press Start 2P"';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.textAlign = 'center';
    ctx.fillText("JASON'S CABIN", MAP_WIDTH / 2, MAP_HEIGHT / 2 + 5);
}

function draw() {
    drawMap();
    drawCounselors(); 
    drawJason(); 
}


// --- 7. UI Update Logic ---

function updateUI() {
    // Update Health Bar
    const healthPercent = (jason.health / jason.maxHealth) * 100;
    const healthFill = document.getElementById('health-bar-fill');
    if (healthFill) {
        healthFill.style.width = `${healthPercent}%`;
    }

    // Update Counselor Count
    const aliveCount = counselors.filter(c => c.isAlive).length;
    const counselorCountSpan = document.getElementById('counselor-count');
    if (counselorCountSpan) {
        counselorCountSpan.textContent = aliveCount; 
    }
    
    // Placeholder UI updates for the abilities (to be completed in the next step)
    document.getElementById('ability-dash').textContent = 'DASH (Q)';
    document.getElementById('ability-vision').textContent = 'VISION (V)';
    document.getElementById('ability-teleport').textContent = 'TELEPORT (E)';
    document.getElementById('ability-rage').textContent = 'RAGE (R)';
}


// --- 8. Main Game Loop ---

function gameLoop() {
    if (!isGameRunning) return; 

    update();
    draw();

    requestAnimationFrame(gameLoop); 
}


// --- 9. Initialization (Start at Menu) ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize input listeners from the player module
    initializePlayerInput();
    
    // 2. Ensure the main menu is visible when the page loads
    window.showScreen('main-menu');
    updateUI(); 
});