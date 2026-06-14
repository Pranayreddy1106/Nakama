const ADJECTIVES = [
  'Calm', 'Peaceful', 'Serene', 'Gentle', 'Happy', 'Warm', 'Kind', 'Bright', 
  'Quiet', 'Wise', 'Brave', 'Strong', 'Uplifting', 'Hopeful', 'Joyful', 'Caring'
];

const ANIMALS = [
  'Fox', 'Deer', 'Owl', 'Koala', 'Panda', 'Otter', 'Bear', 'Rabbit', 
  'Squirrel', 'Hedgehog', 'Seal', 'Robin', 'Dolphin', 'Butterfly', 'Turtle'
];

export function generateAnonName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const anim = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
  const num = Math.floor(100 + Math.random() * 900); // 3-digit number
  return `${adj}${anim}${num}`;
}
