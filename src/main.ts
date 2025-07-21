import { steamAppAugmenter } from "./steam_app";
import { composeAugmenter } from "./core";
import { PageAugmenter } from "./model";
import { youtubeVideoAugmenter } from "./youtube_video";

// Could add Steam pricing information on other pages
// See https://stackoverflow.com/questions/13784059/how-to-get-the-price-of-an-app-in-steam-webapi
// Example call: https://store.steampowered.com/api/appdetails?appids=57690
// Content in `res[appid].data.price_overview`

GM.notification("Attempting to augment this page", "Polymerizing");

const augmenters: PageAugmenter[] = [
  composeAugmenter(steamAppAugmenter),
  composeAugmenter(youtubeVideoAugmenter),
];

(async () => {
  await Promise.all(augmenters.map((augment) => augment(document)));
  console.log("augmentation finished");
})();
