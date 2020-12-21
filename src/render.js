import { desktopCapturer, remote } from 'electron';
const { Menu, dialog } = remote;
const { writeFile } = require('fs');

const videoDisplay = document.querySelector('#video-display');
const videoSelectBtn = document.querySelector('#video-select-btn');
const recordToggleBtn = document.querySelector('#record-toggle-btn');

console.log('%c Console Debugger Active!', 'background: black; color: limegreen');

async function getSources() {
    // Grab video sources
    const desktopSources = await desktopCapturer.getSources({
        types: ['window', 'screen']
    });
    console.log('getSources');
    // Construct video select menu

    const selectorMenu = Menu.buildFromTemplate(
        desktopSources.map(src => {
            return {
                label: src.name,
                click: () => showSource(src)
            }
        })
    );

    selectorMenu.popup(); // Show menu
}

async function toggleRecord() {
    if (recorder.state == 'recording')
        recorder.stop();
    else
        recorder.start();
}

let recorder;
const chunks = [];

async function showSource(src) {
    // Details about the source the user selected
    const sourceConstraints = {
        video: {
            mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: src.id
            }
        },
        audio: false
    };

    let recording = false;
    navigator.mediaDevices.getUserMedia(sourceConstraints) // Get source from user selection
        .then(stream => {
            // Link the stream of the source to the video output element in the app
            videoDisplay.srcObject = stream;
            videoDisplay.play();

            recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
            recorder.addEventListener('dataavailable', handleData);
            recorder.onstop = e => handleVideoSave(e, chunks);
        });

    recordToggleBtn.onclick = () => {
        if (!recording) { recorder.start(); }
        else            { recorder.stop(); }

        recordToggleBtn.classList.toggle('red');
        recordToggleBtn.classList.toggle('limegreen');
        recordToggleBtn.children[0].classList.toggle('fa-pause');
        recordToggleBtn.children[0].classList.toggle('fa-video');
        recording = !recording;
    }

    setInterval(() => {
        console.log(recorder);
    }, 1000);
}

function handleData(e) {
    console.log('Pushing a chunk!');
    chunks.push(e.data);
}

async function handleVideoSave(event, chunks) {
    const d = new Date();
    const fileName = `${d.getFullYear()}-${d.getMonth()}-${d.getHours()}-${d.getMinutes()}-SR.webm`;
    const blob = new Blob(chunks, { type: 'video/webm; codecs=vp9' });
    const buff = Buffer.from(await blob.arrayBuffer());
    const { filePath } = await dialog.showSaveDialog({
        buttonLabel: 'Save',
        defaultPath: fileName
    });

    if (filePath) {
        writeFile(filePath, chunks, () => console.log('Successfully saved video to: ' + filePath));
    }
}

videoSelectBtn.onclick = getSources;


 