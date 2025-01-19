const endpoint =
  process.env.NEXT_PUBLIC_DEMO_API_ENDPOINT ?? "__missing_demo_api_endpoint";

/**
 * In a real application you would typically not embed an API key like this, as
 * it is easily exposed. This is only for demo purposes.
 */
const demoApiKey =
  process.env.NEXT_PUBLIC_DEMO_API_KEY ?? "__missing_demo_api_key";

const headers = {
  "x-demo-api-key": demoApiKey,
  "content-type": "application/json",
};

export async function reset() {
  const url = `${endpoint}/reset`;
  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    console.error(`Failed to call add: ${response.statusText}`);
  }
}

export async function add(value: number) {
  const url = `${endpoint}/add`;
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ n: value }),
    headers,
  });

  if (!response.ok) {
    console.error(`Failed to call add: ${response.statusText}`);
  }
}

export async function multiply(value: number) {
  const url = `${endpoint}/multiply`;
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ n: value }),
    headers,
  });

  if (!response.ok) {
    console.error(`Failed to call add: ${response.statusText}`);
  }
}
