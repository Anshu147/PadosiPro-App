import { prisma } from "../config/prisma.js";

export async function getSelectedTasks(userId: string) {
    const userTasks = await prisma.userTask.findMany({
        where: {
            userId,
        },
        include: {
            task: {
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            createdAt: "asc",
        },
    });

    return userTasks.map((userTask) => userTask.task);
}

export async function saveSelectedTasks(
    userId: string,
    taskIds: string[]
) {
    // Remove duplicate IDs from the request
    const uniqueTaskIds = [...new Set(taskIds)];

    // Make sure every task actually exists
    const existingTasks = await prisma.task.findMany({
        where: {
            id: {
                in: uniqueTaskIds,
            },
        },
        select: {
            id: true,
        },
    });

    const existingTaskIds = new Set(
        existingTasks.map((task) => task.id)
    );

    const invalidTaskIds = uniqueTaskIds.filter(
        (taskId) => !existingTaskIds.has(taskId)
    );

    if (invalidTaskIds.length > 0) {
        throw new Error(
            `Invalid task IDs: ${invalidTaskIds.join(", ")}`
        );
    }

    await prisma.$transaction(async (tx) => {
        // Replace the user's previous selection
        await tx.userTask.deleteMany({
            where: {
                userId,
            },
        });

        if (uniqueTaskIds.length > 0) {
            await tx.userTask.createMany({
                data: uniqueTaskIds.map((taskId) => ({
                    userId,
                    taskId,
                })),
            });
        }
    });

    return getSelectedTasks(userId);
}