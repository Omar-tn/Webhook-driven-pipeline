import { Request, Response } from "express";
import {respondWithJSON} from "./json.js";


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

function processEvent(event: WebhookEvent) {
    console.log(">>> Processing event:", event.id);
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