import { xhr } from "./net";

export async function getWikidataGameInfo(
  steamAppId: string,
): Promise<{ howLongToBeatId: string }> {
  const response = await xhr({
    url: `https://query.wikidata.org/sparql?format=json&query=SELECT ?item ?itemLabel ?HowLongToBeat_ID WHERE { ?item wdt:P1733 "${steamAppId}"; wdt:P2816 ?HowLongToBeat_ID. SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE],mul,en". }}`,
  });
  const howLongToBeatId = JSON.parse(response.responseText).results.bindings[0]
    .HowLongToBeat_ID.value;
  return {
    howLongToBeatId,
  };
}
