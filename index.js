/* Global variables */

/* Arrow control variables */
let rotation = 0;
let arrowWidth;

/* Character position variables */
let xPos = 50;
let yPos = 0;

/* Ball position variables */
let xPosBall = xPos + 65;
let yPosBall = yPos + 140;
let xVel = 0;
let yVel = 0;

/* Hoop position variables*/
let xPosHoop = 400;
let yPosHoop = 700;
let hoopSize = 100;

/* throw control variables */
let force;
let isAiming = false;
let isThrowing = false;
let scoreReady = true;
let resetTimer = 0;
let score = 0;

/* Interval variables */
let setRotation;
let setThrowPower;
let setMoveball;

/* Set Html element variables */
const character = document.getElementById('character');
const ball = document.getElementById('ball');
const arrowImage = document.getElementById('arrow-image');
const scoreBox = document.getElementById('score-box');
const hoop = document.getElementById('hoop');

let scaleX=100/500;
let scaleY=100/1000;

runGame();

/**
 * Main game function:
 * Sets arrow rotation interval, 
 * add event listeners for game mechanics
 */
function runGame() {
    /* Postion ball at player and set arrow rotation interval*/
    resetBall();
    /* Increase the throw force while player is holding touch/mouse on character */
    character.addEventListener('touchstart', aimThrow);
    character.addEventListener('mousedown', aimThrow);

    /* Stop increasing throw force when player released touch/mouse and throw the ball
    or reset the ball if it is already thrown*/
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
        const timeStep = 1;
        xVel = force * Math.cos(rotation * 2 * Math.PI / 360) * timeStep/1000;
        yVel = force * Math.sin(-rotation * 2 * Math.PI / 360) * timeStep/1000;
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
    const ballSize = 40;
    /* Detect edges of game window */
    if (yPosBall > (1000 - ballSize)) {
        yVel = -yVel;
        yPosBall = (1000 - ballSize);
    }
    if (yPosBall < 0) {
        yVel = -yVel / 2;
        xVel = xVel / 2;
        yPosBall = 0;
    }
    if (xPosBall > (500 - ballSize)) {
        xVel = -xVel / 2;
        xPosBall = (500 - ballSize);
    }
    if (xPosBall < 0) {
        xVel = -xVel / 2;
        xPosBall = 0;
    }

    /* Move the ball */
    xPosBall += (xVel);
    yPosBall += (yVel);
    /* Add gravity acceleratoin */
    gravity=25;
    yVel -= gravity* timeStep/1000;

    /* Apply new coordinates to Html Ball element*/
    ball.style.left = `${xPosBall*scaleX}%`;
    ball.style.bottom = `${yPosBall*scaleY}%`;

    /* reset the ball 5 seconds after it is thrown */
    if (resetTimer > ((1000 / (3*timeStep)) * 5)) {
        resetBall();
    }

    /* score a point if ball passes through hoop from above */
    if ((xPosBall > (xPosHoop - hoopSize)  && xPosBall < (xPosHoop + hoopSize)
        && yPosBall -ballSize < (yPosHoop - yVel) && yPosBall >= (yPosHoop) ) &&
        yVel < 0 && scoreReady == true) {
            if(xPosBall <((xPosHoop - hoopSize)+20) || xPosBall >((xPosHoop + hoopSize)-20)){
                yVel=-yVel/2;
            }else{
                score += 1;
                scoreReady = false;
                scoreBox.innerText = `${score}/5`;
                hoop.style.backgroundColor = "red";
            }
    }
}

/* Function to reset the ball to be thrown again */
function resetBall() {
    let rotationRate=20;
    clearInterval(setMoveball);
    clearInterval(setThrowPower);
    force = 0;
    arrowWidth = 100;
    xPosBall = xPos-10;/*65*/
    yPosBall = yPos + 190; /*140*/
    ball.style.left = `${xPosBall*scaleX}%`;
    ball.style.bottom = `${yPosBall*scaleY}%`;
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
    let growArrowIncrement = 30;
    arrowImage.style.width = `${arrowWidth * 5}%`;
    arrowWidth += growArrowIncrement;
    force = (arrowWidth - 100)*34;
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