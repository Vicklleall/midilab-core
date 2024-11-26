import { sendMidiEvent } from './event';

export let devices = {
  inputs: [],
  outputs: []
};
export const requestDevices = () => {
  return navigator.requestMIDIAccess().then(access => {
    devices.inputs = access.inputs;
    devices.outputs = access.outputs;
    access.inputs.forEach(input => {
      input.onmidimessage = message => {
        sendMidiEvent(...message.data);
      };
    });
    return access;
  });
}