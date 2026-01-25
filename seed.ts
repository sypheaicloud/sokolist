import { db } from './src/lib/db';
import { users, listings } from './src/lib/schema';
import { v4 as uuidv4 } from 'uuid';

const main = async () => {
    console.log('Seeding database...');

    // Clear existing data (Postgres syntax)
    await db.delete(listings);
    await db.delete(users);

    // Create Users
    const user1Id = uuidv4();
    const user2Id = uuidv4();

    await db.insert(users).values([
        {
            id: user1Id,
            name: 'Kamau Juma',
            email: 'kamau@example.com',
            isVerified: true,
        },
        {
            id: user2Id,
            name: 'Wanjiku Mwangi',
            email: 'wanjiku@example.com',
            isVerified: false,
        },
    ]);

    // Create Listings
    await db.insert(listings).values([
        {
            id: uuidv4(),
            title: 'Toyota Vitz 2015',
            description: 'Clean reliable car, low mileage. Lady owned. Located in Westlands.',
            price: 850000,
            category: 'Vehicles',
            location: 'Westlands',
            userId: user1Id,
            imageUrl: 'https://images.unsplash.com/photo-1621993202323-f438eec934ff?q=80&w=1964&auto=format&fit=crop',
        },
        {
            id: uuidv4(),
            title: 'iPhone 14 Pro Max',
            description: 'Factory unlocked, 256GB. Battery health 95%.',
            price: 120000,
            category: 'Electronics',
            location: 'CBD',
            userId: user2Id,
            imageUrl: 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?q=80&w=1974&auto=format&fit=crop',
        },
        {
            id: uuidv4(),
            title: 'Plumbing Services',
            description: 'Professional plumber available for repairs and installations.',
            price: 1500,
            category: 'Services',
            location: 'Kilimani',
            userId: user1Id,
            imageUrl: 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=2070&auto=format&fit=crop',
        },
        {
            id: uuidv4(),
            title: 'Modern Apartment in Kilimani',
            description: 'Stunning 2-bedroom apartment with city views, gym, and high-speed lifts. Available immediately.',
            price: 85000,
            category: 'Real Estate',
            location: 'Kilimani',
            userId: user2Id,
            imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070&auto=format&fit=crop',
        },
    ]);

    console.log('Seeding complete!');
};

main();
