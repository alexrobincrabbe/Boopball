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
let aimInterrupted = false;

/* Interval functions*/
let setRotation;
let setThrowPower;
let setMoveball;
let setCountDown;
let setBump;
let setColorHoop;
let soundEffects = false;
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
const settingsWindow = document.getElementById('settings-window');


/* level variables */
let levelTimer;
let levelTimerStart = 60;
let timeSetting = true;
let level = 1;
let changeScore = false;
let paused = false;
let stageReady = true;
const timeStep = 1;

/* Scale the game window cordinates: Window is 500x1000px */
const scaleX = 100 / 500;
const scaleY = 100 / 1000;

/* Sounds */
/* Sound effects */
const sadBoop = new sound('assets/sounds/sad_boop.m4a');
const happyBoop = new sound('assets/sounds/happy_boop.m4a');
const tap = new sound('assets/sounds/tap.wav');
const button = new sound('assets/sounds/buttonclick.mp3');
const blip = new sound('assets/sounds/blip.mp3');
const disappointed = new sound('assets/sounds/gameover.mp3');


/* Background Music */
const BackgroundMusic = document.createElement('audio');
BackgroundMusic.setAttribute('src', 'assets/sounds/backgroundmusic.mp3');
BackgroundMusic.loop = true;
let toggleBackgroundMusic = false;

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
    settingsWindow.style.display = "none"; //ensure the settings window is hidden
    /* Game variables initialization */
    stageReady = false;
    paused = false;
    score = 0;
    level = 1;
    levelTimer = levelTimerStart;
    clock.innerText = `${levelTimer}`;
    /* Update alert window content */
    alertMessage.innerText = "WELCOME!";
    option1.innerHTML = "<strong>PLAY GAME</strong>"
    option2.innerHTML = "<strong>SETTINGS</strong>"
    arrowImage.style.display = "none";
    option1.addEventListener("click", () => button.play());
    option1.addEventListener("click", runGame);
    option2.addEventListener("click", () => button.play());
    option2.addEventListener("click", settings);
    alertWindow.style.display = "flex"; // show the alert window
    /* start the background music if it is turned on  */
    if (toggleBackgroundMusic == true) {
        BackgroundMusic.play();
    } else {
        BackgroundMusic.pause();
    }
}

function gamerOverScreen() {
    stageReady = false; // stop scoring after game is over
    /* update alert window content */
    alertMessage.innerText = "GAME OVER...";
    option1.innerHTML = "<strong>PLAY AGAIN</strong>"
    option2.innerHTML = "<strong>QUIT</strong>"
    arrowImage.style.display = "none";
    option1.addEventListener("click", runGame);
    option2.addEventListener("click", startScreen);
    alertWindow.style.display = "flex"; // show alert window
}

function nextLevelScreen() {
    stageReady = false; // stop scoring before next nevel starts
    /* Update alert window content */
    alertMessage.innerText = `Level ${level} Complete`;
    option1.innerHTML = "<strong>PLAY NEXT</strong>"
    option2.innerHTML = "<strong>QUIT</strong>"
    option1.addEventListener("click", runGame);
    option2.addEventListener("click", startScreen);
    arrowImage.style.display = "none";
    level = level + 1;
    levelTimer = levelTimerStart;
    score = 0;
    alertWindow.style.display = "flex"; //show the alert window
}

function pauseScreen() {
    /* Update alert window content */
    alertMessage.innerText = `Game Paused`;
    option1.innerHTML = "<strong>CONTINUE</strong>"
    option2.innerHTML = "<strong>QUIT</strong>"
    option1.addEventListener("click", runGame);
    option2.addEventListener("click", startScreen);
    /* pause the game */
    arrowImage.style.display = "none";
    clearInterval(setCountDown);
    clearInterval(setMoveHoop);
    clearInterval(setMoveball);
    clearInterval(setThrowPower);
    clearInterval(setRotation);
    character.removeEventListener('touchstart', aimThrow);
    character.removeEventListener('mousedown', aimThrow);
    alertWindow.style.display = "flex";
    /* Fixes bug, in case the game is paused while the player is aiming */
    if (isAiming === true) {
        isAiming = false;
        aimInterrupted = true;
    }
    force = 0;
    arrowWidth = 100;
    paused = true;
}

/**
 * Main game function:
 * Sets arrow rotation interval, 
 * add event listeners for game mechanics
 */
function runGame() {
    /* Clear any event listeners from alert window buttons */
    option1.removeEventListener("click", runGame);
    option2.removeEventListener("click", settings);
    option2.removeEventListener("click", startScreen);
    /* Hide alert window */
    alertWindow.style.display = "none";
    /* Postion ball at player and set arrow rotation interval */
    if (paused == false) {
        resetBall();
        /* Start level timer */
        levelTimer = levelTimerStart;
        score = 0;
    } else {
        if (aimInterrupted == true) {
            resetBall();
            aimInterrupted = false;
        } else if (isThrowing == true) {
            setMoveball = setInterval(() => moveBall(timeStep), timeStep);
        } else {
            resetBall()
        }
    }
    /* start the level timer */
    if(timeSetting){
        setCountDown = setInterval(countDown, 1000)
    }
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
    stageReady = true; // allow scoring
    /* pause the game when escape key is pressed */
    document.addEventListener('keydown', function (event) {
        if (event.key === "Escape" && stageReady) {
            pauseScreen();
        }
    })

    /* Set the hoop postion and velocity for current stage 
    unless runGame was called after the game was paused*/
    if (paused == false) {
        stageStart();
    }
    paused = false;
    /* Move the hoop */
    clearInterval(setMoveHoop);
    setMoveHoop = setInterval(moveHoop, 1);
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

/* Function to reset the ball to be thrown again */
function resetBall() {
    let rotationRate = 20;
    /* make sure all intervals are cleared before setting new ones */
    clearInterval(setMoveball);
    clearInterval(setThrowPower);
    clearInterval(setRotation);
    /* initialize variables */
    force = 0;
    arrowWidth = 100;
    xPosBall = xPos - 10;
    yPosBall = yPos + 190;
    /* update html elements */
    ball.style.left = `${xPosBall * scaleX}%`;
    ball.style.bottom = `${yPosBall * scaleY}%`;
    arrowImage.style.display = "inline";
    arrowImage.style.width = `${arrowWidth}%`;
    /* Rotate the arrow */
    setRotation = setInterval(rotateArrow, rotationRate);
    resetTimer = 0;
    isThrowing = false;
    scoreReady = true;
    /* if the player has scored, start the next stage when the ball resets */
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
        if (soundEffects) {
            tap.play();
        }
        yVel = -yVel;
        yPosBall = (1000 - ballSize);
    }
    if (yPosBall < 0) {
        if (yVel < -2) {
            if (soundEffects) {
                tap.play();
            }
        }
        yVel = -yVel / 2;
        xVel = xVel / 2;
        yPosBall = 0;
    }
    if (xPosBall > (500 - ballSize)) {
        if (soundEffects) {
            tap.play();
        }
        xVel = -xVel / 2;
        xPosBall = (500 - ballSize);
    }
    if (xPosBall < 0) {
        if (soundEffects) {
            tap.play();
        }
        xVel = -xVel / 2;
        xPosBall = 0;
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
        /* If the ball hits the edge of the hoop, it bounces off */
        if (xPosBall < ((xPosHoop - xVel) + 25) || xPosBall > ((xPosHoop + hoopSize - xVel) - 25)) {
            yVel = -yVel / 2;
        } else if (stageReady) {
            score += 1;
            changeScore = true;
            scoreReady = false; //only score once on each throw
            scoreBox.innerText = `${score}/5`;
            /* Highlight the hoop */
            colorHoop("brightness(200%)");
            setColorHoop = setInterval(colorHoop, 100, "brightness(100%)");
            if (soundEffects) {
                happyBoop.play();
            }
            if (score === 5 && level < 5) {
                completeLevel();
            } else if (score === 5 && level == 5) {
                winGame();
            }
        }
    }
    /* Hit the bottom of the hoop */
    if ((xPosBall > (xPosHoop) && xPosBall < (xPosHoop + hoopSize)
        && yPosBall + ballSize > (yPosHoop - yVel) && yPosBall <= (yPosHoop)) &&
        yVel > 0 && !bumped) {
        yVel = -yVel;
        bumpHoop(10);
        if (soundEffects) {
            sadBoop.play();
        }
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
    if (levelTimer < 10) {
        if (soundEffects) {
            blip.play();
        }
    } else {
        levelDisplay.style.borderColor = "black";
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
    if(soundEffects){
    disappointed.play();
    }
    clearInterval(setRotation);
    clearInterval(setCountDown);
    gamerOverScreen();
    levelTimer = levelTimerStart;
    score = 0;
    level = 1;
    scoreBox.innerText = `${score}/5`;
}

/** settings function */

function settings() {
    settingsWindow.style.display = "flex";
    alertWindow.style.display = "none";
    const confirmButton = document.getElementById('confirm-settings');
    confirmButton.addEventListener("click", () => button.play());
    confirmButton.addEventListener('click', confirmSettings);
}

function confirmSettings() {
    toggleBackgroundMusic = document.getElementById("background-music").checked;
    soundEffects = document.getElementById("sound-effects").checked;
    timeSettingDropdown = document.getElementById('timer-setting').value;
    if (timeSettingDropdown == "none") {
        timeSetting = false;
        levelTimerStart = "-";
    } else {
        timeSetting = true;
        levelTimerStart = timeSettingDropdown;
    }
    startScreen();
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
    }
    hoop1.style.left = `${xPosHoop * scaleX}%`
    hoop1.style.bottom = `${yPosHoop * scaleY}%`
    hoop2.style.left = `${xPosHoop * scaleX}%`
    hoop2.style.bottom = `${yPosHoop * scaleY}%`
}

function winGame() {
    confettiAnimation();
    winGameScreen()
    score = 0;
    level = 0;
    /*location.reload();*/
}

function winGameScreen() {
    stageReady = false;
    alertMessage.innerText = "CONGRATULATIONS!!!";
    option2.innerHTML = "<strong>OK</strong>"
    arrowImage.style.display = "none";
    option1.style.display = "none";
    option2.addEventListener("click", reloadGame);
    alertWindow.style.display = "flex";
    clearInterval(setCountDown);
}
function reloadGame() {
    location.reload();
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

/**
 * confetti animation
 * Code taken from https://codepen.io/bananascript/pen/EyZeWm
 */

function confettiAnimation() {
    // Globals
    var random = Math.random
        , cos = Math.cos
        , sin = Math.sin
        , PI = Math.PI
        , PI2 = PI * 2
        , timer = undefined
        , frame = undefined
        , confetti = [];

    var particles = 10
        , spread = 40
        , sizeMin = 3
        , sizeMax = 12 - sizeMin
        , eccentricity = 10
        , deviation = 100
        , dxThetaMin = -.1
        , dxThetaMax = -dxThetaMin - dxThetaMin
        , dyMin = .13
        , dyMax = .18
        , dThetaMin = .4
        , dThetaMax = .7 - dThetaMin;

    var colorThemes = [
        function () {
            return color(200 * random() | 0, 200 * random() | 0, 200 * random() | 0);
        }, function () {
            var black = 200 * random() | 0; return color(200, black, black);
        }, function () {
            var black = 200 * random() | 0; return color(black, 200, black);
        }, function () {
            var black = 200 * random() | 0; return color(black, black, 200);
        }, function () {
            return color(200, 100, 200 * random() | 0);
        }, function () {
            return color(200 * random() | 0, 200, 200);
        }, function () {
            var black = 256 * random() | 0; return color(black, black, black);
        }, function () {
            return colorThemes[random() < .5 ? 1 : 2]();
        }, function () {
            return colorThemes[random() < .5 ? 3 : 5]();
        }, function () {
            return colorThemes[random() < .5 ? 2 : 4]();
        }
    ];
    function color(r, g, b) {
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    // Cosine interpolation
    function interpolation(a, b, t) {
        return (1 - cos(PI * t)) / 2 * (b - a) + a;
    }

    // Create a 1D Maximal Poisson Disc over [0, 1]
    var radius = 1 / eccentricity, radius2 = radius + radius;
    function createPoisson() {
        // domain is the set of points which are still available to pick from
        // D = union{ [d_i, d_i+1] | i is even }
        var domain = [radius, 1 - radius], measure = 1 - radius2, spline = [0, 1];
        while (measure) {
            var dart = measure * random(), i, l, interval, a, b, c, d;

            // Find where dart lies
            for (i = 0, l = domain.length, measure = 0; i < l; i += 2) {
                a = domain[i], b = domain[i + 1], interval = b - a;
                if (dart < measure + interval) {
                    spline.push(dart += a - measure);
                    break;
                }
                measure += interval;
            }
            c = dart - radius, d = dart + radius;

            // Update the domain
            for (i = domain.length - 1; i > 0; i -= 2) {
                l = i - 1, a = domain[l], b = domain[i];
                // c---d          c---d  Do nothing
                //   c-----d  c-----d    Move interior
                //   c--------------d    Delete interval
                //         c--d          Split interval
                //       a------b
                if (a >= c && a < d)
                    if (b > d) domain[l] = d; // Move interior (Left case)
                    else domain.splice(l, 2); // Delete interval
                else if (a < c && b > c)
                    if (b <= d) domain[i] = c; // Move interior (Right case)
                    else domain.splice(i, 0, c, d); // Split interval
            }

            // Re-measure the domain
            for (i = 0, l = domain.length, measure = 0; i < l; i += 2)
                measure += domain[i + 1] - domain[i];
        }

        return spline.sort();
    }

    // Create the overarching container
    var container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '0';
    container.style.overflow = 'visible';
    container.style.zIndex = '9999';

    // Confetto constructor
    function Confetto(theme) {
        this.frame = 0;
        this.outer = document.createElement('div');
        this.inner = document.createElement('div');
        this.outer.appendChild(this.inner);

        var outerStyle = this.outer.style, innerStyle = this.inner.style;
        outerStyle.position = 'absolute';
        outerStyle.width = (sizeMin + sizeMax * random()) + 'px';
        outerStyle.height = (sizeMin + sizeMax * random()) + 'px';
        innerStyle.width = '100%';
        innerStyle.height = '100%';
        innerStyle.backgroundColor = theme();

        outerStyle.perspective = '50px';
        outerStyle.transform = 'rotate(' + (360 * random()) + 'deg)';
        this.axis = 'rotate3D(' +
            cos(360 * random()) + ',' +
            cos(360 * random()) + ',0,';
        this.theta = 360 * random();
        this.dTheta = dThetaMin + dThetaMax * random();
        innerStyle.transform = this.axis + this.theta + 'deg)';

        this.x = window.innerWidth * random();
        this.y = -deviation;
        this.dx = sin(dxThetaMin + dxThetaMax * random());
        this.dy = dyMin + dyMax * random();
        outerStyle.left = this.x + 'px';
        outerStyle.top = this.y + 'px';

        // Create the periodic spline
        this.splineX = createPoisson();
        this.splineY = [];
        for (var i = 1, l = this.splineX.length - 1; i < l; ++i)
            this.splineY[i] = deviation * random();
        this.splineY[0] = this.splineY[l] = deviation * random();

        this.update = function (height, delta) {
            this.frame += delta;
            this.x += this.dx * delta;
            this.y += this.dy * delta;
            this.theta += this.dTheta * delta;

            // Compute spline and convert to polar
            var phi = this.frame % 7777 / 7777, i = 0, j = 1;
            while (phi >= this.splineX[j]) i = j++;
            var rho = interpolation(
                this.splineY[i],
                this.splineY[j],
                (phi - this.splineX[i]) / (this.splineX[j] - this.splineX[i])
            );
            phi *= PI2;

            outerStyle.left = this.x + rho * cos(phi) + 'px';
            outerStyle.top = this.y + rho * sin(phi) + 'px';
            innerStyle.transform = this.axis + this.theta + 'deg)';
            return this.y > height + deviation;
        };
    }

    function poof() {
        if (!frame) {
            // Append the container
            document.body.appendChild(container);

            // Add confetti
            var theme = colorThemes[0]
                , count = 0;
            (function addConfetto() {
                var confetto = new Confetto(theme);
                confetti.push(confetto);
                container.appendChild(confetto.outer);
                timer = setTimeout(addConfetto, spread * random());
            })(0);

            // Start the loop
            var prev = undefined;
            requestAnimationFrame(function loop(timestamp) {
                var delta = prev ? timestamp - prev : 0;
                prev = timestamp;
                var height = window.innerHeight;

                for (var i = confetti.length - 1; i >= 0; --i) {
                    if (confetti[i].update(height, delta)) {
                        container.removeChild(confetti[i].outer);
                        confetti.splice(i, 1);
                    }
                }

                if (timer || confetti.length)
                    return frame = requestAnimationFrame(loop);

                // Cleanup
                document.body.removeChild(container);
                frame = undefined;
            });
        }
    }

    poof();
};
