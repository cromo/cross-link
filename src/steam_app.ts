import {pageAugmenterSteps} from "./model";
import {type HltbGameInfo, getHltbGameData} from "./how_long_to_beat";
import {getWikidataGameInfo} from "./wikidata";

export const steamAppAugmenter = pageAugmenterSteps(
  steamAppActivationGuard,
  steamAppBaseDataExtractor,
  collectExternalSteamAppContext,
  augmentSteamAppPage,
);

function steamAppActivationGuard(document: Document) {
  return !!document.location.href.match(
    /^https:\/\/store.steampowered.com\/app\/\d+/,
  );
}

function steamAppBaseDataExtractor(document: Document): Promise<{
  steam: {appId: string; price: number};
}> {
  return Promise.resolve({
    steam: {
      // Because of the activation guard we know that the match succeeds.
      appId: document.location.href.match(
        /^https:\/\/store.steampowered.com\/app\/(\d+)/,
      )![1],
      // Price in pennies.
      // TODO: check for whether there is actually a price. Some pages may not have one, e.g. if it's not out yet.
      price: +document
        .querySelectorAll(".game_purchase_price")[0]
        .getAttribute("data-price-final")!,
    },
  });
}

async function collectExternalSteamAppContext(context: {
  steam: {appId: string; price: number};
}): Promise<{howLongToBeat: HltbGameInfo}> {
  const gameInfo = await getWikidataGameInfo(context.steam.appId);
  const howLongToBeat = await getHltbGameData(gameInfo.howLongToBeatId);
  return {howLongToBeat};
}

function augmentSteamAppPage(
  document: Document,
  context: {howLongToBeat: HltbGameInfo},
): void {
  if (context.howLongToBeat) {
    addSteamAppInfoBlockLine(
      document,
      "HLTB Main:",
      `${context.howLongToBeat.gameplayMain.toFixed(1)} hours`,
    );
    addSteamAppInfoBlockLine(
      document,
      "HLTB Main+Extras:",
      `${context.howLongToBeat.gameplayMainExtra.toFixed(1)} hours`,
    );
    addSteamAppInfoBlockLine(
      document,
      "HLTB 100%:",
      `${context.howLongToBeat.gameplayComplete.toFixed(1)} hours`,
    );
  }
}

function addSteamAppInfoBlockLine(
  document: Document,
  label: string,
  value: string,
): void {
  const labelElement = document.createElement("b");
  labelElement.textContent = label;
  document
    .getElementById("genresAndManufacturer")
    ?.append(labelElement, " ", value, document.createElement("br"));
}
