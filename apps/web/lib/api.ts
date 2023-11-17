const endpoint = process.env.NEXT_PUBLIC_DEMO_API_ENDPOINT;

export async function callReset() {
  const url = `${endpoint}/reset`;
  const response = await fetch(url);

  if (!response.ok) {
    console.error(`Failed to call add: ${response.statusText}`);
  }
}

export async function callAdd(value: number) {
  const url = `${endpoint}/add`;
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ value }),
  });

  if (!response.ok) {
    console.error(`Failed to call add: ${response.statusText}`);
  }
}

export async function callMultiply(value: number) {
  const url = `${endpoint}/multiply`;
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({ value }),
  });

  if (!response.ok) {
    console.error(`Failed to call add: ${response.statusText}`);
  }
}
