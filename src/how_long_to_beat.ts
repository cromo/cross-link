import { xhr } from "./net";

export type HltbGameInfo = {
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

export async function getHltbGameData(id: string): Promise<HltbGameInfo> {
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
