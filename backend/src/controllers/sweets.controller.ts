import { Response } from 'express';
import { SweetsService } from '../services/sweets.service';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';

const prisma = new PrismaClient();
const sweetsService = new SweetsService(prisma);

export class SweetsController {
  async create(req: AuthRequest, res: Response) {
    try {
      const { name, category, price, quantity } = req.body;

      if (!name || !category || price === undefined || quantity === undefined) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const sweet = await sweetsService.createSweet({
        name,
        category,
        price: parseFloat(price),
        quantity: parseInt(quantity)
      });

      res.status(201).json({
        message: 'Sweet created successfully',
        sweet
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: AuthRequest, res: Response) {
    try {
      const sweets = await sweetsService.getAllSweets();

      res.status(200).json({
        count: sweets.length,
        sweets
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async search(req: AuthRequest, res: Response) {
    try {
      const { name, category, minPrice, maxPrice } = req.query;

      const searchParams: any = {};

      if (name) searchParams.name = name as string;
      if (category) searchParams.category = category as string;
      if (minPrice) searchParams.minPrice = parseFloat(minPrice as string);
      if (maxPrice) searchParams.maxPrice = parseFloat(maxPrice as string);

      const sweets = await sweetsService.searchSweets(searchParams);

      res.status(200).json({
        count: sweets.length,
        sweets
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, category, price, quantity } = req.body;

      const updateData: any = {};
      if (name) updateData.name = name;
      if (category) updateData.category = category;
      if (price !== undefined) updateData.price = parseFloat(price);
      if (quantity !== undefined) updateData.quantity = parseInt(quantity);

      const sweet = await sweetsService.updateSweet(id, updateData);

      res.status(200).json({
        message: 'Sweet updated successfully',
        sweet
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await sweetsService.deleteSweet(id);

      res.status(200).json({
        message: 'Sweet deleted successfully'
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async purchase(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Valid quantity is required' });
      }

      const sweet = await sweetsService.purchase(id, parseInt(quantity));

      res.status(200).json({
        message: 'Purchase successful',
        sweet
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }

  async restock(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      if (!quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Valid quantity is required' });
      }

      const sweet = await sweetsService.restock(id, parseInt(quantity));

      res.status(200).json({
        message: 'Restock successful',
        sweet
      });
    } catch (error: any) {
      if (error.message.includes('not found')) {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  }
}
