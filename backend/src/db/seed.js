import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

const img = (name) => `/uploads/media/${name}.svg`;
const day = (day, title, description) => ({ day, title, description });

const categories = [
  ['Nepal Trekking', 'nepal-trekking', null],
  ['Nepal Tours', 'nepal-tours', null],
  ['Peak Climbing', 'peak-climbing', null],
];

const packages = [
  {
    title: 'Everest Base Camp Trek',
    slug: 'everest-base-camp-trek',
    cat: 'nepal-trekking',
    price: 1450,
    duration: '14 Days',
    grade: 'Moderate',
    featured: true,
    short: 'Trek to the foot of the world\u2019s highest mountain through Sherpa villages, rhododendron forests and the famous Khumbu glacier.',
    full: `The Everest Base Camp Trek is the trek of a lifetime. Flying into Lukla, we follow the Dudh Koshi river through Phakding and Namche Bazaar, the gateway of Sherpa country. Each day brings the peaks closer: Ama Dablam, Lhotse and finally Everest herself. We spend a full day at Namche to acclimatise, visit the Khumbu's oldest monastery at Tengboche, then continue through Dingboche, Lobuche and Gorak Shep. A dawn hike to Kala Patthar (5,545m) rewards us with the most famous mountain view in the world, and a trek onto the Khumbu glacier takes us to Everest Base Camp itself. This journey is as cultural as it is physical, and our local guides bring the Sherpa story to life at every step.`,
    itinerary: [
      day(1, 'Arrival in Kathmandu', 'Meet your guide at the airport, transfer to your hotel in Thamel. Evening briefing on the trek and a gear check.'),
      day(2, 'Scenic flight to Lukla \u2013 trek to Phakding', 'Fly to Lukla (2,840m), then a relaxed 3\u20134 hour walk downhill along the Dudh Koshi river to Phakding.'),
      day(3, 'Trek to Namche Bazaar', 'Steep climb through pine and rhododendron forest to Namche Bazaar (3,440m), the Sherpa gateway of the Khumbu.'),
      day(4, 'Acclimatisation day at Namche', 'Day walk to Syangboche airstrip and the Everest View Hotel for the first close views of Everest, plus an optional hike to Khumjung village.'),
      day(5, 'Trek to Tengboche', 'Forest trail descending to the Dudh Koshi before climbing to Tengboche monastery (3,860m), the largest in the Khumbu.'),
      day(6, 'Trek to Dingboche', 'Follow the river valley past Pangboche village and climb through mani walls and yak pastures to Dingboche (4,410m).'),
      day(7, 'Acclimatisation day at Dingboche', 'Optional hike to the ridge above Dingboche for views of Lhotse, Makalu and Island Peak, plus a short ice-axe lesson.'),
      day(8, 'Trek to Lobuche', 'Cross the memorial hill of the Dudh Koshi valley on the way to Lobuche (4,930m).'),
      day(9, 'Trek to Gorak Shep \u2013 Everest Base Camp', 'Morning walk to Gorak Shep, then continue over the Khumbu glacier to Everest Base Camp (5,364m) and back for the night.'),
      day(10, 'Sunrise at Kala Patthar \u2013 trek to Pheriche', 'Pre-dawn climb to Kala Patthar (5,545m) for sunrise over Everest and Nuptse, then descend to Pheriche.'),
      day(11, 'Trek back to Namche', 'Descend through the pine forest to Namche Bazaar, marking the start of the journey home.'),
      day(12, 'Trek to Lukla', 'Final trekking day via Phakding, with a celebration dinner in Lukla.'),
      day(13, 'Fly back to Kathmandu', 'Morning flight to Kathmandu, with a farewell dinner with the whole team.'),
      day(14, 'Departure day', 'Transfer to the airport for your international flight, or continue with one of our Nepal tours.'),
    ],
    includes: [
      'Airport transfers and hotel in Kathmandu on a B&B basis',
      'Domestic flights Kathmandu\u2013Lukla\u2013Kathmandu with airport taxes',
      'Teahouse accommodation throughout the trek with 3 meals a day',
      'Licensed English-speaking trekking guide and required number of porters',
      'Porter wages, food and insurance covered by Trekking with Rabin',
      'All necessary trekking permits (Sagarmatha National Park, Khumbu village)',
    ],
    excludes: [
      'Nepal entry visa (US$50) and international flights',
      'Travel insurance (required, incl. helicopter evacuation cover)',
      'Lunch and dinner in Kathmandu',
      'Personal trekking gear and tips for guide and porter',
    ],
    dates: [
      { date: '2026-03-10', price: 1450, available: true },
      { date: '2026-04-12', price: 1450, available: true },
      { date: '2026-05-03', price: 1550, available: true },
      { date: '2026-10-29', price: 1450, available: false },
    ],
    gallery: [img('everest-base-camp'), img('chola-pass'), img('hero-everest')],
    map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3547.0!2d86.9256!3d27.9416!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0!2zMjfCsDU2JzI5LjgiTiA4NsKwNTUnMzIuMiJF!5e0!3m2!1sen!2snp!4v1700000000000',
  },
  {
    title: 'Annapurna Base Camp Trek',
    slug: 'annapurna-base-camp-trek',
    cat: 'nepal-trekking',
    price: 1150,
    duration: '10 Days',
    grade: 'Moderate',
    featured: true,
    short: 'Walk through Gurung villages, bamboo forests and alpine meadows into the iconic amphitheatre of the Annapurna Sanctuary.',
    full: `Few journeys match the drama of the Annapurna Base Camp trek. We begin in the heartland of the Gurung people, crossing rice terraces and rhododendron forest before the climb through the Modi Khola canyon. Towering cliffs give way to the wilderness of the Sanctuary, and finally to the massive amphitheatre of Annapurna I, Gangapurna, Machapuchare and Hiunchuli. The route above ABC is a classic once-in-a-lifetime destination that combines immersion in rural Nepali life with high-altitude wilderness.`,
    itinerary: [
      day(1, 'Arrive Kathmandu \u2013 drive to Pokhara', 'Short sightseeing in Kathmandu, then the famous 7-hour drive to Pokhara (820m) alongside rivers and terraces.'),
      day(2, 'Drive to Nayapul, trek to Ulleri', 'Short drive from Pokhara, then trek through bamboo forest and stone stair literally carved from the Himalaya to Ulleri (2,050m).'),
      day(3, 'Trek to Ghorepani', 'Climb the classic staircase of 3,300 stone steps past Magar villages into the pine forests of Ghorepani.'),
      day(4, 'Sunrise at Poon Hill \u2013 trek to Tadapani', 'Dawn climb to Poon Hill (3,210m) for sunrise over the Annapurnas and Dhaulagiri, then descend to Tadapani.'),
      day(5, 'Trek to Chomrong', 'Walk through rhododendron and oak forest to Chomrong (2,170m), the gateway to the Sanctuary.'),
      day(6, 'Trek to Dovan', 'Descend to the Chomrong river and climb through moss-hung forest to Dovan.'),
      day(7, 'Trek to Machapuchare Base Camp', 'Follow the Modi Khola through alpine meadows to Machapuchare Base Camp (3,700m), below the fish-tail peak.'),
      day(8, 'Trek to Annapurna Base Camp', 'The iconic forest of the Sanctuary opens onto the vast amphitheatre of Annapurna Base Camp (4,130m).'),
      day(9, 'Sunrise at ABC \u2013 trek to Bamboo', 'Sunrise on the full amphitheatre, then a long descent through the forest to Bamboo.'),
      day(10, 'Trek to Nayapul \u2013 drive to Pokhara', 'Final descent to Nayapul, then drive back to Pokhara for a well-earned rest.'),
    ],
    includes: [
      'Kathmandu\u2013Pokhara return transfers by tourist coach',
      'Guided trek with licensed English-speaking guide',
      'Teahouse accommodation and meals while on the trail',
      'ACAP permit and TIMS card',
      'Porters for luggage (max 12 kg) with full insurance',
    ],
    excludes: [
      'Hotels in Kathmandu and Pokhara (can be added on request)',
      'International flights and Nepal visa',
      'Travel insurance, tips and personal expenses',
    ],
    dates: [
      { date: '2026-03-05', price: 1150, available: true },
      { date: '2026-04-18', price: 1150, available: true },
      { date: '2026-09-27', price: 1250, available: true },
      { date: '2026-11-08', price: 1150, available: false },
    ],
    gallery: [img('annapurna-base-camp'), img('annapurna-sunrise'), img('hero-annapurna')],
    map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.0!2d83.8047!3d28.4179!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0!5e0!3m2!1sen!2s!4v1700000000000',
  },
  {
    title: 'Langtang Valley Trek',
    slug: 'langtang-valley-trek',
    cat: 'nepal-trekking',
    price: 850,
    duration: '7 Days',
    grade: 'Easy-Moderate',
    featured: true,
    short: 'A short, high-altitude trek into Langtang National Park — yak pastures, glacier valleys and the warm culture of the Tamang people.',
    full: `The Langtang Valley is the most accessible of Nepal's classic high-altitude treks and the homeland of the Tamang people. From Kathmandu, you cross the fertile hills of Helambu into the deep canyon of the Langtang Khola river, surrounded by the peaks of Langtang Lirung and Peruru. The trail was devastated by the 2015 earthquake and has been lovingly rebuilt by the local community — trekking here is also a way to support responsible reconstruction.`,
    itinerary: [
      day(1, 'Drive Kathmandu to Syabrubesi', 'A scenic 7-hour drive climbs the Trishuli Valley to Syabrubesi (1,550m), the trailhead.'),
      day(2, 'Trek to Lama Hotel', 'Cross the Bhote Koshi and climb through dense forest along the Langtang river to Lama Hotel.'),
      day(3, 'Trek to Langtang village', 'Trek through rhododendron forest, yak meadows and the reconstructed village of Langtang.'),
      day(4, 'Trek to Kyanjin Gompa', 'Follow the wide glacial valley floor to Kyanjin Gompa (3,870m), below Langtang Lirung.'),
      day(5, 'Acclimatisation at Kyanjin Gompa', 'Optional hike to Kyanjin Ri (4,773m) for 360\u00b0 views of the Langtang massif, and the cheese factory.'),
      day(6, 'Trek back to Lama Hotel', 'Long, gentle descent through forest back to Lama Hotel.'),
      day(7, 'Trek to Syabrubesi \u2013 drive to Kathmandu', 'Morning walk to Syabrubesi, then return drive to Kathmandu, arriving in the late afternoon.'),
    ],
    includes: [
      'Transfers Kathmandu\u2013Syabrubesi\u2013Kathmandu in tourist bus',
      'Teahouse accommodation and meals with trek guide',
      'Langtang National Park entry permit and TIMS',
      'Experienced English-speaking trek leader and porters',
    ],
    excludes: [
      'Kathmandu hotel nights and visa fee',
      'International flights, insurance, tips and personal expenses',
    ],
    dates: [
      { date: '2026-02-20', price: 850, available: true },
      { date: '2026-04-25', price: 850, available: true },
      { date: '2026-10-04', price: 950, available: true },
    ],
    gallery: [img('langtang-valley'), img('hero-langtang')],
    map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7291.0!2d85.5621!3d28.2058!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0!3z3!4v1700000000000',
  },
  {
    title: 'Manaslu Circuit Trek',
    slug: 'manaslu-circuit-trek',
    cat: 'nepal-trekking',
    price: 1950,
    duration: '16 Days',
    grade: 'Challenging',
    short: 'A remote, wild circuit of the eighth-tallest mountain on Earth, crossing the high Larkya La pass through unchanged Himalayan villages.',
    full: `The Manaslu Circuit is one of the last great untouched trekking circuits in the Himalaya. Beginning in the peaceful Machha Khola valley, the trail crosses the wild river gorges of the Budhi Gandaki, climbs through forested slopes into the Tibetan-flavoured villages of Lho and Samagaon, and finally crosses the high Larkya La pass (5,106m) into the glacial Dudh Khola valley. Because much of the area is restricted, the path remains quiet and the culture strikingly intact. The reward is big — this is the trail for trekkers ready for a true wilderness circuit, with our itinerary carefully planned for acclimatisation.`,
    itinerary: [
      day(1, 'Arrive Kathmandu', 'Airport transfer, gear check and trip briefing.'),
      day(2, 'Drive to Soti Khola', 'A full valley day along the Budi Gandaki gorge to the trailhead at Soti Khola.'),
      day(3, 'Trek to Machha Khola', 'Cross the river via suspension bridges beside waterfalls and hot springs.'),
      day(4, 'Trek to Yaruphat / Jagat', 'Walk the gorge walls and climb gradually to the old customs post at Jagat (1,380m).'),
      day(5, 'Trek to Ghap', 'A green forest day, with first views of Manaslu North.'),
      day(6, 'Trek to Namrung', 'Climb through villages of the embankments of the young Manaslu slopes to Namrung (2,540m).'),
      day(7, 'Trek to Samagaon', 'Wild, increasingly Tibetan landscape of buckwheat and mani walls up to Samagoon (3,530m).'),
      day(8, 'Rest / acclimatisation at Samagaon', 'Hike towards Manaslu Base Camp or the ridge.'),
      day(9, 'Trek to Samdo', 'Short day carrying supplies across the grazing valleys to Samdo (3,875m).'),
      day(10, 'Rest day at Samdo', 'Acclimatisation walk up the East Ridge for views of Larkya Peak.'),
      day(11, 'Trek to Dharmasala (Larkya Dovan)', 'Cross the moraine ballow to the foot of the pass at Larkya (4,460m).'),
      day(12, 'Cross Larkya La (5,106m) \u2013 trek to Bimthang', 'Dawn start over the pass into the glacial basin, past the tannic lakes, to Bimthang (3,720m).'),
      day(13, 'Trek to Tilje', 'Follow the Dudh Khola gorge and climb the final forest ridge to Tilje (2,300m).'),
      day(14, 'Trek to Thonje / Dharapani', 'Descend through the last forests into the Annapurna region.'),
      day(15, 'Trek to Besi Sahar \u2013 drive to Kathmandu', 'Final easy walk and evening drive back to Kathmandu.'),
      day(16, 'Departure day', 'Airport transfer for your international flight.'),
    ],
    includes: [
      'Accommodation in teahouses and 3 meals per day on the trek',
      'Licensed English-speaking guide, note trekkers and personal costs',
      'Special Restricted Area permit, ACAP and TIMS',
      'Emergency oxygen for above 3,500m and comprehensive first aid kit',
      'All necessary local transportation (private vehicle)',
    ],
    excludes: [
      'International flights and Nepal visa',
      'Meals in Kathmandu, drinks on the trek',
      'Travel insurance, tips and extra nights',
    ],
    dates: [
      { date: '2026-04-23', price: 1950, available: true },
      { date: '2026-10-08', price: 2150, available: true },
    ],
    gallery: [img('manaslu-circuit'), img('hero-annapurna')],
    map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9651.0!2d84.6!3d28.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0!2z!4v1700000000000',
  },
  {
    title: 'Everest Panorama Tour',
    slug: 'everest-panorama-tour',
    cat: 'nepal-tours',
    price: 650,
    duration: '5 Days',
    grade: 'Easy',
    featured: true,
    short: 'A comfortable sampler of the Khumbu with guaranteed Everest views — ideal for first-timers, families and big mountain scenery.',
    full: `The Everest Panorama Tour packages the best and easiest views of Everest into a few unhurried days. A scenic flight to Lukla landing at the world's most famous little airstrip, gentle walks around the forest ridges of the Khumbu, and optional vantage points like the Everest View Hotel. Family-friendly pace with full service support so you can focus on the views.`,
    itinerary: [
      day(1, 'Arrive Kathmandu', 'Airport pickup, hotel check-in and welcome dinner.'),
      day(2, 'Fly to Lukla \u2013 trek to Monjo', 'Board the mountain flight to Lukla, then a gentle warm-up walk to Monjo village.'),
      day(3, 'Trek to Namche & Everest View', 'Climb to Namche Bazaar and the Everest View Hotel for the classic panorama.'),
      day(4, 'Flight back to Kathmandu', 'Return flight to Kathmandu, free afternoon.'),
      day(5, 'Tour ends', 'Transfer to the airport or extension day options.'),
    ],
    includes: [
      'Kathmandu\u2013Lukla return flights',
      'Mountain teahouse nights on full-board basis',
      'Hotel in Kathmandu on B&B',
      'English-speaking guide throughout',
    ],
    excludes: ['Nepal visa and international tickets', 'Travel insurance, tips, extra days'],
    dates: [
      { date: '2026-03-18', price: 650, available: true },
      { date: '2026-05-14', price: 650, available: true },
    ],
    gallery: [img('everest-panorama'), img('hero-everest')],
    map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d48431!2d86.93!3d27.77!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0!4v1700000000000',
  },
  {
    title: 'Kathmandu Valley Cultural Tour',
    slug: 'kathmandu-valley-cultural-tour',
    cat: 'nepal-tours',
    price: 450,
    duration: '4 Days',
    grade: 'Easy',
    short: 'Seven UNESCO sites, centuries-old Newar craftsmanship and temple skies in the cultural heart of the Himalaya.',
    full: `The Kathmandu Valley is a living museum: three medieval capitals, seven UNESCO World Heritage sites and niches of temples hidden in everyday lanes. On this unhurried tour you'll explore the Durbar Squares of Kathmandu, Patan and Bhaktapur, the great stupas of Swayambhunath and Boudhanath, and the sacred ghats of Pashupatinath along the Bagmati river. Your guide will bring to life the rituals and craft traditions that still make this one of the world's great crossroads of culture.`,
    itinerary: [
      day(1, 'Arrive Kathmandu', 'Transfer to your hotel. Afterwards a welcome briefing over tea.'),
      day(2, 'Kathmandu Durbar Square & Swayambhunath', 'Hanuman Dhoka and the living goddess kumari, then the Swayambhunath Stupa at sunset over the valley.'),
      day(3, 'Boudhanath, Pashupatinath & Patan', 'Kora around the Boudhanath stupa, the sacred Pashupatinath ghats, and the craft streets of Patan.'),
      day(4, 'Bhaktapur & departure', 'Medieval lanes and the Palace of 55 Windows in Bhaktapur, then transfer to the airport.'),
    ],
    includes: [
      '3 nights hotel in Kathmandu on B&B',
      'Private A/C vehicle with driver and English-speaking guide',
      'All monument entry fees and city permits',
      'All arrival/departure transfers and taxes',
    ],
    excludes: ['Visa fee and international flights', 'Meals besides breakfast, tips'],
    dates: [
      { date: '2026-01-15', price: 450, available: true },
      { date: '2026-03-02', price: 450, available: true },
      { date: '2026-05-08', price: 450, available: true },
    ],
    gallery: [img('kathmandu-valley'), img('kathmandu-durbar')],
    map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12731!2d85.323!3d27.71!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0!2v1700000000000',
  },
  {
    title: 'Island Peak Climb (Imja Tse)',
    slug: 'island-peak-climb',
    cat: 'peak-climbing',
    price: 1750,
    duration: '14 Days',
    grade: 'Challenging',
    featured: true,
    short: 'A rewarding 6,189m summit in the Everest Khumbu with real climbing — the best introduction to Himalayan mountaineering.',
    full: `Island Peak rises out of the Imja glacier like a ship's hull, and is the classic "first 6,000m peak" of the Himalaya. With prior enthusiasm and reasonable fitness, our certified climbing guides will take you up through fixed lines and short rock pitches to a genuine summit reward — a 360\u00b0 dawn above the glaciers of Makalu, Lhotse, Ama Dablam and the Everest group. All climbing gear is provided; you walk in through the famous trails of the Khumbu, so it also ticks the Everest Base Camp treks off the same trip.`,
    itinerary: [
      day(1, 'Arrive Kathmandu', 'Airport pickup, hotel check-in and climbing gear check.'),
      day(2, 'Fly to Lukla \u2013 trek to Phakding', 'The famous mountain morning flight, then a gentle walk into the Khumbu.'),
      day(3, 'Trek to Namche Bazaar', 'The steep climb through lodges forest to the largest Sherpa village mountain town.'),
      day(4, 'Acclimatisation at Namche', 'Visit the Everest viewpoint and the Khumjung school.'),
      day(5, 'Trek to Tengboche', 'The monastery village in its meadow of prayer flags.'),
      day(6, 'Trek to Dingboche', 'High valley walk below the big walls of Lhotse and Ama Dablam.'),
      day(7, 'Trek to Island Peak Base Camp', 'Glacier walk across the boulders in the shadow of Islan Тse (5,000m).'),
      day(8, 'Climb to High Camp', 'Climb fixed ladders and the ropes edging the glacial tongue to High Camp (5,600m).'),
      day(9, 'Island Peak summit day', 'Summit start at 3am with headlamps; ice-sky ridge to the summit (6,189m) around sunrise.'),
      day(10, 'Buffer day (weather contingency)', 'Reserve day in case of weather — or a rest trek around the monastery.'),
      day(11, 'Trek back to Dingboche', 'Easy descent through the glacier fields.'),
      day(12, 'Trek to Tengboche \u2013 Namche', 'Re-walk the classic valleys back.'),
      day(13, 'Trek to Lukla', 'The last day on the trail, and a celebration dinner.'),
      day(14, 'Fly to Kathmandu \u2013 departure', 'Morning flight back to Kathmandu, evening departure transfer.'),
    ],
    includes: [
      'Airport transfers and ZTE partner hotels in Kathmandu (B&B)',
      'Domestic flights Kathmandu\u2013Lukla\u2013Kathmandu',
      'Trekking/tea-house & expedition camp all on full board',
      'Certified IFMGA climbing guides, all climbing and safety gear (rope, ice screws, harness, helmet, crampons, ice axe)',
      'All permits (ACAP, TIMS, climbing permit) and insurance for your crew',
    ],
    excludes: [
      'International flights and visa fee',
      'Personal clothing and climbing boots',
      'Tips and hotel nights in Kathmandu outside the itinerary',
    ],
    dates: [
      { date: '2026-04-22', price: 1750, available: true },
      { date: '2026-10-18', price: 1750, available: true },
    ],
    gallery: [img('island-peak'), img('chola-pass')],
    map: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d25671!2d86.92!3d27.93!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0!2v1700000000000',
  },
];

const blogPosts = [
  {
    title: 'The Complete Everest Base Camp Packing List',
    slug: 'everest-base-camp-packing-list',
    image: img('blog-1'),
    content: `<p>Packing for Everest Base Camp is all about layers and extremes — scorching sun at midday and minus-20\u00b0C nights. This is our field-tested list after years of guiding groups to the foot of the world.</p><h2>Your backpack</h2><p>A 40\u201360L backpack with rain cover, a 15L daypack for the summit morning, and a sleeping bag rated -15\u00b0C or warmer.</p><h2>Clothing layers</h2><p>Merino or synthetic base layers, a fleece, a true down jacket (800-fill), a hard-shell jacket for the wind of Kala Patthar, trekking trousers that convert to shorts, three pairs of good trekking socks and a warm hat for the summit mornings.</p><h2>Footwear</h2><p>Waterproof, broken-in trekking boots one size larger than your street shoes, plus liner socks. Trekking poles, a headlamp with fresh batteries, a power bank, and two 1L bottles.</p><h2>Health & documents</h2><p>SPF 50 sunscreen, lip balm, a small personal first-aid kit (plus Diamox after a doctor\u2019s consult), your passport with at least 6 months validity, and cash for the airport duty.</p><p>Ready to go? View our <a href="/packages/everest-base-camp-trek">Everest Base Camp trek</a> departures.</p>`,
    published_at: '2026-01-20',
  },
  {
    title: 'Best Time to Trek the Himalaya: A Month-by-Month Guide',
    slug: 'best-time-to-trek-himalaya-month-guide',
    image: img('blog-2'),
    published_at: '2026-01-05',
    content: `<p>Choosing the right season is half of a successful Himalaya trek. Here is our month-by-month window.</p><h2>Spring (March\u2013May)</h2><p>The classic season: rhododendron forests in flower, clear skies and comfortable daytime temperatures. Dust few but passes where the monsoon lingers. Everest Base Camp and the Annapurnas run full.</p><h2>Monsoon (June\u2013August)</h2><p>Lower trails can get jungle-green, but the high valleys of Mustang and Dolpo sit in the rain shadow, and the Kathmandu valley blooms green. Also the best time to see Bhutan in full green.</p><h2>Autumn (September\u2013November)</h2><p>The second great season: pristine post-monsoon skies and warm days. The views are almost unreal. Book early for the September\u2013October departures.</p><h2>Winter (December\u2013February)</h2><p>Cold but quiet, shocking clean and often close enough to touch. The Annapurnas and Everest are the best winter treks, with far fewer people and bright sunlight on the peaks.</p>`,
  },
  {
    title: 'Nepal Visa on Arrival: 2026 Step-by-Step Guide',
    slug: 'nepal-visa-on-arrival-guide',
    image: img('blog-3'),
    published_at: '2025-12-18',
    content: `<p>Nepal still provides visas on arrival at almost all land and air borders. Single entry: 15 days US$50, 30 days US$80, 90 days US$170.</p><h2>The application</h2><p>Fill out the arrival form online or on paper, join the line at the visa counter, and pay — the process takes 10\u201315 minutes. Keep one passport photo with you.</p><h2>Fees and payment</h2><p>USD cash is strongly preferred. The bank counter accepts major cards too. In the busy spring and autumn seasons, having USD cash gets you through faster.</p><h2>Travelling with family</h2><p>Children under 10 travel visa-free on their parents\u2019 passports. We include full airport assistance with any of our trek and tour bookings.</p>`,
  },
];

const testimonials = [
  { name: 'Sarah Mitchell', country: 'United Kingdom', rating: 5, review: 'The Everest Base Camp trek exceeded every expectation. The guides were outstanding, the teahouses warm, and the valley views were sheer perfection. I have already booked my next trip with Trekking with Rabin!', photo: '' },
  { name: 'Lukas Weber', country: 'Germany', rating: 5, review: 'Everything ran flawlessly — flights, permits, the entire Annapurna circuit. Our guide Raj turned a physical challenge into a heart-warming story. Highly recommend.', photo: '' },
  { name: 'Priya Sharma', country: 'India', rating: 5, review: 'The Kathmandu Valley tour was the perfect mix of comfort and immersion. We got to smell the monasteries, taste the café culture and feel the rhythm of the living squares.', photo: '' },
  { name: 'Daniel Okozi', country: 'United States', rating: 4, review: 'Everest Base Camp with them was the trip of my life. The only reason for not five stars — I got sick at altitude and the team handled it with total professionalism and warmth.', photo: '' },
  { name: 'Emma Larsson', country: 'Sweden', rating: 5, review: 'As a first-time trekker I felt completely supported between the porter coordination and the daily checks. The sunrise at Kala Patth was worth every step.', photo: '' },
];

const settings = {
  site_name: 'Trekking with Rabin',
  tagline: 'Your local trekking partner in Nepal',
  contact_email: 'rubhum2058@gmail.com',
  contact_phone: '9762342058, 9808047141',
  address: 'Kathmandu, Nepal',
  facebook_url: 'https://www.facebook.com/groups/615513139185784',
  linkedin_url: '',
  instagram_url: 'https://www.instagram.com/__ra_bin__/',
  whatsapp_number: '+9779762342058',
  hero_title: 'Let\u2019s Discover The World Together',
  hero_subtitle: 'Personal trekking & travel experiences across Nepal \u2014 from high passes to jungles, culture to giant mountains.',
  trust_badges: 'Small Groups \u00b7 Max 12 Trekkers \u00b7 Licensed Local Guides',
  about_intro: 'Trekking with Rabin is a personal trekking company run by Rabin, a local Nepali guide. No big agency, no hand-offs \u2014 you trek with Rabin himself and his trusted local team. Small groups, honest prices, and safety without compromise.',
  csr_text: 'Every booking supports fair wages for local guides and porters, village school projects and trail cleanup drives. Join us, travel lighter.',
};

async function main() {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query('DELETE FROM testimonials');
    await conn.query('DELETE FROM blog_posts');
    await conn.query('DELETE FROM bookings');
    await conn.query('DELETE FROM inquiries');
    await conn.query('DELETE FROM packages');
    await conn.query('DELETE FROM categories');
    await conn.query('DELETE FROM settings');
    await conn.query('DELETE FROM admin_users');

    const catIds = {};
    for (const [name, slug, parent] of categories) {
      const [r] = await conn.query('INSERT INTO categories (name, slug, parent_id) VALUES (?,?,?)', [name, slug, parent]);
      catIds[slug] = r.insertId;
    }

    for (const p of packages) {
      await conn.query(
        `INSERT INTO packages
         (title, slug, category_id, price, duration, grade, short_description, full_description, itinerary, includes, excludes, fixed_departure_dates, gallery_images, map_embed_url, status, featured)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [p.title, p.slug, catIds[p.cat], p.price, p.duration, p.grade, p.short, p.full,
         JSON.stringify(p.itinerary), JSON.stringify(p.includes), JSON.stringify(p.excludes),
         JSON.stringify(p.dates), JSON.stringify(p.gallery), p.map, 'published', p.featured ? 1 : 0]
      );
    }

    const hash = await bcrypt.hash('admin123', 10);
    await conn.query('INSERT INTO admin_users (username, password_hash, role) VALUES (?,?,?)', ['admin', hash, 'admin']);
    await conn.query('INSERT INTO admin_users (username, password_hash, role) VALUES (?,?,?)', ['editor', hash, 'editor']);

    for (const b of blogPosts) {
      await conn.query(
        'INSERT INTO blog_posts (title, slug, content, featured_image, published_at) VALUES (?,?,?,?,?)',
        [b.title, b.slug, b.content, b.featured_image, new Date(b.published_at)]
      );
    }
    for (const t of testimonials) {
      await conn.query('INSERT INTO testimonials (name, country, review, rating, photo, status) VALUES (?,?,?,?,?,?)',
        [t.name, t.country, t.review, t.rating, t.photo, 'approved']);
    }
    for (const [k, v] of Object.entries(settings)) {
      await conn.query('INSERT INTO settings (\`key\`, \`value\`) VALUES (?,?)', [k, v]);
    }

    await conn.commit();
    console.log('Seed complete: 6 categories, 10 packages, 3 blog posts, 5 testimonials, settings, 2 admin users (admin/admin123)');
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});