import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const waitlistEntries = sqliteTable("waitlist_entries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  source: text("source").default("landing"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull(),
  stripeCustomerId: text("stripe_customer_id"),
  isPaid: integer("is_paid", { mode: "boolean" }).default(false).notNull(),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const cvGenerations = sqliteTable("cv_generations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clerkUserId: text("clerk_user_id"),
  ipAddress: text("ip_address").notNull(),
  inputData: text("input_data").notNull(),
  generatedCv: text("generated_cv").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const ipRateLimits = sqliteTable("ip_rate_limits", {
  ipAddress: text("ip_address").primaryKey(),
  lastGenerationAt: integer("last_generation_at", { mode: "timestamp" }).notNull(),
  generationCount: integer("generation_count").default(1).notNull(),
});
