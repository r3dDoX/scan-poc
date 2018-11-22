const constraints = window.constraints = {
    audio: false,
    video: {facingMode: {exact: 'environment'}}
};

const video = document.querySelector('video');
const button = document.querySelector('button');
const canvas = window.canvas = document.querySelector('canvas');
canvas.width = 480;
canvas.height = 360;

button.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
});

navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
        const videoTracks = stream.getVideoTracks();
        window.stream = stream; // make variable available to browser console
        video.srcObject = stream;
    });
