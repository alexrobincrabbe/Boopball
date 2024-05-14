let rotation = 0;
let rotationRate = 20;
let arrowWidth=50;
let force=arrowWidth;
let setForce=null;
let isAiming=false;

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
    if (!isAiming){
        arrowWidth=50;
        clearInterval(setRotation);
        setForce = setInterval (growArrow,20);
        isAiming=true;
    } 
}

/* stop aiming and release throw when touch is released */
function Throw () {
    if(isAiming){
        clearInterval(setForce);
        arrowWidth=50;
        arrowImage.style.width=`${arrowWidth}px`
        setRotation = setInterval(rotateArrow,rotationRate);
        isAiming=false;
        throwBall()
    }
}

/* Function to handle ball throw */
function throwBall () {

}


/**
 * function to increase the arrow length and throw force while player is
 * holding the touch on the character
 */
function growArrow ()   {
    let growArrowIncrement=10;
    arrowImage.style.width=`${arrowWidth}px`
    arrowWidth += growArrowIncrement;
    force=arrowWidth;
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