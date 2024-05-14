let rotation = 0;
let rotationRate = 20;
let arrowWidth=50;
let force=arrowWidth;
let setForce=null;
let isAiming=false;
let isThrowing=false;
let xPos=50;
let yPos=0;
let yPosBall=xPos+140;
let xPosBall=yPos+65;
let xPosHoop=400;
let yPosHoop=400;
let hoopSize=100;
let xVel=0;
let yVel=0;
let resetTimer=0;
let score=0;
let scoreReady=false;
let moveBallInterval=5;

let character = document.getElementById('character');
let ball = document.getElementById('ball');
let arrowImage = document.getElementById('arrow-image');
let scoreBox = document.getElementById('score-box');
let hoop = document.getElementById('hoop');
/* rotate the arrow by rotationIncrement every rotationRate(milli seconds) */
let setRotation = setInterval(rotateArrow,rotationRate);


/* Increase the throw force while player is holding touch on character */
character.addEventListener('touchstart',aimThrow);

/* Stop increasing throw force when player released touch */
character.addEventListener('touchend',Throw);



/* increase the throw force until touch is released */
function aimThrow () {
    if (!isAiming && !isThrowing){
        arrowWidth=50;
        clearInterval(setRotation);
        setForce = setInterval (growArrow,20);
        isAiming=true;
    } else if (isThrowing){
        resetBall();
    }
}

/* stop aiming and release throw when touch is released */
function Throw () {
    if(isAiming && !isThrowing){
        clearInterval(setForce);
        arrowWidth=50;
        arrowImage.style.width=`${arrowWidth}px`
        arrowImage.style.display="none";
        isAiming=false;
        xVel=force*Math.cos(rotation*2*Math.PI/360)*moveBallInterval/20;
        yVel=force*Math.sin(-rotation*2*Math.PI/360)*moveBallInterval/20;
        isThrowing=true;
        setThrow=setInterval(moveBall,moveBallInterval);
    }
}

function moveBall () {
    resetTimer += 1;
    if (yPosBall>775){
        yVel=-yVel;
        yPosBall=775;
    }

    if (yPosBall<0){
        yVel=-yVel/2;
        xVel=xVel/2;
        yPosBall=0;
    }
    if (xPosBall>475){
        xVel=-xVel/2;
        xPosBall=475;
    }

    if (xPosBall<0){
        xVel=-xVel/2;
        xPosBall=0;
    }
    xPosBall+= xVel*0.2/moveBallInterval;
    yPosBall+= yVel*0.2/moveBallInterval;
    
    yVel -= 30*moveBallInterval/200;
   
    ball.style.position="absolute";
    ball.style.left=`${xPosBall}px`;
    ball.style.bottom=`${yPosBall}px`;

    /* reset the ball 5 seconds after it is thrown */

    if (resetTimer>((1000/moveBallInterval)*5)){
        resetBall();
    }

    if((xPosBall>(xPosHoop-hoopSize) && xPosBall<(xPosHoop+hoopSize)
         && yPosBall < (yPosHoop + 20) && yPosBall >= (yPosHoop))&& scoreReady==true){
        score +=1;
        scoreReady=false;
        scoreBox.innerText=`Score : ${score}`;
        hoop.style.backgroundColor="red";
        }
}

function resetBall () {
    clearInterval(setThrow);
    xPosBall=xPos+65;
    yPosBall=yPos+140;
    ball.style.left=`${xPosBall}px`;
    ball.style.bottom=`${yPosBall}px`;
    arrowImage.style.display="inline";
    setRotation = setInterval(rotateArrow,rotationRate);
    resetTimer=0;
    isThrowing=false;
    scoreReady=true;
}


/**
 * function to increase the arrow length and throw force while player is
 * holding the touch on the character
 */
function growArrow ()   {
    let growArrowIncrement=30;
    arrowImage.style.width=`${arrowWidth}px`
    arrowWidth += growArrowIncrement;
    force=arrowWidth*5-100;
}

/**
 * Function to rotate the arrow by rotation increment
 */
function rotateArrow () {
    let arrowImage = document.getElementById('arrow-image');
    let rotationIncrement = 10;
    rotation += rotationIncrement;
    /* restrict angle to range 0-360 degrees for debugging purposes */
    if (rotation === 360){
        rotation = 0;
    }
    arrowImage.style.transform=`rotate(${rotation}deg)`;
}