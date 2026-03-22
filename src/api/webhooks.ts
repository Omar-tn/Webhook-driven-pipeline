import { Request, Response } from "express";
import {respondWithJSON} from "./json.js";

export function webhooksHandler(req: Request, res: Response) {
    let sourceKey = req.params.sourceKey;
    console.log("======= Webhook Received =======");
    console.log("Source:", sourceKey);
    console.log("Body:", JSON.stringify(req.body, null, 2));
    respondWithJSON(res, 200,'======= Webhook Recieved =======');

}