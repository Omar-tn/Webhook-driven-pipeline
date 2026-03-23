import { Request, Response } from "express";
import {pipelines} from "../index";

export function pipelineCreator(req: Request, res: Response)  {
    const { sourceKey, target } = req.body;

    if (!sourceKey || !target) {
        return res.status(400).json({ error: "sourceKey and target required" });
    }

    pipelines.push({ sourceKey, target });

    console.log("Pipeline registered:", { sourceKey, target });

    res.status(201).json({ message: "Pipeline created" });
}