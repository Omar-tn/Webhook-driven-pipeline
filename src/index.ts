import express from 'express';
import {events, startWorker, webhooksHandler} from "./api/webhooks.js";
import {pipelineCreator} from "./api/pipelines";

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

//  In-memory pipelines
type Pipeline = {
    sourceKey: string;
    target: string;
};

export const pipelines: Pipeline[] = [];



app.get("/events", (req, res) => {
    res.json(events);
});


//  Register pipeline
app.post("/pipelines", pipelineCreator);


app.post('/webhook/:sourceKey', webhooksHandler);
console.log("Starting server...");

app.post("/dummy-target", (req, res) => {
    console.log(">>> Target received:", req.body);
    res.sendStatus(200);
});



app.listen(Port, () => {
    console.log('Server running on http://localhost:' +
                    Port);

    startWorker();

});

//console.log("App started");