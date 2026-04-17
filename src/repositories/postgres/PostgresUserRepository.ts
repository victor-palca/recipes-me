import { prisma } from "../../config/prisma";
import { UserEntity } from "../../entities/user";
import {
  CreateUserInput,
  IUserRepository,
} from "../interfaces/IUserRepository";

function mapToEntity(user: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}): UserEntity {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    passwordHash: user.passwordHash,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export class PostgresUserRepository implements IUserRepository {
  async create(input: CreateUserInput): Promise<UserEntity> {
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
      },
    });

    return mapToEntity(user);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ? mapToEntity(user) : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? mapToEntity(user) : null;
  }
}
