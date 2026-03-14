// ── Shared admin products data store ──
// Both the products list and edit pages use this to ensure consistent data

import engineImg from "../images/engine.jpg";
import brakeImg from "../images/brake.jpg";
import tyreImg from "../images/tyre.jpg";
import lightImg from "../images/light.jpg";
import productImg from "../images/product.jpg";

// Default static products
const defaultProducts = [
  {
    id: 1,
    name: "Engine Oil Filter",
    category: "Engine",
    price: 499,
    stock: 50,
    img: engineImg,
    desc: "High-quality oil filter for engine protection and performance.",
  },
  {
    id: 2,
    name: "Brake Disc Set",
    category: "Brakes",
    price: 2999,
    stock: 30,
    img: brakeImg,
    desc: "Premium brake disc set for superior stopping power.",
  },
  {
    id: 3,
    name: "All-Season Tyre",
    category: "Tyres",
    price: 4500,
    stock: 42,
    img: tyreImg,
    desc: "Durable all-season tyre with excellent grip and long life.",
  },
  {
    id: 4,
    name: "LED Headlight",
    category: "Lights",
    price: 1899,
    stock: 80,
    img: lightImg,
    desc: "Bright LED headlight for better visibility at night.",
  },
  {
    id: 5,
    name: "Car Air Freshener",
    category: "Accessories",
    price: 199,
    stock: 100,
    img: productImg,
    desc: "Long-lasting car air freshener with premium fragrance.",
  },
  {
    id: 6,
    name: "Spark Plugs Set",
    category: "Engine",
    price: 799,
    stock: 75,
    img: productImg,
    desc: "High-performance spark plugs for smooth engine running.",
  },
  {
    id: 7,
    name: "Brake Pads",
    category: "Brakes",
    price: 1299,
    stock: 45,
    img: brakeImg,
    desc: "Premium brake pads for safe and reliable braking.",
  },
  {
    id: 8,
    name: "Fog Light Set",
    category: "Lights",
    price: 1599,
    stock: 60,
    img: lightImg,
    desc: "Powerful fog lights for driving in low-visibility conditions.",
  },
];

const STORAGE_KEY = "adminProducts";

// Get products from sessionStorage, or initialize with defaults
export function getAdminProducts() {
  const stored = sessionStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultProducts;
    }
  }
  // First time: store defaults and return them
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(defaultProducts));
  return defaultProducts;
}

// Save products to sessionStorage
export function saveAdminProducts(products) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

export { defaultProducts };
