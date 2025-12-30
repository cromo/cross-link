import {xhr} from "./net";

/**
 * Information about a game from [HowLongToBeat](https://howlongtobeat.com/).
 * 
 * This structure was informed by
 * https://github.com/ckatzorke/howlongtobeat/blob/master/src/main/howlongtobeat.ts#L80
 * which is licensed under the WTFPL.
 */
export type HltbGameInfo = {
  /** The HowLongToBeat ID for a game. */
  id: string;
  /** The name of the game. */
  gameName: string;
  /** A description of the game. */
  gameDescription: string;
  // These are in hours
  /**
   * Approximately how long it takes to get through the main campaign of the
   * game in hours.
   */
  gameplayMain: number;
  /**
   * Approximately how long it takes to get through the main campaign and
   * optional sidequests in hours.
   */
  gameplayMainExtra: number;
  /**
   * Approximately how long it takes to unlock everything in a game in hours.
   */
  gameplayComplete: number;
  /**
   * How closely this game matches the search term.
   */
  similarity: number;
  /**
   * The term that was searched for that included this game in its result set.
   */
  searchTerm: string;
};

function urlForGame(id: string): string {
  return `https://howlongtobeat.com/game/${id}`;
}

function scrape(document: Document): HltbGameInfo {
  // Lucky! At least on 2024-11-27, HLTB is a NextJS site, so it includes a lot
  // of info directly in the page as JSON.
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

async function scrapeHtml<T>(
  url: string,
  scraper: (document: Document) => T,
): Promise<T> {
  return scraper(Document.parseHTMLUnsafe((await xhr({url})).responseText));
}

export async function getHltbGameData(id: string): Promise<HltbGameInfo> {
  return scrapeHtml(urlForGame(id), scrape);
}
