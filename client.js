const constraints = window.constraints = {
    audio: false,
    video: {facingMode: {exact: 'environment'}}
};

const video = document.querySelector('video');
const button = document.querySelector('button');
const canvas = window.canvas = document.querySelector('canvas');

button.addEventListener('click', () => {
    video.classList.remove('fullscreen');
    video.classList.add('hidden');
    canvas.classList.add('fullscreen');
    canvas.classList.remove('hidden');

    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').scale(ratio, ratio);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
});

navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
        video.srcObject = stream;
    });
