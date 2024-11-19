import { BigQuery } from "@google-cloud/bigquery";

// Initialize BigQuery client
const bigquery = new BigQuery();

export const runBigQuery = async (
  query: string,
  params: {
    [key: string]: string;
  }
) => {
  try {
    // Run the query
    const [job] = await bigquery.createQueryJob({ query, params: params });
    const [rows] = await job.getQueryResults();

    // Return the results
    return { success: true, data: rows };
  } catch (error) {
    // Handle errors
    console.error("Error querying BigQuery:", error);
    return { success: false, data: [] };
  }
};
