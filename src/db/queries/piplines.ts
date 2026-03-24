import {Pipeline, pipelines} from "../schema.js";
import {db} from "../index.js";
import {eq} from "drizzle-orm";

export async function addPipeline(sourceKey: string, target: string, action: any) {

    //console.log("DB_URL:", process.env.DB_URL);

    let result = await db.insert(pipelines).values({
        sourceKey: sourceKey ,
        target: target,
        action: action ?? null,
    });
    return result;

}

export async function getPipelines(sourceKey: string): Promise<Pipeline[]> {
    let res =  await db.select().from(pipelines).where(eq(pipelines.sourceKey, sourceKey));

    return res;

}