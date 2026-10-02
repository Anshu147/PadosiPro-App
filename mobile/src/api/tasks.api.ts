import { api } from "./client";
import type { Task } from "@/types/api";

interface TasksResponse {
    success: boolean;
    tasks: Task[];
}

interface SelectedTasksResponse {
    success: boolean;
    tasks: Task[];
}

export async function getTasks(params?: {
    category?: string;
    search?: string;
}): Promise<TasksResponse> {
    const response = await api.get<TasksResponse>("/api/tasks", {
        params,
    });

    return response.data;
}

export async function getSelectedTasks(): Promise<SelectedTasksResponse> {
    const response = await api.get<SelectedTasksResponse>(
        "/api/tasks/selected"
    );

    return response.data;
}

export async function saveSelectedTasks(
    taskIds: string[]
): Promise<SelectedTasksResponse> {
    const response = await api.put<SelectedTasksResponse>(
        "/api/tasks/selected",
        { taskIds }
    );

    return response.data;
}