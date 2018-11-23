const input = document.querySelector('input');
const canvas = document.getElementById('original');
const button = document.querySelector('button');
const corners = [];
const TP_RADIUS = 15;
let dataUrl;

let downEvent;
let moveEvent;
let upEvent;

if ('onpointerdown' in document.documentElement) {
    downEvent = 'pointerdown';
    moveEvent = 'pointermove';
    upEvent = 'pointerup';
} else if ('ontouchstart' in document.documentElement) {
    downEvent = 'touchstart';
    moveEvent = 'touchmove';
    upEvent = 'touchend';
} else {
    downEvent = 'mousedown';
    moveEvent = 'mousemove';
    upEvent = 'mouseup';
}

input.addEventListener('change', handleFiles, false);

let currentShownImage;
button.addEventListener('click', renderCroppedImage);

function renderCroppedImage() {
    currentShownImage && document.body.removeChild(currentShownImage);
    let clippedImage;
    if (dataUrl) {
        clippedImage = new Image();
        clippedImage.id = 'cropped';
        clippedImage.onload = () => document.body.appendChild(clippedImage);
        clippedImage.src = dataUrl;
    }
    currentShownImage = clippedImage;
}

function isIntersect(point, circle) {
    return Math.sqrt(Math.pow(point.x - circle.x, 2) + Math.pow(point.y - circle.y, 2)) < TP_RADIUS;
}

function getMousePos(evt) {
    const {top, left} = canvas.getBoundingClientRect();
    return {
        x: evt.clientX - left,
        y: evt.clientY - top,
    };
}

function moveTouchPoint(touchPoint, event) {
    const mousePosition = getMousePos(event.targetTouches ? event.targetTouches[0] : event);
    touchPoint.x =  mousePosition.x < 0
        ? 0
        : mousePosition.x > canvas.offsetWidth
            ? canvas.offsetWidth
            : mousePosition.x;
    touchPoint.y = mousePosition.y < 0
        ? 0
        : mousePosition.y > canvas.offsetHeight
            ? canvas.offsetHeight
            : mousePosition.y;
}

window.onload = () => {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);

    canvas.addEventListener(downEvent, event => {
        let mousePosition = getMousePos(event);
        const touchPoint = corners.find(touchPoint => isIntersect(mousePosition, touchPoint));
        if (touchPoint) {
            const boundMoveTouchPoint = moveTouchPoint.bind(null, touchPoint);
            canvas.addEventListener(moveEvent, boundMoveTouchPoint, {passive: true});
            window.addEventListener(upEvent, () => canvas.removeEventListener(moveEvent, boundMoveTouchPoint))
        }
    });
};

function getTouchPointPath(x, y) {
    const path = new Path2D();

    path.arc(x, y, TP_RADIUS, 0, 2 * Math.PI);

    return path;
}

function drawTouchPoint(x, y) {
    const ctx = canvas.getContext('2d');
    let touchPointPath = getTouchPointPath(x, y);
    ctx.stroke(touchPointPath);
    ctx.fillStyle = 'white';
    ctx.fill(touchPointPath);
    ctx.fillStyle = 'none';
}

function getPath() {
    const path = new Path2D();

    const [firstTouchPoint, ...touchPoints] = corners;
    path.moveTo(firstTouchPoint.x, firstTouchPoint.y);
    touchPoints.forEach(touchPoint => path.lineTo(touchPoint.x, touchPoint.y));
    path.closePath();

    return path;
}

function getMinX() {
    return Math.min(...corners.map(corner => corner.x));
}

function getMinY() {
    return Math.min(...corners.map(corner => corner.y));
}

function getCropWidth() {
    return Math.max(...corners.map(corner => corner.x)) - getMinX();
}

function getCropHeight() {
    return Math.max(...corners.map(corner => corner.y)) - getMinY();
}

function getDataUrlFromCroppedImage(ctx, img, width, height) {
    ctx.save();
    ctx.clip(getPath());
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
    ctx.restore();

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const croppedCanvas = document.createElement('canvas');
    const croppedContext = croppedCanvas.getContext('2d');
    croppedCanvas.width = getCropWidth();
    croppedCanvas.height = getCropHeight();
    croppedContext.drawImage(canvas, getMinX(), getMinY(), croppedCanvas.width, croppedCanvas.height, 0, 0, croppedCanvas.width, croppedCanvas.height);
    dataUrl = croppedCanvas.toDataURL();
}

function renderBlurryCroppedImage(ctx, img, width, height) {
    ctx.filter = 'blur(4px)';
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
    ctx.filter = 'none';

    ctx.save();
    ctx.clip(getPath());
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
    ctx.restore();
}

function drawCropShape(width, height, img) {
    const ctx = canvas.getContext('2d');

    if (corners.length === 0) {
        corners.push({x: 40, y: 40});
        corners.push({x: 40, y: height - 40});
        corners.push({x: width - 40, y: height - 40});
        corners.push({x: width - 40, y: 40});
    }

    getDataUrlFromCroppedImage(ctx, img, width, height);
    renderBlurryCroppedImage(ctx, img, width, height);

    ctx.stroke(getPath());
    corners.forEach(touchPoint => drawTouchPoint(touchPoint.x, touchPoint.y));
}

function drawImage(img) {
    const destWidth = canvas.offsetWidth;
    const destHeight = img.height * (canvas.offsetWidth / img.width);
    drawCropShape(destWidth, destHeight, img);
}

function clearCanvas() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function loop(img) {
    clearCanvas();
    drawImage(img);
    window.requestAnimationFrame(() => loop(img));
}

function handleFiles(e) {
    var url = URL.createObjectURL(e.target.files[0]);
    var img = new Image();
    img.onload = () => loop(img);
    img.src = url;
}