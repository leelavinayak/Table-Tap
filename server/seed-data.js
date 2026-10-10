const seedRestaurants = [
  {
    _id: '1',
    name: 'The Velvet Bistro',
    location: 'SoHo, New York',
    category: 'Fine Dining',
    description: 'Upscale dining environment utilizing unobtrusive tabletop tablets for supplemental course selection and cellar reserve vintages.',
    rating: '4.9 (1.2k reviews)',
    tables: '42 Tables Connected',
    metricLabel: 'Average reorder speed',
    metricValue: '2.1 minutes',
    badge: 'French & Italian Bistro',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80'
  },
  {
    _id: '2',
    name: 'Omakase Slate & Bar',
    location: 'Hayes Valley, SF',
    category: 'Sushi',
    description: 'Intimate wood-counter dining where guests order rare Japanese whiskey pairings and supplemental nigiri pieces without breaking chef dialogue.',
    rating: '4.95 (840 reviews)',
    tables: '28 Counter Seats Live',
    metricLabel: 'Drink reorder volume',
    metricValue: '+44% per cover',
    badge: 'Artisanal Japanese & Bar',
    image: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&q=80'
  },
  {
    _id: '3',
    name: 'The Hopyard Craft Grill',
    location: 'East Austin, TX',
    category: 'Brewery',
    description: 'High-capacity dual-level beer garden eliminating bar lines. Groups order shared appetizer trays and cold IPA pitchers straight from table taps.',
    rating: '4.8 (3.1k reviews)',
    tables: '64 Tables & Patio',
    metricLabel: 'Missed rounds on rush hours',
    metricValue: '0% (Zero bar queues)',
    badge: 'Brewery & Gourmet Grill',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80'
  }
];

const seedMenu = [
  { name: 'Peroni Nastro Azzurro', price: 9 },
  { name: 'San Pellegrino Sparkling', price: 6 },
  { name: 'Truffle Tagliolini', price: 28 },
  { name: 'Negroni Classico', price: 16 }
];

module.exports = { seedRestaurants, seedMenu };
