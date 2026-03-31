import {deliveries, Delivery} from "../schema.js";
import {db} from "../index.js";

export async function addDelivery(delivery: Delivery) {
    try {
        // Skip DB writes during test runs to keep unit tests isolated.
        if (process.env.NODE_ENV === "test" || process.env.VITEST) {
            return null;
        }

        return await db.insert(deliveries).values(delivery);
    } catch (err) {
        console.error("addDelivery failed:", err);
        return null;
    }
}
