frontend-app-catalog
####################

|license-badge| |status-badge|

.. note::

   **Work in progress.** This branch (``frontend-base``) is the in-flight
   port of the catalog MFE to `frontend-base`_. For the migration plan and
   change-by-change context, see `docs/migrate-to-frontend-base.md`_ and
   `docs/migrate-to-frontend-base-worklog.md`_.

.. _frontend-base: https://github.com/openedx/frontend-base
.. _docs/migrate-to-frontend-base.md: ./docs/migrate-to-frontend-base.md
.. _docs/migrate-to-frontend-base-worklog.md: ./docs/migrate-to-frontend-base-worklog.md

Purpose
*******

The Catalog micro-frontend serves the public-facing Home, Course About, and
Course Catalog pages — the intended replacement for the corresponding
legacy views in ``edx-platform``.

Slots
*****

This app offers a number of slots for operators to customize its pages. See
`src/slots/`_ for the current list and per-slot READMEs with usage examples.

.. _src/slots/: ./src/slots/

Getting Help
************

If you're having trouble, we have discussion forums at
https://discuss.openedx.org. Real-time conversations happen in the
`#wg-frontend channel`_ of the `community Slack workspace`_ (request a
`Slack invitation`_ first).

.. _Slack invitation: https://openedx.org/slack
.. _community Slack workspace: https://openedx.slack.com/
.. _#wg-frontend channel: https://openedx.slack.com/archives/C04BM6YC7A6

License
*******

The code in this repository is licensed under the AGPLv3 unless otherwise
noted.

Please see `LICENSE <LICENSE>`_ for details.

.. |license-badge| image:: https://img.shields.io/github/license/openedx/frontend-app-catalog.svg
    :target: https://github.com/openedx/frontend-app-catalog/blob/master/LICENSE
    :alt: License

.. |status-badge| image:: https://img.shields.io/badge/Status-WIP-yellow
    :alt: WIP
