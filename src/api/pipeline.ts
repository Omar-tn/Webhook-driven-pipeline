import {Request, Response} from "express";
import {addPipeline} from "../db/queries/piplines.js";
import {respondWithJSON} from "./json.js";

/*export type Pipeline = {
    sourceKey: string;
    target: string;
    action?: {
        type: "filter";
        field: string;
        equals: any;
    };
};*/

//export let pipelines: Pipeline[] = [];

export async function pipelineCreator(req: Request, res: Response)  {
    const { sourceKey, targets, action } = req.body;

    if (!sourceKey || !targets || !action) {
        return res.status(400).json({ error: "sourceKey and target and action required" });
    }
    if (!Array.isArray(targets) || targets.length === 0) {
        return res.status(400).json({ error: "targets must be non-empty array" });
    }
    if ( action.type !== 'filter' && action.type !== 'transform' && action.type !== 'validate' ) {
        return res.status(400).json({ error: "Support only these actions: filter, transform or validate" });
    }

    let re = await addPipeline( sourceKey, targets, action );
    if (!re) return respondWithJSON(res,500,"Failed to store pipeline" );

    console.log("Pipeline stored to DB", { sourceKey, targets, action });

    res.status(201).json({ message: "Pipeline created" });
}
