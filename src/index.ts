import express from 'express';
import {webhooksHandler} from "./api/webhooks.js";

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

app.post('/webhook/:sourceKey', webhooksHandler);
console.log("Starting server...");
app.listen(Port, () => {
    console.log('Server running on http://localhost:' +
                    Port);



});

//console.log("App started");