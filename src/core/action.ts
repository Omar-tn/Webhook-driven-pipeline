import {NewEvent, Pipeline} from "../db/schema";

export function applyAction(event: NewEvent, pipeline: Pipeline) {
    if (!pipeline.action) return true;

    let action;
    try {
        action = typeof pipeline.action === 'string'
            ? JSON.parse(pipeline.action)
            : pipeline.action;
    } catch (error) {
        console.error("Failed to parse pipeline action:", error);
        return false;
    }

    if (action?.type === "filter") {
        if (!event.payload || !action.field ) {

            return false;
        }
        let pay = (event.payload as Record<string, any>);
        const value = pay[action.field] ;
        return value === action.equals;
    }

    return true;
}