import { Icon, Hyperlink } from '@openedx/paragon';

import type { SocialLink } from './types';

const SocialLinks = ({ socialLinks }: { socialLinks: SocialLink[] }) => (
  <>
    {socialLinks.map((link) => (
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

export default SocialLinks;
