import { AuthResponse, UserResponse } from "../dtos/auth.dto";

interface UserLike {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toUserResponse(user: UserLike): UserResponse {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function toAuthResponse(accessToken: string, user: UserLike): AuthResponse {
  return {
    accessToken,
    user: toUserResponse(user),
  };
}
