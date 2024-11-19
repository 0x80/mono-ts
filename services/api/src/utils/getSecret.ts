import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { getCurrentEnv } from "./getCurrentEnv";

const client = new SecretManagerServiceClient();

export const getGoogleSecret = async (name: string) => {
  const { projectNumber } = getCurrentEnv();

  const realName = "projects/" + projectNumber + name;
  const [version] = await client.accessSecretVersion({ name: realName });
  const payload = version.payload?.data?.toString();
  return payload;
};
