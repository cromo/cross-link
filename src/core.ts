import { PageAugmenter, type PageAugmenterSteps } from "./model";

export async function runAugmenter<PageContext, ExternalContext>(
  document: Document,
  {
    guard,
    extract,
    collect,
    augment,
  }: PageAugmenterSteps<PageContext, ExternalContext>,
): Promise<boolean> {
  const shouldAugmentPage = guard(document);
  // console.log("should augment:", shouldAugmentPage);
  if (shouldAugmentPage) {
    const pageContext = await extract(document);
    // console.log("page context", pageContext);
    augment(document, { ...pageContext, ...(await collect(pageContext)) });
  }
  return shouldAugmentPage;
}

export function composeAugmenter<PageContext, ExternalContext>(
  augmenter: PageAugmenterSteps<PageContext, ExternalContext>,
): PageAugmenter {
  return (document: Document) => runAugmenter(document, augmenter);
}
