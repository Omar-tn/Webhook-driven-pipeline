import { pgTable, serial, text, jsonb, timestamp } from "drizzle-orm/pg-core";

export const events = pgTable("events", {
    id: serial("id").primaryKey(),
    sourceKey: text("sourceKey").notNull(),
    payload: jsonb("payload").notNull(),
    headers: jsonb("headers").notNull(),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    receivedAt: timestamp("received_at").defaultNow().notNull(),
});

export type NewEvent = typeof events.$inferInsert;


export const pipelines = pgTable("pipelines", {
    id: serial("id").primaryKey(),
    sourceKey: text("sourceKey").notNull(),
    target: text("target").notNull(),
    action: jsonb("action"),
})

export type Pipeline = typeof pipelines.$inferInsert;
export type pipelineGet = typeof pipelines.$inferSelect;