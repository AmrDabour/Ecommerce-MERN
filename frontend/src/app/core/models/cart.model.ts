import { Product } from './product.model';

export interface CartItem {
  _id: string;
  product: Product | string;
  quantity: number;
  price: number;
}

/** Backend uses 'cartItems' not 'items' */
export interface Cart {
  _id: string;
  user: string;
  cartItems: CartItem[];
  totalPrice: number;
  totalPriceAfterDiscount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/** For guest cart stored in localStorage */
export interface GuestCartItem {
  productId: string;
  quantity: number;
}
