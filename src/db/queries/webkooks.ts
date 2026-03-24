import {db} from "../index.js";
import {events, NewEvent, } from "../schema.js";

export async function registerWebhook(event: NewEvent) {
    await db.insert(events).values({
        sourceKey: event.sourceKey,
        payload: event.payload,
        headers: event.headers,
    });
}
