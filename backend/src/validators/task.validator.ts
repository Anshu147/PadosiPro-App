import { z } from "zod";

export const selectedTasksSchema = z.object({
    taskIds: z
        .array(
            z.string().uuid("Each task ID must be a valid UUID")
        )
        .max(25, "You can select at most 25 tasks"),
});

export type SelectedTasksInput = z.infer<
    typeof selectedTasksSchema
>;