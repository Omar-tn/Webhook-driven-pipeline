import {deliveries, Delivery} from "../schema.js";
import {db} from "../index.js";

export async function addDelivery(delivery: Delivery) {
    let res = await db.insert(deliveries).values(delivery);
    return res;
}
