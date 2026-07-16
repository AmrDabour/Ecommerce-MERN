import { User } from './user.model';

export interface Review {
  _id: string;
  comment?: string;
  rating: number;
  user: string | User;
  product: string | { _id: string; name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReviewRequest {
  comment: string;
  rating: number;
  product: string;
}

export interface UpdateReviewRequest {
  comment?: string;
  rating?: number;
}
