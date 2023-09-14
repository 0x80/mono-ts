import { chunk } from "lodash-es";

/**
 * Iterate over a potentially large set of items and process them in chunks with
 * some optional CLI feedback on progress. If the process function returns a
 * value those values are aggregated in the final result.
 */
export async function processInChunks<Input, Result>(
  allItems: Input[],
  processFunction: (value: Input) => Promise<Result>,
  chunkSize = 500
): Promise<Result[]> {
  const chunks = chunk(allItems, chunkSize);
  const allResults = [];

  for (const [index, items] of chunks.entries()) {
    if (process.env.VERBOSE) {
      console.log(`Processing chunk ${index + 1}/${chunks.length}`);
    }

    const chunkResults = await Promise.all(
      items.map((v) => processFunction(v))
    );

    allResults.push(...chunkResults);
  }

  return allResults;
}
