import { Request, Response } from "express";
import {respondWithJSON} from "./json.js";

import {getPipelines} from "../db/queries/piplines.js";
import {NewEvent, Pipeline, pipelines} from "../db/schema.js";
import {applyAction} from "../core/action.js";
import {sendWithRetry} from "../core/retry.js";
import {enqueue, queue, setHandler} from "../core/queue.js";
import {getEventStatus, registerWebhook, updateEventStatus} from "../db/queries/webkooks.js";
import {log} from "../core/logger.js";

type WebhookEvent = {
    id: number;
    sourceKey: string;
    payload: any;
    headers: any;
    receivedAt: Date;
};

export let events: NewEvent[] = [];
let idCounter = 1;
//let queue: NewEvent[] = [];


export async function webhooksHandler(req: Request, res: Response) {

    const sourceKey = req.params.sourceKey as string;
    if(req.headers["action"] === undefined)
        return respondWithJSON(res, 400, "action header is required");
    const actionHeader = req.headers["action"] as string;
    if(actionHeader !=='filter' && actionHeader !=='transform' && actionHeader !=='validate')
        return respondWithJSON(res, 400, 'action header must be one of: filter, transform or validate')
    console.log('accepting the request');
    const event: NewEvent = {

        sourceKey,
        action: actionHeader,
        payload: req.body,
        headers: req.headers,
        receivedAt: new Date()
    };

    let saved = await registerWebhook(event);
    if (!saved) {
        console.error("Failed to store event:", event);
        return respondWithJSON(res, 500, "Failed to store event");
    }
    events.push(saved);

    await enqueue(saved);
    console.log("Stored event:", saved.id);
    console.log("Queued event:", saved.id);



    respondWithJSON(res, 200,{
        res:'======= Webhook Received =======',
        following :`event created with id: ${saved.id}`,
        id: saved.id,});

}

export async function processEvent(event: NewEvent) {

    let eventid = event.id! as unknown as string;

    const matched = await getPipelines( event);

    if (matched.length === 0) {
        console.log("No pipeline matched for:", event.sourceKey);
        await log(eventid!, "No pipeline matched for: " + event.sourceKey);
        await updateEventStatus(event.id!, "no pipeline matched");
        return;
    }
    console.log(">>> Processing event:", event.id);
    await log(eventid, "Processing event");
    //console.log("passed check length now to loop");
    let succeedAll = true;
    let long = matched.length > 1;

    let c = 1;
    for (const pipeline of matched) {
        if(long){
            console.log("processing pipeline #:",c);
            await log(eventid!, "processing pipeline #:" + c);
            await updateEventStatus(event.id!, "processing pipeline #:" + c++);
        }
        let action = typeof pipeline.action === 'string'
            ? JSON.parse(pipeline.action)
            : pipeline.action;
        if(!action.type) continue;

        const pass = await applyAction(event, pipeline);

        if (!pass.action) {
            console.log("Failed to do the action for pipeline:" + pipeline.id+ " of key: "+ pipeline.sourceKey+" with action: " + action.type + "");
            await log(eventid!, "Failed to do the action for pipeline:"+ pipeline.id+ " of key: " + pipeline.sourceKey + " with action: " + action.type + "");
            succeedAll = false;
            continue;
        }
        else if( pass.action === "filter"){
            console.log("action filter completed for pipeline:" + pipeline.id + " of key: " + pipeline.sourceKey + " with action: " + action?.type + "");
            await log(eventid!, "Action filter completed for pipeline: " + pipeline.id + " of key: " + pipeline.sourceKey + " with action: " + action.type + "");
            await updateEventStatus(event.id!, "processed");
        }
        else if( pass.action === "transform"){
            console.log("action transform completed for pipeline:" + pipeline.id + " of key: " + pipeline.sourceKey + " with action: " + action.type + "");
            await log(eventid!, "Action transform completed for pipeline: " + pipeline.id + " of key: " + pipeline.sourceKey + " with action: " + action.type + "");
            await updateEventStatus(event.id!, "processed");
        }
        else if( pass.action === "validate"){
            console.log("action validate completed for pipeline:" + pipeline.id + " of key: " + pipeline.sourceKey + " with action: " + action.type + "");
            await log(eventid!, "Action validate completed for pipeline: " + pipeline.id + " of key: " + pipeline.sourceKey + " with action: " + action.type + "");
            await updateEventStatus(event.id!, "processed");
        }


        const targets = pipeline.targets as string[]  ?? [];
        if(targets.length > 1)
            long = true;
        let successAll = true;
        for( const target of targets ) {
            console.log("Forwarding to : ", target, "");
            await log(eventid!, "Forwarding to : " + target);

            try {
                 let success = await sendWithRetry(target,
                    event
                );
                if (!success) {
                    console.log("Final failure for event:", event.id);
                    await log(eventid!, "Failed in delivery to: " + target + "");
                    await updateEventStatus(event.id!, "failed in delivery to: " + target + "");
                    successAll = false;
                }
            } catch (err) {
                console.error("Forward failed:", err);

            }
        }
        if (successAll) {
            await updateEventStatus(event.id!, "success and delivered");
            await log(eventid!, "Success and delivered");
        }
        else {
            await updateEventStatus(event.id!, "failed");
            await log(eventid!, "Failed");
            succeedAll = false;

        }


    }
    if(!succeedAll ) {
        await updateEventStatus(event.id!, "failed");
        await log(eventid!, "overall status: Failed ");
    }
    

}



export async function startWorker() {
    setInterval( async () => {

        if (queue.length === 0) return;
        //console.log("Processing queue:", queue.length);
        await new Promise(resolve => setTimeout(resolve, 1000));
        //console.log('startWorker:' );
        const event = events.shift(); // FIFO

        if (event) {
            await processEvent(event);
        }
    }, 1000); // every 1 second
}



export async function eventStatusHandler(req: Request, res: Response) {
    const id = req.params.id as unknown as number;
    let {event, logsData, deliveriesData} = await getEventStatus(id);
    let Event = {
        id: event.id,
        status:event.status,
        sourceKey: event.sourceKey,
        action: event.action
    }

    let Log = {
        messages: logsData.map(log => log.message)
    }


    let Delivery = {
        subscribers: deliveriesData.map(del => ({
            target: del.target,
            status: del.status,
            attempts: del.attempts
        }))
    }
    respondWithJSON(res, 200, { Event, Log, Delivery});
}