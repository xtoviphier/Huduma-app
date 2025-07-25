import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertServiceProviderSchema, insertJobSchema, insertMessageSchema, insertReviewSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<string, WebSocket>();

  wss.on('connection', (ws, req) => {
    const userId = req.url?.split('userId=')[1];
    if (userId) {
      clients.set(userId, ws);
    }

    ws.on('close', () => {
      if (userId) {
        clients.delete(userId);
      }
    });
  });

  // Broadcast message to user
  function sendToUser(userId: string, message: any) {
    const client = clients.get(userId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }

  // Auth endpoints
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByPhone(userData.phoneNumber);
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists with this phone number' });
      }

      const user = await storage.createUser(userData);
      res.json({ user });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ message: 'Registration failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { phoneNumber } = req.body;
      const user = await storage.getUserByPhone(phoneNumber);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Login failed', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Service categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ message: 'Failed to fetch categories' });
    }
  });

  // Seed initial categories
  app.post('/api/categories/seed', async (req, res) => {
    try {
      const categories = [
        { name: 'Plumbing', nameSwahili: 'Mipamili', icon: 'fas fa-wrench', description: 'Water and pipe services', descriptionSwahili: 'Huduma za maji na mipamili' },
        { name: 'Electrical Work', nameSwahili: 'Kazi za Umeme', icon: 'fas fa-bolt', description: 'Electrical installation and repair', descriptionSwahili: 'Kusakinisha na kukarabati umeme' },
        { name: 'Carpentry', nameSwahili: 'Useremala', icon: 'fas fa-hammer', description: 'Wood work and furniture', descriptionSwahili: 'Kazi za mbao na samani' },
        { name: 'Mobile Repair', nameSwahili: 'Kukarabati Simu', icon: 'fas fa-mobile-alt', description: 'Phone and device repair', descriptionSwahili: 'Kukarabati simu na vifaa' },
        { name: 'Hairdressing', nameSwahili: 'Kunyoa Nywele', icon: 'fas fa-cut', description: 'Hair and beauty services', descriptionSwahili: 'Huduma za nywele na urembo' },
        { name: 'Gardening', nameSwahili: 'Bustani', icon: 'fas fa-leaf', description: 'Garden and landscaping', descriptionSwahili: 'Huduma za bustani na mazingira' },
        { name: 'House Cleaning', nameSwahili: 'Kusafisha Nyumba', icon: 'fas fa-broom', description: 'Home cleaning services', descriptionSwahili: 'Huduma za kusafisha nyumba' },
        { name: 'Masonry', nameSwahili: 'Ujenzi', icon: 'fas fa-cube', description: 'Construction and bricklaying', descriptionSwahili: 'Ujenzi na kuweka matofali' },
      ];

      for (const category of categories) {
        await storage.createServiceCategory(category);
      }

      res.json({ message: 'Categories seeded successfully' });
    } catch (error) {
      console.error('Error seeding categories:', error);
      res.status(500).json({ message: 'Failed to seed categories' });
    }
  });

  // Service providers
  app.get('/api/providers', async (req, res) => {
    try {
      const { categoryId, location } = req.query;
      const providers = await storage.getServiceProviders(
        categoryId as string,
        location as string
      );
      res.json(providers);
    } catch (error) {
      console.error('Error fetching providers:', error);
      res.status(500).json({ message: 'Failed to fetch providers' });
    }
  });

  app.post('/api/providers', async (req, res) => {
    try {
      const providerData = insertServiceProviderSchema.parse(req.body);
      const provider = await storage.createServiceProvider(providerData);
      res.json(provider);
    } catch (error) {
      console.error('Error creating provider:', error);
      res.status(400).json({ message: 'Failed to create provider', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Jobs
  app.get('/api/jobs/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const { userType } = req.query;
      const jobs = await storage.getJobsForUser(userId, userType as 'customer' | 'provider');
      res.json(jobs);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({ message: 'Failed to fetch jobs' });
    }
  });

  app.post('/api/jobs', async (req, res) => {
    try {
      const jobData = insertJobSchema.parse(req.body);
      const job = await storage.createJob(jobData);
      
      // Notify provider if specified
      if (job.providerId) {
        sendToUser(job.providerId, {
          type: 'new_job_request',
          job,
        });
      }

      res.json(job);
    } catch (error) {
      console.error('Error creating job:', error);
      res.status(400).json({ message: 'Failed to create job', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.patch('/api/jobs/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const job = await storage.updateJob(id, updates);
      
      // Notify both customer and provider of job updates
      if (job.customerId) {
        sendToUser(job.customerId, {
          type: 'job_updated',
          job,
        });
      }
      if (job.providerId) {
        sendToUser(job.providerId, {
          type: 'job_updated',
          job,
        });
      }

      res.json(job);
    } catch (error) {
      console.error('Error updating job:', error);
      res.status(400).json({ message: 'Failed to update job', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Messages
  app.get('/api/messages/:jobId', async (req, res) => {
    try {
      const { jobId } = req.params;
      const messages = await storage.getMessagesForJob(jobId);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(messageData);
      
      // Send real-time message to receiver
      sendToUser(message.receiverId, {
        type: 'new_message',
        message,
      });

      res.json(message);
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(400).json({ message: 'Failed to send message', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  app.patch('/api/messages/:jobId/read', async (req, res) => {
    try {
      const { jobId } = req.params;
      const { userId } = req.body;
      await storage.markMessagesAsRead(jobId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      res.status(500).json({ message: 'Failed to mark messages as read' });
    }
  });

  // Reviews
  app.get('/api/reviews/:providerId', async (req, res) => {
    try {
      const { providerId } = req.params;
      const reviews = await storage.getReviewsForProvider(providerId);
      res.json(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Failed to fetch reviews' });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      const reviewData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(400).json({ message: 'Failed to create review', error: error instanceof Error ? error.message : 'Unknown error' });
    }
  });

  // Favorites
  app.get('/api/favorites/:customerId', async (req, res) => {
    try {
      const { customerId } = req.params;
      const favorites = await storage.getFavoritesForCustomer(customerId);
      res.json(favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ message: 'Failed to fetch favorites' });
    }
  });

  app.post('/api/favorites', async (req, res) => {
    try {
      const { customerId, providerId } = req.body;
      const favorite = await storage.addToFavorites(customerId, providerId);
      res.json(favorite);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      res.status(400).json({ message: 'Failed to add to favorites' });
    }
  });

  app.delete('/api/favorites', async (req, res) => {
    try {
      const { customerId, providerId } = req.body;
      await storage.removeFromFavorites(customerId, providerId);
      res.json({ success: true });
    } catch (error) {
      console.error('Error removing from favorites:', error);
      res.status(400).json({ message: 'Failed to remove from favorites' });
    }
  });

  // Payment endpoints (M-Pesa integration placeholder)
  app.post('/api/payments/mpesa', async (req, res) => {
    try {
      const { amount, phoneNumber, jobId } = req.body;
      
      // TODO: Integrate with M-Pesa Daraja API
      // For now, simulate payment processing
      const paymentResult = {
        success: true,
        transactionId: `TX${Date.now()}`,
        amount,
        phoneNumber,
        jobId,
      };

      // Update job payment status
      await storage.updateJob(jobId, { paymentStatus: 'paid' });

      res.json(paymentResult);
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ message: 'Payment processing failed' });
    }
  });

  return httpServer;
}
