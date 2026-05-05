"use client";

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import { Product } from "@/lib/data";

// ── Types ────────────────────────────────────────────
export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: "ADD";     product: Product }
  | { type: "REMOVE";  id: number }
  | { type: "SET_QTY"; id: number; qty: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

// ── Reducer — handles all cart actions ───────────────
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {

    case "ADD": {
      const existing = state.items.find(
        (i) => i.product.id === action.product.id
      );
      // If already in cart → increase quantity
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.product.id === action.product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      // Otherwise → add new item
      return {
        items: [...state.items, { product: action.product, quantity: 1 }],
      };
    }

    case "REMOVE":
      return {
        items: state.items.filter((i) => i.product.id !== action.id),
      };

    case "SET_QTY":
      if (action.qty <= 0) {
        return {
          items: state.items.filter((i) => i.product.id !== action.id),
        };
      }
      return {
        items: state.items.map((i) =>
          i.product.id === action.id ? { ...i, quantity: action.qty } : i
        ),
      };

    case "CLEAR":
      return { items: [] };

    case "HYDRATE":
      return { items: action.items };

    default:
      return state;
  }
}

// ── Context ──────────────────────────────────────────
type CartContextType = {
  items:   CartItem[];
  add:     (product: Product) => void;
  remove:  (id: number) => void;
  setQty:  (id: number, qty: number) => void;
  clear:   () => void;
  total:   number;
  count:   number;
};

const CartContext = createContext<CartContextType | null>(null);

// ── Provider — wrap your app with this ───────────────
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Load cart from localStorage on first render
  useEffect(() => {
    try {
      const saved = localStorage.getItem("cart");
      if (saved) {
        dispatch({ type: "HYDRATE", items: JSON.parse(saved) });
      }
    } catch {}
  }, []); // ← empty array = run once on mount

  // Save cart to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(state.items));
  }, [state.items]); // ← runs every time items updates

  // Computed values
  const total = state.items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );
  const count = state.items.reduce(
    (sum, i) => sum + i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items:  state.items,
        add:    (product) => dispatch({ type: "ADD", product }),
        remove: (id)      => dispatch({ type: "REMOVE", id }),
        setQty: (id, qty) => dispatch({ type: "SET_QTY", id, qty }),
        clear:  ()        => dispatch({ type: "CLEAR" }),
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook — use this in any component ─────────────────
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}