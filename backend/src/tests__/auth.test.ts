// src/__tests__/auth.service.test.ts
import { AuthService } from '../services/auth.service';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Mock Prisma Client
jest.mock('@prisma/client');
jest.mock('bcrypt');

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrismaClient: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    mockPrismaClient = new PrismaClient() as jest.Mocked<PrismaClient>;
    authService = new AuthService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a new user with hashed password', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const hashedPassword = 'hashed_password';
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const mockUser = {
        id: '1',
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrismaClient.user.findUnique as jest.Mock).mockResolvedValue(null);
      (mockPrismaClient.user.create as jest.Mock).mockResolvedValue(mockUser);

      // Act
      const result = await authService.register(userData);

      // Assert
      expect(bcrypt.hash).toHaveBeenCalledWith(userData.password, 10);
      expect(mockPrismaClient.user.create).toHaveBeenCalledWith({
        data: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name
        }
      });
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email', userData.email);
      expect(result).not.toHaveProperty('password');
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      const userData = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const existingUser = {
        id: '1',
        email: userData.email,
        name: 'Existing User',
        password: 'hashed',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrismaClient.user.findUnique as jest.Mock).mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Email already exists');
    });

    it('should validate email format', async () => {
      // Arrange
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      };

      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Invalid email format');
    });

    it('should validate password length', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      };

      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Password must be at least 6 characters');
    });
  });

  describe('login', () => {
    it('should return user and token for valid credentials', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const mockUser = {
        id: '1',
        email: loginData.email,
        name: 'Test User',
        password: 'hashed_password',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrismaClient.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      // Act
      const result = await authService.login(loginData);

      // Assert
      expect(mockPrismaClient.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email }
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginData.password, mockUser.password);
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result.user).not.toHaveProperty('password');
    });

    it('should throw error for invalid email', async () => {
      // Arrange
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      (mockPrismaClient.user.findUnique as jest.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });

    it('should throw error for invalid password', async () => {
      // Arrange
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const mockUser = {
        id: '1',
        email: loginData.email,
        name: 'Test User',
        password: 'hashed_password',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrismaClient.user.findUnique as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginData)).rejects.toThrow('Invalid credentials');
    });
  });
});