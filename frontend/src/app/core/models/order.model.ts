import { Product } from './product.model';
import { User, Address } from './user.model';

export interface OrderItem {
  _id?: string;
  product: Product | string;
  quantity: number;
  price: number;
  color?: string;
  size?: string;
}

/** Backend uses 'orderItems' not 'items' */
export interface Order {
  _id: string;
  user: string | User;
  orderItems: OrderItem[];
  totalPrice: number;
  paymentMethod: 'cash' | 'card' | 'wallet';
  isPaid: boolean;
  paidAt?: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  isDelivered: boolean;
  deliveredAt?: string;
  shippingAddress: Address;
  coupon?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  paymentMethod: 'cash' | 'card' | 'wallet';
  shippingAddress: Address;
  useWallet?: boolean;
}
