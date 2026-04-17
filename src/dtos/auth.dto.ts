export interface UserResponse {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: UserResponse;
}
