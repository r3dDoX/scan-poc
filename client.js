const input = document.querySelector('input');
const canvas = document.querySelector('canvas');
const corners = [];
const TP_RADIUS = 10;

input.addEventListener('change', handleFiles, false);

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
    const mousePosition = getMousePos(event);
    touchPoint.x = mousePosition.x;
    touchPoint.y = mousePosition.y;
}

window.onload = () => {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);

    canvas.addEventListener('touchstart', event => {
        let mousePosition = getMousePos(event);
        const touchPoint = corners.find(touchPoint => isIntersect(mousePosition, touchPoint));
        if (touchPoint) {
            const boundMoveTouchPoint = moveTouchPoint.bind(null, touchPoint);
            canvas.addEventListener('touchmove', boundMoveTouchPoint);
            window.addEventListener('touchend', () => canvas.removeEventListener('touchmove', boundMoveTouchPoint))
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

function drawCropShape(width, height, img) {
    const ctx = canvas.getContext('2d');

    if (corners.length === 0) {
        corners.push({x: 40, y: 40});
        corners.push({x: 40, y: height - 40});
        corners.push({x: width - 40, y: height - 40});
        corners.push({x: width - 40, y: 40});
    }


    ctx.save();
    ctx.clip(getPath());
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, width, height);
    ctx.restore();

    ctx.stroke(getPath());
    corners.forEach(touchPoint => drawTouchPoint(touchPoint.x, touchPoint.y));
}

function drawImage(img) {
    const ctx = canvas.getContext('2d');
    const destWidth = canvas.offsetWidth;
    const destHeight = img.height * (canvas.offsetWidth / img.width);
    ctx.filter = 'blur(4px)';
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, destWidth, destHeight);
    ctx.filter = 'none';
    drawCropShape(destWidth, destHeight, img);
}

function loop(img) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawImage(img);
    window.requestAnimationFrame(() => loop(img));
}

function handleFiles(e) {
    var url = URL.createObjectURL(e.target.files[0]);
    var img = new Image();
    img.onload = () => loop(img);
    img.src = url;
}