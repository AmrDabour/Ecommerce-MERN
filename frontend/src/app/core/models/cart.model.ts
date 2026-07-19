import { Product } from './product.model';

export interface SelectedOption {
  optionName: string;
  valueName: string;
  priceAdjustment?: number;
}

export interface CartItem {
  _id: string;
  product: Product | string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
  selectedOptions?: SelectedOption[];
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

export interface GuestCartItem {
  productId: string;
  quantity: number;
  color?: string;
  size?: string;
  selectedOptions?: SelectedOption[];
}
