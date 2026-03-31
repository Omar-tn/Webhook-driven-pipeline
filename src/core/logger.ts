import {logToDB} from "../db/queries/loggers.js";
export async function log(id: string, message: string) {
    await logToDB( id, message);
}