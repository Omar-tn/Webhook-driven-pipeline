import {db} from "../index.js";
import {logs} from "../schema.js";

export async function logToDB(eventId: string, message: string) {

    let Id = Number(eventId);
    await db.insert(logs).values({
        eventId: Id,
        message
    });
}