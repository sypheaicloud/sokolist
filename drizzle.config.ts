import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// 👇 LOAD .env.local SPECIFICALLY
dotenv.config({ path: ".env.local" });

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing! Check your .env.local file.");
}

export default defineConfig({
    schema: "./src/lib/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL,
    },
});