import {Request, Response} from "express";
import {addPipeline} from "../db/queries/piplines.js";

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
    const { sourceKey, target, action } = req.body;

    if (!sourceKey || !target) {
        return res.status(400).json({ error: "sourceKey and target required" });
    }

    let re = await addPipeline( sourceKey, target, action );

    console.log("Pipeline stored to DB", { sourceKey, target, action });

    res.status(201).json({ message: "Pipeline created" });
}
