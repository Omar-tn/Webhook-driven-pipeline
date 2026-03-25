type Job = any;

const queue: Job[] = [];
let processing = false;

export async function enqueue(job: Job) {
    queue.push(job);
    await processQueue();
}

async function processQueue() {
    if (processing) return;

    processing = true;

    while (queue.length > 0) {
        const job = queue.shift();

        try {
            await handleJob(job);
        } catch (err) {
            console.error("Job failed:", err);
        }
    }

    processing = false;
}

// //////////// handler later
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