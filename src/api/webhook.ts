import { Request, Response } from "express";
import {respondWithJSON} from "./json.js";

import {getPipelines} from "../db/queries/piplines.js";
import  {Pipeline} from "../db/schema.js";

type WebhookEvent = {
    id: number;
    sourceKey: string;
    payload: any;
    headers: any;
    receivedAt: Date;
};

export let events: WebhookEvent[] = [];
let idCounter = 1;
let queue: WebhookEvent[] = [];

export async function webhooksHandler(req: Request, res: Response) {

    const sourceKey = req.params.sourceKey as string;

    const event: WebhookEvent = {
        id: idCounter++,
        sourceKey,
        payload: req.body,
        headers: req.headers,
        receivedAt: new Date()
    };

    events.push(event);
    queue.push(event);

    console.log("Stored event:", event.id);
    console.log("Queued event:", event.id);

    respondWithJSON(res, 200,'======= Webhook Received =======');

}

async function processEvent(event: WebhookEvent) {
    console.log(">>> Processing event:", event.id);

    const matched = await getPipelines( event.sourceKey);

    if (matched.length === 0) {
        console.log("No pipeline matched for:", event.sourceKey);
        return;
    }

    for (const pipeline of matched) {

        /*const pass = applyAction(event, pipeline);

        if (!pass) {
            console.log("Event filtered out");
            continue;
        }
*/
        console.log("Forwarding to target...");

        try {
            await fetch(pipeline.target, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(event.payload),
            });
        } catch (err) {
            console.error("Forward failed:", err);
        }
    }
}

function applyAction(event: WebhookEvent, pipeline: Pipeline) {
    if (!pipeline.action) return true;

    const action = typeof pipeline.action === 'string'
        ? JSON.parse(pipeline.action)
        : pipeline.action;

    if (action?.type === "filter") {
        const value = event.payload[action?.field];
        return value === action?.equals;
    }

    return true;
}

export function startWorker() {
    setInterval( async () => {
        if (queue.length === 0) return;

        await new Promise(resolve => setTimeout(resolve, 1000));

        const event = queue.shift(); // FIFO

        if (event) {
            processEvent(event);
        }
    }, 1000); // every 1 second
}