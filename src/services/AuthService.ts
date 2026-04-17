import { AuthResponse, UserResponse } from "../dtos/auth.dto";
import { AppError } from "../errors/AppError";
import { ErrorCodes } from "../errors/errorCodes";
import { toAuthResponse, toUserResponse } from "../mappers/authMapper";
import { IUserRepository } from "../repositories/interfaces/IUserRepository";
import { comparePassword, hashPassword } from "../utils/hash";
import { signAccessToken } from "../utils/jwt";

interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

interface SignInInput {
  email: string;
  password: string;
}

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async signUp(input: SignUpInput): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new AppError("Email already in use", 409, ErrorCodes.CONFLICT);
    }

    const passwordHash = await hashPassword(input.password);
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const accessToken = signAccessToken({ sub: user.id, email: user.email });

    return toAuthResponse(accessToken, user);
  }

  async signIn(input: SignInInput): Promise<AuthResponse> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError("Invalid credentials", 401, ErrorCodes.UNAUTHORIZED);
    }

    const isPasswordValid = await comparePassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError("Invalid credentials", 401, ErrorCodes.UNAUTHORIZED);
    }

    const accessToken = signAccessToken({ sub: user.id, email: user.email });

    return toAuthResponse(accessToken, user);
  }

  async me(userId: string): Promise<UserResponse> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404, ErrorCodes.NOT_FOUND);
    }

    return toUserResponse(user);
  }
}
