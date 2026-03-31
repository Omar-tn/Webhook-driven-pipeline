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

    it("should pass when condition matches", async () => {
        const event = { payload: { msg: "hello" } } as NewEvent;

        let res = await applyAction(event, pipe);

        expect(res.action).toBe("filter");
    });

    it("should fail when condition does not match", async () => {
        const event = { payload: { msg: "no" } } as NewEvent;

        let res = await applyAction(event, pipe);
        expect(res.action).toBe(null);
    });

});