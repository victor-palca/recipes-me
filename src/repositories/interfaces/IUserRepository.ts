import { UserEntity } from "../../entities/user";

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

export interface IUserRepository {
  create(input: CreateUserInput): Promise<UserEntity>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
}
