export interface Address {
  street: string;
  city: string;
  zip: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'user' | 'admin';
  address?: {
    street?: string;
    city?: string;
    zip?: string;
  };
  wishlist?: string[];
  points?: number;
  loyaltyTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  createdAt?: string;
  updatedAt?: string;
}

/** JWT payload decoded from the token */
export interface JwtPayload {
  id: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

/** Login returns only { msg, token } — no user object */
export interface LoginResponse {
  msg: string;
  token: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  // Never send 'role' from the public UI
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UpdateUserRequest {
  phone?: string;
  address?: Address;
}
