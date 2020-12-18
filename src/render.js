import { desktopCapturer } from 'electron';

const videoDisplay = document.querySelector('#video-display');
const videoSelectBtn = document.querySelector('#video-select-btn');

const desktopSource = await desktopCapturer.getSources();