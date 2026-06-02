
import Prod1 from '../assets/Interior Accessories/Sill plates/sill plates-1.png';
import Prod2 from '../assets/Interior Accessories/steering controles/steering-1.png';
import Prod3 from '../assets/Interior Accessories/stereos/stereos-1.png';
import Prod4 from '../assets/Interior Accessories/sun shades/sunshades-1.png';

export { Prod1, Prod2, Prod3, Prod4 };

export const INTERIOR_UPGRADES = [
  { id: 21, name: "Premium Sill Plates", price: "$189.00", image: Prod1, category: "Interior", badge: "New", stock: 12 },
  { id: 22, name: "Carbon Steering Kit", price: "$220.00", image: Prod2, category: "Interior", badge: null, stock: 8 },
  { id: 23, name: "Android Stereo Pro", price: "$475.00", image: Prod3, category: "Tech", badge: "Sale", stock: 15 },
  { id: 24, name: "Custom Sun Shades", price: "$95.00", image: Prod4, category: "Utilities", badge: null, stock: 5 },
  { id: 25, name: "LED Scuff Plates", price: "$110.00", image: Prod1, category: "Interior", badge: "Popular", stock: 20 },
  { id: 26, name: "Driver Comfort Kit", price: "$165.00", image: Prod2, category: "Interior", badge: null, stock: 11 },
];

export const EXTERIOR_STYLING = [
  { id: 101, name: "Performance Grille", price: "$229.00", image: Prod2, category: "Exterior", badge: "Best Seller", stock: 10 },
  { id: 102, name: "Carbon Mirror Caps", price: "$140.00", image: Prod3, category: "Styling", badge: null, stock: 5 },
  { id: 103, name: "Chrome Accent Kit", price: "$115.00", image: Prod1, category: "Exterior", badge: "Sale", stock: 14 },
  { id: 104, name: "Black Edition Badge", price: "$45.00", image: Prod4, category: "Styling", badge: null, stock: 8 },
];

export const PERFORMANCE_TECH = [
  { id: 201, name: "Smart Dash System", price: "$399.00", image: Prod3, category: "Tech", badge: "Best Seller", stock: 12 },
  { id: 202, name: "Parking Sensor Kit", price: "$130.00", image: Prod2, category: "Safety", badge: null, stock: 8 },
  { id: 203, name: "OBD2 Scanner Pro", price: "$145.00", image: Prod3, category: "Tools", badge: "Sale", stock: 15 },
  { id: 204, name: "Reverse Camera HD", price: "$185.00", image: Prod4, category: "Safety", badge: null, stock: 5 },
];

export const FEATURED_PRODUCTS = [
  { id: 1, name: "Signature Sill Kit", price: "$189.00", image: Prod1, category: "Premium", stock: 12 },
  { id: 2, name: "Track Edition Wheel", price: "$275.00", image: Prod2, category: "Performance", stock: 8 },
  { id: 3, name: "Ultra-Clear Stereo", price: "$465.00", image: Prod3, category: "Audio", stock: 15 },
  { id: 4, name: "Magnetic Sun Shade", price: "$95.00", image: Prod4, category: "Essentials", stock: 5 },
];

export const ALL_PRODUCTS = [
  ...INTERIOR_UPGRADES,
  ...EXTERIOR_STYLING,
  ...PERFORMANCE_TECH,
  ...FEATURED_PRODUCTS
];
