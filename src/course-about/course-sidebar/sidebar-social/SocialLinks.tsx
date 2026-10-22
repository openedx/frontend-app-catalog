import { ShareLinks } from '@src/generic/share-links';

import type { SocialLink } from './types';

/**
 * Course About's own share-control renderer.
 *
 * @deprecated Use `ShareLinks` from `@src/generic/share-links`, which this
 * delegates to. Kept so existing imports of this path keep working.
 */
const SocialLinks = ({ socialLinks }: { socialLinks: SocialLink[] }) => (
  <ShareLinks links={socialLinks} />
);

export default SocialLinks;
