import "./play.css";

import { Worker } from "threads"
import { touchControls, desktopControls } from './Input';
import ClientNetwork from './network/ClientNetwork';
import { v1 as uuidv1 } from 'uuid';

const clientId = uuidv1();

const canvas = document.createElement('canvas');
canvas.id = 'gameplay-canvas';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight
canvas.style.width = '100%';
canvas.style.height = '100%';
document.body.appendChild(canvas);

const offscreen = canvas.transferControlToOffscreen();

function fetchPalette(){
  let palette = localStorage.getItem('palette');
  if(palette){
    return JSON.parse(localStorage.getItem('palette'));
  }

  return[
    {"r":0.26666666666666666,"g":0.26666666666666666,"b":0.26666666666666666,"a":1},
    {"r":0.8313725490196079,"g":0.41568627450980394,"b":0.050980392156862744,"a":1},
    {"r":0.4666666666666667,"g":0.5882352941176471,"b":0.6039215686274509,"a":1},
    {"r":1,"g":1,"b":1,"a":1}
  ];
}

function fetchLocalStoragePlayerData(){
  const localStoragePlayer = {
    userName: localStorage.getItem('userName') || '',
    skeleton: 'mechSniperActions',
    palette: fetchPalette(),
    items:  JSON.parse(localStorage.getItem('items')) || {
      head: 'standardHead',
      core: 'standardCore',
      arms: 'standardArms',
      legs: 'standardLegs',
      booster: 'standardBooster',
      weapon: 'standardGun',
    },
  }

  return localStoragePlayer;
}

let worker: Worker = null;
let network: ClientNetwork = null;

async function main(){
  worker = new Worker('./browser.worker');
  network = new ClientNetwork(workerWrap);

  network.uuid = clientId;
  network.init();
}
main();

// Disconnect from network on window reload and refresh
window.onbeforeunload = function() {
  console.log("window unload!");
  network.destroy();
};

worker.addEventListener('message', (messageEvent: any) => {
  console.log('worker message', messageEvent);
  if(
    messageEvent.data.constructor.name === 'Uint8Array' ||
    (messageEvent.data &&
     messageEvent.data.type &&
     messageEvent.data.type.match(/@NETWORK/))
  ){
    network.broadcastActionToPeers(messageEvent.data);
  }else{
    console.warn('unknown messageEvent from worker', messageEvent);
  }
});

//
// You can not pass around a reference to worker.postMessage
// it will throw an illegal operation.
// you can pass around this wrapper function
//
function workerWrap(action: any){
  worker.postMessage(action);
}

function inputDispatch(action: any){
  // send inputs to simulation
  // and server
  worker.postMessage(action);
  network.broadcastActionToPeers(action);
}

if('ontouchstart' in window || navigator.maxTouchPoints){
  touchControls(document, inputDispatch);
}else{
  desktopControls(document, inputDispatch);
}

worker.postMessage(
  {
    type: "@RENDER/INIT",
    payload: {
      canvas:  offscreen,
      width: window.innerWidth,
      height: window.innerHeight,
      player: fetchLocalStoragePlayerData(),
      clientId,
    }
  },
  [offscreen]
);

window.onresize = function windowResizeHandler(){
  worker.postMessage({
    type: "@RENDER/RESIZE",
    payload: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  });
}

window.onorientationchange = function windowResizeHandler(){
  worker.postMessage({
    type: "@RENDER/RESIZE",
    payload: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  });
}
