// --- Player Module (Jason) ---

// --- 1. Global Player State and Input ---
const MAP_WIDTH = 800; // Hardcoding dimensions for initial export definitions
const MAP_HEIGHT = 800;

// Defines the main player character (Jason)
export const jason = {
    x: MAP_WIDTH / 2, // Start in the center of the cabin map
    y: MAP_HEIGHT / 2,
    size: 64, // NOTE: Changed from 32 to 64 for visual size on canvas
    frameWidth: 32, // The width of a single sprite frame in the sheet
    frameHeight: 64, // The height of a single sprite frame in the sheet
    baseSpeed: 3,
    currentSpeed: 3,
    health: 100,
    maxHealth: 100,
    currentJasonId: 1,
    direction: 'down', // Tracks the direction Jason is facing for drawing
    isMoving: false,
    // Animation state
    currentFrame: 0, 
    frameTimer: 0,
    frameDelay: 8, // How many game loops before switching frame (lower = faster animation)
    
    // Ability state (Initialized for the next step)
    isVisionActive: false,
    isRageActive: false,
    abilities: {
        dash: { cooldown: 180, cooldownTimer: 0, duration: 30 }, // 3 seconds cooldown
        vision: { cooldown: 480, cooldownTimer: 0, duration: 180 }, // 8 seconds cooldown
        teleport: { cooldown: 600, cooldownTimer: 0, duration: 0 }, // 10 seconds cooldown
        rage: { cooldown: 1800, cooldownTimer: 0, duration: 300 } // 30 seconds cooldown
    }
};

// Tracks key presses for smooth movement
export const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    w: false,
    s: false,
    a: false,
    d: false,
    q: false, // Dash
    v: false, // Vision
    e: false, // Teleport
    r: false  // Rage
};

// --- SPRITESHEET DATA ---
// Coordinates are based on a 32x64 frame size
const FRAME_SIZE = 32;
const ROW_SIZE = 64;

export const JASON_ANIMATIONS = {
    // Row 0: Walk Down
    'down': [
        { sx: 0 * FRAME_SIZE, sy: 0 * ROW_SIZE }, // Frame 1 (Standing/Down)
        { sx: 1 * FRAME_SIZE, sy: 0 * ROW_SIZE } // Frame 2
    ],
    // Row 1: Walk Left (Based on sheet appearance)
    'left': [
        { sx: 0 * FRAME_SIZE, sy: 1 * ROW_SIZE },
        { sx: 1 * FRAME_SIZE, sy: 1 * ROW_SIZE }
    ],
    // Row 2: Walk Right (Based on sheet appearance)
    'right': [
        { sx: 0 * FRAME_SIZE, sy: 2 * ROW_SIZE },
        { sx: 1 * FRAME_SIZE, sy: 2 * ROW_SIZE }
    ],
    // Row 3: Walk Up
    'up': [
        { sx: 0 * FRAME_SIZE, sy: 3 * ROW_SIZE },
        { sx: 1 * FRAME_SIZE, sy: 3 * ROW_SIZE }
    ]
};

// --- 2. Input Handling ---

/**
 * Handles key down events and updates the global 'keys' state.
 * @param {Event} event - The keyboard event.
 */
export function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    
    // Prevent default browser behavior for movement keys (like scrolling)
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 's', 'a', 'd'].includes(key)) {
        event.preventDefault();
    }
    
    if (keys.hasOwnProperty(key)) {
        keys[key] = true;
    }
}

/**
 * Handles key up events and updates the global 'keys' state.
 * @param {Event} event - The keyboard event.
 */
export function handleKeyUp(event) {
    const key = event.key.toLowerCase();
    if (keys.hasOwnProperty(key)) {
        keys[key] = false;
    }
}

/**
 * Attaches the keyboard listeners to the document.
 */
export function initializePlayerInput() {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
}


// --- 3. Player Movement Logic ---

/**
 * Handles all player movement based on keyboard input, and updates animation state.
 * @param {number} mapWidth - Width of the game map.
 * @param {number} mapHeight - Height of the game map.
 */
export function handlePlayerMovement(mapWidth, mapHeight) {
    let moved = false;
    let dx = 0;
    let dy = 0;

    // Check for combined keyboard inputs (WASD or Arrows)
    if (keys.ArrowUp || keys.w) {
        dy -= jason.currentSpeed;
        jason.direction = 'up';
        moved = true;
    }
    if (keys.ArrowDown || keys.s) {
        dy += jason.currentSpeed;
        jason.direction = 'down';
        moved = true;
    }
    if (keys.ArrowLeft || keys.a) {
        dx -= jason.currentSpeed;
        jason.direction = 'left';
        moved = true;
    }
    if (keys.ArrowRight || keys.d) {
        dx += jason.currentSpeed;
        jason.direction = 'right';
        moved = true;
    }

    // Diagonal movement normalization 
    if (dx !== 0 && dy !== 0) {
        const diagonalFactor = 1 / Math.sqrt(2);
        dx *= diagonalFactor;
        dy *= diagonalFactor;
    }

    // Apply movement
    jason.x += dx;
    jason.y += dy;
    jason.isMoving = moved;
    
    // Keep Jason within the map bounds (simple boundary check)
    jason.x = Math.max(0, Math.min(mapWidth - jason.size, jason.x));
    jason.y = Math.max(0, Math.min(mapHeight - jason.size, jason.y));


    // --- Animation Update Logic ---
    if (jason.isMoving) {
        jason.frameTimer++;
        if (jason.frameTimer >= jason.frameDelay) {
            // Cycle between Frame 0 and Frame 1
            jason.currentFrame = (jason.currentFrame + 1) % JASON_ANIMATIONS[jason.direction].length;
            jason.frameTimer = 0;
        }
    } else {
        // If not moving, show the standing frame (Frame 0)
        jason.currentFrame = 0;
        jason.frameTimer = 0;
    }
}