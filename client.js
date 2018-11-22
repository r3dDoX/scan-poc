const input = document.querySelector('input');
const canvas = document.querySelector('canvas');

input.addEventListener('change', handleFiles, false);

function handleFiles(e) {
    var ctx = canvas.getContext('2d');
    var url = URL.createObjectURL(e.target.files[0]);
    var img = new Image();
    img.onload = () => ctx.drawImage(img, 20, 20);
    img.src = url;
}