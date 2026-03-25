import { describe, it, expect, vi } from "vitest";
import { sendWithRetry } from "../core/retry.js";

describe("sendWithRetry", () => {

    it("should succeed on first try", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true
        }) as any;

        const result = await sendWithRetry("http://test", {});

        expect(result).toBe(true);
    });

    it("should retry and fail", async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: false,
            status: 500
        }) as any;

        const result = await sendWithRetry("http://test", {}, 2, 10);

        expect(result).toBe(false);
    });

});