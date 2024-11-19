import { firebaseApp } from "@repo/backend/firebase";
export const getCurrentEnv = () => {
  const projectId = firebaseApp.options.projectId;
  return {
    projectId: projectId ?? "",
    isDev: projectId == "early-dev-73f4d",
    projectNumber:
      projectId == "early-dev-73f4d" ? "408457316732" : "249092724837",
  };
};
