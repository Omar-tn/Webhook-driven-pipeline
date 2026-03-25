import { Request, Response } from "express";
import {respondWithJSON} from "./json.js";

import {getPipelines} from "../db/queries/piplines.js";
import {NewEvent, Pipeline} from "../db/schema.js";
import {applyAction} from "../core/action.js";
import {sendWithRetry} from "../core/retry.js";

type WebhookEvent = {
    id: number;
    sourceKey: string;
    payload: any;
    headers: any;
    receivedAt: Date;
};

export let events: NewEvent[] = [];
let idCounter = 1;
let queue: NewEvent[] = [];

export async function webhooksHandler(req: Request, res: Response) {

    const sourceKey = req.params.sourceKey as string;

    const event: NewEvent = {
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

async function processEvent(event: NewEvent) {
    console.log(">>> Processing event:", event.id);

    const matched = await getPipelines( event.sourceKey);

    if (matched.length === 0) {
        console.log("No pipeline matched for:", event.sourceKey);
        return;
    }
    //console.log("passed check length now to loop");
    for (const pipeline of matched) {

        const pass = applyAction(event, pipeline);

        if (!pass) {
            console.log("Event filtered out");
            continue;
        }
        console.log("Forwarding to : ", pipeline.target, "");

        try {
            let success = await sendWithRetry(pipeline.target,
                event,
                3,
                1000);
            if (!success)
                console.log("Final failure for event:", event.id);
        } catch (err) {
            console.error("Forward failed:", err);
        }
    }
}



export function startWorker() {
    setInterval( async () => {
        if (queue.length === 0) return;
        //console.log("Processing queue:", queue.length);
        await new Promise(resolve => setTimeout(resolve, 1000));

        const event = queue.shift(); // FIFO

        if (event) {
            processEvent(event);
        }
    }, 1000); // every 1 second
}