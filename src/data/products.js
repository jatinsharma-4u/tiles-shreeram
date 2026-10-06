/**
 * Product catalogue, single source of truth for cards, filters, search and detail pages.
 * NOTE: names, specs and descriptions are sample data. Replace with the real catalogue;
 * everything (filters, counts, colour swatches, sizes) is derived from this array.
 */

export const COLOR_HEX = {
  White: '#F4F1EA',
  Beige: '#D9C7A8',
  Grey: '#9B9993',
  Black: '#2A2A2C',
  Brown: '#7A5638',
  Blue: '#8DA3B4',
  Green: '#2F4A3C',
};

export const COLLECTIONS = {
  Marble: { name: 'Aurelia', blurb: 'Veined marble-look porcelain with a luminous, polished depth.' },
  Stone: { name: 'Terra', blurb: 'Honest stone textures for rooms that want to feel grounded.' },
  Concrete: { name: 'Atelier', blurb: 'Quiet, architectural concrete in large-format slabs.' },
  Wood: { name: 'Quercus', blurb: 'The warmth of oak and walnut, without the maintenance.' },
  Terrazzo: { name: 'Venezia', blurb: 'Hand-scattered chips set in a calm, modern ground.' },
  Metal: { name: 'Metallo', blurb: 'Brushed and patinated metallic surfaces for accents.' },
};

export const APPLICATION_SCENES = {
  'Living Room': 'scene-living-cream',
  Bedroom: 'scene-bedroom',
  Kitchen: 'scene-kitchen',
  Bathroom: 'scene-bathroom-white',
  Commercial: 'scene-commercial',
  Outdoor: 'scene-outdoor',
};

const LOOK_COPY = {
  Marble: 'Soft veining travels across the surface the way it does in natural quarried stone, finished to a depth you notice in every light.',
  Stone: 'A tactile, stone-inspired surface with natural variation from tile to tile, made for rooms that want to feel grounded.',
  Concrete: 'A calm, architectural concrete surface with subtle tonal movement. Large formats keep grout lines to a minimum.',
  Wood: 'Plank-format porcelain with an authentic grain and warm tone, the character of timber with the durability of a tile.',
  Terrazzo: 'Scattered chips in a considered palette, giving a classic terrazzo surface a clean, contemporary rhythm.',
  Metal: 'A brushed metallic finish that adds a quiet, architectural accent to walls and feature surfaces.',
};

/* id-key, name, look, category, color, finish, size, thickness(mm), applications, tagline */
const RAW = [
  ['M01', 'Calacatta Bianco', 'Marble', 'Floor Tiles', 'White', 'Polished', '600x1200', 10, ['Living Room', 'Bedroom', 'Bathroom', 'Commercial'], 'Warm white ground, fine grey and gold veining.'],
  ['M02', 'Statuario Veil', 'Marble', 'Wall Tiles', 'White', 'Matt', '600x600', 9, ['Bathroom', 'Kitchen', 'Living Room'], 'A pale, veiled marble for calm walls.'],
  ['M03', 'Nero Marquina', 'Marble', 'Floor Tiles', 'Black', 'Polished', '800x1600', 10, ['Living Room', 'Commercial', 'Bathroom'], 'Deep black with sharp white veining.'],
  ['M04', 'Verde Alpi', 'Marble', 'Wall Tiles', 'Green', 'Polished', '600x1200', 9, ['Bathroom', 'Living Room'], 'Forest green with pale mineral veins.'],
  ['M05', 'Azul Fiume', 'Marble', 'Bathroom Tiles', 'Blue', 'Satin', '600x600', 9, ['Bathroom', 'Kitchen'], 'Cool river-blue with a silken satin finish.'],
  ['M06', 'Crema Aurelia', 'Marble', 'Floor Tiles', 'Beige', 'Satin', '800x1600', 10, ['Living Room', 'Bedroom'], 'Creamy beige marble with a soft, honeyed glow.'],
  ['S01', 'Travertino Sand', 'Stone', 'Floor Tiles', 'Beige', 'Matt', '600x1200', 10, ['Living Room', 'Bedroom', 'Kitchen'], 'Sun-washed travertine with natural pitting.'],
  ['S02', 'Basalt Noir', 'Stone', 'Outdoor Tiles', 'Black', 'Textured', '600x600', 20, ['Outdoor', 'Commercial'], 'Dark volcanic texture with a secure, anti-slip grip.'],
  ['S03', 'Sandstone Dune', 'Stone', 'Outdoor Tiles', 'Beige', 'Textured', '600x600', 20, ['Outdoor'], 'Warm sandstone with a soft, weathered surface.'],
  ['S04', 'Slate Ridge', 'Stone', 'Bathroom Tiles', 'Grey', 'Textured', '300x300', 9, ['Bathroom', 'Outdoor'], 'Cleft slate texture in a compact format.'],
  ['C01', 'Atelier Grey', 'Concrete', 'Floor Tiles', 'Grey', 'Matt', '1200x2400', 6, ['Commercial', 'Living Room', 'Kitchen'], 'Mid-grey concrete in a statement slab format.'],
  ['C02', 'Atelier Cloud', 'Concrete', 'Floor Tiles', 'White', 'Matt', '800x1600', 10, ['Living Room', 'Commercial', 'Kitchen'], 'Light, cloudy concrete that opens up a room.'],
  ['C03', 'Atelier Graphite', 'Concrete', 'Floor Tiles', 'Black', 'Matt', '800x1600', 10, ['Commercial', 'Living Room'], 'Dense graphite concrete with quiet movement.'],
  ['C04', 'Cement Sand', 'Concrete', 'Floor Tiles', 'Beige', 'Matt', '600x1200', 10, ['Kitchen', 'Living Room', 'Bedroom'], 'A warm, sandy cement tone.'],
  ['W01', 'Oak Natural', 'Wood', 'Floor Tiles', 'Beige', 'Matt', '200x1200', 10, ['Living Room', 'Bedroom', 'Kitchen'], 'Light natural oak with a gentle, open grain.'],
  ['W02', 'Oak Smoked', 'Wood', 'Floor Tiles', 'Brown', 'Textured', '200x1200', 10, ['Living Room', 'Bedroom', 'Commercial'], 'Smoked oak with a brushed, tactile grain.'],
  ['W03', 'Walnut Heritage', 'Wood', 'Floor Tiles', 'Brown', 'Matt', '200x1200', 10, ['Living Room', 'Bedroom'], 'Rich, dark walnut with pronounced character.'],
  ['W04', 'Ash Whitewash', 'Wood', 'Floor Tiles', 'White', 'Matt', '200x1200', 10, ['Bedroom', 'Living Room', 'Kitchen'], 'Whitewashed ash, airy and Scandinavian.'],
  ['T01', 'Venezia Chiara', 'Terrazzo', 'Floor Tiles', 'White', 'Polished', '600x600', 10, ['Living Room', 'Kitchen', 'Commercial'], 'Pale ground with warm stone chips.'],
  ['T02', 'Venezia Terra', 'Terrazzo', 'Floor Tiles', 'Beige', 'Polished', '600x600', 10, ['Living Room', 'Bedroom', 'Commercial'], 'Earthy clay ground with cream and umber chips.'],
  ['T03', 'Venezia Notte', 'Terrazzo', 'Floor Tiles', 'Black', 'Polished', '600x600', 10, ['Commercial', 'Living Room'], 'Midnight ground with bright scattered chips.'],
  ['T04', 'Laguna Mist', 'Terrazzo', 'Wall Tiles', 'Blue', 'Satin', '600x600', 9, ['Bathroom', 'Kitchen'], 'Misty blue terrazzo for fresh feature walls.'],
  ['X01', 'Brushed Pewter', 'Metal', 'Wall Tiles', 'Grey', 'Satin', '600x1200', 9, ['Commercial', 'Kitchen', 'Bathroom'], 'Fine-brushed pewter with a soft sheen.'],
  ['X02', 'Bronze Patina', 'Metal', 'Wall Tiles', 'Brown', 'Satin', '600x600', 9, ['Commercial', 'Living Room'], 'Aged bronze with a hint of green patina.'],
];

const FEATURED = ['M01', 'W01', 'C01', 'T01'];

const slipFor = (finish, category) => {
  if (category === 'Outdoor Tiles') return 'R11';
  return { Polished: 'R9', Satin: 'R9', Matt: 'R10', Textured: 'R11' }[finish] || 'R10';
};

export const PRODUCTS = RAW.map(([key, name, look, category, color, finish, size, thickness, application, tagline], i) => ({
  id: `TILE-${String(i + 1).padStart(3, '0')}`,
  code: `HT-${key}`,
  name,
  collection: COLLECTIONS[look].name,
  look,
  category,
  color,
  finish,
  size,
  thickness,
  application,
  tagline,
  description: `${tagline} ${LOOK_COPY[look]}`,
  image: `images/tile-${key.toLowerCase()}.webp`,
  imageSm: `images/tile-${key.toLowerCase()}-sm.webp`,
  featured: FEATURED.includes(key),
  added: i + 1,
  specs: {
    Material: 'Glazed porcelain',
    Rectified: 'Yes',
    'Water absorption': '< 0.5%',
    'Slip resistance': slipFor(finish, category),
    'Frost resistant': category === 'Outdoor Tiles' ? 'Yes' : 'Indoor use',
    'Variation': look === 'Concrete' ? 'V2, slight' : 'V3, moderate',
  },
}));

export const fmtSize = (s) => s.replace('x', ' × ');
export const byId = (id) => PRODUCTS.find((p) => p.id === id);
export const byKey = (key) => PRODUCTS.find((p) => p.code === `HT-${key}`);
export const sceneFor = (p) => APPLICATION_SCENES[p.application[0]];
export const unique = (key) => [...new Set(PRODUCTS.flatMap((p) => p[key]))];
