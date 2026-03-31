import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";


const connectionString = process.env.DB_URL!;

let client;

async function connectWithRetry() {
    let attempts = 0;

    while (attempts < 10) {
        try {
            client = postgres(connectionString);
            await client`SELECT 1`; // test query
            console.log("DB connected");
            return client;
        } catch (err) {
            console.log("DB not ready, retrying...");
            attempts++;
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    throw new Error("DB connection failed");
}

client = await connectWithRetry();
export const db = drizzle(client, { schema });