import {db} from "../index.js";
import {logs} from "../schema.js";

export async function logToDB(eventId: string, message: string) {
    try {
        const Id = Number(eventId);

        // Skip DB writes during test runs to keep unit tests isolated.
        if (process.env.NODE_ENV === "test" || process.env.VITEST) {
            return;
        }

        await db.insert(logs).values({
            eventId: Id,
            message
        });
    } catch (err) {
        console.error("logToDB failed:", err);
    }
}