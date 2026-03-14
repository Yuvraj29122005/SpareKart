import tyre from "../images/tyre.jpg";
import light from "../images/light.jpg";
import engine from "../images/engine.jpg";
import brake from "../images/brake.jpg";

const products = [
  { id: 1, name: "All-Season Tyre",    price: 4500, category: "Tyres",       stock: 15, desc: "Durable all-season tyre with excellent grip and long life.", img: tyre },
  { id: 2, name: "LED Headlight",      price: 1899, category: "Lights",      stock: 22, desc: "Bright LED headlight for better visibility at night.", img: light },
  { id: 3, name: "Engine Oil Filter",  price: 499,  category: "Engine",      stock: 40, desc: "High-quality oil filter for engine protection and performance.", img: engine },
  { id: 4, name: "Brake Disc Set",     price: 2999, category: "Brakes",      stock: 30, desc: "Premium brake disc set for superior stopping power. Fits front wheels.", img: brake },
  { id: 5, name: "Sport Tyre",         price: 5200, category: "Tyres",       stock: 8,  desc: "High-performance sport tyre for better cornering and speed.", img: tyre },
  { id: 6, name: "Air Filter",         price: 699,  category: "Engine",      stock: 35, desc: "Premium air filter to keep your engine clean and efficient.", img: engine },
];

export default products;