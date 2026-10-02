import { describe, expect, it } from "vitest";
import { selectedTasksSchema } from "../../validators/task.validator.js";

describe("Task selection validation", () => {
    it("should accept valid task IDs", () => {
        const result = selectedTasksSchema.safeParse({
            taskIds: [
                "550e8400-e29b-41d4-a716-446655440000",
                "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
            ],
        });

        expect(result.success).toBe(true);
    });

    it("should accept an empty selection", () => {
        const result = selectedTasksSchema.safeParse({
            taskIds: [],
        });

        expect(result.success).toBe(true);
    });

    it("should reject invalid task IDs", () => {
        const result = selectedTasksSchema.safeParse({
            taskIds: ["not-a-uuid"],
        });

        expect(result.success).toBe(false);
    });

    it("should reject more than 25 tasks", () => {
        const taskIds = Array.from(
            { length: 26 },
            (_, index) =>
                `550e8400-e29b-41d4-a716-${String(index).padStart(12, "0")}`
        );

        const result = selectedTasksSchema.safeParse({
            taskIds,
        });

        expect(result.success).toBe(false);
    });
});