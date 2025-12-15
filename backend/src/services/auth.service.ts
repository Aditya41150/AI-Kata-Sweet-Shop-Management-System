import { Prisma } from "@prisma/client";
import prisma from "../config/database";

import jwt, { Secret, SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";

export class AuthService {
  private prisma = prisma;
  private jwtSecret = process.env.TOKEN_SECRET || "your-secret-key";
  private jwtExpiration = "24h";

  async register(data: { email: string; password: string; name: string }): Promise<{ id: string; email: string; name: string; role: string }> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  async login(data: { email: string; password: string }): Promise<{ token: string; user: { id: string; email: string; name: string; role: string } }> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      this.jwtSecret as Secret,
      { expiresIn: this.jwtExpiration } as SignOptions
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
