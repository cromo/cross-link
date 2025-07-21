import { pageAugmenterSteps } from "./model";

export const youtubeVideoAugmenter = pageAugmenterSteps(
  youTubeVideoActivationGuard,
  youTubeVideoBaseDataExtractor,
  collectExternalYouTubeVideoContext,
  augmentYouTubeVideoPage,
);

function youTubeVideoActivationGuard(document: Document) {
  console.log(
    "cross-link youtube activation guard",
    !!document.location.href.match(/^https:\/\/www.youtube.com\/watch\b/),
  );
  return !!document.location.href.match(/^https:\/\/www.youtube.com\/watch\b/);
}

async function youTubeVideoBaseDataExtractor(document: Document): Promise<{
  youtube: { channel: { id?: string; name?: string }; video: { id: string } };
}> {
  // Augh, this needs to wait until the element is added. YouTube is so slow it
  // doesn't even include the basic metadata about the video on page load.
  const channelElement = document.querySelector(".ytd-channel-name a");
  console.log("cross-link", channelElement);
  const jsonLd = JSON.parse(
    document.querySelector('script[type="application/ld+json"]')?.textContent ??
      "{}",
  );
  const context = {
    youtube: {
      channel: {
        id: channelElement?.getAttribute("href")?.slice(1),
        name: channelElement?.textContent ?? undefined,
      },
      video: {
        id: document.location.search.match(/\bv=([^&]+)/)![1],
      },
    },
  };
  console.log("cross-link extracted context", context);
  return context;
}

async function collectExternalYouTubeVideoContext(
  context: unknown,
): Promise<{}> {
  console.log("cross-link youtube context:", context);
  return {};
}

function augmentYouTubeVideoPage(context: {}): void {}
