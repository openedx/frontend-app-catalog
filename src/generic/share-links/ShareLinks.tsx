import { Icon, Hyperlink } from '@openedx/paragon';

import type { ShareLink } from './types';

/** Renders share controls in the Module's canonical order. */
const ShareLinks = ({ links }: { links: ShareLink[] }) => (
  <>
    {links.map((link) => (
      <Hyperlink key={link.id} destination={link.destination}>
        <Icon
          src={link.icon}
          screenReaderText={link.screenReaderText}
          size="lg"
        />
      </Hyperlink>
    ))}
  </>
);

export default ShareLinks;
