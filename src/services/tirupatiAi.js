import { callGroqAi, isGroqEnabled } from "./aiProvider";
import { getOptimalVisitWindow, predictWaitTimeHours } from "./predictionService";

const hasValidKey = isGroqEnabled();

const GLOBAL_MISSION_GRID = [
   { id: 'temple', name: 'Srivari Temple', coords: [13.6833, 79.3474], type: 'core' },
   { id: 'mahadwaram', name: 'Mahadwaram', coords: [13.6831, 79.3476], type: 'indoor' },
   { id: 'vqc2', name: 'VQC-2 (General)', coords: [13.6850, 79.3480], type: 'queue' },
   { id: 'alipiri', name: 'Alipiri Mettu', coords: [13.6500, 79.4000], type: 'gate' },
   { id: 'srivari_mettu', name: 'Srivari Mettu', coords: [13.6080, 79.4520], type: 'gate' },
   { id: 'PAC1', name: 'PAC-1 (Srinivasam)', coords: [13.6285, 79.4215], type: 'pac' },
   { id: 'PAC2', name: 'PAC-2 (Vishnu Nivasam)', coords: [13.6280, 79.4195], type: 'pac' },
   { id: 'PAC3', name: 'PAC-3 (Alipiri)', coords: [13.6505, 79.4005], type: 'pac' },
   { id: 'PAC4', name: 'PAC-4 (Madhavan)', coords: [13.6295, 79.4175], type: 'pac' },
   { id: 'PAC5', name: 'PAC-5 (Venkatadri)', coords: [13.6840, 79.3510], type: 'pac' },
   { id: 'tiruchanoor', name: 'Tiruchanoor Ammavari', coords: [13.6080, 79.4520], type: 'temple' },
   { id: 'govindaraja', name: 'Sri Govindaraja Swamy', coords: [13.6300, 79.4150], type: 'temple' },
   { id: 'kapila_theertham', name: 'Kapila Theertham', coords: [13.6496, 79.4184], type: 'temple' },
   { id: 'railway_station', name: 'Tirupati Station', coords: [13.6276, 79.4190], type: 'station' },
   { id: 'bus_stand', name: 'Alipiri Bus Complex', coords: [13.6490, 79.4010], type: 'transit' },
   { id: 'priority_counter', name: 'Priority Darshan Counter (Seniors)', coords: [13.6828, 79.3470], type: 'health' },
   { id: 'medical_center', name: 'Main Medical Center', coords: [13.6845, 79.3505], type: 'health' }
];

// GRAND SACRED KNOWLEDGE DATABASE — COMPREHENSIVE PILGRIMAGE INTELLIGENCE
const SACRED_KNOWLEDGE = {
   darshan: {
      'SSD': 'Slotted Sarva Darshan (Free Slot). Token from Tirupati city counters. Wait: 2-4 hours. Token counters open 6AM at Alipiri, PAC-1, PAC-2, PAC-3.',
      'SED': 'Special Entry Darshan (Rs. 300). Book online at tirupatibalaji.ap.gov.in. Wait: 30-90 mins. Bring printout + ID.',
      'DIVYA': 'Divya Darshan. 100% FREE. Only for foot pilgrims who climb Alipiri (3550 steps) or Srivari Mettu. No booking needed.',
      'SARVA': 'Free Sarvadarshan for ALL pilgrims. No ticket. No booking. Direct queue at VQC. Wait: 6-22 hours.',
      'VIP': 'VIP / Seva Pass / Donor Pass (Rs.1500+). Entry near Mahadwaram. Wait: 15-30 mins. Book at TTD counters only.',
      'SUPRABHATA': 'Suprabhata Seva: Early morning 3AM. Ticket: Rs.500. Online booking mandatory. Limited 90 seats.',
      'THOMALA': 'Thomala Seva: 3:30AM. Flower garland offering. Rs.500.',
      'KALYANOTSAVAM': 'Sacred Marriage of the Lord. Daily 10AM. Rs.750. Couples allowed.'
   },
   laddu_intelligence: {
      'FREE_QUOTA': '1 free laddu per pilgrim completing darshan. Collected at Srivari Seva Sadan.',
      'PAID_LADDU': 'Exceeding quota laddus: Rs.50 each. Token required from counters behind the temple.',
      'UPI_KIOSKS': 'NEW: Digital kiosks installed at all 48 counters. Scan UPI to buy laddus instantly. No cash needed.'
   },
   sacred_spots: {
      'TEERTHAMS': 'Akasa Ganga (hot springs), Papavinasam (curse removal), Silathoranam (natural arch).',
      'LOCAL': 'Kapila Theertham (at hill base), Govindaraja Swamy (city center), Padmavathi Temple (Tiruchanoor).'
   },
   priority_protocol: {
      who_is_eligible: 'Senior Citizens (65+ years), Differently Abled (Divyang), and Heart Patients with medical proof.',
      id_documents: 'MANDATORY: Original Aadhar Card + Age Proof. For medical priority: Original Discharge Summary / Medical Certificate.',
      process: '1. Report to the Special Entry Gate near Mahadwaram (Priority Counter). 2. Verification of documents. 3. Rs. 300 SED ticket price applies. 4. Direct entry with minimum walk (wheelchairs available).',
      timings: 'Daily across 2 slots: 10:00 AM and 03:00 PM. Arrive 1 hour early.',
      checkpoints: 'Wheelchair assistance is FREE. Do not pay anyone for skip-queue. TTD staff will assist personally.'
   },
   medical_sos: 'Emergency Ambulance: 108. TTD Main Hospital: 0877-2234567. Medical centers at PAC-1, 2, 3 and inside VQC.',
   facilities: {
      toilets: 'Free clean toilets at every PAC and queue checkpoint. Open 24 hours.',
      wheelchair: 'Wheelchairs and priority darshan for senior citizens (65+) and differently-abled. Apply at Priority Counter node on map.',
      baby_care: 'Baby care rooms at PAC-1, PAC-2, PAC-3. Free feeding and changing facilities.',
      lost_found: 'Lost & Found: Tirumala Police Station. TTD Help Desk at each PAC. Phone: 0877-2264444.',
      atm: 'ATMs at PAC-1, PAC-2, Brahmin street, near Mahadwaram. SBI, Canara, Andhra Bank.',
      mobile_charging: 'Free mobile charging points at all PAC complexes. Carry your own cable.'
   },
   head_tonsure: {
      meaning: 'Mottai (Tonsure) offered as a sacred vow to Lord Venkateswara. Hair = ego, Tonsure = surrender.',
      location: 'Kalyana Katta (Tonsure Hall): Near PAC-2, Vishnu Nivasam area. Open 5AM-11PM.',
      cost: 'Completely FREE at TTD Kalyana Katta. Blade + service included. No tips needed.',
      process: 'Queue: 30-60 mins usually. Barbers for men, women, and children available.'
   },
   best_time: {
      months: 'October-February: Best weather (18-25°C), smaller crowds.',
      avoid: 'Avoid: April-June (35-40°C heat). Brahmotsavam September (1 lakh+ per day). Vaikuntha Ekadasi December (5 lakh pilgrims!).',
      days: 'Tuesday-Thursday least crowded. Avoid Friday, Saturday, Sunday.',
      arrival: 'Arrive 3AM-5AM for shortest queue. Weekday morning arrivals are ideal.'
   },
   what_to_carry: {
      must: 'Aadhar card (MANDATORY), photo ID, SED/SSD ticket printout if applicable.',
      clothing: 'Traditional dress as per dress code. Extra pair of clothes. Light sweater for early morning.',
      others: 'Water bottle, light snacks, small bag (no large luggage), cash Rs.500-1000.',
      dont_carry: 'Leather items, alcohol, non-veg food, camera near sanctum, sharp objects.'
   },
   helplines: {
      ttd_main: '0877-2264444',
      toll_free: '1800-425-1333 (Toll Free 24/7)',
      emergency: '0877-2264541',
      police: '0877-2234100 (Tirumala Police)',
      ambulance: '108',
      ap_tourism: '1800-425-2121',
      website: 'tirupatibalaji.ap.gov.in | tirumala.org'
   },
   routes: {
      'ALIPIRI_GHAT': '18km uphill via First Ghat Road. 45-60 mins by vehicle.',
      'ALIPIRI_FOOT': '9km uphill (3550 steps). 3-4 hours by foot. Recommended for Divya Darshan.',
      'METTU_FOOT': '2.1km steep climb. 1-2 hours by foot. Recommended for speed.',
      'SECOND_GHAT': 'Second Ghat Road: 20km, one-way down only for vehicles.'
   },
   emergency_exit: {
      from_tirumala_hill: {
         to_bus_station: 'From Tirumala: Take TTD Free Bus from Vishnu Nivasam Bus Stop. Every 10-15 mins. Reaches Tirupati APSRTC in 1-1.5 hours.',
         to_railway_station: 'Take TTD free bus to Tirupati city, then auto 5 mins to Railway Station. Total ~1.5 hours.',
         taxi: 'Taxi from Tirumala to Tirupati: Rs.300-500. Available at Vishnu Nivasam taxi stand.'
      },
      from_queue_area: {
         step1: 'STEP 1: Inform TTD staff at your queue checkpoint. Request Emergency Exit pass.',
         step2: 'STEP 2: Exit via LEFT side gate. Follow GREEN arrow boards.',
         step3: 'STEP 3: Walk to Vishnu Nivasam Bus Stand — 5 mins from VQC.',
         step4: 'STEP 4: Board TTD Free Bus OR hire taxi to Tirupati city.',
         emergency_ttd_helpline: 'TTD Helpline: 1800-425-1333 | Emergency: 0877-2264541'
      },
      transport_from_city: {
         bus_stand: 'APSRTC Bus Stand: Buses to Hyderabad, Vijayawada, Bangalore, Chennai every 30 mins.',
         railway: 'Tirupati Railway Station (3 km from Bus Stand). Trains to Chennai, Hyderabad, Delhi, Mumbai.',
         airport: 'Tirupati Airport (15 km). Flights to Hyderabad, Chennai, Bangalore, Delhi.'
      }
   },
   sevas: {
      intro: 'TTD Sevas are special religious services. Most require advance booking at tirupatibalaji.ap.gov.in',
      suprabhata: 'Suprabhata Seva: 3AM. Rs.500. Waking the Lord with hymns. Limited 90 seats. Book 45+ days in advance.',
      thomala: 'Thomala Seva: 3:30AM. Rs.500. Flower garland offering. Book online.',
      archana: 'Archana (Astothara): Rs.120. Available all day at counters. No advance booking needed.',
      kalyanotsavam: 'Kalyanotsavam (Divine Marriage): Daily 10AM. Rs.750. Witness the celestial wedding of Lord and Goddess.',
      sahasra_deepam: 'Sahasra Deepalankara Seva: 6PM-7PM. Rs.500. 1000 lamps illumination. Online booking.',
      vasanta_puja: 'Vasanta Puja: Rs.500. Seasonal flower offering. Online booking.',
      nitya_kalyanotsavam: 'Nitya Kalyanotsavam: Rs.750 per couple. Daily. You can participate in the celestial wedding.',
      ekanta: 'Ekanta Seva: 12AM-1AM. Rs.2000. Private after-hours darshan. Very limited. Book 90+ days in advance.',
      vip_darshan: 'VIP Darshan / Special Entry: Rs.300 (SED) to Rs.1500+. Online booking mandatory for SED.'
   },
   online_booking: {
      website: 'Official site: tirupatibalaji.ap.gov.in (TTD Official Portal)',
      sed_steps: 'SED Booking: 1. Visit tirupatibalaji.ap.gov.in 2. Register/Login 3. Click "Darshan" 4. Select SED Rs.300 5. Choose date & slots 6. Pay online 7. Download e-ticket 8. Carry printout + Aadhar to temple.',
      seva_booking: 'Seva Booking: Same portal. Click "Sevas" section. Most open 30-45 days in advance. Set alarm for midnight when slots open.',
      ssd_token: 'SSD Token (Free Slot): Physical token from Tirupati city counters. Open 6AM. Lines from 3AM. Token = specific date + time slot. Online SSD: pilgrimcard.ttdsevaonline.com',
      pac_booking: 'PAC Room Booking: tirupatibalaji.ap.gov.in → Accommodation → Select PAC, dates, room type. Rooms fill up fast — book 2 weeks in advance.',
      payment: 'Accepted: Debit Card, Credit Card, Net Banking, UPI. No cash payment on portal.',
      cancellation: 'Cancellation: 48 hours before = full refund. Within 48 hours = no refund.'
   },
   vqc_system: {
      what_is: 'VQC = Vaikunta Queue Complex. The main queue complex that leads pilgrims from entry to the temple sanctum.',
      compartments: 'Has multiple compartments (numbered). Each compartment holds ~200-300 pilgrims. You wait until your compartment is called.',
      flow: 'Flow: Queue Line → Compartment Entry → VQC Inner Hall → Mahadwaram → Sanctum Sanctorum (Darshan) → Exit.',
      duration: 'Time inside VQC to Darshan: 30-45 minutes. Movement is continuous — do not stop.',
      rules: 'No sitting inside VQC. Move forward. Do not use mobile. Keep together with family. Hold Prasadam cards ready.'
   },
   photography_rules: {
      outside: 'Photography allowed outside the temple complex and in queuing areas.',
      inside_temple: 'Photography STRICTLY PROHIBITED inside the temple and near the sanctum. Cameras/phones must be in pockets.',
      drone: 'Drones are completely BANNED in the entire Tirumala hill area.',
      selfie: 'No selfies near the sanctum. TTD security will confiscate camera if caught inside temple.',
      allowed_zones: 'Good photo spots: Swami Pushkarini lake, Divya Darshana entrance, Alipiri footpath viewpoints, Papavinasanam dam.'
   },
   parking: {
      at_alipiri: 'Vehicles must park at Alipiri Mettu or Tirumala TTD parking lots. No private vehicles on ghat road without pass.',
      ttd_parking: 'TTD Parking at Alipiri: Rs.50 for 2-wheelers, Rs.100 for cars, Rs.200 for SUVs. 24-hour parking available.',
      ghat_road: 'Only TTD buses and vehicles with special pass allowed on ghat road. Private vehicles go by online vehicle pass from TTD.',
      two_wheeler: '2-wheelers not recommended on ghat road. Use TTD bus service instead.',
      vehicle_pass: 'Vehicle Pass online: tirupatibalaji.ap.gov.in → Services → Vehicle Pass. Rs.300-500. Apply 2 weeks before visit.'
   },
   children: {
      entry: 'Children of ALL ages allowed for darshan. No ticket required for children below 12 for Free Darshan.',
      sed_children: 'SED ticket: Children (5-12): Rs.150. Below 5: FREE.',
      best_darshan: 'For children: Consider early morning darshan (5AM-7AM) when crowds are smaller.',
      facilities: 'Baby care rooms at PAC-1, 2, 3. Milk/food stalls near rest areas. Prams allowed in queue lines.',
      vip_option: 'For families with young children: VIP Darshan is strongly recommended to avoid long queues with kids.'
   },
   donations: {
      hundi: 'Hundi (Donation Box): The famous golden hundi near the sanctum. Pilgrims drop cash as an offering to the Lord.',
      online_donation: 'Online donation: tirupatibalaji.ap.gov.in → Donations. Any amount accepted. 80G tax benefits apply.',
      hair_donation: 'Hair (Mottai) is also a form of donation. TTD sells donated hair in international auctions for crores of rupees which funds temple activities.',
      annadanam: 'You can sponsor Annadanam (free meals) for pilgrims. Rs.1800 sponsors food for 100 pilgrims. Contact TTD for seva booking.',
      amounts: 'Seva Donations: Rs.1000 to crores. All receipts provided with 80G certificate for income tax benefit.'
   },
   digital_payments: {
      at_temple: 'UPI/Digital payments accepted at: Ladu counters, TTD canteens, paid accommodation, online portal.',
      atm: 'ATMs available on Tirumala hill. SBI, Canara, Andhra Bank. Sometimes experience heavy traffic — carry some cash.',
      cash_recommended: 'Carry cash Rs.500-1000 for small purchases, autos, and emergency situations.',
      gpay_phonepe: 'Google Pay, Phone Pe, Paytm all work at most TTD counters. UPI QR codes displayed at payment points.'
   },
   nearby_attractions: {
      chandragiri_fort: 'Chandragiri Fort: 12km from Tirupati. Mughal-era fort. Entry: Rs.15 (Indian), Rs.200 (Foreign). Worth visiting.',
      srikalahasti: 'Srikalahasti Temple: 36km. Famous Vayu Linga, Rahu-Ketu Dosha remedies. Must visit for astrology believers.',
      iskcon_tirupati: 'ISKCON Temple Tirupati: Near Railway Station. Beautiful temple. Free Prasadam. Open 5AM-8PM.',
      kapila_theertham: 'Kapila Theertham (Sacred hot springs): 3km from bus stand. Lord Shiva temple. Holy bath.',
      govindaraja: 'Sri Govindaraja Swamy Temple: In city center. Same deity as Tirumala. Shorter queue.',
      tada_falls: 'Tada Falls (Ubbalamadugu): 50km from Tirupati. Beautiful waterfall. Weekend picnic spot.',
      nagalapuram_beach: 'Nagalapuram Beach: 70km. Secluded beach near the Eastern Ghats. Great for day trips.'
   },
   languages: {
      supported: 'TTD staff speak: Telugu, Hindi, Tamil, English, Kannada, Malayalam.',
      helpdesk: 'Multi-language help desks at all PAC complexes and VQC entry.',
      useful_telugu: 'Useful Telugu phrases: "Darshanimu eppudu?" (When is Darshan?), "Pasi ledhu" (I am hungry), "Help kavali" (Need help), "Dormitory undi?" (Is dormitory available?)',
      guide: 'TTD official guides available at Rs.300-500 for 3 hours. Book at PAC-1 help desk.'
   },
   brahmotsavam: {
      when: 'Brahmotsavam: 9-day annual festival. Usually in September (date varies by Telugu calendar).',
      crowd: 'Crowd: 5 lakh+ pilgrims daily. Most crowded time of the year. SED wait: 6+ hours. Free darshan: 30+ hours.',
      special: 'Special events: Garuda Seva (Lord on Garuda vehicle), Rathotsavam (Chariot procession), Chakrasnanam.',
      book_early: 'Book accommodation 6 months in advance for Brahmotsavam. All TTD rooms and city hotels fill up.',
      avoid: 'Avoid Brahmotsavam if you want peaceful darshan. Come 2 weeks before or after.'
   },
   // ⚠️ BRUTAL REALITY — SACRED TRUTHS (No Sugarcoating)
   brutal_reality: {
      darshan_experience: [
         'Darshan Duration: 2-5 SECONDS ONLY. You wait 15 hours for a few seconds of sight.',
         'Sactum Chaos: Security will push you forward immediately. No time for long prayers.',
         'Heavy Pushing: Near the deity, physical pressure is at its peak. Guards push hard to maintain flow.',
         'Flow Speed: You have zero control. You move at the speed of the crowd behind you.'
      ],
      booking_wars: [
         'Sold Out: Monthly quotas vanish in 5-10 minutes. 10:02 AM is often too late.',
         'Bot Activity: Agents and bots often grab slots faster than real users can login.',
         'Payment Stress: Server overload causes payment failures. Money deducted, no ticket generated.',
         'OTP Lag: Session expires while waiting for OTP during peak booking.'
      ],
      accommodation_black_market: [
         'Zero Availability: Online rooms gone instantly. Physical arrival without booking = sleeping on roads/vehicles.',
         'Black Market: Unofficial agents sell ₹500 rooms for ₹2000+ near the hill base.',
         'Hygiene Crisis: Overcrowded dormitories and high noise levels in free halls.'
      ],
      transport_fatigue: [
         'Ghat Road Jams: 1-hour climb can turn into 4 hours during festivals.',
         'Footpath Exhaustion: Alipiri/Mettu are physically demanding. Many start without preparation and faint.',
         'Parking Chaos: Limited parking at Tirumala causes long searches and random far-off parking.'
      ],
      harsh_truth: 'This is a demand vs capacity explosion. 100,000 pilgrims vs 20,000 capacity. Tech helps, but cannot fix overcrowding. Plan for EXHAUSTION.'
   },
   // END BRUTAL REALITY
   free_darshan_problems: {
      extreme_wait: 'REALITY: Free Darshan (Sarva Darshan) = 8 to 20+ hours waiting. Not exaggeration. Festival days = 24+ hours. Example: Enter 6PM → darshan next day morning.',
      crowd_pressure: 'REALITY: Very tight queues, zero personal space. Kids & elderly struggle badly. Elderly people faint in long queues. Parents carry kids for hours. Physical exhaustion is REAL.',
      no_timing_control: 'REALITY: You DO NOT know your exact darshan time. Depends entirely on crowd flow. Same entry time → one person gets darshan in 8 hrs, another in 15 hrs. No guarantee.',
      facility_issues: 'REALITY: Toilets are limited in queue areas. Food/water sometimes insufficient. People avoid drinking water to avoid toilet breaks → dehydration risk. Carry your OWN water bottle.',
      mental_stress: 'REALITY: Long waiting + uncertainty = irritation and frustration. Queue cutting arguments are common. Fights happen. Arrives with devotion, struggles with stress. Mental preparation is CRITICAL.',
      survival_tips: [
         'Arrive Tuesday-Wednesday 3AM-5AM for shortest queues (avoid weekends).',
         'CARRY water bottle — TTD refills it. Dehydration is the #1 risk.',
         'Wear comfortable flat footwear. You will STAND for hours.',
         'Bring light snacks (biscuits, fruits) — queue food is insufficient.',
         'Elderly & children: SERIOUSLY consider SED (Rs.300) instead.',
         'If you feel dizzy, inform TTD volunteer IMMEDIATELY. First Aid available.',
         'Do NOT leave queue for bathroom — you LOSE your position.',
         'Mental prep: Accept 10-15 hours wait. If shorter, be grateful.'
      ]
   },
   ticket_darshan_problems: {
      still_long_wait: 'REALITY: SED ticket (Rs.300) does NOT mean instant darshan. Still 2-6 hours waiting. Slot 10AM → actual darshan 2PM is NORMAL. Ticket reduces waiting, NOT eliminates it.',
      slot_mismanagement: 'REALITY: People do not follow reporting time. 1000-person slot → 2000 people show up. Overcrowding happens anyway. TTD staff overwhelmed.',
      booking_issues: 'REALITY: Tickets sell out in SECONDS online. Website/app glitches are common. Payment deducted but ticket NOT generated — happens frequently. Always screenshot your payment.',
      travel_stress: 'REALITY: Need exact date + time planning. Miss your slot = ticket WASTED, no refund. Traffic delay on ghat road = missed darshan. Arrive 2 hours BEFORE your slot.',
      no_vip_feel: 'REALITY: Final darshan line merges ALL categories (Free, SED, VIP). Everyone pushed during final 10-20 seconds near the deity. No special treatment at sanctum.',
      survival_tips: [
         'Book SED 30-45 days in advance. Set alarm for midnight when slots open.',
         'Screenshot EVERYTHING — booking confirmation, payment receipt, e-ticket.',
         'Arrive 2 HOURS before your slot time. Give buffer for traffic/delays.',
         'Carry PRINTED ticket + Aadhar. Phone battery may die after long wait.',
         'Even with ticket, carry water and snacks. 2-6 hour wait is normal.',
         'If payment deducted but no ticket → call TTD: 0877-2264444 IMMEDIATELY.'
      ]
   },
   common_problems: {
      accommodation: 'REALITY: Rooms in Tirumala are EXTREMELY hard to get. Online booking site crashes during peak times. People sleep in cars, corridors, and open areas. Book 2-4 WEEKS in advance or stay in Tirupati city.',
      transport_traffic: 'REALITY: Alipiri Ghat road traffic jams turn 1-hour journey into 3-5 hours. Bus delays are common. Weekend traffic is horrific. Solution: Travel EARLY morning (before 5AM) or late night.',
      no_realtime_info: 'REALITY: TTD provides NO clear real-time queue updates. People blindly enter queues without knowing wait time. Our AI chatbot tries to solve this — but even we estimate based on historical patterns, not live sensors.',
      health_safety: 'REALITY: Long standing causes BP issues, knee pain, back pain, dehydration, heat stroke (summer). ESPECIALLY risky for elderly, pregnant women, heart patients. Carry medicines, drink water every 30 mins.',
      brutal_truth: 'HONEST TRUTH: Ticket ≠ guaranteed comfort. Free darshan = physically exhausting. The system is overloaded — 60,000-80,000 pilgrims DAILY vs temple capacity of ~20,000. Planning poorly = guaranteed bad experience.'
   },
   smart_planning: {
      best_strategy: 'BEST STRATEGY: Visit Tuesday-Wednesday. Arrive Tirupati city by 8PM night. Sleep in hotel. Wake 2AM. Take 3AM bus. Join queue by 4AM. Expected darshan: 10AM-12PM. Total wait: 6-8 hours (best case for free darshan).',
      worst_case: 'WORST CASE: Friday/Saturday arrival. No room booking. Join queue afternoon. Wait 15-20 hours. Darshan next morning. Exhausted, hungry, frustrated. DO NOT do this.',
      golden_rules: [
         'RULE 1: Tuesday-Wednesday-Thursday ONLY for short wait.',
         'RULE 2: Book accommodation BEFORE traveling. No room = disaster.',
         'RULE 3: Arrive at queue before 5AM. After 8AM = double the wait.',
         'RULE 4: Carry water, snacks, Aadhar, comfortable shoes. Minimum luggage.',
         'RULE 5: If elderly/kids in group, BUY SED ticket. Rs.300 saves 10+ hours.',
         'RULE 6: Check our AI chatbot for current wait estimates before joining queue.',
         'RULE 7: Mental preparation — it WILL be long. Accept it as part of the offering.'
      ],
      live_prediction_tip: 'ASK ME: "What is the current wait time?" — I will give you the best estimate based on day, time, and crowd patterns. Use this BEFORE joining the queue!'
   }
};

const MISSION_ROUTES = {
   'PAC5_TEMPLE': [[13.6840, 79.3474], [13.6835, 79.3500], [13.6833, 79.3474]],
   'VQC_TEMPLE': [[13.6850, 79.3480], [13.6840, 79.3478], [13.6833, 79.3474]],
   'TEMPLE_LADU': [[13.6833, 79.3474], [13.6830, 79.3470], [13.6825, 79.3465]],
   'ALIPIRI_TEMPLE': [[13.6500, 79.4000], [13.6600, 79.3800], [13.6833, 79.3474]],
   'PAC1_METTU': [[13.6285, 79.4215], [13.6150, 79.4400], [13.6080, 79.4520]],
   'CITY_TO_TIRUCHANOOR': [[13.6276, 79.4190], [13.6200, 79.4350], [13.6080, 79.4520]],
   'CITY_TO_KAPILA': [[13.6285, 79.4215], [13.6400, 79.4200], [13.6496, 79.4184]],
   'CITY_TO_GOVINDARAJA': [[13.6276, 79.4190], [13.6300, 79.4170], [13.6300, 79.4150]],
   'TEMPLE_TO_BUSSTAND': [[13.6833, 79.3474], [13.6840, 79.3510], [13.6500, 79.4000], [13.6490, 79.4010]],
   'TEMPLE_TO_RAILWAY': [[13.6833, 79.3474], [13.6840, 79.3510], [13.6500, 79.4000], [13.6276, 79.4190]]
};

// NEURAL PATHFINDER HELPERS
const findNode = (name) => {
   if (!name) return null;
   const q = name.toLowerCase().replace(/[^\w\s]/g, ' ').trim();
   return GLOBAL_MISSION_GRID.find(n =>
      n.id.toLowerCase() === q.replace(/\s/g, '') ||
      n.name.toLowerCase().includes(q) ||
      q.includes(n.id.toLowerCase()) ||
      (n.id === 'vqc2' && q.includes('vqc')) // Special case alias
   );
};

export async function chatWithTirupatiAi(prompt, currentStatus) {
   // ADVANCED NEURAL FALLBACK ENGINE
   const generateFallback = (query, status) => {
      // EXTRACT USER GPS COORDS if embedded by chatbot UI
      let userCoords = null;
      const coordMatch = query.match(/\[USER_COORDS:([\d.]+),([\d.]+)\]/);
      if (coordMatch) {
         userCoords = [parseFloat(coordMatch[1]), parseFloat(coordMatch[2])];
      }
      const text = query.toLowerCase().replace(/\[user_coords:[^\]]+\]/, '').replace(/[^\w\s]/g, ' ').replace(/-/g, ' ');

      // CURRENT LOCATION ROUTER (GPS-Powered Live Navigation)
      const hasMyLocation = text.includes('my location') || text.includes('current location') || text.includes('from here') || text.includes('navigate to') || text.includes('take me to') || text.includes('where i am');
      if (hasMyLocation && userCoords) {
         const destCandidates = [
            { kw: ['bus stand', 'bus station', 'apsrtc', 'bustand'], id: 'bus_stand' },
            { kw: ['railway', 'train', 'station'], id: 'railway_station' },
            { kw: ['temple', 'tirumala', 'srivari'], id: 'temple' },
            { kw: ['alipiri'], id: 'alipiri' },
            { kw: ['pac1', 'pac 1', 'srinivasam'], id: 'PAC1' },
            { kw: ['pac2', 'pac 2', 'vishnu nivasam'], id: 'PAC2' },
            { kw: ['pac5', 'pac 5', 'venkatadri'], id: 'PAC5' },
            { kw: ['kapila', 'theertham'], id: 'kapila_theertham' },
            { kw: ['tiruchanoor', 'padmavathi', 'ammavari'], id: 'tiruchanoor' },
            { kw: ['govindaraja'], id: 'govindaraja' },
            { kw: ['vqc', 'queue', 'complex'], id: 'vqc2' },
         ];
         let destNode = null;
         for (const c of destCandidates) {
            if (c.kw.some(k => text.includes(k))) {
               destNode = GLOBAL_MISSION_GRID.find(n => n.id === c.id);
               break;
            }
         }
         if (destNode) {
            return {
               explanation: `Om Namo Venkatesaya. \ud83d\udccd LIVE NAVIGATION ACTIVE! Routing from your current GPS location to ${destNode.name}. Follow the glowing path on the map. Have a safe and blessed journey! \ud83d\ude4f`,
               map_commands: [{ action: 'draw_route', points: [userCoords, destNode.coords], zoom: 14 }],
               visual_data: { type: 'NAVIGATOR_HUB', decision: 'GO' }
            };
         }
         return {
            explanation: `Om Namo Venkatesaya. \ud83d\udccd Your GPS location is locked! Tell me your destination: "navigate to bus stand", "take me to temple", "route to PAC-5", and I will project the live route!`,
            map_commands: [{ action: 'set_view', center: userCoords, zoom: 16 }],
            visual_data: { type: 'INFO', decision: 'GO' }
         };
      }

      // DYNAMIC ROUTING PARSER (From [A] to [B])
      if (text.includes('from') && text.includes('to')) {
         const fromMatch = text.match(/from\s+(.+?)\s+to/);
         const toMatch = text.match(/to\s+(.+)$/);

         const nodeA = fromMatch ? findNode(fromMatch[1]) : null;
         const nodeB = toMatch ? findNode(toMatch[1]) : null;

         if (nodeA && nodeB) {
            return {
               explanation: `Om Namo Venkatesaya. MISSION UPLINK UNSTABLE. Dynamic Path Synthesized: From ${nodeA.name} to ${nodeB.name}. Projecting tactical route.`,
               map_commands: [{ action: "draw_route", points: [nodeA.coords, nodeB.coords], zoom: 15 }],
               visual_data: { type: "NAVIGATOR_HUB", decision: "GO" }
            };
         }
      }

      // 0. EMERGENCY EXIT INTELLIGENCE (Only triggers on URGENT/EMERGENCY intent)
      const urgentIntentKeywords = ['urgent', 'emergency', 'quit queue', 'leave queue', 'quit q line', 'leave q', 'go back urgent', 'urgent work', 'urgent matter'];
      const hasUrgentIntent = urgentIntentKeywords.some(kw => text.includes(kw));
      if (hasUrgentIntent) {
         const toBus = text.includes('bus') || text.includes('stand') || text.includes('apsrtc');
         const toRail = text.includes('railway') || text.includes('train') || text.includes('station');
         const toAirport = text.includes('airport') || text.includes('flight');

         const ex = SACRED_KNOWLEDGE.emergency_exit;
         let dest = 'Bus Stand or Railway Station';
         let steps = `${ex.from_queue_area.step1} ${ex.from_queue_area.step2} ${ex.from_queue_area.step3} ${ex.from_queue_area.step4}`;
         let route = MISSION_ROUTES.TEMPLE_TO_BUSSTAND;
         let zoom = 13;

         if (toRail) {
            dest = 'Tirupati Railway Station';
            steps = `${ex.from_queue_area.step1} ${ex.from_queue_area.step2} ${ex.from_queue_area.step3} ${ex.from_tirumala_hill.to_railway_station}`;
            route = MISSION_ROUTES.TEMPLE_TO_RAILWAY;
         } else if (toBus) {
            dest = 'APSRTC Bus Stand Tirupati';
            steps = `${ex.from_queue_area.step1} ${ex.from_queue_area.step2} ${ex.from_queue_area.step3} ${ex.from_tirumala_hill.to_bus_station}`;
         } else if (toAirport) {
            dest = 'Tirupati Airport';
            steps = `${ex.from_queue_area.step1} ${ex.from_tirumala_hill.taxi} Then take a cab from city to airport. 15km, ~30 mins.`;
         }

         return {
            explanation: `Om Namo Venkatesaya. 🚨 EMERGENCY EXIT BRIEFING: Destination — ${dest}. ${steps} TTD Helpline: 1800-425-1333 (Toll Free). Lord Venkateswara will understand. Come back soon! 🙏`,
            map_commands: [{ action: 'draw_route', points: route, zoom }],
            visual_data: { type: 'NAVIGATOR_HUB', decision: 'CAUTION' }
         };
      }

      // 1. Navigation Logic (Classic Pre-defined Routes)
      if (text.includes('how to go') || text.includes('route') || text.includes('navigate') || text.includes('location') || text.includes('bus stand') || text.includes('bus station') || text.includes('railway') || text.includes('airport')) {
         let advice = "You can reach Tirumala via Alipiri (Vehicle/Steps) or Srivari Mettu (Steps).";
         let commands = [];

         if (text.includes('bus stand') || text.includes('bus station') || text.includes('apsrtc')) {
            advice = "APSRTC Bus Stand is in Tirupati city. Projecting the route from Tirumala hill to the Bus Stand.";
            commands = [{ action: 'draw_route', points: MISSION_ROUTES.TEMPLE_TO_BUSSTAND, zoom: 13 }];
         } else if (text.includes('railway') || text.includes('train station') || text.includes('railway station')) {
            advice = "Tirupati Railway Station is 3km from the Bus Stand. Projecting the route from Tirumala hill to the Railway Station.";
            commands = [{ action: 'draw_route', points: MISSION_ROUTES.TEMPLE_TO_RAILWAY, zoom: 13 }];
         } else if (text.includes('airport')) {
            advice = "Tirupati Airport is 15km from the city. Take a cab from the Railway Station or Bus Stand. Approx Rs.300-500.";
            commands = [{ action: 'draw_route', points: MISSION_ROUTES.TEMPLE_TO_RAILWAY, zoom: 12 }];
         } else if (text.includes('pac 5') || text.includes('venkatadri') || text.includes('pac5')) {
            advice = "PAC-5 (Venkatadri) is near the Main Temple. I am projecting the 5-minute walking route on your map now.";
            commands = [{ action: "draw_route", points: MISSION_ROUTES.PAC5_TEMPLE, zoom: 17 }];
         } else if (text.includes('vqc') || text.includes('queue') || text.includes('complex') || text.includes('compartment')) {
            advice = "VQC Complex is the primary entry point to the temple. I am projecting the internal entry route to the Mahadwaram.";
            commands = [{ action: "draw_route", points: MISSION_ROUTES.VQC_TEMPLE, zoom: 17 }];
         } else if (text.includes('ladu') || text.includes('prasadam') || text.includes('counter')) {
            advice = "Ladu Prasadam counters are located behind the main temple. Projecting the route from the exit gate.";
            commands = [{ action: "draw_route", points: MISSION_ROUTES.TEMPLE_LADU, zoom: 18 }];
         } else if (text.includes('tiruchanoor') || text.includes('ammavari') || text.includes('padmavathi')) {
            advice = "Sri Padmavathi Ammavari Temple is in Tiruchanoor (south sector). Projecting the route from the city transport hub.";
            commands = [{ action: "draw_route", points: MISSION_ROUTES.CITY_TO_TIRUCHANOOR, zoom: 14 }];
         } else if (text.includes('kapila') || text.includes('theertham')) {
            advice = "Sri Kapileswara Swamy Temple is at the foot of the hills. Projecting the tactical route from PAC-1.";
            commands = [{ action: "draw_route", points: MISSION_ROUTES.CITY_TO_KAPILA, zoom: 15 }];
         } else if (text.includes('govindaraja')) {
            advice = "Sri Govindaraja Swamy Temple is located near the Railway Station. Displaying the central city route.";
            commands = [{ action: "draw_route", points: MISSION_ROUTES.CITY_TO_GOVINDARAJA, zoom: 16 }];
         } else if (text.includes('alipiri')) {
            advice = "Displaying the tactical route from Alipiri to Tirumala via the Main Ghat Road.";
            commands = [{ action: "draw_route", points: MISSION_ROUTES.ALIPIRI_TEMPLE, zoom: 14 }];
         }

         return {
            explanation: `Om Namo Venkatesaya. MISSION UPLINK UNSTABLE. Local Tactical Briefing: ${advice}`,
            map_commands: commands,
            visual_data: { type: "NAVIGATOR_HUB", decision: "GO" }
         };
      }

      // 1.5 PROBLEM REPORTING & EMERGENCY CATEGORIZATION
      const problemKeywords = ['report', 'issue', 'emergency', 'lost', 'help', 'medical', 'panic', 'pain', 'missing'];
      if (problemKeywords.some(kw => text.includes(kw))) {
         let category = 'GENERAL_REPORT';
         let urgency = 'P3';
         let advice = "Your report is being synthesized. Stay calm and contact the nearest TTD volunteer.";

         if (text.includes('child') || text.includes('lost') || text.includes('missing')) {
            category = 'LOST_PERSON'; urgency = 'P1';
            advice = "CRITICAL: Reporting Lost Person. Head to the nearest Police Station or Public Announcement center (PAC-2/PAC-3). Stay where people can see you.";
         } else if (text.includes('medical') || text.includes('chest') || text.includes('breath') || text.includes('accident')) {
            category = 'MEDICAL'; urgency = 'P1_CRITICAL';
            advice = "CRITICAL: Medical Emergency detected. Call 108 immediately. TTD Main Hospital: 0877-2234567. Sit down, breathe deeply, and do not move until help arrives.";
         } else if (text.includes('panic') || text.includes('crush') || text.includes('suffocat')) {
            category = 'CROWD_CONTROL'; urgency = 'P1_STAMPEDE_RISK';
            advice = "CAUTION: Crowd Intensity Alert. Move diagonally toward the nearest exit or compartment wall. Do not fight the flow. Inform TTD staff of the block immediately.";
         }

         return {
            explanation: `Om Namo Venkatesaya. 🚨 EMERGENCY PROTOCOL: ${category} (${urgency}). ${advice}`,
            visual_data: { type: 'EMERGENCY_SOS', decision: 'CAUTION', report: { category, urgency } },
            map_commands: [{ action: 'set_view', center: [13.6845, 79.3505], zoom: 17 }]
         };
      }

      // 2. QUEUE WAIT TIME INTELLIGENCE
      if (text.includes('wait') || text.includes('time') || text.includes('hour') || text.includes('queue') || text.includes('waiting') || text.includes('standing') || text.includes('how long') || text.includes('how much time') || text.includes('darshan time')) {
         // Parse how many hours they have already waited
         const hourMatch = text.match(/(\d+)\s*(hr|hour|hrs|hours)/i);
         const hoursWaited = hourMatch ? parseInt(hourMatch[1]) : null;

         const liveWait = currentStatus?.darshan?.free_sarva;
         let estimation = SACRED_KNOWLEDGE.queue_wait_times.wait_estimation.waited_5hr;
         if (hoursWaited !== null) {
            if (hoursWaited <= 1) estimation = SACRED_KNOWLEDGE.queue_wait_times.wait_estimation.waited_1hr;
            else if (hoursWaited <= 2) estimation = SACRED_KNOWLEDGE.queue_wait_times.wait_estimation.waited_2hr;
            else if (hoursWaited <= 3) estimation = SACRED_KNOWLEDGE.queue_wait_times.wait_estimation.waited_3hr;
            else if (hoursWaited <= 4) estimation = SACRED_KNOWLEDGE.queue_wait_times.wait_estimation.waited_4hr;
            else if (hoursWaited <= 5) estimation = SACRED_KNOWLEDGE.queue_wait_times.wait_estimation.waited_5hr;
            else if (hoursWaited <= 6) estimation = SACRED_KNOWLEDGE.queue_wait_times.wait_estimation.waited_6hr;
            else if (hoursWaited <= 7) estimation = SACRED_KNOWLEDGE.queue_wait_times.wait_estimation.waited_7hr;
            else estimation = SACRED_KNOWLEDGE.queue_wait_times.wait_estimation.waited_8hr;
         }

         const tips = SACRED_KNOWLEDGE.queue_wait_times.tips.slice(0, 3).join(' | ');
         const liveInfo = liveWait ? ` Live grid shows current Free Darshan wait: ${liveWait} hours.` : '';
         const hoursMsg = hoursWaited !== null ? ` You have already waited ${hoursWaited} hour(s).` : '';

         return {
            explanation: `Om Namo Venkatesaya. Sacred Briefing:${hoursMsg} ${estimation}.${liveInfo} Once inside VQC, Darshan takes 30-45 more minutes. Tips: ${tips}. Have courage — Lord Venkateswara's darshan is worth every minute! 🙏`,
            map_commands: [{ action: 'set_view', center: [13.6850, 79.3480], zoom: 17 }],
            visual_data: { type: 'INFO', decision: 'GO' }
         };
      }

      // 3. COMPREHENSIVE TOPIC-BASED KNOWLEDGE HANDLERS
      const sk = SACRED_KNOWLEDGE;

      if (text.includes('hotel') || text.includes('room') || text.includes('stay') || text.includes('accommodation') || text.includes('dharamshala') || text.includes('lodge') || text.includes('pac room') || text.includes('book room')) {
         return { explanation: `Om Namo Venkatesaya. Sacred Briefing on Accommodation: ${sk.accommodation.ttd_rooms} Booking: ${sk.accommodation.booking} City Hotels: ${sk.accommodation.city_hotels} Contact: ${sk.accommodation.contact}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('food') || text.includes('eat') || text.includes('meal') || text.includes('annadanam') || text.includes('canteen') || text.includes('veg') || text.includes('hungry')) {
         return { explanation: `Om Namo Venkatesaya. Sacred Briefing on Food: ${sk.food.free_meals} Prasadam: ${sk.food.prasadam} Canteens: ${sk.food.canteens} Rule: ${sk.food.rule}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('locker') || text.includes('luggage') || text.includes('bag') || text.includes('deposit') || text.includes('cloak')) {
         return { explanation: `Om Namo Venkatesaya. Sacred Briefing on Lockers: ${sk.lockers.locations} What to deposit: ${sk.lockers.deposit_items} ${sk.lockers.cloak_room}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('dress') || text.includes('wear') || text.includes('cloth') || text.includes('saree') || text.includes('dhoti') || text.includes('trouser') || text.includes('jeans') || text.includes('shirt')) {
         return { explanation: `Om Namo Venkatesaya. Sacred Dress Code: Men: ${sk.dress_code.men} Women: ${sk.dress_code.women} Note: ${sk.dress_code.enforcement}`, visual_data: { type: 'INFO', decision: 'CAUTION' } };
      }
      if (text.includes('tonsure') || text.includes('mottai') || text.includes('hair') || text.includes('mundanam') || text.includes('kalyana katta') || text.includes('shave')) {
         return { explanation: `Om Namo Venkatesaya. Sacred Briefing on Head Tonsure: ${sk.head_tonsure.meaning} Location: ${sk.head_tonsure.location} Cost: ${sk.head_tonsure.cost} Process: ${sk.head_tonsure.process}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('medical') || text.includes('hospital') || text.includes('doctor') || text.includes('sick') || text.includes('ill') || text.includes('ambulance') || text.includes('first aid') || text.includes('dizzy')) {
         return { explanation: `Om Namo Venkatesaya. Medical Briefing: ${sk.medical.hospital} Ambulance: ${sk.medical.ambulance} First Aid: ${sk.medical.first_aid} Tips: ${sk.medical.tips}`, visual_data: { type: 'INFO', decision: 'CAUTION' } };
      }
      if (text.includes('wheelchair') || text.includes('senior') || text.includes('old age') || text.includes('disabled') || text.includes('divyang') || text.includes('differently abled')) {
         return { explanation: `Om Namo Venkatesaya. Special Facilities: ${sk.facilities.wheelchair} Baby Care: ${sk.facilities.baby_care} Contact TTD Help Desk at any PAC complex. Helpline: 1800-425-1333`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('atm') || text.includes('cash') || text.includes('money') || text.includes('bank') || text.includes('charge') || text.includes('mobile charge') || text.includes('lost') || text.includes('found')) {
         return { explanation: `Om Namo Venkatesaya. Facilities Briefing: ATMs: ${sk.facilities.atm} Mobile Charging: ${sk.facilities.mobile_charging} Lost & Found: ${sk.facilities.lost_found}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('cost') || text.includes('price') || text.includes('fee') || text.includes('charge') || text.includes('budget') || text.includes('how much') || text.includes('ticket price') || text.includes('money')) {
         return { explanation: `Om Namo Venkatesaya. Cost Briefing: Free: ${sk.cost_breakdown.free} SED Ticket: ${sk.cost_breakdown.sed} Transport: ${sk.cost_breakdown.transport} Rooms: ${sk.cost_breakdown.accommodation} Total Budget: ${sk.cost_breakdown.total}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('best time') || text.includes('when to visit') || text.includes('which month') || text.includes('avoid') || text.includes('season') || text.includes('weather') || text.includes('summer') || text.includes('winter')) {
         return { explanation: `Om Namo Venkatesaya. Best Time to Visit Tirupati: ${sk.best_time.months} AVOID: ${sk.best_time.avoid} Best Days: ${sk.best_time.days} Arrival Tip: ${sk.best_time.arrival}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('timing') || text.includes('open') || text.includes('close') || text.includes('temple time') || text.includes('darshan time') || text.includes('when') || text.includes('seva')) {
         return { explanation: `Om Namo Venkatesaya. Temple Timings: ${sk.temple_timings.general} Darshan: ${sk.temple_timings.darshan_start} Best Time: ${sk.temple_timings.best_darshan}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('carry') || text.includes('bring') || text.includes('take') || text.includes('what to') || text.includes('important') || text.includes('checklist') || text.includes('packing')) {
         return { explanation: `Om Namo Venkatesaya. What to Carry: Must Have: ${sk.what_to_carry.must} Clothing: ${sk.what_to_carry.clothing} Others: ${sk.what_to_carry.others} Don't Carry: ${sk.what_to_carry.dont_carry}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('helpline') || text.includes('phone') || text.includes('number') || text.includes('contact') || text.includes('call') || text.includes('ttd') || text.includes('help')) {
         const h = sk.helplines;
         return { explanation: `Om Namo Venkatesaya. TTD Helplines: Main: ${h.ttd_main} | Toll Free: ${h.toll_free} | Emergency: ${h.emergency} | Police: ${h.police} | Ambulance: ${h.ambulance} | AP Tourism: ${h.ap_tourism} | Website: ${h.website}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('bus') && (text.includes('from') || text.includes('hyderabad') || text.includes('chennai') || text.includes('bangalore') || text.includes('city'))) {
         return { explanation: `Om Namo Venkatesaya. Transport Briefing: ${sk.transport.ttd_free_bus} Paid Bus: ${sk.transport.paid_bus} Taxi: ${sk.transport.taxi} Auto: ${sk.transport.auto} From Hyderabad: ${sk.transport.from_hyderabad} From Chennai: ${sk.transport.from_chennai}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }

      if (text.includes('seva') || text.includes('suprabhata') || text.includes('thomala') || text.includes('archana') || text.includes('kalyanotsavam') || text.includes('ekanta') || text.includes('sahasra deepa')) {
         return { explanation: `Om Namo Venkatesaya. Sacred Sevas Briefing: ${sk.sevas.intro} | Suprabhata: ${sk.sevas.suprabhata} | Archana: ${sk.sevas.archana} | Kalyanotsavam: ${sk.sevas.kalyanotsavam} | Sahasra Deepam: ${sk.sevas.sahasra_deepam} | Ekanta: ${sk.sevas.ekanta}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('book online') || text.includes('online booking') || text.includes('how to book') || text.includes('website') || text.includes('portal') || text.includes('e ticket') || text.includes('online ticket') || text.includes('cancel')) {
         return { explanation: `Om Namo Venkatesaya. Online Booking Guide: Website: ${sk.online_booking.website} | SED Steps: ${sk.online_booking.sed_steps} | SSD Token: ${sk.online_booking.ssd_token} | Room Booking: ${sk.online_booking.pac_booking} | Cancellation: ${sk.online_booking.cancellation}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('vqc') || text.includes('compartment') || text.includes('vaikunta') || text.includes('queue complex') || text.includes('how vqc works')) {
         return { explanation: `Om Namo Venkatesaya. VQC System: ${sk.vqc_system.what_is} | Compartments: ${sk.vqc_system.compartments} | Flow: ${sk.vqc_system.flow} | Duration: ${sk.vqc_system.duration} | Rules: ${sk.vqc_system.rules}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('photo') || text.includes('camera') || text.includes('selfie') || text.includes('drone') || text.includes('video') || text.includes('picture')) {
         return { explanation: `Om Namo Venkatesaya. Photography Rules: ${sk.photography_rules.inside_temple} | Drones: ${sk.photography_rules.drone} | ${sk.photography_rules.selfie} | Allowed Zones: ${sk.photography_rules.allowed_zones}`, visual_data: { type: 'INFO', decision: 'CAUTION' } };
      }
      if (text.includes('parking') || text.includes('car') || text.includes('vehicle') || text.includes('bike') || text.includes('two wheeler') || text.includes('vehicle pass')) {
         return { explanation: `Om Namo Venkatesaya. Parking & Vehicle Guide: ${sk.parking.at_alipiri} | TTD Parking Fees: ${sk.parking.ttd_parking} | Ghat Road: ${sk.parking.ghat_road} | Vehicle Pass: ${sk.parking.vehicle_pass}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('child') || text.includes('children') || text.includes('baby') || text.includes('kids') || text.includes('infant') || text.includes('toddler') || text.includes('family')) {
         return { explanation: `Om Namo Venkatesaya. Children & Family Guide: ${sk.children.entry} | SED for Children: ${sk.children.sed_children} | Facilities: ${sk.children.facilities} | Tip: ${sk.children.vip_option}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('donat') || text.includes('hundi') || text.includes('offering') || text.includes('80g') || text.includes('annadanam sponsor') || text.includes('contribute')) {
         return { explanation: `Om Namo Venkatesaya. Donations & Offerings: ${sk.donations.hundi} | Online: ${sk.donations.online_donation} | Hair Donation: ${sk.donations.hair_donation} | Annadanam Sponsorship: ${sk.donations.annadanam} | ${sk.donations.amounts}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('upi') || text.includes('gpay') || text.includes('phonepe') || text.includes('paytm') || text.includes('digital payment') || text.includes('online pay') || text.includes('card payment')) {
         return { explanation: `Om Namo Venkatesaya. Digital Payments: ${sk.digital_payments.at_temple} | ATMs: ${sk.digital_payments.atm} | ${sk.digital_payments.cash_recommended} | ${sk.digital_payments.gpay_phonepe}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('nearby') || text.includes('attraction') || text.includes('visit') || text.includes('sightseeing') || text.includes('chandragiri') || text.includes('srikalahasti') || text.includes('iskcon') || text.includes('falls') || text.includes('beach')) {
         return { explanation: `Om Namo Venkatesaya. Nearby Attractions: Chandragiri Fort: ${sk.nearby_attractions.chandragiri_fort} | Srikalahasti: ${sk.nearby_attractions.srikalahasti} | ISKCON: ${sk.nearby_attractions.iskcon_tirupati} | Tada Falls: ${sk.nearby_attractions.tada_falls} | Nagalapuram Beach: ${sk.nearby_attractions.nagalapuram_beach}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('language') || text.includes('telugu') || text.includes('hindi') || text.includes('tamil') || text.includes('guide') || text.includes('translator') || text.includes('phrase')) {
         return { explanation: `Om Namo Venkatesaya. Language Support: ${sk.languages.supported} | Help Desk: ${sk.languages.helpdesk} | Useful Telugu Phrases: ${sk.languages.useful_telugu} | TTD Guide: ${sk.languages.guide}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('brahmotsavam') || text.includes('festival') || text.includes('garuda seva') || text.includes('rathotsavam') || text.includes('annual') || text.includes('vaikuntha ekadasi')) {
         return { explanation: `Om Namo Venkatesaya. Brahmotsavam & Festivals: ${sk.brahmotsavam.when} | Crowd: ${sk.brahmotsavam.crowd} | Special Events: ${sk.brahmotsavam.special} | Planning Tip: ${sk.brahmotsavam.book_early} | ${sk.brahmotsavam.avoid}`, visual_data: { type: 'INFO', decision: 'CAUTION' } };
      }

      // REAL PROBLEMS & HONEST ADVICE HANDLERS
      if (text.includes('problem') || text.includes('issue') || text.includes('difficult') || text.includes('struggle') || text.includes('bad experience') || text.includes('reality') || text.includes('truth') || text.includes('honest') || text.includes('not good') || text.includes('worst')) {
         const fp = sk.free_darshan_problems;
         const tp = sk.ticket_darshan_problems;
         const cp = sk.common_problems;
         return { explanation: `Om Namo Venkatesaya. ⚠️ HONEST REALITY BRIEFING (No Sugarcoating): FREE DARSHAN: ${fp.extreme_wait} ${fp.crowd_pressure} TICKET (SED Rs.300): ${tp.still_long_wait} ${tp.no_vip_feel} COMMON: ${cp.health_safety} ${cp.brutal_truth} Survival Tip: ${fp.survival_tips[0]} | ${fp.survival_tips[1]} | ${fp.survival_tips[4]}`, visual_data: { type: 'INFO', decision: 'CAUTION' } };
      }
      if (text.includes('free darshan') || text.includes('sarva darshan') || text.includes('without ticket') || text.includes('free q') || text.includes('free queue') || text.includes('no ticket')) {
         const fp = sk.free_darshan_problems;
         const tips = fp.survival_tips.join(' | ');
         return { explanation: `Om Namo Venkatesaya. ⚠️ FREE DARSHAN REALITY CHECK: ${fp.extreme_wait} | ${fp.crowd_pressure} | ${fp.no_timing_control} | ${fp.facility_issues} | ${fp.mental_stress} | SURVIVAL TIPS: ${tips}`, visual_data: { type: 'INFO', decision: 'CAUTION' } };
      }
      if (text.includes('ticket problem') || text.includes('sed problem') || text.includes('with ticket') || text.includes('rs 300') || text.includes('sheeghra') || text.includes('special entry problem') || text.includes('ticket worth')) {
         const tp = sk.ticket_darshan_problems;
         const tips = tp.survival_tips.join(' | ');
         return { explanation: `Om Namo Venkatesaya. ⚠️ TICKET DARSHAN REALITY CHECK: ${tp.still_long_wait} | ${tp.slot_mismanagement} | ${tp.booking_issues} | ${tp.travel_stress} | ${tp.no_vip_feel} | SURVIVAL TIPS: ${tips}`, visual_data: { type: 'INFO', decision: 'CAUTION' } };
      }
      if (text.includes('plan') || text.includes('strategy') || text.includes('best way') || text.includes('smart') || text.includes('golden rule') || text.includes('advice') || text.includes('tip') || text.includes('suggest') || text.includes('recommend') || text.includes('prepare') || text.includes('preparation')) {
         const sp = sk.smart_planning;
         const rules = sp.golden_rules.join(' | ');
         return { explanation: `Om Namo Venkatesaya. 🧠 SMART PLANNING GUIDE: ${sp.best_strategy} | ❌ ${sp.worst_case} | GOLDEN RULES: ${rules} | ${sp.live_prediction_tip}`, visual_data: { type: 'INFO', decision: 'GO' } };
      }
      if (text.includes('traffic') || text.includes('jam') || text.includes('ghat road') || text.includes('delay') || text.includes('blocked')) {
         return { explanation: `Om Namo Venkatesaya. ⚠️ Traffic Reality: ${sk.common_problems.transport_traffic} Smart Tip: Travel before 5AM or after 9PM for smooth ghat road journey. Weekend traffic is 3x worse than weekdays.`, visual_data: { type: 'INFO', decision: 'CAUTION' } };
      }
      if (text.includes('dehydration') || text.includes('bp') || text.includes('blood pressure') || text.includes('faint') || text.includes('unconscious') || text.includes('heat') || text.includes('stroke') || text.includes('tired') || text.includes('exhausted') || text.includes('pain')) {
         return { explanation: `Om Namo Venkatesaya. 🚨 HEALTH ALERT: ${sk.common_problems.health_safety} Immediate Action: Inform nearest TTD volunteer. First Aid at every PAC. Ambulance: 108. SST Hospital: 0877-2234567. Drink water NOW. Sit and rest if possible. Do NOT push through if feeling unwell!`, visual_data: { type: 'INFO', decision: 'CAUTION' } };
      }

      if (text.includes('senior') || text.includes('old age') || text.includes('handicap') || text.includes('disabled') || text.includes('divyang') || text.includes('heart patient') || text.includes('priority darshan')) {
         const pp = sk.priority_protocol;
         return {
            explanation: `Om Namo Venkatesaya. PRIORITY MISSION ACTIVE. Eligibility: ${pp.who_is_eligible} | Documents: ${pp.id_documents} | Process: ${pp.process} | Timings: ${pp.timings} | Checkpoint: ${pp.checkpoints}`,
            map_commands: [{ action: "draw_route", points: [[13.6840, 79.3500], [13.6835, 79.3490], [13.6828, 79.3470]], zoom: 18 }],
            visual_data: { type: 'PRIME_DIRECTIVE', decision: 'GO' }
         };
      }

      // 4. Darshan type definitions
      if (text.includes('what is') || text.includes('tell me about') || text.includes('ssd') || text.includes('sed') || text.includes('divya') || text.includes('sarva') || text.includes('suprabhata') || text.includes('seva')) {
         for (const [key, val] of Object.entries(SACRED_KNOWLEDGE.darshan)) {
            if (text.includes(key.toLowerCase())) return { explanation: `Om Namo Venkatesaya. Sacred Briefing: ${val}`, visual_data: { type: 'INFO', decision: 'GO' } };
         }
         // General darshan info if no specific type matched
         return { explanation: `Om Namo Venkatesaya. Darshan Types: SSD (Free Slot Token), SED (Rs.300 Online), DIVYA (Free for foot pilgrims), SARVA (Free, any time), VIP (Rs.1500+). Which type would you like details on?`, visual_data: { type: 'INFO', decision: 'GO' } };
      }

      // 5. Telemetry Fallback (PAC/Traffic)
      if (text.includes('locker') || text.includes('pac')) {
         const pacs = status?.pac_lockers?.map(p => `${p.name}: ${p.count}`).join(', ');
         return {
            explanation: `Om Namo Venkatesaya. MISSION UPLINK UNSTABLE. Local Telemetry Report: ${pacs || 'Syncing...'}`,
            visual_data: { type: "RECOVERY_MODE", decision: "CAUTION" }
         };
      }

      // 6. CROWD PREDICTION INTELLIGENCE (NEW)
      if (text.includes('best time') || text.includes('when to visit') || text.includes('predict') || text.includes('tomorrow') || text.includes('crowd') || text.includes('waiting')) {
         const window = getOptimalVisitWindow('tirupati');
         return {
            explanation: `Om Namo Venkatesaya. PREDICTIVE AI ACTIVE: The optimal window for Darshan is ${window.startTime} to ${window.endTime}. AI Analysis shows a potential ${window.savingPercent}% reduction in wait times during this window. Grid Status: ${window.status}. Join the queue early!`,
            visual_data: { type: 'PREDICTION_HUB', decision: window.intensity < 0.4 ? 'GO' : 'CAUTION', window }
         };
      }

      return {
         explanation: "Om Namo Venkatesaya. Primary Mission link unstable. Select route info in the map overlays.",
         visual_data: { type: "RECOVERY_MODE", decision: "AVOID" }
      };
   };

   if (!hasValidKey) {
      return generateFallback(prompt, currentStatus);
   }

   try {
      const contextPrompt = `KNOWLEDGE: ${JSON.stringify(SACRED_KNOWLEDGE)}\nGRID: ${JSON.stringify(GLOBAL_MISSION_GRID)}\nROUTES: ${JSON.stringify(MISSION_ROUTES)}\nSTATUS: ${JSON.stringify(currentStatus)}`;

      return await callGroqAi({
         systemPrompt: baseSystemPrompt,
         userContext: contextPrompt,
         userPrompt: prompt
      });
   } catch (error) {
      console.error("AI Mission Error:", error);
      return generateFallback(prompt, currentStatus);
   }
}

const baseSystemPrompt = `
# TIRUPATI MISSION HUB: STRATEGIC AI HUB

You are the TIRUPATI MISSION AI GUIDE. You provide expert pilgrimage tactical navigation.

STRICT PROTOCOLS:
1. CRITICAL RULE: EVERY response/explanation MUST start with "Om Namo Venkatesaya". NEVER skip this.
2. You can draw routes on the map using action: "draw_route" with "points" coordinate arrays.
3. You MUST be able to navigate between ANY two nodes in the GLOBAL_MISSION_GRID. If the user asks for "Route from A to B", find their coordinates and return them as a segment.
4. Use the GRID and ROUTES provided to synthesize tactical guidance.

FORMAT (JSON):
{
  "explanation": "string",
  "map_commands": [{"action": "draw_route", "points": [[lat,lng],...], "zoom": number}],
  "visual_data": { "type": "NAVIGATOR_HUB | PREDICTION_HUB", "decision": "GO|CAUTION|AVOID" },
  "prediction_insights": { "best_window": "string", "saving": "number" }
}
`;
