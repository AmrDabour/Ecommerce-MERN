import { Product } from './product.model';
import { User, Address } from './user.model';

export interface OrderItem {
  _id?: string;
  product: Product | string;
  quantity: number;
  price: number;
}

/** Backend uses 'orderItems' not 'items' */
export interface Order {
  _id: string;
  user: string | User;
  orderItems: OrderItem[];
  totalPrice: number;
  paymentMethod: 'cash' | 'card';
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  shippingAddress: Address;
  coupon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  paymentMethod: 'cash' | 'card';
  shippingAddress: Address;
}
