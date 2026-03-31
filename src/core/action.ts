import {NewEvent, Pipeline} from "../db/schema";
import {sendWithRetry} from "./retry";
import {aw} from "vitest/dist/chunks/reporters.d.CZ5E0GCT";

export async function applyAction(event: NewEvent, pipeline: Pipeline) {
    let res = {
        action: null,
    } as Record<string, any>;

    if (!pipeline.action) return res;

    let action;
    try {
        action = typeof pipeline.action === 'string'
            ? JSON.parse(pipeline.action)
            : pipeline.action;
    } catch (error) {
        console.error("Failed to parse pipeline action:", error);
        return res;
    }

    try {


        if (action?.type === "filter") {
            if (!event.payload || !action.field) {

                return res;
            }
            let pay = (event.payload as Record<string, any>);
            const value = pay[action.field];
            if (value === action.equals)
                res.action = action.type;

            return res;
        }

        if (action?.type === "transform") {
            if (!event.payload ) return res;

            const Payload = {...(event.payload as any)};

            if (action.map) {
                for (const key in action.map) {
                    Payload[key] = Payload[action.map[key]];
                }
                res.action = action.type;
            } else {

                if (!event.payload || !action.field) return res;

                Payload[action.field] = Payload[ action.value];

                res.action = action.type;
            }


            event.payload = Payload;

            res.event = event.payload;

            return res;



        }
        if (action?.type === "validate") {
            const required = action.required;
            if(!event.payload || !required) return res;
            const payload = event.payload as Record<string, any>;

            for (const field of required) {
                if (!(field in payload)) {
                    console.log("Validation failed:", field);
                    return res;
                }
            }
            res.action = action.type;
            return res;
        }




    }catch(e){

            console.error("Failed to do the action:", e);
            return res;


    }

    return res;

}

async function sendHttp(url: string, method: string, payload: any) {

    let res = await fetch(url,{

        method: method,
        headers: {"Content-Type": 'application/json'},
        body: JSON.stringify(payload),



    });

    return res;


}