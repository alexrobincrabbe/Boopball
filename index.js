let rotation = 0;
let rotationRate = 20;
/* rotate the arrow by rotationIncrement every rotationRate(milli seconds) */
let setRotation = setInterval(rotateArrow,rotationRate);


/**
 * Rotate the arrow by rotation increment
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