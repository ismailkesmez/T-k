const fs = require('fs');
const path = require('path');

function writeInt16LE(buf, value, offset) {
  const v = Math.max(-32768, Math.min(32767, value));
  buf[offset] = v & 0xff;
  buf[offset + 1] = (v >> 8) & 0xff;
}

function writeUInt32LE(buf, value, offset) {
  buf[offset]     = value & 0xff;
  buf[offset + 1] = (value >> 8) & 0xff;
  buf[offset + 2] = (value >> 16) & 0xff;
  buf[offset + 3] = (value >> 24) & 0xff;
}

function writeUInt16LE(buf, value, offset) {
  buf[offset]     = value & 0xff;
  buf[offset + 1] = (value >> 8) & 0xff;
}

function generateWav({ freq, freq2, duration, decay, volume = 0.75 }) {
  const sampleRate = 22050;
  const numSamples = Math.floor(sampleRate * duration);
  const buf = Buffer.alloc(44 + numSamples * 2);

  buf.write('RIFF', 0);
  writeUInt32LE(buf, 36 + numSamples * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  writeUInt32LE(buf, 16, 16);
  writeUInt16LE(buf, 1, 20);            // PCM
  writeUInt16LE(buf, 1, 22);            // mono
  writeUInt32LE(buf, sampleRate, 24);
  writeUInt32LE(buf, sampleRate * 2, 28);
  writeUInt16LE(buf, 2, 32);
  writeUInt16LE(buf, 16, 34);
  buf.write('data', 36);
  writeUInt32LE(buf, numSamples * 2, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.exp(-t * decay);
    let sample = Math.sin(2 * Math.PI * freq * t);
    if (freq2) sample = (sample + Math.sin(2 * Math.PI * freq2 * t)) * 0.5;
    const val = Math.floor(sample * env * volume * 32767);
    writeInt16LE(buf, val, 44 + i * 2);
  }

  return buf;
}

const sounds = [
  { id: 1,  name: 'monster_1',  freq: 440,  freq2: null, duration: 0.12, decay: 20 }, // Slime
  { id: 2,  name: 'monster_2',  freq: 280,  freq2: 290,  duration: 0.15, decay: 14 }, // Kurt
  { id: 3,  name: 'monster_3',  freq: 110,  freq2: 105,  duration: 0.22, decay: 10 }, // Golem
  { id: 4,  name: 'monster_4',  freq: 680,  freq2: null, duration: 0.10, decay: 25 }, // Yaratık Avcısı
  { id: 5,  name: 'monster_5',  freq: 520,  freq2: 780,  duration: 0.14, decay: 16 }, // Cadı
  { id: 6,  name: 'monster_6',  freq: 180,  freq2: 360,  duration: 0.14, decay: 12 }, // Vampir
  { id: 7,  name: 'monster_7',  freq: 75,   freq2: 80,   duration: 0.28, decay: 8  }, // Ölü Kral
  { id: 8,  name: 'monster_8',  freq: 340,  freq2: 170,  duration: 0.12, decay: 18 }, // İblis
  { id: 9,  name: 'monster_9',  freq: 140,  freq2: 210,  duration: 0.20, decay: 9  }, // İblis Kral
  { id: 10, name: 'monster_10', freq: 900,  freq2: 1800, duration: 0.09, decay: 28 }, // Melek
  { id: 11, name: 'monster_11', freq: 1047, freq2: 1319, duration: 0.18, decay: 14 }, // Baş Melek
];

const outDir = path.join(__dirname, '../assets/sounds');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

for (const s of sounds) {
  const wav = generateWav(s);
  const outPath = path.join(outDir, `${s.name}.wav`);
  fs.writeFileSync(outPath, wav);
  console.log(`✓ ${s.name}.wav`);
}

console.log('\nSes dosyaları assets/sounds/ klasörüne oluşturuldu.');
