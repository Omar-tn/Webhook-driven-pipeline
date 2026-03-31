import { describe, it, expect } from "vitest";
import { applyAction } from "../core/action.js";
import {NewEvent, Pipeline} from "../db/schema";

describe("applyAction - filter", () => {

    const pipe = {
        sourceKey: "test",
        targets: ["http://localhost:3000/dummy-target"],

        action: {
            type: "filter",
            field: "msg",
            equals: "hello"
        }
    }as Pipeline;

    it("should pass when condition matches", () => {
        const event = { payload: { msg: "hello" } } as NewEvent;



        expect(applyAction(event, pipe)).toBe(true);
    });

    it("should fail when condition does not match", () => {
        const event = { payload: { msg: "no" } } as NewEvent;


        expect(applyAction(event, pipe)).toBe(false);
    });

});