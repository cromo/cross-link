/*
So I think the general shape of a crosslink is:

1. Match the page via URL and/or content to see if there's info we can
   cross-reference, potentially saving some data for performing cross-references.
2. Extract additional identifiers to be used for cross-reference.
3. Perform cross-reference, pulling additional information from Wikidata,
   other websites, local data, etc., using the extracted identifiers and return it.
   This step can be repeated to chain lookups.
4. Use that information to augment the current page.

*/

// Could add Steam pricing information on other pages
// See https://stackoverflow.com/questions/13784059/how-to-get-the-price-of-an-app-in-steam-webapi
// Example call: https://store.steampowered.com/api/appdetails?appids=57690
// Content in `res[appid].data.price_overview`

(async () => {
  const steamAppId = document.location.href.match(
    /^https:\/\/store.steampowered.com\/app\/(\d+)/,
  )![1];
  const gameInfo = await getWikidataGameInfo(steamAppId);
  const hltb = await getHltbGameData(gameInfo.howLongToBeatId);

  addSteamAppInfoBlockLine(
    "HLTB Main:",
    `${hltb.gameplayMain.toFixed(1)} hours`,
  );
  addSteamAppInfoBlockLine(
    "HLTB Main+Extras:",
    `${hltb.gameplayMainExtra.toFixed(1)} hours`,
  );
  addSteamAppInfoBlockLine(
    "HLTB 100%:",
    `${hltb.gameplayComplete.toFixed(1)} hours`,
  );
})();

function xhr<Context = unknown>(
  args: Omit<
    GM.Request<Context>,
    "method" | "onload" | "onerror" | "ontimeout" | "onabort"
  > &
    Partial<Pick<GM.Request, "method">>,
): Promise<GM.Response<Context>> {
  console.log(args);
  return new Promise<GM.Response<Context>>((resolve, reject) =>
    GM.xmlHttpRequest({
      method: "GET",
      ...args,
      onload: resolve,
      onerror: reject,
      ontimeout: reject,
      onabort: reject,
    }),
  );
}

function createElementWithContent(tag: string, content: string): HTMLElement {
  const element = document.createElement(tag);
  element.textContent = content;
  return element;
}

function addSteamAppInfoBlockLine(label: string, value: string): void {
  const labelElement = document.createElement("b");
  labelElement.textContent = label;
  document
    .getElementById("genresAndManufacturer")
    ?.append(labelElement, " ", value, document.createElement("br"));
}

async function getWikidataGameInfo(
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

type HltbGameInfo = {
  id: string;
  gameName: string;
  gameDescription: string;
  // These are in hours
  gameplayMain: number;
  gameplayMainExtra: number;
  gameplayComplete: number;
  similarity: number;
  searchTerm: string;
};

async function getHltbGameData(id: string): Promise<HltbGameInfo> {
  return parseHltbGamePage(
    (await xhr({ url: `https://howlongtobeat.com/game/${id}` })).responseText,
  );
}

function parseHltbGamePage(html: string): HltbGameInfo {
  const document = Document.parseHTMLUnsafe(html);
  /*
  // Based on https://github.com/ckatzorke/howlongtobeat/blob/master/src/main/howlongtobeat.ts#L113 (WTFPL)
  console.log(document.querySelectorAll("div[class*=GameNavigation_profile_nav__] a"), document.body)
  //const id = document.querySelectorAll("div[class*=GameNavigation_profile_nav__] a")[0].attributes.href.textContent.split("/")[2];
  const gameName = document.querySelectorAll("div[class*=GameHeader_profile_header__]")[0].textContent.trim();
  const imageUrl = document.querySelectorAll("div[class*=GameHeader_game_image__] img")[0].attributes.src;
  const gameplay = [...document.querySelectorAll("div[class*=GameStats_game_times__] li")].reduce((times, gameStyle) => {
    const style = gameStyle.getElementsByTagName("h4")[0].textContent;
    const time = gameStyle.getElementsByTagName("h5")[0].textContent;
    return style.startsWith("Main Story")  || style.startsWith("Single-Player") || style.startsWith("Solo") ? { ...times, gameplayMain: time } :
      style.startsWith("Main + Sides") || style.startsWith("Co-Op") ? { ...times, gameplayMainExtra: time } :
      style.startsWith("Completionist") || style.startsWith("Vs.") ? { ...times, gameplayComplete: time } :
      times;
  }, {});
  //*/
  // Lucky! At least on 2024-11-27, HLTB is a NextJS site, so it includes a lot of info directly in the page as JSON.
  const embeddedJson = JSON.parse(
    document.getElementById("__NEXT_DATA__")!.innerText,
  );
  const game = embeddedJson.props.pageProps.game.data.game[0];
  return {
    id: game.game_id,
    gameName: game.game_name,
    gameDescription: game.profile_summary,
    //platforms,
    //imageUrl,
    //timeLabels,
    // These values come in as seconds; convert them to hours.
    gameplayMain: game.comp_main / 60 / 60,
    gameplayMainExtra: game.comp_plus / 60 / 60,
    gameplayComplete: game.comp_100 / 60 / 60,
    similarity: 1,
    searchTerm: game.game_name,
  };
}
