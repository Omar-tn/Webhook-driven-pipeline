import {log} from "./logger.js";
import {addDelivery} from "../db/queries/deliveries.js";
import {Delivery} from "../db/schema.js";

export async function sendWithRetry(
    url: string,
    payload: any,
    method = "POST",
    retries = 3,
    delayMs = 1000


) {
    //let status =
    let delivery : Delivery = {
        eventId: payload.id,
        target: url,
        status: "pending",
        attempts: 0,
    }
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.log(`Attempt ${attempt} => ${url}`);
            await log(payload.id, `Attempt ${attempt} => ${url}`)
            const res = await fetch(url, {
                method: method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}`);
            }

            console.log("Success");
            await log(payload.id, "Success");
            delivery.status = "success";
            delivery.attempts = attempt;
            await addDelivery(delivery);

            return true;

        } catch (err) {
            console.error(`Failed attempt ${attempt}:`, err);
            await log(payload.id, `Failed attempt ${attempt}: ${err}`);

            if (attempt === retries) {
                console.error("All retries failed");
                await log(payload.id, "All retries failed");
                delivery.status = "failed";
                delivery.attempts = attempt;
                await addDelivery(delivery);
                return false;
            }

            await new Promise(r => setTimeout(r, delayMs));
        }
    }
    return true;
}