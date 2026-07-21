frontend-app-catalog
####################

|license-badge| |status-badge| |ci-badge| |codecov-badge|

The catalog is a `frontend-base`_ application: a library that plugs into
the Open edX frontend shell, rather than a standalone micro-frontend
bundled with its own webpack build.

.. _frontend-base: https://github.com/openedx/frontend-base

Purpose
*******

The catalog serves the public-facing Home, Course About, and Course
Catalog pages — the intended replacement for the corresponding legacy
views in ``edx-platform``.

Getting Started
***************

Prerequisites
=============

`Tutor`_ is currently recommended as the development environment for
this app. See the `relevant tutor-mfe documentation`_ to get started
with it.

.. _Tutor: https://github.com/overhangio/tutor
.. _relevant tutor-mfe documentation: https://github.com/overhangio/tutor-mfe#mfe-development

Cloning and Startup
===================

1. Clone the repo:

   ``git clone https://github.com/openedx/frontend-app-catalog.git``

2. Use the version of Node specified in the ``.nvmrc`` file.

   Using other major versions of Node *may* work, but is unsupported.
   This repository includes an ``.nvmrc`` file to help set the correct
   Node version via `nvm <https://github.com/nvm-sh/nvm>`_.

3. Install npm dependencies:

   ``cd frontend-app-catalog && npm install``

4. Start the dev server:

   ``npm run dev``

The dev server defaults to ``PORT=1998 PUBLIC_PATH=/catalog`` (set in
the ``dev`` script in ``package.json``) and is available at
`http://apps.local.openedx.io:1998/catalog <http://apps.local.openedx.io:1998/catalog>`_.

Configuration used by the dev server is defined in
``site.config.dev.tsx`` at the repo root.

Local Development Against ``frontend-base``
===========================================

To develop this app and a local checkout of ``frontend-base`` in
tandem, use the built-in npm workspace support:

.. code-block:: sh

    mkdir -p packages/frontend-base
    sudo mount --bind /path/to/frontend-base packages/frontend-base
    npm install
    npm run dev:packages

Bind mounts are used instead of symlinks because Node resolves
symlinks to their real paths, which breaks hoisted dependency
resolution. When you are done, unmount with
``sudo umount packages/frontend-base``.

Configuration
=============

The catalog app declares the following ``AppConfig`` fields (defaults
live in ``src/app.ts``). Sites can override any of them by spreading
over ``catalogApp.config`` in ``site.config.*.tsx``:

.. list-table::
   :header-rows: 1
   :widths: 40 60

   * - Field
     - Purpose
   * - ``ENABLE_COURSE_DISCOVERY``
     - Show the Discover / Explore links in the header.
   * - ``ENABLE_PROGRAMS``
     - Show the Programs link in the header.
   * - ``ENABLE_COURSE_SORTING_BY_START_DATE``
     - Enable start-date sorting in the catalog search.
   * - ``HOMEPAGE_COURSE_MAX``
     - Maximum number of courses to render on the homepage list
       (default ``9``).
   * - ``HOMEPAGE_PROMO_VIDEO_YOUTUBE_ID``
     - YouTube video id for the homepage promo video.
   * - ``NON_BROWSABLE_COURSES``
     - When truthy, hides catalog links for authenticated users.
   * - ``INFO_EMAIL``
     - Support email address shown on the catalog error page.
   * - ``SUPPORT_URL``
     - URL of the support / help page linked from the catalog.
   * - ``LEARNING_BASE_URL``
     - Base URL for course-outline links from the course-about page.
   * - ``COURSE_ABOUT_TWITTER_ACCOUNT``
     - Twitter handle used by the course-about sidebar's share widget.

See ``site.config.dev.tsx`` in this repo for a worked example of
overriding these for local development.

Slots
*****

This app offers a number of slots for operators to customize its
pages. See `src/slots/`_ for the current list and per-slot READMEs
with usage examples.

.. _src/slots/: ./src/slots/

Developing
**********

Project Structure
=================

The layout follows the standard `frontend-base app layout`_:

- ``src/app.ts`` — the app configuration imported by
  ``site.config.*.tsx``.
- ``src/constants.ts`` — the app's ``appId`` and role identifiers.
- ``src/index.ts`` — the package's public exports (this is a
  library).
- ``src/routes.tsx`` — the app's react-router routes.
- ``src/Main.tsx`` — the root component for the app's routes.
- ``src/slots.tsx`` — the slot operations the app applies to the
  shell.
- ``src/slots/`` — the slots this app offers to consumers.
- ``src/style.scss`` — app-scoped runtime styles.

For more, see the `frontend-base migration how-to`_.

.. _frontend-base app layout: https://github.com/openedx/frontend-base/blob/main/docs/how_tos/migrate-frontend-app.md#src-file-structure
.. _frontend-base migration how-to: https://github.com/openedx/frontend-base/blob/main/docs/how_tos/migrate-frontend-app.md

Build Process Notes
===================

**Library build**

``npm run build`` compiles the library into ``dist/`` via ``tsc`` and
``tsc-alias``. This is what gets published and consumed by sites.

**CI build**

``npm run build:ci`` runs ``openedx build`` against
``site.config.ci.tsx`` so webpack traverses the full app graph. This
catches issues (like broken lazy-loaded imports) that ``tsc`` and
Jest would not surface.

Internationalization
====================

Please refer to the `frontend-base i18n howto`_ for documentation on
internationalization.

.. _frontend-base i18n howto: https://github.com/openedx/frontend-base/blob/main/docs/how_tos/i18n.rst

Getting Help
************

If you're having trouble, we have discussion forums at
https://discuss.openedx.org where you can connect with others in the
community.

Our real-time conversations are on Slack. You can request a `Slack
invitation`_, then join our `community Slack workspace`_. Because
this is a frontend repository, the best place to discuss it would be
in the `#wg-frontend channel`_.

For anything non-trivial, the best path is to open an issue in this
repository with as many details about the issue you are facing as
you can provide.

https://github.com/openedx/frontend-app-catalog/issues

For more information about these options, see the `Getting Help`_
page.

.. _Slack invitation: https://openedx.org/slack
.. _community Slack workspace: https://openedx.slack.com/
.. _#wg-frontend channel: https://openedx.slack.com/archives/C04BM6YC7A6
.. _Getting Help: https://openedx.org/getting-help

License
*******

The code in this repository is licensed under the AGPLv3 unless
otherwise noted.

Please see `LICENSE <LICENSE>`_ for details.

Contributing
************

Contributions are very welcome. Please read `How To Contribute`_ for
details.

.. _How To Contribute: https://openedx.org/r/how-to-contribute

This project is currently accepting all types of contributions, bug
fixes, security fixes, maintenance work, or new features. However,
please make sure to have a discussion about your new feature idea
with the maintainers prior to beginning development to maximize the
chances of your change being accepted. You can start a conversation
by creating a new issue on this repo summarizing your idea.

The Open edX Code of Conduct
****************************

All community members are expected to follow the `Open edX Code of
Conduct`_.

.. _Open edX Code of Conduct: https://openedx.org/code-of-conduct/

People
******

The assigned maintainers for this component and other project details
may be found in `Backstage`_. Backstage pulls this data from the
``catalog-info.yaml`` file in this repo.

.. _Backstage: https://open-edx-backstage.herokuapp.com/catalog/default/component/frontend-app-catalog

Reporting Security Issues
*************************

Please do not report security issues in public, and email
security@openedx.org instead.

.. |license-badge| image:: https://img.shields.io/github/license/openedx/frontend-app-catalog.svg
    :target: https://github.com/openedx/frontend-app-catalog/blob/master/LICENSE
    :alt: License

.. |status-badge| image:: https://img.shields.io/badge/Status-Maintained-brightgreen
    :alt: Maintained

.. |ci-badge| image:: https://github.com/openedx/frontend-app-catalog/actions/workflows/ci.yml/badge.svg
    :target: https://github.com/openedx/frontend-app-catalog/actions/workflows/ci.yml
    :alt: Continuous Integration

.. |codecov-badge| image:: https://codecov.io/github/openedx/frontend-app-catalog/coverage.svg?branch=master
    :target: https://codecov.io/github/openedx/frontend-app-catalog?branch=master
    :alt: Codecov
