import {deleteEvent, getAllEvents, getEvents, getUndoneEvents, updateEventStatus} from "../db/queries/webkooks.js";
import {NewEvent} from "../db/schema.js";

type Job = NewEvent;

export let queue: NewEvent[]  = [];
let processing = false;

export async function enqueue(job: Job) {
    queue.push(job);
    await processQueue();
}

export async function processQueue() {
    if (processing) return;
    queue = await getUndoneEvents();
    processing = true;
    console.log("Processing queue of:", queue.length);
    while (queue.length > 0) {
        const job = queue.shift();
        if(job === undefined) continue;
        try {
            await handleJob(job);
        } catch (err) {
            console.error("Job failed:", err);
        }
        //await deleteEvent(job.id!);
        //await updateEventStatus(job.id!, "success");
    }

    processing = false;
    console.log("Queue processing complete");
}


let handler: (job: Job) => Promise<void>;

export function setHandler(fn: (job: Job) => Promise<void>) {
    handler = fn;
}

async function handleJob(job: Job) {
    if (!handler) {
        throw new Error("No queue handler defined");
    }

    await handler(job);
}