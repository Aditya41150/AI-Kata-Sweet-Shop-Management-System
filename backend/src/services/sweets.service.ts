import { Prisma } from "@prisma/client";
import prisma from "../config/database";

// Prisma model types (Prisma 7 syntax)
type Sweet = Prisma.SweetGetPayload<{}>;

interface CreateSweetData {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

interface UpdateSweetData {
  name?: string;
  category?: string;
  price?: number;
  quantity?: number;
}

interface SearchParams {
  name?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export class SweetsService {
  private prisma = prisma;

  async createSweet(data: CreateSweetData): Promise<Sweet> {
    if (data.price <= 0) {
      throw new Error("Price must be positive");
    }

    if (data.quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }

    return await this.prisma.sweet.create({
      data,
    });
  }

  async getAllSweets(): Promise<Sweet[]> {
    return await this.prisma.sweet.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async searchSweets(params: SearchParams): Promise<Sweet[]> {
    const where: any = {};

    if (params.name) {
      where.name = {
        contains: params.name,
        mode: "insensitive",
      };
    }

    if (params.category) {
      where.category = {
        contains: params.category,
        mode: "insensitive",
      };
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.price = {};
      if (params.minPrice !== undefined) {
        where.price.gte = params.minPrice;
      }
      if (params.maxPrice !== undefined) {
        where.price.lte = params.maxPrice;
      }
    }

    return await this.prisma.sweet.findMany({ where });
  }

  async updateSweet(id: string, data: UpdateSweetData): Promise<Sweet> {
    if (data.price !== undefined && data.price <= 0) {
      throw new Error("Price must be positive");
    }

    if (data.quantity !== undefined && data.quantity < 0) {
      throw new Error("Quantity cannot be negative");
    }

    return await this.prisma.sweet.update({
      where: { id },
      data,
    });
  }

  async deleteSweet(id: string): Promise<Sweet> {
    return await this.prisma.sweet.delete({
      where: { id },
    });
  }

  async purchase(id: string, quantity: number): Promise<Sweet> {
    if (quantity <= 0) {
      throw new Error("Purchase quantity must be positive");
    }

    const sweet = await this.prisma.sweet.findUnique({
      where: { id },
    });

    if (!sweet) {
      throw new Error("Sweet not found");
    }

    if (sweet.quantity < quantity) {
      throw new Error("Insufficient quantity available");
    }

    return await this.prisma.sweet.update({
      where: { id },
      data: {
        quantity: sweet.quantity - quantity,
      },
    });
  }

  async restock(id: string, quantity: number): Promise<Sweet> {
    if (quantity <= 0) {
      throw new Error("Restock quantity must be positive");
    }

    const sweet = await this.prisma.sweet.findUnique({
      where: { id },
    });

    if (!sweet) {
      throw new Error("Sweet not found");
    }

    return await this.prisma.sweet.update({
      where: { id },
      data: {
        quantity: sweet.quantity + quantity,
      },
    });
  }
}
