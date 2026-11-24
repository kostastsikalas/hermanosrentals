// Shared pricing / payment rules — used by the booking page (display)
// and by the serverless API (authoritative amount sent to Viva).

export const SCOOTER_DEPOSIT_RATE = 0.3;
export const NON_REFUNDABLE_DISCOUNT = 0.1;

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export function calculateDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;
  const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 1;
}

/**
 * Payment options available for a given selection.
 *  - scooter only   : scooter_deposit (30%) | full
 *  - apartment only : full
 *  - both           : combo_deposit (apartment 100% + scooter 30%)
 *                     | full_refundable | full_nonrefundable (-10%)
 */
export function getAvailableOptions({ hasApartment, hasScooter }) {
  if (hasApartment && hasScooter) return ['combo_deposit', 'full_refundable', 'full_nonrefundable'];
  if (hasScooter) return ['scooter_deposit', 'full'];
  if (hasApartment) return ['full'];
  return [];
}

export function getDefaultOption(selection) {
  return getAvailableOptions(selection)[0] || null;
}

/**
 * Returns the amounts for a booking.
 * total     = final price of the booking (after any discount)
 * dueNow    = amount charged online through Viva now
 * remaining = amount paid on arrival / pickup
 */
export function computePayment({ apartmentPrice = 0, scooterPrice = 0, days = 0, hasApartment, hasScooter, option }) {
  const apartmentTotal = hasApartment ? round2(Number(apartmentPrice || 0) * days) : 0;
  const scooterTotal = hasScooter ? round2(Number(scooterPrice || 0) * days) : 0;
  const subtotal = round2(apartmentTotal + scooterTotal);

  const available = getAvailableOptions({ hasApartment, hasScooter });
  const chosen = available.includes(option) ? option : available[0] || null;

  let discount = 0;
  let dueNow = subtotal;
  let refundable = true;

  switch (chosen) {
    case 'scooter_deposit':
      dueNow = round2(scooterTotal * SCOOTER_DEPOSIT_RATE);
      break;
    case 'combo_deposit':
      dueNow = round2(apartmentTotal + scooterTotal * SCOOTER_DEPOSIT_RATE);
      break;
    case 'full_nonrefundable':
      discount = round2(subtotal * NON_REFUNDABLE_DISCOUNT);
      dueNow = round2(subtotal - discount);
      refundable = false;
      break;
    case 'full':
    case 'full_refundable':
    default:
      dueNow = subtotal;
  }

  const total = round2(subtotal - discount);
  const remaining = round2(total - dueNow);

  return {
    option: chosen,
    apartmentTotal,
    scooterTotal,
    subtotal,
    discount,
    total,
    dueNow,
    remaining,
    refundable,
    isDeposit: remaining > 0,
  };
}

export const PAYMENT_OPTION_LABELS = {
  scooter_deposit: { el: 'Προκαταβολή 30%', en: '30% deposit' },
  full: { el: 'Ολόκληρο το ποσό', en: 'Full amount' },
  combo_deposit: { el: 'Δωμάτιο ολόκληρο + 30% μηχανής', en: 'Full room + 30% scooter' },
  full_refundable: { el: 'Ολόκληρο το ποσό – Επιστρέψιμο', en: 'Full amount – Refundable' },
  full_nonrefundable: { el: 'Ολόκληρο το ποσό – Μη επιστρέψιμο (-10%)', en: 'Full amount – Non-refundable (-10%)' },
};
