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
  if (shouldAugmentPage) {
    const pageContext = extract(document);
    augment({ ...pageContext, ...(await collect(pageContext)) });
  }
  return shouldAugmentPage;
}

export function composeAugmenter<PageContext, ExternalContext>(
  augmenter: PageAugmenterSteps<PageContext, ExternalContext>,
): PageAugmenter {
  return (document: Document) => runAugmenter(document, augmenter);
}
