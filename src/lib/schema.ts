import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
    id: text('id').primaryKey(),
    name: text('name'),
    email: text('email').unique(),
    password: text('password'),
    image: text('image'),
    isVerified: boolean('is_verified').default(false),
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
    createdAt: timestamp('created_at').defaultNow(),
});
