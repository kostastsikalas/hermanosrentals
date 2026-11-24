// Hosthub Open API integration
// Uses Hosthub API Key to sync availability and rates directly with Hosthub

export const HOSTHUB_API_KEY = process.env.HOSTHUB_API_KEY || 'YzE1YTViMTktZTBlNy00MzM2LTk1YjAtOWE2NjkzZTU4ZDAx';
export const HOSTHUB_BASE_URL = 'https://app.hosthub.com/api/2019-03-01';

export const HOSTHUB_RENTALS = [
  {
    id: 'two-bedroom',
    hosthub_id: '26h6xx3s78',
    name: 'Two Bedroom Apartment',
    title_el: 'Two Bedroom Apartment',
    title_en: 'Two Bedroom Apartment',
    floor_el: '1ος Όροφος',
    floor_en: '1st Floor',
    capacity: 6,
    price: 98,
    images: [
      '/apartments/minos-1st-floor/image00001.jpeg',
      '/apartments/minos-1st-floor/image00002.jpeg',
      '/apartments/minos-1st-floor/image00003.jpeg',
      '/apartments/minos-1st-floor/image00004.jpeg',
    ],
  },
  {
    id: 'deluxe-queen',
    hosthub_id: 'havcyt1asp',
    name: 'Deluxe Studio with Queen size bed',
    title_el: 'Deluxe Studio with Queen size bed',
    title_en: 'Deluxe Studio with Queen size bed',
    floor_el: 'Ισόγειο',
    floor_en: 'Ground Floor',
    capacity: 2,
    price: 65,
    images: [
      '/apartments/minos-deluxe/image00002.jpeg',
      '/apartments/minos-deluxe/image00003.jpeg',
      '/apartments/minos-deluxe/image00004.jpeg',
    ],
  },
  {
    id: 'second-floor-4',
    hosthub_id: 'sfr8dwynnm',
    name: 'Second floor number 4',
    title_el: 'Second floor number 4',
    title_en: 'Second floor number 4',
    floor_el: '2ος Όροφος',
    floor_en: '2nd Floor',
    capacity: 2,
    price: 63,
    images: [
      '/apartments/minos-1st-floor/image00006.jpeg',
      '/apartments/minos-1st-floor/image00008.jpeg',
      '/apartments/minos-1st-floor/image00009.jpeg',
    ],
  },
  {
    id: 'second-floor-deluxe',
    hosthub_id: '2m1upswrc1',
    name: 'Second floor deluxe studio',
    title_el: 'Second floor deluxe studio',
    title_en: 'Second floor deluxe studio',
    floor_el: '2ος Όροφος',
    floor_en: '2nd Floor',
    capacity: 2,
    price: 60,
    images: [
      '/apartments/minos-deluxe/image00005.jpeg',
      '/apartments/minos-deluxe/image00006.jpeg',
      '/apartments/minos-deluxe/image00007.jpeg',
    ],
  },
  {
    id: 'standard-studio',
    hosthub_id: 's8t2qech6g',
    name: 'Standard studio',
    title_el: 'Standard studio',
    title_en: 'Standard studio',
    floor_el: 'Ισόγειο',
    floor_en: 'Ground Floor',
    capacity: 2,
    price: 59,
    images: [
      '/apartments/minos-standard/image00001.jpeg',
      '/apartments/minos-standard/image00002.jpeg',
      '/apartments/minos-standard/image00003.jpeg',
    ],
  },
  {
    id: 'second-floor-1',
    hosthub_id: 'ed8ez4rnuh',
    name: 'second floor number 1',
    title_el: 'second floor number 1',
    title_en: 'second floor number 1',
    floor_el: '2ος Όροφος',
    floor_en: '2nd Floor',
    capacity: 2,
    price: 55,
    images: [
      '/apartments/minos-white/20181120_174443.jpg',
      '/apartments/minos-white/20181120_174449.jpg',
      '/apartments/minos-white/20181120_174518.jpg',
    ],
  },
  {
    id: 'studio-yard',
    hosthub_id: '6n5b3d8y2x',
    name: 'Studio with yard',
    title_el: 'Studio with yard',
    title_en: 'Studio with yard',
    floor_el: 'Ισόγειο',
    floor_en: 'Ground Floor',
    capacity: 2,
    price: 53,
    images: [
      '/apartments/minos-white/DSC_0002.jpg',
      '/apartments/minos-white/DSC_0003.jpg',
      '/apartments/minos-white/DSC_0004.jpg',
    ],
  },
];

/**
 * Checks if a rental is available in Hosthub for given start & end date.
 * Returns true if available, false if blocked/booked in Hosthub.
 */
export async function checkHosthubAvailability(hosthubRentalId, startDate, endDate) {
  if (!hosthubRentalId || !startDate || !endDate) return true;

  try {
    const url = `${HOSTHUB_BASE_URL}/rentals/${encodeURIComponent(hosthubRentalId)}/calendar-events`;
    const res = await fetch(url, {
      headers: {
        Authorization: HOSTHUB_API_KEY,
        'User-Agent': 'HermanosRentals/1.0',
      },
    });

    if (!res.ok) {
      console.warn(`Hosthub calendar check HTTP ${res.status}`);
      return true; // Fallback to allowing check if Hosthub API is temporarily slow
    }

    const json = await res.json();
    const events = json.data || [];

    const reqStart = new Date(startDate);
    const reqEnd = new Date(endDate);

    const isBlocked = events.some((ev) => {
      if (ev.cancelled_at) return false;
      const evStart = new Date(ev.date_from);
      const evEnd = new Date(ev.date_to);
      // Overlap condition
      return reqStart < evEnd && reqEnd > evStart;
    });

    return !isBlocked;
  } catch (err) {
    console.error('Hosthub availability check error:', err);
    return true; // Fail open to not block booking if network glitch
  }
}
