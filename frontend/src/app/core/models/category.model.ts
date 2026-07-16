export interface Category {
  _id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: string;
}
