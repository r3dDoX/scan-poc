const input = document.querySelector('input');
const canvas = document.querySelector('canvas');

input.addEventListener('change', handleFiles, false);

window.onload = () => {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);
};

function handleFiles(e) {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var url = URL.createObjectURL(e.target.files[0]);
    var img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.offsetWidth, img.height * (canvas.offsetWidth / img.width))
    img.src = url;
}