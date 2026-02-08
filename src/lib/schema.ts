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
    // ⚠️ Cascade delete: User deleted = Listings deleted
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
    imageUrl: text('image_url'),
    isApproved: boolean('is_approved').default(true),
    isActive: boolean('is_active').default(true),
    createdAt: timestamp('created_at').defaultNow(),
});

export const conversations = pgTable('conversations', {
    id: text('id').primaryKey(),
    // ⚠️ Set Null: Listing deleted = Chat stays, but shows "Item Unavailable"
    listingId: text('listing_id').references(() => listings.id, { onDelete: 'set null' }),
    buyerId: text('buyer_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    sellerId: text('seller_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const messages = pgTable('messages', {
    id: text('id').primaryKey(),
    conversationId: text('conversation_id').references(() => conversations.id, { onDelete: 'cascade' }).notNull(),
    senderId: text('sender_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    content: text('content').notNull(),
    // 👇 THIS IS THE KEY PART
    isRead: boolean('is_read').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});

export const siteStats = pgTable('site_stats', {
    id: text('id').primaryKey(),
    totalVisits: integer('total_visits').default(0).notNull(),
    updatedAt: timestamp('updated_at').defaultNow(),
});