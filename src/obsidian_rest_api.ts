import {xhr} from "./net";
import {config} from "./config";

export async function obsidianRestApiDataviewSearch(
  dql: string,
): Promise<Array<{filename: string; result: {}}>> {
  const response = await xhr({
    method: "POST",
    url: "http://127.0.0.1:27124/search/",
    headers: {
      Authorization: `Bearer ${config.obsidianRestApi.apiKey}`,
      "Content-Type": "application/vnd.olrapi.dataview.dql+txt",
    },
    data: dql,
  });
  console.log("ORA DQL", {query: dql, response});
  return JSON.parse(response.responseText);
}
