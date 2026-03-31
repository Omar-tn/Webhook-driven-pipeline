import 'dotenv/config';
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";
import {a} from "vitest/dist/chunks/suite.d.udJtyAgw";


const connectionString = process.env.DB_URL!;
let dbInstance : ReturnType<typeof drizzle> ;
const client = postgres(connectionString);

async function connectWithRetry() {
    let attempts = 0;

    while (attempts < 10) {
        try {
            const client = postgres(connectionString); // limit connections
            await client`SELECT 1`;
            console.log("DB connected");
            return drizzle(client, { schema });
        } catch (err) {
            console.log("DB not ready, retrying...", err);
            attempts++;
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    throw new Error("DB connection failed after 10 attempts");
}

export async function getDB() {
    if (!dbInstance) {
        dbInstance = await connectWithRetry();
    }
    return dbInstance;
}
export const db = await connectWithRetry();//drizzle(client, { schema });