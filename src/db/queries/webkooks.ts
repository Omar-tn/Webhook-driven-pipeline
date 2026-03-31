import {db} from "../index.js";
import {deliveries, events, logs, NewEvent,} from "../schema.js";
import {eq, not, or} from "drizzle-orm";

export async function registerWebhook(event: NewEvent) {
    let [res] = await db.insert(events).values({
        sourceKey: event.sourceKey,
        payload: event.payload,
        headers: event.headers,
        action: event.action,

    }).returning();

    return res;
}

export async function getEvents(sourceKey: string) {
    let [res] = await db.select().from(events).where(eq(events.sourceKey,sourceKey));
    return res;
}

export async function  getAllEvents() {
    let res = await db.select().from(events).orderBy(events.receivedAt);
    return res;
}

export async function  getUndoneEvents() {
    let res = await db.select().from(events).where(or(eq(events.status,'pending'),eq(events.status,'failed'))).orderBy(events.updatedAt);
    return res;
}



export async function deleteEvent(id: number) {
    await db.delete(events).where(eq(events.id, id));
}



export async function updateEventStatus(id: number, status: string) {
   let res =  await db.update(events).set({status}).where(eq(events.id, id));
   return res;
}

export async function getEventStatus(id: number) {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    const logsData = await db.select().from(logs).where(eq(logs.eventId, id));
    const deliveriesData = await db.select().from(deliveries).where(eq(deliveries.eventId, id));
    return {event, logsData, deliveriesData};
}

