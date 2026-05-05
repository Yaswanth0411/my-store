// ── Step 1: Define the TYPE (shape of a product) ──────────────────
export type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;   // the ? means it's optional
  category: string;
  rating: number;
  reviews: number;
  stock: number;
  badge?: "new" | "sale" | "bestseller";  // optional, only 3 allowed values
  emoji: string;
};

// ── Step 2: Define the categories list ────────────────────────────
export const categories = [
  "All",
  "Electronics",
  "Fashion",
  "Home & Living",
  "Food & Drink",
];

// ── Step 3: Your product data ──────────────────────────────────────
export const products: Product[] = [
  {
    id: 1,
    name: "Wireless Headphones",
    description: "Premium over-ear headphones with active noise cancellation and 30hr battery life.",
    price: 89,
    originalPrice: 129,
    category: "Electronics",
    rating: 4.7,
    reviews: 342,
    stock: 15,
    badge: "sale",
    emoji: "🎧",
  },
  {
    id: 2,
    name: "Leather Wallet",
    description: "Full-grain cowhide bifold wallet with RFID blocking and 8 card slots.",
    price: 45,
    category: "Fashion",
    rating: 4.5,
    reviews: 128,
    stock: 30,
    emoji: "👜",
  },
  {
    id: 3,
    name: "Ceramic Mug",
    description: "Hand-thrown ceramic mug with speckled glaze. Microwave and dishwasher safe.",
    price: 24,
    category: "Home & Living",
    rating: 4.8,
    reviews: 95,
    stock: 50,
    badge: "new",
    emoji: "☕",
  },
  {
    id: 4,
    name: "Organic Trail Mix",
    description: "Blend of roasted nuts, seeds and dried fruits. No added sugar.",
    price: 12,
    category: "Food & Drink",
    rating: 4.3,
    reviews: 212,
    stock: 100,
    emoji: "🥜",
  },
  {
    id: 5,
    name: "Smart Watch",
    description: "Health and fitness tracker with GPS, heart rate monitor and 7-day battery.",
    price: 199,
    originalPrice: 249,
    category: "Electronics",
    rating: 4.6,
    reviews: 507,
    stock: 8,
    badge: "sale",
    emoji: "⌚",
  },
  {
    id: 6,
    name: "Linen Tote Bag",
    description: "Eco-friendly stonewashed linen tote with reinforced handles and inner pocket.",
    price: 32,
    category: "Fashion",
    rating: 4.4,
    reviews: 87,
    stock: 40,
    emoji: "🛍️",
  },
  {
    id: 7,
    name: "Soy Wax Candle",
    description: "Hand-poured cedarwood and amber scent. Burns clean for up to 60 hours.",
    price: 18,
    category: "Home & Living",
    rating: 4.9,
    reviews: 431,
    stock: 60,
    badge: "bestseller",
    emoji: "🕯️",
  },
  {
    id: 8,
    name: "Cold Brew Kit",
    description: "Stainless steel cold brew coffee maker. 1-litre capacity, ready in 12 hours.",
    price: 29,
    category: "Food & Drink",
    rating: 4.5,
    reviews: 163,
    stock: 25,
    emoji: "🧊",
  },
  {
    id: 9,
    name: "Bluetooth Speaker",
    description: "Compact waterproof speaker with 360° sound and 12hr playback.",
    price: 65,
    category: "Electronics",
    rating: 4.4,
    reviews: 284,
    stock: 20,
    emoji: "🔊",
  },
  {
    id: 10,
    name: "Silk Scarf",
    description: "100% mulberry silk scarf with hand-rolled edges. 90×90cm, printed in Italy.",
    price: 55,
    category: "Fashion",
    rating: 4.7,
    reviews: 56,
    stock: 12,
    emoji: "🧣",
  },
  {
    id: 11,
    name: "Bamboo Diffuser",
    description: "Ultrasonic aromatherapy diffuser with 7-colour LED and auto-shutoff.",
    price: 42,
    category: "Home & Living",
    rating: 4.6,
    reviews: 198,
    stock: 35,
    badge: "new",
    emoji: "🌿",
  },
  {
    id: 12,
    name: "Ceremonial Matcha",
    description: "First-harvest Japanese matcha from Uji. 30g tin with resealable lid.",
    price: 38,
    category: "Food & Drink",
    rating: 4.8,
    reviews: 321,
    stock: 45,
    badge: "bestseller",
    emoji: "🍵",
  },
];