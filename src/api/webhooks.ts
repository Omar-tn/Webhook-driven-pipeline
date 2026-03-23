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

    console.log("Stored event:", event.id);
    respondWithJSON(res, 200,'======= Webhook Received =======');

}