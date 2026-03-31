import {pgTable, serial, text, jsonb, timestamp, uuid, integer} from "drizzle-orm/pg-core";

export const events = pgTable("events", {
    id: serial("id").primaryKey().notNull(),
    sourceKey: text("sourceKey").notNull(),
    payload: jsonb("payload").notNull(),
    headers:  jsonb("headers").notNull(),
    action: text("action").notNull(),
    status: text("status").default("pending"),
    updatedAt: timestamp("updated_at")
        .notNull()
        .defaultNow()
        .$onUpdate(() => new Date()),
    receivedAt: timestamp("received_at").defaultNow().notNull(),
});

export type NewEvent = typeof events.$inferInsert;


export const pipelines = pgTable("pipelines", {
    id: serial("id").primaryKey().notNull(),
    sourceKey: text("sourceKey").notNull(),
    targets: jsonb("targets").notNull(),
    action: jsonb("action"),
})

export type Pipeline = typeof pipelines.$inferInsert;
export type pipelineGet = typeof pipelines.$inferSelect;


export  const logs = pgTable("logs", {
    id: serial("id").primaryKey().notNull(),
    eventId: serial("event_id").notNull()
        .references(() => events.id, { onDelete: "no action" }),
    message: text("message"),
    createdAt: timestamp("created_at").defaultNow()
});

export const deliveries = pgTable("deliveries", {
    id: serial("id").primaryKey().notNull(),
    eventId: serial("event_id")
        .references(() => events.id, { onDelete: "no action" }),

    target: text("target"),
    status: text("status"),
    attempts: integer("attempts"),
    createdAt: timestamp("created_at").defaultNow()

});

export type Delivery = typeof deliveries.$inferInsert;
