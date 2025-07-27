import {pageAugmenterSteps} from "./model";
import {obsidianRestApiDataviewSearch} from "./obsidian_rest_api";

export const youtubeVideoAugmenter = pageAugmenterSteps(
  youTubeVideoActivationGuard,
  youTubeVideoBaseDataExtractor,
  collectExternalYouTubeVideoContext,
  augmentYouTubeVideoPage,
);

function youTubeVideoActivationGuard(document: Document) {
  return !!document.location.href.match(/^https:\/\/www.youtube.com\/watch\b/);
}

async function youTubeVideoBaseDataExtractor(document: Document): Promise<{
  youtube: {channel?: {id: string; name: string}; video: {id: string}};
}> {
  const publishedByChannel = await new Promise<
    {id: string; name: string} | undefined
  >((resolve) => {
    const observer = new MutationObserver((mutations, observer) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) {
            return;
          }
          const element = node as Element;
          const channelElement = element.querySelector(".ytd-channel-name a");
          if (!channelElement) {
            return;
          }
          observer.disconnect();
          resolve({
            // We know it's an <a> tag, it has an href attribute.
            id: channelElement.getAttribute("href")!.slice(1),
            name: channelElement.textContent ?? "",
          });
        });
      });
    });

    observer.observe(document, {childList: true, subtree: true});
  });

  // const jsonLd = JSON.parse(
  //   document.querySelector('script[type="application/ld+json"]')?.textContent ??
  //     "{}",
  // );
  const context = {
    youtube: {
      channel: publishedByChannel,
      video: {
        id: document.location.search.match(/\bv=([^&]+)/)![1],
      },
    },
  };
  return context;
}

async function collectExternalYouTubeVideoContext(context: {
  youtube: {channel?: {id: string; name: string}; video: {id: string}};
}): Promise<{obsidian: {channelFileName?: string; videoFileName?: string}}> {
  const [channelNote, videoNote] = await Promise.all( [obsidianRestApiDataviewSearch(`
    TABLE
    FROM "clippings"
    WHERE econtains(aliases, "${context.youtube.channel?.id}")
  `), obsidianRestApiDataviewSearch(`
    TABLE
    FROM "clippings"
    WHERE econtains(aliases, "youtube:video/${context.youtube.video.id}")
    `)]);
  return {
    obsidian: {
      channelFileName:
        context.youtube.channel && 0 < channelNote.length
          ? channelNote[0].filename
          : undefined,
      videoFileName: videoNote.length ? videoNote[0].filename : undefined,
    },
  };
}

function augmentYouTubeVideoPage(
  document: Document,
  context: {obsidian: {channelFileName?: string, videoFileName?: string}},
): void {
  const channelInfoElement = document.querySelector("#upload-info");
  const formattedString = document.createElement("yt-formatted-string");
  formattedString.classList.add("style-scope", "ytd-video-owner-renderer");
  if (context.obsidian.channelFileName) {
    const linkToChannelClippingElement = document.createElement("a");
    linkToChannelClippingElement.textContent = "View in Obsidian";
    const openUrl = new URL("obsidian://open");
    openUrl.search = new URLSearchParams({
      vault: "pwiki",
      file: context.obsidian.channelFileName.slice(0, -".md".length),
    })
      .toString()
      .replace(/\+/g, "%20");
    linkToChannelClippingElement.href = openUrl.toString();
    linkToChannelClippingElement.style = `color: var(--yt-endpoint-color,var(--yt-spec-text-primary)); font-family: "Roboto","Arial",sans-serif; font-size: 1.2rem; text-decoration: none;`;

    channelInfoElement?.appendChild(linkToChannelClippingElement);
  } else {
    const notInObsidianElement = document.createElement("span");
    notInObsidianElement.textContent = "Not in Obsidian";

    channelInfoElement?.appendChild(notInObsidianElement);
  }

    const videoButtonsContainer = document.querySelector('.cbTitleButtonContainer');
  if (context.obsidian.videoFileName) {
    const linkToVideoClippingElement = document.createElement('a');
    linkToVideoClippingElement.textContent = "O";
    const openUrl = new URL("obsidian://open");
    openUrl.search = new URLSearchParams({
      vault: "pwiki",
      file: context.obsidian.videoFileName.slice(0, -".md".length),
    })
      .toString()
      .replace(/\+/g, "%20");
    linkToVideoClippingElement.href = openUrl.toString();
    linkToVideoClippingElement.style = `color: var(--yt-spec-text-primary); font-family: "Roboto","Arial",sans-serif; font-size: 2rem; line-height: 2.8rem; font-weight: 700;`

    videoButtonsContainer?.appendChild(linkToVideoClippingElement);
  } else {
    const notInObsidianElement = document.createElement("span");
    notInObsidianElement.textContent = "X";

    videoButtonsContainer?.appendChild(notInObsidianElement);
  }

}
