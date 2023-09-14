export async function fetchJson<T>(
  endpoint: string,
  queryParams: { [key: string]: string | number | boolean | undefined } = {},
  options: RequestInit = {}
) {
  const queryString = makeQueryString(queryParams);

  const url = `${endpoint}?${queryString}`;

  const response = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain",
      "Content-Type": "application/json",
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(
      `Fetch to ${url} failed with status ${
        response.status
      }. Response text: ${await response.text()}`
    );
  }

  try {
    return response.json() as Promise<T>;
  } catch (err) {
    throw new Error(`Failed to parse JSON from response of ${url}`);
  }
}

function makeQueryString(
  params: { [key: string]: string | number | boolean | undefined } = {}
) {
  const queryString = new URLSearchParams();

  Object.entries(params)
    .filter(([, value]) => value !== undefined)
    .forEach(([name, value]) => queryString.append(name, String(value)));

  return queryString.toString();
}
