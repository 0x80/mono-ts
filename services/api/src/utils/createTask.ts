import { CloudTasksClient } from "@google-cloud/tasks";
import * as tasks from "@google-cloud/tasks";
import { getCurrentEnv } from "./getCurrentEnv";

const client = new CloudTasksClient();

export const createTask = async (
  url: string,
  payload: Record<string, unknown>,
  time: number,
  queue: string
) => {
  const { projectId } = getCurrentEnv();
  const project = projectId;
  const location = "southamerica-east1";

  const parent = client.queuePath(project, location, queue);

  const task: tasks.protos.google.cloud.tasks.v2.ITask = {
    httpRequest: {
      httpMethod: tasks.protos.google.cloud.tasks.v2.HttpMethod.POST,
      url,
      headers: {
        "Content-Type": "application/json",
      },
      body: Buffer.from(JSON.stringify(payload)).toString("base64"),
    },
    scheduleTime: {
      seconds: time,
    },
  };

  const request: tasks.protos.google.cloud.tasks.v2.ICreateTaskRequest = {
    parent,
    task,
  };

  const [response] = await client.createTask(request);
  const taskId = response.name;
  console.log(`Created task ${response.name}`);
  return taskId;
};

export const deleteTask = async (name: string) => {
  try {
    await client.deleteTask({ name });
    console.log(`Deleted task ${name}`);
  } catch (_) {
    console.log(`Error deleting task ${name}`);
  }
};
