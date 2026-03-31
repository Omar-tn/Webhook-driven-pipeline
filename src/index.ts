import "dotenv/config";
import express from 'express';
import {events, eventStatusHandler, processEvent, startWorker, webhooksHandler} from "./api/webhook.js";
import {pipelineCreator} from "./api/pipeline.js";
import {enqueue, processQueue, setHandler} from "./core/queue.js";

const app = express();
let Port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.text());

// Root route
app.get('/', (req, res) => {
    console.log('Root APi');
    res.send('Server is running at /');
});

app.get("/events/:id", eventStatusHandler);

//  Register pipeline
app.post("/pipelines", pipelineCreator);


app.post('/webhook/:sourceKey', webhooksHandler);
console.log("Starting server...");

app.post("/dummy-target", (req, res) => {
    console.log(">>> Target received:", req.body);
    res.sendStatus(200);
});



app.listen(Port, async () => {
    console.log('Server running on http://localhost:' +
                    Port);

    setHandler(processEvent);
    await processQueue();
    console.log("Worker started");

});

//console.log("App started");