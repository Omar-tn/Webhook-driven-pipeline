import { Response } from "express";

export function respondWithJSON(res: Response, code: number, payload: unknown) {
    if (typeof payload !== "object" && typeof payload !== "string") {
        throw new Error("Payload must be an object or a string");
    }
    res.setHeader("Content-Type", "application/json");
    const body = JSON.stringify(payload);
    res.status(code).send(body);
    res.end();
}

