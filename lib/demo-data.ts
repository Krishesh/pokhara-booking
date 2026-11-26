import type { Currency, Offer, PricingUnit, VerificationStatus } from "@/lib/types";

export interface DemoActivity {
  id: string;
  name: string;
  slug: string;
  category: string;
  location: string;
  cardLocation: string;
  description: string[];
  image: string | null;
  imageAlt: string;
  credit: string | null;
  relatedSlugs: string[];
  offers: Offer[];
}

export interface DemoOuting {
  id: string;
  slug: string;
  title: string;
  destination: string;
  date: string | null;
  dateLabel: string;
  monthLabel: string;
  monthKey: string;
  day: string | null;
  monthShort: string | null;
  weekday: string | null;
  organizer: string;
  cost: string;
  summary: string;
  about: string[];
  meeting: string;
  image: string | null;
  imageAlt: string;
  credit: string | null;
  status: "cancelled" | "tbc" | null;
  takesInterest: boolean;
}

const SOURCE_DOMAIN = "demo-listings.example.com";

interface ProviderSeed {
  id: string;
  name: string;
  rating?: number;
  reviews?: number;
}

const PROVIDERS = {
  kayak: { id: "p-kayak", name: "Lakeside Kayak & SUP", rating: 4.4, reviews: 93 },
  rowing: { id: "p-rowing", name: "Phewa Rowing Cooperative", rating: 4.2 },
  sky: { id: "p-sky", name: "Annapurna Sky Tandem", rating: 4.2, reviews: 57 },
  fewa: { id: "p-fewa", name: "Fewa Wings Paragliding", rating: 4.8, reviews: 1240 },
  machhapuchhre: {
    id: "p-machhapuchhre",
    name: "Machhapuchhre Air Sports",
    rating: 4.9,
    reviews: 312,
  },
  skyline: {
    id: "p-skyline",
    name: "Sarangkot Skyline Adventures",
    rating: 4.6,
    reviews: 486,
  },
  kaski: { id: "p-kaski", name: "Kaski Ultralight Flights", rating: 4.7, reviews: 198 },
  valley: {
    id: "p-valley",
    name: "Pokhara Valley Guides",
    rating: 4.8,
    reviews: 127,
  },
  zipline: { id: "p-zipline", name: "Seti River Zipline", rating: 4.5, reviews: 864 },
  bungee: { id: "p-bungee", name: "Hemja Gorge Bungee", rating: 4.5, reviews: 210 },
} satisfies Record<string, ProviderSeed>;

interface OfferSeed {
  id: string;
  activityId: string;
  provider?: ProviderSeed;
  packageName: string;
  price: number;
  currency: Currency;
  unit: PricingUnit;
  duration?: string;
  inclusions?: string;
  conditions?: string;
  verification: VerificationStatus;
  checked: string;
}

function makeOffer(seed: OfferSeed): Offer {
  return {
    id: seed.id,
    activity_id: seed.activityId,
    provider_id: seed.provider?.id ?? null,
    package_name: seed.packageName,
    price: seed.price,
    currency: seed.currency,
    pricing_unit: seed.unit,
    duration: seed.duration ?? null,
    inclusions: seed.inclusions ?? null,
    booking_conditions: seed.conditions ?? null,
    verification_status: seed.verification,
    retrieved_at: seed.checked,
    source_domain: SOURCE_DOMAIN,
    provider: seed.provider
      ? {
          id: seed.provider.id,
          name: seed.provider.name,
          google_rating: seed.provider.rating ?? null,
          google_review_count: seed.provider.reviews ?? null,
        }
      : null,
  };
}

const ACTIVITIES: DemoActivity[] = [
  {
    id: "a-boating",
    name: "Boating on Phewa Lake",
    slug: "boating-phewa-lake",
    category: "Boating",
    location: "Lakeside",
    cardLocation: "Lakeside",
    description: [
      "Rowing or paddle boat trip on Phewa Lake, Pokhara's largest lake.",
      "A common stop is the Tal Barahi temple on its small island.",
    ],
    image: "/images/boating-phewa-lake.jpg",
    imageAlt: "Boats on Phewa Lake with the Annapurna hills behind",
    credit: "Photo: Bijay Chaurasia, CC BY-SA 4.0, via Wikimedia Commons",
    relatedSlugs: [
      "paragliding-sarangkot",
      "ultralight-flight",
      "world-peace-pagoda-hike",
    ],
    offers: [
      makeOffer({
        id: "e-boating-1",
        activityId: "a-boating",
        provider: PROVIDERS.kayak,
        packageName: "Single kayak hire",
        price: 900,
        currency: "NPR",
        unit: "per_person",
        duration: "1 hour",
        inclusions: "Sit-on-top kayak\nPaddle and life jacket",
        conditions: "Basic swimming ability required.",
        verification: "unverified",
        checked: "2026-11-19",
      }),
      makeOffer({
        id: "e-boating-2",
        activityId: "a-boating",
        provider: PROVIDERS.rowing,
        packageName: "Paddle boat, up to 4 people",
        price: 1000,
        currency: "NPR",
        unit: "per_group",
        duration: "1 hour",
        inclusions: "Paddle boat\nLife jackets",
        conditions: "Pay at the boat station on the day.",
        verification: "verified",
        checked: "2026-11-20",
      }),
      makeOffer({
        id: "e-boating-3",
        activityId: "a-boating",
        provider: PROVIDERS.rowing,
        packageName: "Rowing boat, up to 4 people",
        price: 1500,
        currency: "NPR",
        unit: "per_group",
        duration: "1 hour",
        inclusions: "Boat and life jackets\nBoatman",
        conditions: "Pay at the boat station on the day.",
        verification: "verified",
        checked: "2026-11-12",
      }),
      makeOffer({
        id: "e-boating-4",
        activityId: "a-boating",
        provider: PROVIDERS.kayak,
        packageName: "Guided kayak tour",
        price: 1800,
        currency: "NPR",
        unit: "per_hour",
        duration: "Minimum 2 hours",
        inclusions: "Kayak and gear\nGuide",
        conditions: "Priced per hour: contact us for a quote.",
        verification: "unverified",
        checked: "2026-11-19",
      }),
      makeOffer({
        id: "e-boating-5",
        activityId: "a-boating",
        provider: PROVIDERS.kayak,
        packageName: "Stand-up paddleboard lesson",
        price: 3500,
        currency: "NPR",
        unit: "per_person",
        duration: "2 hours",
        inclusions: "Board, paddle and life jacket\nCertified instructor\nDry bag for your phone",
        conditions: "Morning sessions only (calmer water).",
        verification: "verified",
        checked: "2026-11-19",
      }),
    ],
  },
  {
    id: "a-bungee",
    name: "Bungee Jump at Hemja",
    slug: "bungee-jump-hemja",
    category: "Bungee",
    location: "Hemja",
    cardLocation: "Hemja",
    description: [
      "Bungee jump from a tower above a river gorge at Hemja, north of Pokhara.",
      "Unpublished on purpose: used to check that hidden activities stay off the site.",
    ],
    image: null,
    imageAlt: "Bungee Jump at Hemja (no photo available)",
    credit: null,
    relatedSlugs: [
      "boating-phewa-lake",
      "paragliding-sarangkot",
      "ultralight-flight",
    ],
    offers: [
      makeOffer({
        id: "e-bungee-1",
        activityId: "a-bungee",
        provider: PROVIDERS.bungee,
        packageName: "Canyon swing",
        price: 10500,
        currency: "NPR",
        unit: "per_person",
        duration: "1 swing",
        inclusions: "Swing from the 70 m tower\nSafety briefing",
        conditions: "Minimum age 14. Weight 35–110 kg.",
        verification: "unverified",
        checked: "2026-11-20",
      }),
      makeOffer({
        id: "e-bungee-2",
        activityId: "a-bungee",
        provider: PROVIDERS.bungee,
        packageName: "Bungee jump",
        price: 11500,
        currency: "NPR",
        unit: "per_person",
        duration: "1 jump",
        inclusions: "Jump from the 70 m tower\nSafety briefing\nCertificate",
        conditions: "Minimum age 14. Weight 35–110 kg.",
        verification: "verified",
        checked: "2026-11-01",
      }),
      makeOffer({
        id: "e-bungee-3",
        activityId: "a-bungee",
        provider: PROVIDERS.bungee,
        packageName: "Bungee and swing combo",
        price: 18000,
        currency: "NPR",
        unit: "per_person",
        duration: "1 jump + 1 swing",
        inclusions: "One bungee jump and one canyon swing\nCertificate\nPhotos",
        conditions: "Both on the same day.",
        verification: "verified",
        checked: "2026-11-20",
      }),
    ],
  },
  {
    id: "a-paragliding",
    name: "Paragliding at Sarangkot",
    slug: "paragliding-sarangkot",
    category: "Paragliding",
    location: "Sarangkot",
    cardLocation: "Sarangkot",
    description: [
      "Tandem paragliding flight launching from Sarangkot hill with a trained pilot.",
      "On clear days the flight looks out over Phewa Lake and the Annapurna range before landing near Lakeside.",
    ],
    image: "/images/paragliding-sarangkot.jpg",
    imageAlt: "Paraglider over Sarangkot near Pokhara",
    credit: "Photo: Thoplo.1, CC BY-SA 4.0, via Wikimedia Commons",
    relatedSlugs: [
      "boating-phewa-lake",
      "ultralight-flight",
      "world-peace-pagoda-hike",
    ],
    offers: [
      makeOffer({
        id: "e-paragliding-1",
        activityId: "a-paragliding",
        provider: PROVIDERS.sky,
        packageName: "Budget tandem flight",
        price: 8800,
        currency: "NPR",
        unit: "per_person",
        duration: "15–20 minutes",
        inclusions: "Tandem pilot\nFlight insurance",
        conditions: "Transport to the take-off point not included.",
        verification: "unverified",
        checked: "2026-11-18",
      }),
      makeOffer({
        id: "e-paragliding-2",
        activityId: "a-paragliding",
        provider: PROVIDERS.fewa,
        packageName: "Standard tandem flight",
        price: 10500,
        currency: "NPR",
        unit: "per_person",
        duration: "25–30 minutes",
        inclusions: "Certified tandem pilot\nFlight insurance\nPick-up and drop-off from Lakeside",
        conditions:
          "Weather dependent; rescheduled or refunded if the flight is cancelled.\nMaximum weight 100 kg.",
        verification: "verified",
        checked: "2026-11-20",
      }),
      makeOffer({
        id: "e-paragliding-3",
        activityId: "a-paragliding",
        provider: PROVIDERS.machhapuchhre,
        packageName: "Sunrise tandem flight",
        price: 11500,
        currency: "NPR",
        unit: "per_person",
        duration: "25–30 minutes",
        inclusions:
          "Licensed tandem pilot\nFlight insurance\nPick-up from Lakeside hotels\nPhotos from the pilot's camera",
        conditions: "Weather dependent: rebooked or refunded if cancelled.\nPassenger weight 15–100 kg.",
        verification: "verified",
        checked: "2026-11-20",
      }),
      makeOffer({
        id: "e-paragliding-4",
        activityId: "a-paragliding",
        provider: PROVIDERS.skyline,
        packageName: "Tandem flight with photos and video",
        price: 12500,
        currency: "NPR",
        unit: "per_person",
        duration: "30 minutes",
        inclusions: "Certified tandem pilot\nGoPro photos and video\nPick-up from Lakeside",
        verification: "unverified",
        checked: "2026-11-08",
      }),
      makeOffer({
        id: "e-paragliding-5",
        activityId: "a-paragliding",
        provider: PROVIDERS.fewa,
        packageName: "Acro tandem flight",
        price: 16000,
        currency: "NPR",
        unit: "per_person",
        duration: "30 minutes",
        inclusions: "Experienced acro pilot\nFlight insurance\nGoPro video\nPick-up from Lakeside",
        conditions: "Spirals and wingovers: not recommended if you get motion sick.",
        verification: "verified",
        checked: "2026-11-20",
      }),
      makeOffer({
        id: "e-paragliding-6",
        activityId: "a-paragliding",
        provider: PROVIDERS.skyline,
        packageName: "Cross-country flight",
        price: 150,
        currency: "USD",
        unit: "per_person",
        duration: "1 hour",
        inclusions: "Experienced cross-country pilot\nFlight insurance",
        conditions: "Only offered October to April.",
        verification: "unverified",
        checked: "2026-11-08",
      }),
    ],
  },
  {
    id: "a-ultralight",
    name: "Ultralight Flight",
    slug: "ultralight-flight",
    category: "Ultralight",
    location: "Pokhara Airport",
    cardLocation: "Pokhara Airport",
    description: [
      "Short scenic flight in a two-seat ultralight aircraft, flown by a licensed pilot.",
      "The route circles the Pokhara valley with close views of the surrounding hills and mountains.",
    ],
    image: "/images/ultralight-flight.jpg",
    imageAlt: "Ultralight aircraft above the Pokhara valley",
    credit:
      "Photo: Pokhara and Phewa Lake from above by Bijay Chaurasia, CC BY-SA 4.0, via Wikimedia Commons",
    relatedSlugs: [
      "boating-phewa-lake",
      "paragliding-sarangkot",
      "world-peace-pagoda-hike",
    ],
    offers: [
      makeOffer({
        id: "e-ultralight-1",
        activityId: "a-ultralight",
        provider: PROVIDERS.skyline,
        packageName: "15-minute ultralight flight",
        price: 16500,
        currency: "NPR",
        unit: "per_flight",
        duration: "15 minutes",
        inclusions: "Licensed pilot\nAirport transfer",
        conditions: "Morning flights only, weather permitting.\nMaximum weight 95 kg.",
        verification: "verified",
        checked: "2026-11-08",
      }),
      makeOffer({
        id: "e-ultralight-2",
        activityId: "a-ultralight",
        provider: PROVIDERS.kaski,
        packageName: "30-minute mountain flight",
        price: 26000,
        currency: "NPR",
        unit: "per_flight",
        duration: "30 minutes",
        inclusions: "Licensed pilot\nAirport transfer\nClose views of Machhapuchhre",
        conditions: "Morning flights only, weather permitting.",
        verification: "verified",
        checked: "2026-11-20",
      }),
      makeOffer({
        id: "e-ultralight-3",
        activityId: "a-ultralight",
        provider: PROVIDERS.kaski,
        packageName: "60-minute Annapurna flight",
        price: 46000,
        currency: "NPR",
        unit: "per_flight",
        duration: "60 minutes",
        inclusions: "Licensed pilot\nAirport transfer\nAnnapurna range circuit",
        conditions: "Morning flights only, weather permitting.",
        verification: "verified",
        checked: "2026-11-20",
      }),
      makeOffer({
        id: "e-ultralight-4",
        activityId: "a-ultralight",
        provider: PROVIDERS.machhapuchhre,
        packageName: "15-minute valley flight",
        price: 125,
        currency: "USD",
        unit: "per_flight",
        duration: "15 minutes",
        inclusions: "Licensed pilot\nFlight insurance",
        verification: "unverified",
        checked: "2026-11-18",
      }),
    ],
  },
  {
    id: "a-world-peace",
    name: "World Peace Pagoda Hike",
    slug: "world-peace-pagoda-hike",
    category: "Hiking",
    location: "Anadu Hill",
    cardLocation: "Anadu Hill",
    description: [
      "Hike up Anadu Hill to the white World Peace Pagoda above the south shore of Phewa Lake.",
      "The trail climbs through forest and can be combined with a boat crossing back to Lakeside.",
    ],
    image: "/images/world-peace-pagoda-hike.jpg",
    imageAlt: "World Peace Pagoda above Phewa Lake",
    credit: "Photo: Yallu007, CC BY-SA 4.0, via Wikimedia Commons",
    relatedSlugs: [
      "boating-phewa-lake",
      "paragliding-sarangkot",
      "ultralight-flight",
    ],
    offers: [
      makeOffer({
        id: "e-world-peace-1",
        activityId: "a-world-peace",
        provider: PROVIDERS.valley,
        packageName: "Guided hike with boat crossing",
        price: 2500,
        currency: "NPR",
        unit: "per_person",
        duration: "About 4 hours",
        inclusions: "English-speaking guide\nBoat across Phewa Lake\nWater",
        conditions: "Moderate climb on stone steps. Good shoes needed.",
        verification: "verified",
        checked: "2026-11-20",
      }),
      makeOffer({
        id: "e-world-peace-2",
        activityId: "a-world-peace",
        provider: PROVIDERS.valley,
        packageName: "Private sunrise hike",
        price: 6000,
        currency: "NPR",
        unit: "per_group",
        duration: "About 3 hours",
        inclusions: "Private guide for your group (up to 6)\nHot tea at the top",
        conditions: "Starts at 5:00 am from Lakeside.",
        verification: "unverified",
        checked: "2026-11-20",
      }),
    ],
  },
  {
    id: "a-zipline",
    name: "Zipline at Sarangkot",
    slug: "zipline-sarangkot",
    category: "Zipline",
    location: "Sarangkot",
    cardLocation: "Sarangkot",
    description: [
      "Long, steep zipline descending from the Sarangkot ridge toward the valley floor.",
      "Riders are harnessed in and travel at high speed over forest and fields.",
    ],
    image: "/images/zipline-sarangkot.jpg",
    imageAlt: "Sarangkot hillside above the Pokhara valley",
    credit: "Photo: Sarangkot hillside by Bijay Chaurasia, CC BY-SA 4.0, via Wikimedia Commons",
    relatedSlugs: [
      "boating-phewa-lake",
      "paragliding-sarangkot",
      "ultralight-flight",
    ],
    offers: [
      makeOffer({
        id: "e-zipline-1",
        activityId: "a-zipline",
        packageName: "Zipline ride",
        price: 6000,
        currency: "NPR",
        unit: "per_person",
        duration: "2 minutes ride, 2 hours total",
        inclusions: "Transport from Lakeside\nSafety gear",
        verification: "unverified",
        checked: "2026-10-30",
      }),
      makeOffer({
        id: "e-zipline-2",
        activityId: "a-zipline",
        provider: PROVIDERS.zipline,
        packageName: "Zipline ride with transport",
        price: 7500,
        currency: "NPR",
        unit: "per_person",
        duration: "2 minutes ride, about 2.5 hours total",
        inclusions: "Return transport from Lakeside\nHarness and helmet\nSafety briefing",
        conditions: "Weight 35–125 kg. Not suitable during pregnancy.",
        verification: "verified",
        checked: "2026-11-20",
      }),
      makeOffer({
        id: "e-zipline-3",
        activityId: "a-zipline",
        provider: PROVIDERS.zipline,
        packageName: "Zipline with GoPro video",
        price: 8800,
        currency: "NPR",
        unit: "per_person",
        duration: "2 minutes ride, about 2.5 hours total",
        inclusions: "Everything in the standard ride\nGoPro video of your ride",
        conditions: "Weight 35–125 kg. Not suitable during pregnancy.",
        verification: "unverified",
        checked: "2026-11-20",
      }),
    ],
  },
];

const OUTINGS: DemoOuting[] = [
  {
    id: "o-sarangkot",
    slug: "sarangkot-sunrise-hike",
    title: "Sarangkot sunrise hike",
    destination: "Sarangkot",
    date: "2026-12-05",
    dateLabel: "Sat, 5 Dec 2026",
    monthLabel: "December 2026",
    monthKey: "2026-12",
    day: "5",
    monthShort: "Dec",
    weekday: "Sat",
    organizer: "Lakeside Trekking Circle",
    cost: "Free (breakfast at your own cost).",
    summary:
      "An early walk up to Sarangkot viewpoint for sunrise over the Annapurna range, then breakfast in the village.",
    about: [
      "An early walk up to Sarangkot viewpoint for sunrise over the Annapurna range, then breakfast in the village.",
    ],
    meeting: "Meet at 4:45 am at Lakeside Chowk. Bring a torch and a warm layer.",
    image: "/images/outing-sarangkot-sunrise-hike.jpg",
    imageAlt: "Sarangkot hillside at sunrise",
    credit: "Photo: Bijay Chaurasia, CC BY-SA 4.0, via Wikimedia Commons",
    status: null,
    takesInterest: true,
  },
  {
    id: "o-australian",
    slug: "australian-camp-overnight",
    title: "Australian Camp overnight",
    destination: "Australian Camp",
    date: "2026-12-06",
    dateLabel: "Sun, 6 Dec 2026",
    monthLabel: "December 2026",
    monthKey: "2026-12",
    day: "6",
    monthShort: "Dec",
    weekday: "Sun",
    organizer: "Lakeside Trekking Circle",
    cost: "Around NPR 4,000 per person.",
    summary: "Overnight hike to Australian Camp for sunset and sunrise views of the Annapurna range.",
    about: [
      "Overnight hike to Australian Camp for sunset and sunrise views of the Annapurna range.",
    ],
    meeting: "Meet at 7:00 am at Lakeside Chowk.",
    image: null,
    imageAlt: "Australian Camp overnight (no photo available)",
    credit: null,
    status: "cancelled",
    takesInterest: false,
  },
  {
    id: "oon-hill",
    slug: "poon-hill-sunrise-weekend",
    title: "Poon Hill sunrise weekend",
    destination: "Ghorepani and Poon Hill",
    date: "2026-12-12",
    dateLabel: "Sat, 12 Dec 2026",
    monthLabel: "December 2026",
    monthKey: "2026-12",
    day: "12",
    monthShort: "Dec",
    weekday: "Sat",
    organizer: "Lakeside Trekking Circle",
    cost: "Around NPR 6,500 per person (jeep, teahouse stay, dinner and breakfast). Paid to the organizer, not on this website.",
    summary:
      "A relaxed two-day group hike from Nayapul to Ghorepani, with an early climb to Poon Hill for sunrise over Annapurna South and Dhaulagiri.",
    about: [
      "A relaxed two-day group hike from Nayapul to Ghorepani, with an early climb to Poon Hill for sunrise over Annapurna South and Dhaulagiri.",
      "Good walking shoes and a warm jacket needed. Beginners welcome; we walk at the pace of the group.",
    ],
    meeting: "Meet at 6:30 am at the Lakeside bus park, Pokhara.\nShared jeep to Nayapul, back on Sunday evening.",
    image: "/images/outing-poon-hill.jpg",
    imageAlt: "Sunrise from Poon Hill over the Annapurna range",
    credit: "Photo: Aditya Pal, CC BY-SA 4.0, via Wikimedia Commons",
    status: null,
    takesInterest: true,
  },
  {
    id: "o-bandipur",
    slug: "bandipur-heritage-day-trip",
    title: "Bandipur heritage day trip",
    destination: "Bandipur",
    date: "2026-12-20",
    dateLabel: "Sun, 20 Dec 2026",
    monthLabel: "December 2026",
    monthKey: "2026-12",
    day: "20",
    monthShort: "Dec",
    weekday: "Sun",
    organizer: "Lakeside Trekking Circle",
    cost: "Around NPR 3,000 per person (return bus and lunch).",
    summary:
      "A day in the car-free hilltop bazaar of Bandipur: old Newar houses, temples, and a short walk to the Tundikhel viewpoint.",
    about: [
      "A day in the car-free hilltop bazaar of Bandipur: old Newar houses, temples, and a short walk to the Tundikhel viewpoint.",
    ],
    meeting: "Meet at 6:30 am at Prithvi Chowk bus stop.",
    image: "/images/outing-bandipur.jpg",
    imageAlt: "Ganesh Temple in the hilltop bazaar of Bandipur",
    credit: "Photo: Rajesh Dhungana, CC BY-SA 4.0, via Wikimedia Commons",
    status: null,
    takesInterest: true,
  },
  {
    id: "o-ghandruk",
    slug: "ghandruk-village-weekend",
    title: "Ghandruk village weekend",
    destination: "Ghandruk",
    date: "2027-01-09",
    dateLabel: "Sat, 9 Jan 2027",
    monthLabel: "January 2027",
    monthKey: "2027-01",
    day: "9",
    monthShort: "Jan",
    weekday: "Sat",
    organizer: "Pokhara Weekend Walkers",
    cost: "Around NPR 5,500 per person (jeep, homestay, dinner and breakfast).",
    summary:
      "Two days in the Gurung village of Ghandruk, with views of Annapurna South and Machhapuchhre.",
    about: [
      "Two days in the Gurung village of Ghandruk, with views of Annapurna South and Machhapuchhre.",
      "Short jeep ride, then an easy 2-hour walk. Homestay with a local family, and a visit to the Gurung museum.",
    ],
    meeting: "Meet at 7:00 am at the Baglung bus park, Pokhara.\nBack on Sunday by 5 pm.",
    image: "/images/outing-ghandruk.jpg",
    imageAlt: "Ghandruk village with Annapurna South behind",
    credit: "Photo: Kondephy, CC BY-SA 4.0, via Wikimedia Commons",
    status: null,
    takesInterest: true,
  },
  {
    id: "o-abc",
    slug: "annapurna-base-camp-group-trek",
    title: "Annapurna Base Camp group trek",
    destination: "Annapurna Base Camp",
    date: "2027-03-15",
    dateLabel: "Mon, 15 Mar 2027",
    monthLabel: "March 2027",
    monthKey: "2027-03",
    day: "15",
    monthShort: "Mar",
    weekday: "Mon",
    organizer: "Himalayan Trail Friends",
    cost: "Around NPR 55,000 per person for 8 days (permits, guide, teahouses and meals).",
    summary:
      "Eight-day group trek through Ghandruk, Chhomrong and the Modi Khola valley to Annapurna Base Camp (4,130 m).",
    about: [
      "Eight-day group trek through Ghandruk, Chhomrong and the Modi Khola valley to Annapurna Base Camp (4,130 m).",
      "Good fitness needed; previous trekking experience recommended. Group of 6–10.",
    ],
    meeting: "Briefing the evening before departure at Lakeside (location shared after registering).",
    image: "/images/outing-annapurna-base-camp.jpg",
    imageAlt: "Annapurna Base Camp surrounded by snowy peaks",
    credit: "Photo: Samdesherpa, CC BY-SA 4.0, via Wikimedia Commons",
    status: null,
    takesInterest: true,
  },
  {
    id: "o-begnas",
    slug: "begnas-lake-walk-and-picnic",
    title: "Begnas Lake walk and picnic",
    destination: "Begnas Lake",
    date: null,
    dateLabel: "Date to be confirmed",
    monthLabel: "Date to be confirmed",
    monthKey: "tbc",
    day: null,
    monthShort: null,
    weekday: null,
    organizer: "Pokhara Weekend Walkers",
    cost: "To be confirmed",
    summary:
      "An easy half-day walk along the Begnas Lake shore and up to a viewpoint, followed by a picnic by the water. Family friendly.",
    about: [
      "An easy half-day walk along the Begnas Lake shore and up to a viewpoint, followed by a picnic by the water.",
      "Family friendly.",
    ],
    meeting: "To be confirmed. The organizer will share it with people who registered.",
    image: "/images/outing-begnas-lake.jpg",
    imageAlt: "Begnas Lake beside the hills near Pokhara",
    credit: "Photo: Shadow Ayush, CC BY-SA 4.0, via Wikimedia Commons",
    status: "tbc",
    takesInterest: true,
  },
  {
    id: "o-rupa",
    slug: "rupa-lake-cycling-day",
    title: "Rupa Lake cycling day",
    destination: "Rupa Lake",
    date: null,
    dateLabel: "Date to be confirmed",
    monthLabel: "Date to be confirmed",
    monthKey: "tbc",
    day: null,
    monthShort: null,
    weekday: null,
    organizer: "Pokhara Weekend Walkers",
    cost: "To be confirmed",
    summary:
      "Ride from Lakeside to the quiet Rupa Lake, with a stop at Begnas on the way back. Mostly flat village roads, one steady climb.",
    about: [
      "Ride from Lakeside to the quiet Rupa Lake, with a stop at Begnas on the way back. Mostly flat village roads, one steady climb.",
      "Bikes can be rented the day before.",
    ],
    meeting: "To be confirmed. The organizer will share it with people who registered.",
    image: "/images/outing-rupa-lake.jpg",
    imageAlt: "Rupa Lake and the surrounding village hills",
    credit: "Photo: Pursob64, CC BY-SA 4.0, via Wikimedia Commons",
    status: "tbc",
    takesInterest: true,
  },
];

export function getActivities(): DemoActivity[] {
  return [...ACTIVITIES].sort((a, b) => a.name.localeCompare(b.name));
}

export function getActivityBySlug(slug: string): DemoActivity | null {
  return ACTIVITIES.find((activity) => activity.slug === slug) ?? null;
}

export function getRelatedActivities(activity: DemoActivity): DemoActivity[] {
  return activity.relatedSlugs
    .map((slug) => getActivityBySlug(slug))
    .filter((item): item is DemoActivity => item !== null);
}

export function getOutings(): DemoOuting[] {
  return OUTINGS;
}

export function getOutingBySlug(slug: string): DemoOuting | null {
  return OUTINGS.find((outing) => outing.slug === slug) ?? null;
}

export function getNextOuting(): DemoOuting {
  return OUTINGS[0];
}

export function getListedOutings(): DemoOuting[] {
  return OUTINGS.slice(1);
}

export function getOutingStats() {
  return {
    upcoming: OUTINGS.filter((outing) => outing.status !== "cancelled").length,
    organizers: new Set(OUTINGS.map((outing) => outing.organizer)).size,
  };
}

export function groupOutings(): { key: string; label: string; outings: DemoOuting[] }[] {
  const groups: { key: string; label: string; outings: DemoOuting[] }[] = [];
  for (const outing of getListedOutings()) {
    let group = groups.find((item) => item.key === outing.monthKey);
    if (!group) {
      group = { key: outing.monthKey, label: outing.monthLabel, outings: [] };
      groups.push(group);
    }
    group.outings.push(outing);
  }
  return groups;
}

export function getRelatedOutings(current: DemoOuting): DemoOuting[] {
  return OUTINGS.filter(
    (outing) =>
      outing.slug !== current.slug &&
      outing.status !== "cancelled" &&
      outing.date !== null
  ).slice(0, 3);
}

export function getTotalOfferCount(): number {
  return ACTIVITIES.reduce((total, activity) => total + activity.offers.length, 0);
}
