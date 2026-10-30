import type { ShareLink } from '@src/generic/share-links';

/**
 * The Course About social link shape.
 *
 * @deprecated Use `ShareLink` from `@src/generic/share-links`. This alias keeps
 * the old name importable for existing callers and is removed once none remain.
 */
export type SocialLink = ShareLink;
