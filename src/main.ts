import { steamAppAugmenter } from "./steam_app";
import { composeAugmenter } from "./core";
import { PageAugmenter } from "./model";

// Could add Steam pricing information on other pages
// See https://stackoverflow.com/questions/13784059/how-to-get-the-price-of-an-app-in-steam-webapi
// Example call: https://store.steampowered.com/api/appdetails?appids=57690
// Content in `res[appid].data.price_overview`

const augmenters: PageAugmenter[] = ([steamAppAugmenter] as const).map(
  composeAugmenter,
);

(async () => {
  await Promise.all(augmenters.map((augment) => augment(document)));
})();
