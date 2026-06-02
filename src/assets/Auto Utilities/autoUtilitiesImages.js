/**
 * Auto Utilities — Centralized Image Map
 * Use these imports in any component or page that displays
 * products from the "Auto Utilities" category.
 *
 * Sub-categories and their images:
 * - Car Cleaning       → cleaning-1.png … cleaning-10.png
 * - Car Security       → security-1.png … security-4.png
 * - Emergency Aid      → Emergency-aid-1.png … Emergency-aid-3.png
 * - Fire Extinguishers → fire-1.png … fire-5.png
 * - Parking Aid        → parking Aid-1.png … parking aid-9.png
 * - Tyre Inflators     → tyre-1.png … tyre-7.png
 * - Vacuum Cleaners    → vacuum-1.png … vacuum-5.png
 * - Paint Protection   → paint-1.png … paint-5.png
 */

// ─── Car Cleaning ──────────────────────────────────────────────────────────────
import cleaning1  from './Car Cleaning/cleaning-1.png';
import cleaning2  from './Car Cleaning/cleaning-2.png';
import cleaning3  from './Car Cleaning/cleaning-3.png';
import cleaning4  from './Car Cleaning/cleaning-4.png';
import cleaning5  from './Car Cleaning/cleaning-5.png';
import cleaning6  from './Car Cleaning/cleaning-6.png';
import cleaning7  from './Car Cleaning/cleaning-7.png';
import cleaning8  from './Car Cleaning/cleaning-8.png';
import cleaning9  from './Car Cleaning/cleaning-9.png';
import cleaning10 from './Car Cleaning/cleaning-10.png';

// ─── Car Security ──────────────────────────────────────────────────────────────
import security1 from './Car Security/security-1.png';
import security2 from './Car Security/security-2.png';
import security3 from './Car Security/security-3.png';
import security4 from './Car Security/security-4.png';

// ─── Emergency Aid ─────────────────────────────────────────────────────────────
import emergencyAid1 from './Emergency Aid/Emergency-aid-1.png';
import emergencyAid2 from './Emergency Aid/Emergency-aid-2.png';
import emergencyAid3 from './Emergency Aid/Emergency-aid-3.png';

// ─── Fire Extinguishers ────────────────────────────────────────────────────────
import fire1 from './Fire extinguishers/fire-1.png';
import fire2 from './Fire extinguishers/fire-2.png';
import fire3 from './Fire extinguishers/fire-3.png';
import fire4 from './Fire extinguishers/fire-4.png';
import fire5 from './Fire extinguishers/fire-5.png';

// ─── Parking Aid ───────────────────────────────────────────────────────────────
import parkingAid1 from './Parking Aid/parking Aid-1.png';
import parkingAid2 from './Parking Aid/parking Aid-2.png';
import parkingAid3 from './Parking Aid/parking Aid-3.png';
import parkingAid4 from './Parking Aid/parking Aid-4.png';
import parkingAid5 from './Parking Aid/parking Aid-5.png';
import parkingAid6 from './Parking Aid/parking Aid-6.png';
import parkingAid7 from './Parking Aid/parking Aid-7.png';
import parkingAid8 from './Parking Aid/parking Aid-8.png';
import parkingAid9 from './Parking Aid/parking aid-9.png';

// ─── Tyre Inflators ────────────────────────────────────────────────────────────
import tyre1 from './Tyre inflactors/tyre-1.png';
import tyre2 from './Tyre inflactors/tyre-2.png';
import tyre3 from './Tyre inflactors/tyre-3.png';
import tyre4 from './Tyre inflactors/tyre-4.png';
import tyre5 from './Tyre inflactors/tyre-5.png';
import tyre6 from './Tyre inflactors/tyre-6.png';
import tyre7 from './Tyre inflactors/tyre-7.png';

// ─── Vacuum Cleaners ───────────────────────────────────────────────────────────
import vacuum1 from './Vacuum cleaner/vacuum-1.png';
import vacuum2 from './Vacuum cleaner/vacuum-2.png';
import vacuum3 from './Vacuum cleaner/vacuum-3.png';
import vacuum4 from './Vacuum cleaner/vacuum-4.png';
import vacuum5 from './Vacuum cleaner/vacuum-5.png';

// ─── Paint Protection ──────────────────────────────────────────────────────────
import paint1 from './paint protection/paint-1.png';
import paint2 from './paint protection/paint-2.png';
import paint3 from './paint protection/paint-3.png';
import paint4 from './paint protection/paint-4.png';
import paint5 from './paint protection/paint-5.png';

// ─── Named Exports (Grouped by Sub-category) ──────────────────────────────────

export const CarCleaningImages = [
  cleaning1, cleaning2, cleaning3, cleaning4, cleaning5,
  cleaning6, cleaning7, cleaning8, cleaning9, cleaning10,
];

export const CarSecurityImages = [
  security1, security2, security3, security4,
];

export const EmergencyAidImages = [
  emergencyAid1, emergencyAid2, emergencyAid3,
];

export const FireExtinguisherImages = [
  fire1, fire2, fire3, fire4, fire5,
];

export const ParkingAidImages = [
  parkingAid1, parkingAid2, parkingAid3, parkingAid4, parkingAid5,
  parkingAid6, parkingAid7, parkingAid8, parkingAid9,
];

export const TyreInflatorImages = [
  tyre1, tyre2, tyre3, tyre4, tyre5, tyre6, tyre7,
];

export const VacuumCleanerImages = [
  vacuum1, vacuum2, vacuum3, vacuum4, vacuum5,
];

export const PaintProtectionImages = [
  paint1, paint2, paint3, paint4, paint5,
];

/**
 * Master lookup map — key matches the product's sub_category field in the DB.
 * Usage: AUTO_UTILITIES_IMAGES['Car Cleaning'][0]  → first cleaning image
 */
export const AUTO_UTILITIES_IMAGES = {
  'Car Cleaning':       CarCleaningImages,
  'Car Security':       CarSecurityImages,
  'Emergency Aid':      EmergencyAidImages,
  'Fire Extinguishers': FireExtinguisherImages,
  'Parking Aid':        ParkingAidImages,
  'Tyre Inflators':     TyreInflatorImages,
  'Vacuum Cleaners':    VacuumCleanerImages,
  'Paint Protection':   PaintProtectionImages,
};

export default AUTO_UTILITIES_IMAGES;
