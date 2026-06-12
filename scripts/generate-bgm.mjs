import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sampleRate = 22050;
const seconds = 24;
const sampleCount = sampleRate * seconds;

const noteFrequencies = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0,
  B3: 246.94, C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0,
  A4: 440.0, B4: 493.88, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99
};

const tracks = {
  main_menu: {
    bpm: 100,
    chords: [["C3", "E3", "G3"], ["A3", "C4", "E4"], ["F3", "A3", "C4"], ["G3", "B3", "D4"]],
    melody: ["E4", "G4", "C5", "G4", "A4", "E4", "D4", "G4", "F4", "A4", "C5", "A4", "G4", "D4", "E4", "G4"]
  },
  visual_novel: {
    bpm: 88,
    chords: [["F3", "A3", "C4"], ["C3", "E3", "G3"], ["A3", "C4", "E4"], ["G3", "B3", "D4"]],
    melody: ["A4", "C5", "A4", "G4", "E4", "G4", "A4", "E4", "F4", "A4", "C5", "A4", "G4", "E4", "D4", "G4"]
  },
  blackjack: {
    bpm: 116,
    chords: [["A3", "C4", "E4"], ["D3", "F3", "A3"], ["G3", "B3", "D4"], ["E3", "G3", "B3"]],
    melody: ["A4", "C5", "E5", "C5", "D5", "A4", "G4", "E4", "G4", "B4", "D5", "B4", "E5", "C5", "B4", "G4"]
  },
  battle: {
    bpm: 128,
    chords: [["D3", "F3", "A3"], ["C3", "E3", "G3"], ["F3", "A3", "C4"], ["A3", "C4", "E4"]],
    melody: ["D4", "A4", "D5", "A4", "F4", "C5", "A4", "F4", "G4", "D5", "C5", "G4", "A4", "E5", "C5", "A4"]
  },
  ending: {
    bpm: 76,
    chords: [["C3", "E3", "G3"], ["G3", "B3", "D4"], ["A3", "C4", "E4"], ["F3", "A3", "C4"]],
    melody: ["C5", "G4", "E4", "G4", "B4", "G4", "D4", "G4", "A4", "E4", "C4", "E4", "F4", "A4", "G4", "E4"]
  }
};

function triangle(phase) {
  return 2 * Math.abs(2 * (phase - Math.floor(phase + 0.5))) - 1;
}

function envelope(position, length, attack = 0.08, release = 0.2) {
  const attackGain = Math.min(1, position / attack);
  const releaseGain = Math.min(1, (length - position) / release);
  return Math.max(0, Math.min(attackGain, releaseGain));
}

function addNote(buffer, startSeconds, duration, frequency, volume, voice = "pluck") {
  const start = Math.floor(startSeconds * sampleRate);
  const length = Math.floor(duration * sampleRate);

  for (let offset = 0; offset < length && start + offset < buffer.length; offset += 1) {
    const time = offset / sampleRate;
    const position = offset / length;
    const phase = time * frequency;
    const env = envelope(position, 1, voice === "pad" ? 0.18 : 0.035, voice === "pad" ? 0.28 : 0.36);
    const shimmer = Math.sin(2 * Math.PI * phase * 2) * 0.16;
    const wave = voice === "pad"
      ? triangle(phase) * 0.62 + Math.sin(2 * Math.PI * phase) * 0.38
      : Math.sin(2 * Math.PI * phase) * 0.7 + triangle(phase) * 0.22 + shimmer * 0.08;
    buffer[start + offset] += wave * volume * env;
  }
}

function renderTrack(config) {
  const samples = new Float64Array(sampleCount);
  const beat = 60 / config.bpm;
  const phraseDuration = seconds / 4;

  for (let phrase = 0; phrase < 4; phrase += 1) {
    const chord = config.chords[phrase];
    chord.forEach((note, index) => addNote(samples, phrase * phraseDuration, phraseDuration, noteFrequencies[note], 0.055 - index * 0.008, "pad"));

    for (let step = 0; step < 4; step += 1) {
      const note = config.melody[phrase * 4 + step];
      const start = phrase * phraseDuration + step * (phraseDuration / 4);
      addNote(samples, start, Math.min(beat * 1.75, phraseDuration / 3), noteFrequencies[note], 0.17, "pluck");
      addNote(samples, start + beat * 0.5, beat * 0.32, noteFrequencies[chord[step % chord.length]] * 2, 0.055, "pluck");
    }
  }

  const pcm = Buffer.alloc(sampleCount * 2);
  for (let index = 0; index < samples.length; index += 1) {
    const fade = Math.min(1, index / 1000, (samples.length - index - 1) / 1000);
    const value = Math.max(-1, Math.min(1, samples[index] * fade));
    pcm.writeInt16LE(Math.round(value * 32767), index * 2);
  }
  return pcm;
}

function createWave(pcm) {
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

for (const [name, config] of Object.entries(tracks)) {
  const wave = createWave(renderTrack(config));
  for (const relativeDirectory of ["assets/audio/bgm", "assets/audio/music", "assets/music"]) {
    const directory = path.join(root, relativeDirectory);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, `${name}.wav`), wave);
  }
}

console.log("Generated five original 24-second whimsical fantasy BGM loops.");
