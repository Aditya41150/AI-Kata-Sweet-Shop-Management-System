import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const user = await authService.register({ email, password, name });

      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const result = await authService.login({ email, password });

      res.status(200).json({
        message: 'Login successful',
        ...result
      });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}