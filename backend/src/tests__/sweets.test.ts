import { SweetsService } from '../services/sweets.service';
import { PrismaClient } from '@prisma/client';

jest.mock('@prisma/client');

describe('SweetsService', () => {
  let sweetsService: SweetsService;
  let mockPrismaClient: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrismaClient = new PrismaClient() as jest.Mocked<PrismaClient>;
    sweetsService = new SweetsService();

  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSweet', () => {
    it('should create a new sweet', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 100
      };

      const mockSweet = {
        id: '1',
        ...sweetData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrismaClient.sweet.create as jest.Mock).mockResolvedValue(mockSweet);

      const result = await sweetsService.createSweet(sweetData);

      expect(mockPrismaClient.sweet.create).toHaveBeenCalledWith({
        data: sweetData
      });
      expect(result).toEqual(mockSweet);
    });

    it('should throw error for invalid price', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: -1,
        quantity: 100
      };

      await expect(sweetsService.createSweet(sweetData)).rejects.toThrow('Price must be positive');
    });

    it('should throw error for negative quantity', async () => {
      const sweetData = {
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: -5
      };

      await expect(sweetsService.createSweet(sweetData)).rejects.toThrow('Quantity cannot be negative');
    });
  });

  describe('getAllSweets', () => {
    it('should return all sweets', async () => {
      const mockSweets = [
        {
          id: '1',
          name: 'Chocolate Bar',
          category: 'Chocolate',
          price: 2.5,
          quantity: 100,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          name: 'Gummy Bears',
          category: 'Gummies',
          price: 1.5,
          quantity: 50,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      (mockPrismaClient.sweet.findMany as jest.Mock).mockResolvedValue(mockSweets);

      const result = await sweetsService.getAllSweets();

      expect(mockPrismaClient.sweet.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockSweets);
    });
  });

  describe('searchSweets', () => {
    it('should search sweets by name', async () => {
      const mockSweets = [{
        id: '1',
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      (mockPrismaClient.sweet.findMany as jest.Mock).mockResolvedValue(mockSweets);

      const result = await sweetsService.searchSweets({ name: 'Chocolate' });

      expect(mockPrismaClient.sweet.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          name: expect.objectContaining({
            contains: 'Chocolate',
            mode: 'insensitive'
          })
        })
      });
      expect(result).toEqual(mockSweets);
    });

    it('should search sweets by price range', async () => {
      const mockSweets = [{
        id: '1',
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      }];

      (mockPrismaClient.sweet.findMany as jest.Mock).mockResolvedValue(mockSweets);

      const result = await sweetsService.searchSweets({ minPrice: 2, maxPrice: 3 });

      expect(mockPrismaClient.sweet.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          price: expect.objectContaining({
            gte: 2,
            lte: 3
          })
        })
      });
      expect(result).toEqual(mockSweets);
    });
  });

  describe('updateSweet', () => {
    it('should update a sweet', async () => {
      const sweetId = '1';
      const updateData = { price: 3.0, quantity: 150 };

      const mockUpdatedSweet = {
        id: sweetId,
        name: 'Chocolate Bar',
        category: 'Chocolate',
        ...updateData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrismaClient.sweet.update as jest.Mock).mockResolvedValue(mockUpdatedSweet);

      const result = await sweetsService.updateSweet(sweetId, updateData);

      expect(mockPrismaClient.sweet.update).toHaveBeenCalledWith({
        where: { id: sweetId },
        data: updateData
      });
      expect(result).toEqual(mockUpdatedSweet);
    });
  });

  describe('deleteSweet', () => {
    it('should delete a sweet', async () => {
      const sweetId = '1';

      const mockDeletedSweet = {
        id: sweetId,
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrismaClient.sweet.delete as jest.Mock).mockResolvedValue(mockDeletedSweet);

      const result = await sweetsService.deleteSweet(sweetId);

      expect(mockPrismaClient.sweet.delete).toHaveBeenCalledWith({
        where: { id: sweetId }
      });
      expect(result).toEqual(mockDeletedSweet);
    });
  });

  describe('purchase', () => {
    it('should decrease quantity when purchasing', async () => {
      const sweetId = '1';
      const purchaseQuantity = 5;

      const mockSweet = {
        id: sweetId,
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUpdatedSweet = {
        ...mockSweet,
        quantity: 95
      };

      (mockPrismaClient.sweet.findUnique as jest.Mock).mockResolvedValue(mockSweet);
      (mockPrismaClient.sweet.update as jest.Mock).mockResolvedValue(mockUpdatedSweet);

      const result = await sweetsService.purchase(sweetId, purchaseQuantity);

      expect(mockPrismaClient.sweet.update).toHaveBeenCalledWith({
        where: { id: sweetId },
        data: { quantity: 95 }
      });
      expect(result.quantity).toBe(95);
    });

    it('should throw error if insufficient quantity', async () => {
      const sweetId = '1';
      const purchaseQuantity = 150;

      const mockSweet = {
        id: sweetId,
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrismaClient.sweet.findUnique as jest.Mock).mockResolvedValue(mockSweet);

      await expect(sweetsService.purchase(sweetId, purchaseQuantity))
        .rejects.toThrow('Insufficient quantity available');
    });

    it('should throw error if sweet not found', async () => {
      const sweetId = '999';
      const purchaseQuantity = 5;

      (mockPrismaClient.sweet.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(sweetsService.purchase(sweetId, purchaseQuantity))
        .rejects.toThrow('Sweet not found');
    });
  });

  describe('restock', () => {
    it('should increase quantity when restocking', async () => {
      const sweetId = '1';
      const restockQuantity = 50;

      const mockSweet = {
        id: sweetId,
        name: 'Chocolate Bar',
        category: 'Chocolate',
        price: 2.5,
        quantity: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const mockUpdatedSweet = {
        ...mockSweet,
        quantity: 150
      };

      (mockPrismaClient.sweet.findUnique as jest.Mock).mockResolvedValue(mockSweet);
      (mockPrismaClient.sweet.update as jest.Mock).mockResolvedValue(mockUpdatedSweet);

      const result = await sweetsService.restock(sweetId, restockQuantity);

      expect(mockPrismaClient.sweet.update).toHaveBeenCalledWith({
        where: { id: sweetId },
        data: { quantity: 150 }
      });
      expect(result.quantity).toBe(150);
    });

    it('should throw error for negative restock quantity', async () => {
      const sweetId = '1';
      const restockQuantity = -10;

      await expect(sweetsService.restock(sweetId, restockQuantity))
        .rejects.toThrow('Restock quantity must be positive');
    });
  });
});
