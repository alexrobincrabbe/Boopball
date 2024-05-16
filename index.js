let scaleX
let scaleY
scaleGameWindow();
/* Arrow control variables */
let rotation = 0;
let rotationRate = 20;
let arrowWidth = 50 * scaleX;
/* Character position variables */
let xPos = 50 * scaleX;
let yPos = 0 * scaleY;
/* Ball position variables */
let xPosBall = xPos + (65 * scaleX);
let yPosBall = yPos + (140 * scaleY);
let xVel = 0 / scaleX;
let yVel = 0 / scaleY;
/* Hoop position variables*/
let xPosHoop = 400;
let yPosHoop = 700;
let hoopSize = 100;
/* throw control variables */
let force = arrowWidth;
let isAiming = false;
let isThrowing = false;
let scoreReady = true;
let resetTimer = 0;
let score = 0;


/* Set Html element variables */
const character = document.getElementById('character');
const ball = document.getElementById('ball');
const arrowImage = document.getElementById('arrow-image');
const scoreBox = document.getElementById('score-box');
const hoop = document.getElementById('hoop');
/* Interval variables */
let setRotation;
let setThrowPower;
let setMoveball;
runGame();

/**
 * Main game function:
 * Sets arrow rotation interval, 
 * add event listeners for game mechanics
 */
function runGame() {
    /* Rotate the arrow around the ball */
    setRotation = setInterval(rotateArrow, rotationRate);

    /* Increase the throw force while player is holding touch/mouse on character */
    character.addEventListener('touchstart', aimThrow);
    character.addEventListener('mousedown', aimThrow);

    /* Stop increasing throw force when player released touch/mouse */
    character.addEventListener('touchend', throwBall);
    character.addEventListener('mouseup', throwBall);
}

/* Increase the throw force until touch/mouse is released */
function aimThrow(event) {
    /* Prevent touch from also triggering mouse event */
    event.preventDefault();

    /* Check that no instances of intervals are already running */
    if (!isAiming && !isThrowing) {
        clearInterval(setRotation);
        setThrowPower = setInterval(growArrow, 20);
        isAiming = true;
    } else if (isThrowing) {
        resetBall();
    }
}

/* stop aiming and release throw when touch is released */
function throwBall() {
    /* Check that character is aiming and no instances of interval are running */
    if (isAiming && !isThrowing) {
        clearInterval(setThrowPower);        
        arrowImage.style.display = "none";
        const timeStep = 5;
        xVel = force * Math.cos(rotation * 2 * Math.PI / 360) * timeStep / 20;
        yVel = force * Math.sin(-rotation * 2 * Math.PI / 360) * timeStep / 20;
        isAiming = false;
        isThrowing = true;
        setMoveball = setInterval(() => moveBall(timeStep), timeStep);
    }
}

/**
 * Function to move the ball
 * ,detect edges of game window
 * ,apply gravity
 * ,score when the ball passes through the hoop
 */
function moveBall(timeStep) {
    resetTimer += 1;
    const ballSize = 5;
    /* Detect edges of game window */
    if (yPosBall > (1000 - ballSize) * scaleY) {
        yVel = -yVel;
        yPosBall = (1000 - ballSize) * scaleY;
    }
    if (yPosBall < 0) {
        yVel = -yVel / 2;
        xVel = xVel / 2;
        yPosBall = 0;
    }
    if (xPosBall > (500 - ballSize) * scaleX) {
        xVel = -xVel / 2;
        xPosBall = (500 - ballSize) * scaleX;
    }
    if (xPosBall < 0) {
        xVel = -xVel / 2;
        xPosBall = 0;
    }

    /* Move the ball */
    xPosBall += xVel * 0.2 / timeStep;
    yPosBall += yVel * 0.2 / timeStep;
    /* Add gravity acceleratoin */
    yVel -= 30 * timeStep / 200;

    /* Apply new coordinates to Html Ball element*/
    ball.style.left = `${xPosBall}px`;
    ball.style.bottom = `${yPosBall}px`;

    /* reset the ball 5 seconds after it is thrown */
    if (resetTimer > ((1000 / timeStep) * 5)) {
        resetBall();
    }

    /* score a point if ball passes through hoop from above */
    if ((xPosBall > (xPosHoop - hoopSize) * scaleX && xPosBall < (xPosHoop + hoopSize) * scaleX
        && yPosBall < (yPosHoop + 20) * scaleY && yPosBall >= (yPosHoop) * scaleY) &&
        yVel < 0 && scoreReady == true) {
        score += 1;
        scoreReady = false;
        scoreBox.innerText = `Score : ${score}`;
        hoop.style.backgroundColor = "red";
    }
}

/* Function to reset the ball to be thrown again */
function resetBall() {
    clearInterval(setMoveball);
    clearInterval(setThrowPower);
    force = 0;
    arrowWidth = 100;
    xPosBall = xPos + (65 * scaleX);
    yPosBall = yPos + (140 * scaleY);
    ball.style.left = `${xPosBall}px`;
    ball.style.bottom = `${yPosBall}px`;
    arrowImage.style.display = "inline";
    arrowImage.style.width = `${arrowWidth}%`;
    setRotation = setInterval(rotateArrow, rotationRate);
    resetTimer = 0;
    isThrowing = false;
    scoreReady = true;
}

/**
 * Function to increase the arrow length and throw force while player is
 * holding the touch on the character
 */
function growArrow() {
    let growArrowIncrement = 30 * scaleX;
    arrowImage.style.width = `${arrowWidth * 5}%`;
    arrowWidth += growArrowIncrement;
    force = (arrowWidth * 2) - 100;
}

/* Function to rotate the arrow by rotation increment */
function rotateArrow() {
    let rotationIncrement = 10;
    rotation += rotationIncrement;
    /* restrict angle to range 0-360 degrees for debugging purposes */
    if (rotation === 360) {
        rotation = 0;
    }
    arrowImage.style.transform = `rotate(${rotation}deg)`;
}

/**
 * Responsivity function: Get actual size of game window in pixels, so game coordinates
and element sizes (in pixels) can be scaled correctly
 */
function scaleGameWindow() {
    /* Get height, width, and border width in pixels */
   let Game_window_height = document.getElementById('game-window').offsetHeight;
   let Game_window_width = document.getElementById('game-window').offsetWidth;
   let Game_window_border = getComputedStyle(document.getElementById('game-window')).borderWidth;
   /* Remove "px" and convert to number so Game_window_border can be used to calculate */
   Game_window_border = Number(Game_window_border.substring(0, (Game_window_border.length - 2)));
   /* Game window scale factors: bottom left of Game window is (0,0), top right is(500,1000) */
   scaleX = (Game_window_width - (2 * Game_window_border)) / 500;
   scaleY = (Game_window_height - (2 * Game_window_border)) / 1000;
   }