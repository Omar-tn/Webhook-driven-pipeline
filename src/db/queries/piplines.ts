import {NewEvent, Pipeline, pipelines} from "../schema.js";
import {db} from "../index.js";
import {and, eq} from "drizzle-orm";

export async function addPipeline(sourceKey: string, target: any, action: any) {

    //console.log("DB_URL:", process.env.DB_URL);
    if (!action || !action.type )
        return false;
    const targets = Array.isArray(target) ? target : [target];
    let result = await db.insert(pipelines).values({
        sourceKey: sourceKey ,
        targets: targets,
        action: action ?? null,
    });
    return result;

}

export async function getPipelines(event: NewEvent): Promise<Pipeline[]> {
    let headers = event.headers as Record<string, any>;

    if(headers["action"] === undefined) return [];

    let res = await db.select().from(pipelines).where(eq(pipelines.sourceKey, event.sourceKey));

    const filtered = res.filter(pipeline => {

        try {
            const action = typeof pipeline.action === 'string' ? JSON.parse(pipeline.action) : pipeline.action;
            return action?.type === headers["action"];
        } catch (error) {
            return false;
        }
    });

    return filtered;

}