let rotation = 0;
let rotationRate = 20;
let arrowWidth=50;
let force=arrowWidth;
let setForce=null;
let isAiming=false;
let isThrowing=false;
let xPos=0;
let yPos=0;
let yPosBall=xPos+140;
let xPosBall=yPos+65;
let xVel=0;
let yVel=0;
let resetTimer=0;

let character = document.getElementById('character');
let ball = document.getElementById('ball');
let arrowImage = document.getElementById('arrow-image');


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
        xVel=force*Math.cos(rotation*2*Math.PI/360);
        yVel=force*Math.sin(-rotation*2*Math.PI/360);
        isThrowing=true;
        setThrow=setInterval(moveBall,20);
    }
}

function moveBall () {
    resetTimer += 1;
    if (yPosBall>750){
        yVel=-yVel;
        yPosBall=750;
    }

    if (yPosBall<0){
        yVel=-yVel/2;
        xVel=xVel/2;
        yPosBall=0;
    }
    if (xPosBall>450){
        xVel=-xVel/2;
        xPosBall=450;
    }

    if (xPosBall<0){
        xVel=-xVel/2;
        xPosBall=0;
    }
    xPosBall+= xVel*0.01;
    yPosBall+= yVel*0.01;
    
    yVel-= 30;
   
    ball.style.position="absolute";
    ball.style.left=`${xPosBall}px`;
    ball.style.bottom=`${yPosBall}px`;

    if (resetTimer>((1000/20)*5)){
        resetBall();
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
}


/**
 * function to increase the arrow length and throw force while player is
 * holding the touch on the character
 */
function growArrow ()   {
    let growArrowIncrement=30;
    arrowImage.style.width=`${arrowWidth}px`
    arrowWidth += growArrowIncrement;
    force=arrowWidth*5;
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