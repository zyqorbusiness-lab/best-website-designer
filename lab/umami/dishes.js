/* UMAMI RING - the five bowls (shared by the 3D ring and the no-WebGL fallback).
   Each bowl is a real photogrammetry scan (CC BY 4.0, see credits); `surf` is the broth line in model units (rim radius 1); `sink` seats a scan whose foot was not captured a little into its tray. */
export const D = [
  { slot: 'tonkotsu', surf: 0.84, sink: 0.2, name: 'Tonkotsu', sub: 'Bone broth, slow and milky. Twelve hours on the fire, ninety seconds to your seat.', note: 'Sliced brisket, tendon, scallion, milky broth',
    bg: '#C8342B', ink: '#F4E9D8' },
  { slot: 'shoyu', surf: 0.64, name: 'Shoyu Classic', sub: 'Clear soy broth with chicken and dashi. The bowl that started the ring.', note: 'Tofu, bean sprouts, cabbage, bonito flakes',
    bg: '#2E4A3B', ink: '#F4E9D8' },
  { slot: 'miso', surf: 0.76, name: 'Miso Fire', sub: 'Red miso and house chilli oil, with sweet corn to cool you down. Mostly.', note: 'Chashu, sweet corn, mushroom, scallion',
    bg: '#D2552C', ink: '#2A1A14' },
  { slot: 'yuzu', surf: 0.74, name: 'Yuzu Shio', sub: 'Light salt broth, silky wontons and greens. Sunshine in a bowl.', note: 'Wontons, greens, scallion, light salt broth',
    bg: '#E8D9BC', ink: '#2E4A3B' },
  { slot: 'garlic', surf: 0.64, name: 'Black Garlic', sub: 'Pork broth under a slick of burnt garlic oil. Dark, deep and a little dramatic.', note: 'Chashu, soft egg, wood ear, bamboo, scallion',
    bg: '#3B2A24', ink: '#F4E9D8' },
];
export const MODEL_DIR = '../../assets/lab/umami/';
export const plateSrc = (d) => MODEL_DIR + 'plate-' + d.slot + '.webp';
