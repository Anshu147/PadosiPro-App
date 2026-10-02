import { prisma } from "../config/prisma.js";


interface GetTasksOptions {
    category?: string;
    search?: string;
}
export async function getTasks(options: GetTasksOptions) {
    const { category, search } = options;

    return prisma.task.findMany({
        where: {
            ...(category
                ? {
                    category: {
                        name: {
                            equals: category,
                            mode: "insensitive",
                        },
                    },
                }
                : {}),

            ...(search
                ? {
                    OR: [
                        {
                            name: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                        {
                            description: {
                                contains: search,
                                mode: "insensitive",
                            },
                        },
                    ],
                }
                : {}),
        },

        include: {
            category: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },

        orderBy: [
            {
                category: {
                    name: "asc",
                },
            },
            {
                name: "asc",
            },
        ],
    });
}

export async function getCategories() {
    return prisma.category.findMany({
        orderBy: {
            name: "asc",
        },
        include: {
            _count: {
                select: {
                    tasks: true,
                },
            },
        },
    });
}