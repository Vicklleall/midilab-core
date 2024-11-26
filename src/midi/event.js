import {
  MIDI_EVENT_NOTE_ON,
  MIDI_EVENT_NOTE_OFF,
  MIDI_EVENT_CC
} from '../constants';

const eventList = [];

export const onMidiEvent = (event, callback) => {
  eventList[event] ??= new Set();
  eventList[event].add(callback);
};
export const sendMidiEvent = (event, ...data) => {
  if (eventList[event]) {
    for (const callback of eventList[event]) callback(...data);
  }
};

export const onMidiNoteOn = callback => {
  onMidiEvent(MIDI_EVENT_NOTE_ON, (note, velocity) => {
    if (velocity > 0) callback(note, velocity);
  });
};
export const onMidiNoteOff = callback => {
  onMidiEvent(MIDI_EVENT_NOTE_ON, (note, velocity) => {
    if (velocity === 0) callback(note, velocity);
  });
  onMidiEvent(MIDI_EVENT_NOTE_OFF, callback);
};
export const onMidiCC = (chanel, callback) => {
  onMidiEvent(MIDI_EVENT_CC, (cc, value) => {
    if (cc === chanel) callback(value);
  });
};

export const cc = {
  data: [],
  set(chanel, value) {
    value = Math.max(0, Math.min(127, Math.round(value)));
    sendMidiEvent(MIDI_EVENT_CC, chanel, value);
  },
  get(chanel) {
    return this.data[chanel];
  }
};
onMidiEvent(MIDI_EVENT_CC, (chanel, value) => cc.data[chanel] = value);