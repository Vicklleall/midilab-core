import { ctx } from './base';

export const buffer = {};
const bufferLoadCallback = {};

export const output = [];

export const instrument = [];

export function loadBuffer(id, url) {
  buffer[id] = null;
  return fetch(url)
         .then(response => response.arrayBuffer())
         .then(audioData => ctx.decodeAudioData(audioData))
         .then(decodedData => {
           buffer[id] = decodedData;
           bufferLoadCallback[id]?.forEach(callback => callback(decodedData));
           return decodedData;
         });
}

export function onBufferLoad(id, callback) {
  if (buffer[id]) callback(buffer[id]);
  bufferLoadCallback[id] ??= [];
  bufferLoadCallback[id].push(callback);
}