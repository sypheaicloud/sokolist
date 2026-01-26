import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name'),
    email: text('email').unique(),
    password: text('password'),
    image: text('image'),
    isVerified: boolean('is_verified').default(false),
    isAdmin: boolean('is_admin').default(false),
    isBanned: boolean('is_banned').default(false),
    bannedAt: timestamp('banned_at'),
    createdAt: timestamp('created_at').defaultNow(),
});

export const listings = pgTable('listings', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    price: integer('price').notNull(),
    category: text('category').notNull(),
    location: text('location').notNull(),
    userId: text('user_id').references(() => users.id),
    imageUrl: text('image_url'),
    isApproved: boolean('is_approved').default(true),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

export const conversations = pgTable('conversations', {
    id: text('id').primaryKey(),
    listingId: text('listing_id').references(() => listings.id).notNull(),
    buyerId: text('buyer_id').references(() => users.id).notNull(),
    sellerId: text('seller_id').references(() => users.id).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const messages = pgTable('messages', {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id').references(() => conversations.id).notNull(),
    senderId: text('sender_id').references(() => users.id).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});
