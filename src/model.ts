/**
 * Determines whether or not an augmenter should be run on the current page.
 *
 * Usually, this is a check against the `document.location.href`, but it could
 * contain additional checks e.g. against content in the page.
 *
 * @param document The document for the page under consideration for
 * augmentation.
 * @returns `true` when the augmenter should run; otherwise, `false`.
 */
export type ActivationGuard = (document: Document) => boolean;

/**
 * The steps that compose all page augmenters.
 */
export type PageAugmenterSteps<PageContext, ExternalContext> = {
  /**
   * Determines whether or not the augmenter should be run on the current page.
   */
  guard: ActivationGuard;
  /**
   * Extracts the base data to use for looking up external data.
   *
   * It can also collect information in the page that could be combined with
   * external data to produce additional useful information, e.g. a game's
   * dollar-per-hour rate.
   * @param document The document for the current page.
   * @returns Context extracted from the document, whether that be from the URL
   * or page content. Is a `Promise` so that extraction can take as long as
   * needed, e.g. when the page does not include the desired data on load but
   * adds it within a few seconds, e.g. YouTube videos add the link to the
   * channel after much of the rest of the page has loaded.
   */
  extract: (document: Document) => Promise<PageContext>;
  /**
   * Collects external data using the page context as input.
   *
   * The data could come from other sites or APIs, local servers, caches, etc.
   * Multiple steps could be performed during the collect step, as data from one
   * source could be used to look up data from another.
   * @param context The context from the page to augment.
   * @returns A `Promise` of external content that was collected to be used for
   * augmenting the page.
   */
  collect: (context: PageContext) => Promise<ExternalContext>;
  /**
   * Alters the current page, preferably making the new data fit in with the
   * existing page structure.
   * @param document The document of the current page to be modified.
   * @param context The combination of the data extracted from the document and
   * the data collected from external sources.
   * @returns Nothing.
   */
  augment: (document: Document, context: PageContext & ExternalContext) => void;
};

/**
 * Helps with constructing `PageAugmenterStep`s via type deduction.
 * @param guard Determines the augmenter should run on the current page.
 * @param extractor Pulls starting data from the current page.
 * @param collector Reaches out to other sources using that data to collect more
 * data.
 * @param augmenter Uses the extracted and collected data to alter the current
 * page.
 * @returns A `PageAugmenterStep` with the supplied functions.
 */
export function pageAugmenterSteps<PageContext, ExternalContext>(
  guard: ActivationGuard,
  extractor: (document: Document) => Promise<PageContext>,
  collector: (context: PageContext) => Promise<ExternalContext>,
  augmenter: (
    document: Document,
    context: PageContext & ExternalContext,
  ) => void,
): PageAugmenterSteps<PageContext, ExternalContext> {
  return {
    guard,
    extract: extractor,
    collect: collector,
    augment: augmenter,
  };
}

/**
 * A function that takes a document and returns whether or not it augmented the
 * current page.
 */
export type PageAugmenter = (document: Document) => Promise<boolean>;
