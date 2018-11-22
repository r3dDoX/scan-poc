const constraints = window.constraints = {
    audio: false,
    video: true
};

navigator.mediaDevices
    .getUserMedia(constraints)
    .then(stream => {
        const video = document.querySelector('video');
        const videoTracks = stream.getVideoTracks();

        console.log('Got stream with constraints:', constraints);
        console.log(`Using video device: ${videoTracks[0].label}`);
        console.log(videoTracks[0]);

        window.stream = stream; // make variable available to browser console
        video.srcObject = stream;
    });
