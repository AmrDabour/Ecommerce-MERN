export interface Coupon {
  _id: string;
  code: string;
  discount: number;       // percentage 0-100
  expireDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCouponRequest {
  code: string;
  discount: number;
  expireDate: string;
}

export interface ApplyCouponRequest {
  code: string;
}
