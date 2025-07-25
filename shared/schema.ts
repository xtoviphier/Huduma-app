import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  integer, 
  decimal, 
  timestamp, 
  boolean, 
  jsonb,
  index
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table (both customers and service providers)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phoneNumber: varchar("phone_number").notNull().unique(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email"),
  profileImageUrl: varchar("profile_image_url"),
  userType: varchar("user_type").notNull(), // 'customer' or 'provider'
  location: varchar("location").notNull(),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service categories
export const serviceCategories = pgTable("service_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  nameSwahili: varchar("name_swahili").notNull(),
  icon: varchar("icon").notNull(),
  description: text("description"),
  descriptionSwahili: text("description_swahili"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Service providers additional info
export const serviceProviders = pgTable("service_providers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  yearsExperience: integer("years_experience").notNull(),
  categoryId: varchar("category_id").notNull().references(() => serviceCategories.id),
  priceRangeMin: decimal("price_range_min", { precision: 10, scale: 2 }).notNull(),
  priceRangeMax: decimal("price_range_max", { precision: 10, scale: 2 }).notNull(),
  bio: text("bio"),
  bioSwahili: text("bio_swahili"),
  isActive: boolean("is_active").default(true),
  rating: decimal("rating", { precision: 3, scale: 2 }).default('0.00'),
  totalReviews: integer("total_reviews").default(0),
  completedJobs: integer("completed_jobs").default(0),
  subscriptionTier: varchar("subscription_tier").default('free'), // 'free', 'standard', 'premium'
  monthlyConnections: integer("monthly_connections").default(0),
  maxConnections: integer("max_connections").default(2),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Jobs/Bookings
export const jobs = pgTable("jobs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").references(() => users.id),
  categoryId: varchar("category_id").notNull().references(() => serviceCategories.id),
  title: varchar("title").notNull(),
  description: text("description").notNull(),
  location: varchar("location").notNull(),
  preferredDate: timestamp("preferred_date"),
  preferredTime: varchar("preferred_time"),
  budgetMin: decimal("budget_min", { precision: 10, scale: 2 }),
  budgetMax: decimal("budget_max", { precision: 10, scale: 2 }),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }),
  status: varchar("status").notNull().default('pending'), // 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'
  paymentStatus: varchar("payment_status").default('pending'), // 'pending', 'paid', 'refunded'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  messageType: varchar("message_type").default('text'), // 'text', 'image', 'file'
  imageUrl: varchar("image_url"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews and ratings
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull().references(() => jobs.id),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Favorites/Bookmarks
export const favorites = pgTable("favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().references(() => users.id),
  providerId: varchar("provider_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  sentMessages: many(messages, { relationName: "sender" }),
  receivedMessages: many(messages, { relationName: "receiver" }),
  customerJobs: many(jobs, { relationName: "customer" }),
  providerJobs: many(jobs, { relationName: "provider" }),
  customerReviews: many(reviews, { relationName: "customer" }),
  providerReviews: many(reviews, { relationName: "provider" }),
  favorites: many(favorites),
  providerProfile: one(serviceProviders, {
    fields: [users.id],
    references: [serviceProviders.userId],
  }),
}));

export const serviceProvidersRelations = relations(serviceProviders, ({ one }) => ({
  user: one(users, {
    fields: [serviceProviders.userId],
    references: [users.id],
  }),
  category: one(serviceCategories, {
    fields: [serviceProviders.categoryId],
    references: [serviceCategories.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one, many }) => ({
  customer: one(users, {
    fields: [jobs.customerId],
    references: [users.id],
    relationName: "customer",
  }),
  provider: one(users, {
    fields: [jobs.providerId],
    references: [users.id],
    relationName: "provider",
  }),
  category: one(serviceCategories, {
    fields: [jobs.categoryId],
    references: [serviceCategories.id],
  }),
  messages: many(messages),
  review: one(reviews, {
    fields: [jobs.id],
    references: [reviews.jobId],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  job: one(jobs, {
    fields: [messages.jobId],
    references: [jobs.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id],
    relationName: "receiver",
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertJobSchema = createInsertSchema(jobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;
export type ServiceCategory = typeof serviceCategories.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type InsertJob = z.infer<typeof insertJobSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Favorite = typeof favorites.$inferSelect;
