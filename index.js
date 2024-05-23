/* Global variables */

/* Arrow control variables */
let rotation = 0;
let arrowWidth;

/* Character position variables */
const xPos = 50;
const yPos = 0;

/* Ball position variables */
let xPosBall = xPos + 65;
let yPosBall = yPos + 140;
let xVel = 0;
let yVel = 0;

/* Hoop position variables*/
let xPosHoop = 300;
let yPosHoop = 700;
let hoopSize = 200;
let bumped = false;
let xVelHoop;
let yVelHoop;

/* throw control variables */
let force;
let isAiming = false;
let isThrowing = false;
let scoreReady = true;
let resetTimer = 0;
let score = 0;
let aimInterrupted=false;

/* Interval functions*/
let setRotation;
let setThrowPower;
let setMoveball;
let setCountDown;
let setBump;
let setColorHoop;
let toggleBackgroundMusic=false;
let toggleSoundEffects=false;
let setMoveHoop

/* Set Html element variables */
const character = document.getElementById('character');
const ball = document.getElementById('ball');
const arrowImage = document.getElementById('arrow-image');
const scoreBox = document.getElementById('score-box');
const hoop1 = document.getElementById('hoop1');
const hoop2 = document.getElementById('hoop2');
const clock = document.getElementById('clock');
const levelDisplay = document.getElementById('level');
const alertWindow = document.getElementById('alert-window');
const alertMessage = document.getElementById('alert');
const option1 = document.getElementById('alert-option1');
const option2 = document.getElementById('alert-option2');
const lines = document.getElementsByClassName('line');
const gameWindow = document.getElementById('game-window');
const settingsWindow=document.getElementById('settings-window');


/* level variables */
let levelTimer;
let levelTimerStart = 60;
let timeSetting=true;
let level = 1;
let changeScore = false;
let paused=false;
let stageReady=true;
const timeStep = 1;

const scaleX = 100 / 500;
const scaleY = 100 / 1000;

/* Sounds */
const sadBoop = new sound('assets/sounds/sad_boop.m4a');
const happyBoop = new sound('assets/sounds/happy_boop.m4a');
const tap = new sound('assets/sounds/tap.wav');
const button = new sound('assets/sounds/buttonclick.mp3');
const blip = new sound('assets/sounds/blip.mp3');
/* Header animation on page load */
for (let line of lines) {
    line.classList.add('line-animate');
    window.addEventListener('load', () => {
        line.style.width = "30%";
    });
}

/* load start screen */
startScreen();

/* Game functions */
/* Game alert windows */
function startScreen() {
    settingsWindow.style.display="none";
    stageReady=false;
    paused=false;
    score = 0;
    level = 1;
    levelTimer = levelTimerStart;
    clock.innerText = `${levelTimer}`;
    alertMessage.innerText = "WELCOME!";
    option1.innerHTML = "<strong>PLAY GAME</strong>"
    option2.innerHTML = "<strong>SETTINGS</strong>"
    arrowImage.style.display = "none";
    option1.addEventListener("click", () => button.play());
    option1.addEventListener("click", runGame);
    option2.addEventListener("click", () => button.play());
    option2.addEventListener("click", settings);
    alertWindow.style.display = "flex";
}

function gamerOverScreen() {
    stageReady=false;
    alertMessage.innerText = "GAME OVER...";
    option1.innerHTML = "<strong>PLAY AGAIN</strong>"
    option2.innerHTML = "<strong>QUIT</strong>"
    arrowImage.style.display = "none";
    option1.addEventListener("click", runGame);
    option2.addEventListener("click", startScreen);
    alertWindow.style.display = "flex";
}

function nextLevelScreen() {
    stageReady=false;
    alertMessage.innerText = `Level ${level} Complete`;
    option1.innerHTML = "<strong>PLAY NEXT</strong>"
    option2.innerHTML = "<strong>QUIT</strong>"
    arrowImage.style.display = "none";
    level = level + 1;
    levelTimer = levelTimerStart;
    score = 0;
    option1.addEventListener("click", runGame);
    option2.addEventListener("click", startScreen);
    alertWindow.style.display = "flex";
}

function pauseScreen(){
    alertMessage.innerText = `Game Paused`;
    option1.innerHTML = "<strong>CONTINUE</strong>"
    option2.innerHTML = "<strong>QUIT</strong>"
    arrowImage.style.display = "none";
    clearInterval(setCountDown);
    clearInterval(setMoveHoop);
    clearInterval(setMoveball);
    clearInterval(setThrowPower);
    clearInterval(setRotation);
    character.removeEventListener('touchstart', aimThrow);
    character.removeEventListener('mousedown', aimThrow);
    if(isAiming===true){
        isAiming=false;
        aimInterrupted=true;
    }
    force=0;
    arrowWidth=100;
    paused=true;
    option1.addEventListener("click", runGame);
    option2.addEventListener("click", startScreen);
    alertWindow.style.display = "flex";
}

/**
 * Main game function:
 * Sets arrow rotation interval, 
 * add event listeners for game mechanics
 */
function runGame() {
    /* clear event listeners from alert window buttons */
    option1.removeEventListener("click", runGame);
    option2.removeEventListener("click", settings);
    option2.removeEventListener("click", startScreen);
    /* hid alert window */
    alertWindow.style.display = "none";
    /* Postion ball at player and set arrow rotation interval*/
    if (paused==false) {
        resetBall();
        /* Start level timer */
        levelTimer = levelTimerStart;
        score = 0;
    }else{
        if(aimInterrupted==true){
            resetBall();
            aimInterrupted=false;
        }else if(isThrowing == true){
            setMoveball = setInterval(() => moveBall(timeStep), timeStep);
        }else{
            resetBall()}
    }
    
    setCountDown = setInterval(countDown, 1000)
    
    /* update infobar display */
    levelDisplay.innerText = level;
    scoreBox.innerText = `${score}/5`

    /* Increase the throw force while player is holding touch/mouse on character */
    character.addEventListener('touchstart', aimThrow);
    character.addEventListener('mousedown', aimThrow);

    /* Stop increasing throw force when player released touch/mouse and throw the ball
    or reset the ball if it is already thrown*/
    character.addEventListener('touchend', throwBall);
    character.addEventListener('mouseup', throwBall);
    stageReady=true;
    document.addEventListener('keydown', function (event) {
        if (event.key === "Escape" && stageReady) {
            pauseScreen();
        }
    })

    /* Set the hoop postion and velocity for current stage */
    if (paused==false){
        stageStart();
    }
    paused=false;
    /* Move the hoop */
    clearInterval(setMoveHoop);
    setMoveHoop = setInterval(moveHoop, 1);
}

/* Functions controlling the ball throw */

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

/* Function to reset the ball to be thrown again */
function resetBall() {
    let rotationRate = 20;
    clearInterval(setMoveball);
    clearInterval(setThrowPower);
    clearInterval(setRotation);
    force = 0;
    arrowWidth = 100;
    xPosBall = xPos - 10;
    yPosBall = yPos + 190;
    ball.style.left = `${xPosBall * scaleX}%`;
    ball.style.bottom = `${yPosBall * scaleY}%`;
    arrowImage.style.display = "inline";
    arrowImage.style.width = `${arrowWidth}%`;
    setRotation = setInterval(rotateArrow, rotationRate);
    resetTimer = 0;
    isThrowing = false;
    scoreReady = true;
    if (changeScore == true) {
        changeScore = false;
        stageStart();
    }
}

/**
 * Function to increase the arrow length and throw force while player is
 * holding the touch on the character
 */
function growArrow() {
    let growArrowIncrement = 30;
    arrowImage.style.width = `${arrowWidth * 5}%`;
    arrowWidth += growArrowIncrement;
    force = (arrowWidth - 100) * 34;
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

/* stop aiming and release throw when touch is released */
function throwBall() {
    /* Check that character is aiming and no instances of interval are running */
    if (isAiming && !isThrowing) {
        clearInterval(setThrowPower);
        arrowImage.style.display = "none";
        xVel = force * Math.cos(rotation * 2 * Math.PI / 360) * timeStep / 1000;
        yVel = force * Math.sin(-rotation * 2 * Math.PI / 360) * timeStep / 1000;
        isAiming = false;
        isThrowing = true;
        setMoveball = setInterval(() => moveBall(timeStep), timeStep);
    }
}

/* Functions controlling movement of game elements and scoring*/

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
        tap.play();
        yVel = -yVel;
        yPosBall = (1000 - ballSize);
    }
    if (yPosBall < 0) {
        if (yVel < -2) {
            tap.play();
        }
        yVel = -yVel / 2;
        xVel = xVel / 2;
        yPosBall = 0;
    }
    if (xPosBall > (500 - ballSize)) {
        tap.play();
        xVel = -xVel / 2;
        xPosBall = (500 - ballSize);
    }
    if (xPosBall < 0) {
        xVel = -xVel / 2;
        xPosBall = 0;
        tap.play();
    }

    /* Move the ball */
    xPosBall += (xVel);
    yPosBall += (yVel);
    /* Add gravity acceleratoin */
    gravity = 25;
    yVel -= gravity * timeStep / 1000;

    /* Apply new coordinates to Html Ball element*/
    ball.style.left = `${xPosBall * scaleX}%`;
    ball.style.bottom = `${yPosBall * scaleY}%`;

    /* reset the ball 5 seconds after it is thrown */
    if (resetTimer > ((1000 / (3 * timeStep)) * 5)) {
        resetBall();
    }

    /* score a point if ball passes through hoop from above */
    if ((xPosBall > (xPosHoop - xVel - 30) && xPosBall < (xPosHoop + hoopSize - xVel + 30)
        && yPosBall < (yPosHoop - yVel) && yPosBall >= (yPosHoop)) &&
        yVel < 0 && scoreReady == true) {
        if (xPosBall < ((xPosHoop - xVel) + 25) || xPosBall > ((xPosHoop + hoopSize - xVel) - 25)) {
            yVel = -yVel / 2;
        } else if(stageReady){
            score += 1;
            changeScore = true;
            scoreReady = false;
            scoreBox.innerText = `${score}/5`;
            colorHoop("brightness(200%)");
            happyBoop.play();
            setColorHoop = setInterval(colorHoop, 100, "brightness(100%)");
            if (score === 5) {
                completeLevel();
            }
        }
    }

    if ((xPosBall > (xPosHoop) && xPosBall < (xPosHoop + hoopSize)
        && yPosBall + ballSize > (yPosHoop - yVel) && yPosBall <= (yPosHoop)) &&
        yVel > 0 && !bumped) {
        yVel = -yVel;
        bumpHoop(10);
        sadBoop.play();
        setBump = setInterval(bumpHoop, 50, -10);
    }
}

function moveHoop() {
    /* Detect edges of game window */
    if (yPosHoop > (850)) {
        yVelHoop = -yVelHoop;
        yPosHoop = (850);
    }
    if (yPosHoop < 350) {
        yVelHoop = -yVelHoop;
        yPosHoop = 350;
    }

    if (xPosHoop > (500 - hoopSize)) {
        xVelHoop = -xVelHoop;
        xPosHoop = (500 - hoopSize);
    }
    if (xPosHoop < 0) {
        xVelHoop = -xVelHoop;
        xPosHoop = 0;
    }

    /* Move the Hoop */
    xPosHoop += (xVelHoop);
    yPosHoop += (yVelHoop);

    /* Apply new coordinates to Html Ball element*/
    hoop1.style.left = `${xPosHoop * scaleX}%`;
    hoop1.style.bottom = `${yPosHoop * scaleY}%`;
    hoop2.style.left = `${xPosHoop * scaleX}%`;
    hoop2.style.bottom = `${yPosHoop * scaleY}%`;
}

function colorHoop(brightness) {
    hoop1.style.filter = brightness;
    hoop2.style.filter = brightness;
    clearInterval(setColorHoop);
}

function bumpHoop(bump) {
    yPosHoop += bump;
    hoop1.style.bottom = `${yPosHoop * scaleY}%`;
    hoop2.style.bottom = `${yPosHoop * scaleY}%`;
    clearInterval(setBump);
}

/* Level control functions */

/* Run the level countdown timer */
function countDown() {
    if (levelTimer<10) {
        blip.play();
    }else{
        levelDisplay.style.borderColor="black";
    }
    levelTimer = levelTimer - 1;
    clock.innerText = `${levelTimer}`;
    if (levelTimer < 1) {
        clearInterval(setCountDown);
        gameOver();
    }
}

function completeLevel() {
    clearInterval(setCountDown);
    nextLevelScreen();
}

function gameOver() {
    clearInterval(setRotation);
    clearInterval(setCountDown);
    gamerOverScreen();
    levelTimer = levelTimerStart;
    score = 0;
    level = 1;
    scoreBox.innerText = `${score}/5`;
}

/** settings function */

function settings(){
    settingsWindow.style.display="flex";
    alertWindow.style.display="none";
    const confirmButton=document.getElementById('confirm-settings');
    confirmButton.addEventListener("click", () => button.play());
    confirmButton.addEventListener('click', confirmSettings);
}

function confirmSettings() {
    toggleBackgroundMusic=document.getElementById("background-music").checked;
    toggleSoundEffects=document.getElementById("sound-effects").checked;
    timeSettingDropdown=document.getElementById('timer-setting').value; 
    if (timeSettingDropdown=="none"){
        timeSetting=false;
        levelTimerStart="-";
    }else{
        timeSetting=true;
        levelTimerStart=timeSettingDropdown;
    }
    startScreen();
    console.log('clicked')
}

/**
 * Function to set the hoop position and velocity for each stage and level
 */
function stageStart() {
    switch (level) {
        case 1:
            xVelHoop = 0;
            yVelHoop = 0;
            switch (score) {
                case 0:
                    xPosHoop = 300;
                    yPosHoop = 350;
                    break;
                case 1:
                    xPosHoop = 300;
                    yPosHoop = 700;
                    break;
                case 2:
                    xPosHoop = 0;
                    yPosHoop = 700;
                    break;
                case 3:
                    xPosHoop = 0;
                    yPosHoop = 350;
                    break;
                case 4:
                    xPosHoop = 150;
                    yPosHoop = 700;
                    break;
            }
            break;
        case 2:
            switch (score) {
                case 0:
                    xVelHoop = -1;
                    yVelHoop = 0;
                    xPosHoop = 300;
                    yPosHoop = 350;
                    break;
                case 1:
                    xVelHoop = -1;
                    yVelHoop = 0;
                    xPosHoop = 300;
                    yPosHoop = 700;
                    break;
                case 2:
                    xVelHoop = 0;
                    yVelHoop = 1;
                    xPosHoop = 300;
                    yPosHoop = 350;
                    break;
                case 3:
                    xVelHoop = 0;
                    yVelHoop = 1;
                    xPosHoop = 0;
                    yPosHoop = 350;
                    break;
                case 4:
                    xVelHoop = -1;
                    yVelHoop = 1;
                    xPosHoop = 300;
                    yPosHoop = 350;
                    break;
            }
            break;
        case 3:
            switch (score) {
                case 0:
                    xVelHoop = -3;
                    yVelHoop = 0;
                    xPosHoop = 300;
                    yPosHoop = 350;
                    break;
                case 1:
                    xVelHoop = -3;
                    yVelHoop = 0;
                    xPosHoop = 300;
                    yPosHoop = 700;
                    break;
                case 2:
                    xVelHoop = 0;
                    yVelHoop = 3;
                    xPosHoop = 300;
                    yPosHoop = 350;
                    break;
                case 3:
                    xVelHoop = 0;
                    yVelHoop = 3;
                    xPosHoop = 0;
                    yPosHoop = 350;
                    break;
                case 4:
                    xVelHoop = -3;
                    yVelHoop = 3;
                    xPosHoop = 300;
                    yPosHoop = 350;
                    break;
            }
            break;
        case 4:
            switch (score) {
                case 0:
                    xVelHoop = -6;
                    yVelHoop = 0;
                    xPosHoop = 300;
                    yPosHoop = 350;
                    break;
                case 1:
                    xVelHoop = -6;
                    yVelHoop = 0;
                    xPosHoop = 300;
                    yPosHoop = 700;
                    break;
                case 2:
                    xVelHoop = 0;
                    yVelHoop = 6;
                    xPosHoop = 300;
                    yPosHoop = 350;
                    break;
                case 3:
                    xVelHoop = 0;
                    yVelHoop = 3;
                    xPosHoop = 0;
                    yPosHoop = 350;
                    break;
                case 4:
                    xVelHoop = -6;
                    yVelHoop = 6;
                    xPosHoop = 300;
                    yPosHoop = 350;
                    break;
            }
            break;
        case 5:
            switch (score) {
                case 0:
                    xVelHoop = 0;
                    yVelHoop = 0;
                    xPosHoop = 300;
                    yPosHoop = 850;
                    break;
                case 1:
                    xVelHoop = 0;
                    yVelHoop = 0;
                    xPosHoop = 0;
                    yPosHoop = 850;
                    break;
                case 2:
                    xVelHoop = 0;
                    yVelHoop = 0;
                    xPosHoop = 150;
                    yPosHoop = 850;
                    break;
                case 3:
                    xVelHoop = -1;
                    yVelHoop = 0;
                    xPosHoop = 300;
                    yPosHoop = 850;
                    break;
                case 4:
                    xVelHoop = -6;
                    yVelHoop = 0;
                    xPosHoop = 300;
                    yPosHoop = 850;
                    break;
            }
            break;
        case 6:
            winGame();
            break;
    }
    hoop1.style.left = `${xPosHoop * scaleX}%`
    hoop1.style.bottom = `${yPosHoop * scaleY}%`
    hoop2.style.left = `${xPosHoop * scaleX}%`
    hoop2.style.bottom = `${yPosHoop * scaleY}%`
}

function winGame() {
    alert('Congratulations, you won!')
    score = 0;
    level = 0;
    startScreen();
}

/** Function to play game sounds
 * taken from W3 schools tutorials
 */
function sound(src) {
    this.sound = document.createElement("audio");
    this.sound.src = src;
    this.sound.setAttribute("preload", "auto");
    this.sound.setAttribute("controls", "none");
    this.sound.style.display = "none";
    document.body.appendChild(this.sound);
    this.play = function () {
        this.sound.play();
    }
    this.stop = function () {
        this.sound.pause();
    }
}