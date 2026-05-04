/* global React */
// Sample course data sourced from the screenshots provided by the user.
// Real NZ courses, plausible amenity mixes for motorhome stays.

const COURSES = [
  {
    id: 'akarana',
    name: 'Akarana Golf Club',
    region: 'Auckland',
    rating: 4.4, reviews: 708,
    sites: 4, price: 25,
    stayType: 'pay-stay-play',          // overnight allowed, pay
    power: true, dogs: false, askAhead: true,
    photo: 'linear-gradient(165deg, #6B8B5A 0%, #3F6B4A 50%, #1F4530 100%)',
    photoAccent: 'linear-gradient(180deg, transparent 40%, rgba(29,53,87,0.25) 100%)',
    coords: { x: 60, y: 22 },           // % position on NZ silhouette
    address: '1388 Great North Rd, Auckland',
    blurb: 'Sweeping inner-city links a short drive from the harbour bridge.',
  },
  {
    id: 'akaroa',
    name: 'Akaroa Golf Club',
    region: 'Canterbury',
    rating: 4.7, reviews: 34,
    sites: 6, price: 0,
    stayType: 'free-with-fees',
    power: false, dogs: true, askAhead: false,
    photo: 'linear-gradient(160deg, #A8C8DC 0%, #6FA08A 50%, #3F6B4A 100%)',
    photoAccent: 'linear-gradient(180deg, transparent 40%, rgba(29,53,87,0.25) 100%)',
    coords: { x: 50, y: 70 },
    address: '116 Long Bay Rd, Akaroa',
    blurb: 'Coastal nine-holer overlooking the harbour. Quiet on weekdays.',
  },
  {
    id: 'alexandra',
    name: 'Alexandra Golf Club',
    region: 'Otago',
    rating: 4.5, reviews: 64,
    sites: 8, price: 20,
    stayType: 'pay-stay-no-play',
    power: true, dogs: true, askAhead: false,
    photo: 'linear-gradient(160deg, #C8B985 0%, #8B9F4A 60%, #4F5F2D 100%)',
    photoAccent: 'linear-gradient(180deg, transparent 40%, rgba(29,53,87,0.25) 100%)',
    coords: { x: 38, y: 82 },
    address: '21 Dunorling St, Alexandra',
    blurb: 'Tussock-and-thyme inland course in the Central Otago basin.',
  },
  {
    id: 'allangrange',
    name: 'Allan Grange Golf Club',
    region: 'Otago',
    rating: null, reviews: 0,
    sites: 3, price: 0,
    stayType: 'donation',
    power: false, dogs: true, askAhead: true,
    photo: 'linear-gradient(160deg, #ADBFAA 0%, #6F8A6E 60%, #3F4F3F 100%)',
    photoAccent: 'linear-gradient(180deg, transparent 40%, rgba(29,53,87,0.25) 100%)',
    coords: { x: 36, y: 80 },
    address: 'Old Dunstan Rd, Maniototo',
    blurb: 'Hidden country nine. Honesty box at the gate.',
  },
  {
    id: 'amberley',
    name: 'Amberley Golf Club',
    region: 'Canterbury',
    rating: 4.7, reviews: 118,
    sites: 5, price: 25,
    stayType: 'pay-stay-play',
    power: true, dogs: true, askAhead: false,
    photo: 'linear-gradient(160deg, #7FA98D 0%, #3F7A5A 60%, #1F4530 100%)',
    photoAccent: 'linear-gradient(180deg, transparent 40%, rgba(29,53,87,0.25) 100%)',
    coords: { x: 48, y: 67 },
    address: 'Carters Rd, Amberley',
    blurb: 'Mature fairways an hour north of Christchurch. Powered sites behind the clubhouse.',
  },
  {
    id: 'amuri',
    name: 'Amuri Golf Club',
    region: 'Canterbury',
    rating: 4.4, reviews: 16,
    sites: 4, price: 15,
    stayType: 'pay-stay-no-play',
    power: false, dogs: true, askAhead: true,
    photo: 'linear-gradient(160deg, #B5C68F 0%, #7A9050 60%, #3F4F2D 100%)',
    photoAccent: 'linear-gradient(180deg, transparent 40%, rgba(29,53,87,0.25) 100%)',
    coords: { x: 47, y: 64 },
    address: 'Hanmer Springs Rd, Culverden',
    blurb: 'Wide rural fairways with the Hanmer ranges behind.',
  },
  {
    id: 'matarangi',
    name: 'The Dunes Matarangi Golf Club',
    region: 'Waikato',
    rating: 4.8, reviews: 211,
    sites: 10, price: 35,
    stayType: 'pay-stay-play',
    power: true, dogs: false, askAhead: true,
    photo: 'linear-gradient(160deg, #C7E29A 0%, #6FA08A 50%, #2D5F3F 100%)',
    photoAccent: 'linear-gradient(180deg, transparent 40%, rgba(29,53,87,0.25) 100%)',
    coords: { x: 64, y: 24 },
    address: '741 Matarangi Drive, Matarangi 3592',
    blurb: 'A links course laid into the dunes of the Coromandel coast.',
  },
  {
    id: 'whangamata',
    name: 'Whangamatā Golf Club',
    region: 'Bay of Plenty',
    rating: 4.6, reviews: 92,
    sites: 6, price: 25,
    stayType: 'pay-stay-play',
    power: true, dogs: true, askAhead: false,
    photo: 'linear-gradient(160deg, #6FA08A 0%, #2D5F3F 60%, #1F4530 100%)',
    photoAccent: 'linear-gradient(180deg, transparent 40%, rgba(29,53,87,0.25) 100%)',
    coords: { x: 65, y: 28 },
    address: 'Tairua Rd, Whangamatā',
    blurb: 'Nine-hole coastal course a short walk from the surf beach.',
  },
  {
    id: 'paraparaumu',
    name: 'Paraparaumu Beach Golf',
    region: 'Wellington',
    rating: 4.9, reviews: 156,
    sites: 4, price: 30,
    stayType: 'pay-stay-play',
    power: true, dogs: false, askAhead: true,
    photo: 'linear-gradient(160deg, #B7D4D8 0%, #5A8FA8 60%, #2A4F6B 100%)',
    photoAccent: 'linear-gradient(180deg, transparent 40%, rgba(29,53,87,0.25) 100%)',
    coords: { x: 58, y: 50 },
    address: 'Kāpiti Rd, Paraparaumu',
    blurb: 'World-ranked links. Powered overflow available off-peak.',
  },
];

const REGIONS = [
  'All regions', 'Northland', 'Auckland', 'Waikato', 'Bay of Plenty',
  'Hawke\u2019s Bay', 'Taranaki', 'Manawatū-Whanganui', 'Wellington',
  'Nelson · Tasman', 'Marlborough', 'West Coast', 'Canterbury',
  'Otago', 'Southland', 'Fiordland',
];

const STAY_TYPES = [
  { id: 'free-with-fees',    label: 'Free with green fees',  sub: 'Stay free if you pay green fees' },
  { id: 'pay-stay-no-play',  label: 'Pay to stay (no play)', sub: 'Allowed without playing — paid' },
  { id: 'pay-stay-play',     label: 'Pay to stay & play',    sub: 'Stay with golf — paid' },
  { id: 'donation',          label: 'Donation accepted',     sub: 'Honesty-box style' },
];

const AMENITIES = [
  { id: 'power',    label: 'Powered sites', sub: 'Electrical hookup available' },
  { id: 'dogs',     label: 'Dogs OK',       sub: 'Dogs are welcome' },
  { id: 'askAhead', label: 'Ask/Book ahead',sub: 'Need to contact course first' },
];

window.COURSES = COURSES;
window.REGIONS = REGIONS;
window.STAY_TYPES = STAY_TYPES;
window.AMENITIES = AMENITIES;
