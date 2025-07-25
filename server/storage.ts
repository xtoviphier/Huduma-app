import {
  users,
  serviceCategories,
  serviceProviders,
  jobs,
  messages,
  reviews,
  favorites,
  type User,
  type InsertUser,
  type ServiceProvider,
  type InsertServiceProvider,
  type ServiceCategory,
  type Job,
  type InsertJob,
  type Message,
  type InsertMessage,
  type Review,
  type InsertReview,
  type Favorite,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, like, ilike } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByPhone(phoneNumber: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;

  // Service Categories
  getServiceCategories(): Promise<ServiceCategory[]>;
  createServiceCategory(category: Omit<ServiceCategory, 'id' | 'createdAt'>): Promise<ServiceCategory>;

  // Service Providers
  getServiceProvider(userId: string): Promise<ServiceProvider | undefined>;
  getServiceProviders(categoryId?: string, location?: string): Promise<(ServiceProvider & { user: User; category: ServiceCategory })[]>;
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;
  updateServiceProvider(id: string, updates: Partial<InsertServiceProvider>): Promise<ServiceProvider>;

  // Jobs
  getJob(id: string): Promise<Job | undefined>;
  getJobsForUser(userId: string, userType: 'customer' | 'provider'): Promise<Job[]>;
  createJob(job: InsertJob): Promise<Job>;
  updateJob(id: string, updates: Partial<InsertJob>): Promise<Job>;

  // Messages
  getMessagesForJob(jobId: string): Promise<(Message & { sender: User; receiver: User })[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(jobId: string, userId: string): Promise<void>;

  // Reviews
  getReviewsForProvider(providerId: string): Promise<(Review & { customer: User })[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Favorites
  getFavoritesForCustomer(customerId: string): Promise<(Favorite & { provider: ServiceProvider & { user: User } })[]>;
  addToFavorites(customerId: string, providerId: string): Promise<Favorite>;
  removeFromFavorites(customerId: string, providerId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phoneNumber: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phoneNumber, phoneNumber));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getServiceCategories(): Promise<ServiceCategory[]> {
    return await db.select().from(serviceCategories).orderBy(asc(serviceCategories.name));
  }

  async createServiceCategory(categoryData: Omit<ServiceCategory, 'id' | 'createdAt'>): Promise<ServiceCategory> {
    const [category] = await db.insert(serviceCategories).values(categoryData).returning();
    return category;
  }

  async getServiceProvider(userId: string): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.userId, userId));
    return provider;
  }

  async getServiceProviders(categoryId?: string, location?: string): Promise<(ServiceProvider & { user: User; category: ServiceCategory })[]> {
    let whereConditions = [eq(serviceProviders.isActive, true)];

    if (categoryId) {
      whereConditions.push(eq(serviceProviders.categoryId, categoryId));
    }

    if (location) {
      whereConditions.push(ilike(users.location, `%${location}%`));
    }

    const results = await db
      .select()
      .from(serviceProviders)
      .innerJoin(users, eq(serviceProviders.userId, users.id))
      .innerJoin(serviceCategories, eq(serviceProviders.categoryId, serviceCategories.id))
      .where(whereConditions.length > 1 ? and(...whereConditions) : whereConditions[0])
      .orderBy(desc(serviceProviders.rating));
    
    return results.map(result => ({
      ...result.service_providers,
      user: result.users,
      category: result.service_categories,
    }));
  }

  async createServiceProvider(providerData: InsertServiceProvider): Promise<ServiceProvider> {
    const [provider] = await db.insert(serviceProviders).values(providerData).returning();
    return provider;
  }

  async updateServiceProvider(id: string, updates: Partial<InsertServiceProvider>): Promise<ServiceProvider> {
    const [provider] = await db
      .update(serviceProviders)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(serviceProviders.id, id))
      .returning();
    return provider;
  }

  async getJob(id: string): Promise<Job | undefined> {
    const [job] = await db.select().from(jobs).where(eq(jobs.id, id));
    return job;
  }

  async getJobsForUser(userId: string, userType: 'customer' | 'provider'): Promise<Job[]> {
    const condition = userType === 'customer' 
      ? eq(jobs.customerId, userId)
      : eq(jobs.providerId, userId);
    
    return await db.select().from(jobs).where(condition).orderBy(desc(jobs.createdAt));
  }

  async createJob(jobData: InsertJob): Promise<Job> {
    const [job] = await db.insert(jobs).values(jobData).returning();
    return job;
  }

  async updateJob(id: string, updates: Partial<InsertJob>): Promise<Job> {
    const [job] = await db
      .update(jobs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(jobs.id, id))
      .returning();
    return job;
  }

  async getMessagesForJob(jobId: string): Promise<(Message & { sender: User; receiver: User })[]> {
    const results = await db
      .select()
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .innerJoin(users, eq(messages.receiverId, users.id))
      .where(eq(messages.jobId, jobId))
      .orderBy(asc(messages.createdAt));

    return results.map(result => ({
      ...result.messages,
      sender: result.users,
      receiver: result.users,
    }));
  }

  async createMessage(messageData: InsertMessage): Promise<Message> {
    const [message] = await db.insert(messages).values(messageData).returning();
    return message;
  }

  async markMessagesAsRead(jobId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(and(eq(messages.jobId, jobId), eq(messages.receiverId, userId)));
  }

  async getReviewsForProvider(providerId: string): Promise<(Review & { customer: User })[]> {
    const results = await db
      .select()
      .from(reviews)
      .innerJoin(users, eq(reviews.customerId, users.id))
      .where(eq(reviews.providerId, providerId))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      ...result.reviews,
      customer: result.users,
    }));
  }

  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    
    // Update provider's rating and review count
    const allReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.providerId, reviewData.providerId));
    
    const averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    
    await db
      .update(serviceProviders)
      .set({
        rating: averageRating.toString(),
        totalReviews: allReviews.length,
      })
      .where(eq(serviceProviders.userId, reviewData.providerId));

    return review;
  }

  async getFavoritesForCustomer(customerId: string): Promise<(Favorite & { provider: ServiceProvider & { user: User } })[]> {
    const results = await db
      .select()
      .from(favorites)
      .innerJoin(serviceProviders, eq(favorites.providerId, serviceProviders.userId))
      .innerJoin(users, eq(serviceProviders.userId, users.id))
      .where(eq(favorites.customerId, customerId))
      .orderBy(desc(favorites.createdAt));

    return results.map(result => ({
      ...result.favorites,
      provider: {
        ...result.service_providers,
        user: result.users,
      },
    }));
  }

  async addToFavorites(customerId: string, providerId: string): Promise<Favorite> {
    const [favorite] = await db
      .insert(favorites)
      .values({ customerId, providerId })
      .returning();
    return favorite;
  }

  async removeFromFavorites(customerId: string, providerId: string): Promise<void> {
    await db
      .delete(favorites)
      .where(and(eq(favorites.customerId, customerId), eq(favorites.providerId, providerId)));
  }
}

export const storage = new DatabaseStorage();
