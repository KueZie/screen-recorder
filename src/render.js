import { desktopCapturer, remote } from 'electron';
const { Menu } = remote;

const videoDisplay = document.querySelector('#video-display');
const videoSelectBtn = document.querySelector('#video-select-btn');

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

    // Get source from user selection
    const stream = await navigator.mediaDevices.getUserMedia(sourceConstraints);

    // // Link the stream of the source to the video output element in the app
    videoDisplay.srcObject = stream;
    videoDisplay.play();

}

videoSelectBtn.onclick = getSources;