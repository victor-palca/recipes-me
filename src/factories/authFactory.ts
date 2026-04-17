import { AuthController } from "../controllers/AuthController";
import { PostgresUserRepository } from "../repositories/postgres/PostgresUserRepository";
import { AuthService } from "../services/AuthService";

export function makeAuthService(): AuthService {
  const userRepository = new PostgresUserRepository();
  return new AuthService(userRepository);
}

export function makeAuthController(): AuthController {
  const authService = makeAuthService();
  return new AuthController(authService);
}
