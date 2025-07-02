frontend-app-catalog
#############################

|license-badge| |status-badge| |codecov-badge|


Purpose
*******

This is the Catalog micro-frontend application, currently under development by `2U <https://2u.com>`_.

**What is the domain of this MFE?**

- Home / Index page
- Course About page
- Course Catalog page

These are public-facing pages intended for unauthenticated users.
The goal is to replace legacy views in ``edx-platform`` with modern, React and Paragon-based implementations.

Getting Started
***************

Prerequisites
=============

The Tutor_ platform is a prerequisite for developing an MFE.
Utilize `relevant tutor-mfe documentation`_ to guide you through
the process of MFE development within the Tutor environment.

.. _Tutor: https://github.com/overhangio/tutor

.. _relevant tutor-mfe documentation: https://github.com/overhangio/tutor-mfe#mfe-development


Cloning and Startup
===================


1. Clone the repo:

  ``git clone https://github.com/openedx/frontend-app-catalog.git``

2. Use node v20.x.

  The current version of the micro-frontend build scripts support node 20.
  Using other major versions of node *may* work, but this is unsupported.  For
  convenience, this repository includes an .nvmrc file to help in setting the
  correct node version via `nvm <https://github.com/nvm-sh/nvm>`_.

3. Install npm dependencies:

  ``cd frontend-app-catalog && npm ci``

4. Mount the frontend-app-catalog MFE in Tutor:

  ``tutor mounts add <your-tutor-project-dir>/frontend-app-catalog``

5. Build the Docker image:

  ``tutor images build catalog-dev``

6. Launch the development server with Tutor:

  ``tutor dev start catalog``


The dev server is running at `http://apps.local.openedx.io:1998/catalog/ <http://apps.local.openedx.io:1998/catalog/>`_.

`Tutor <https://github.com/overhangio/tutor>`_. If you start Tutor with ``tutor dev start catalog``
that should give you everything you need as a companion to this frontend.

.. |Build Status| image:: https://api.travis-ci.com/edx/frontend-app-catalog.svg?branch=master
  :target: https://travis-ci.com/edx/frontend-app-catalog
.. |Codecov| image:: https://codecov.io/gh/edx/frontend-app-catalog/branch/master/graph/badge.svg
  :target: https://codecov.io/gh/edx/frontend-app-catalog
.. |license| image:: https://img.shields.io/npm/l/@edx/frontend-app-catalog.svg
  :target: @edx/frontend-app-catalog

Internationalization
====================

Please see refer to the `frontend-platform i18n howto`_ for documentation on
internationalization.

.. _frontend-platform i18n howto: https://github.com/openedx/frontend-platform/blob/master/docs/how_tos/i18n.rst

Getting Help
************

If you're having trouble, we have discussion forums at
https://discuss.openedx.org where you can connect with others in the community.

Our real-time conversations are on Slack. You can request a `Slack
invitation`_, then join our `community Slack workspace`_.  Because this is a
frontend repository, the best place to discuss it would be in the `#wg-frontend
channel`_.

For anything non-trivial, the best path is to open an issue in this repository
with as many details about the issue you are facing as you can provide.

https://github.com/openedx/frontend-app-catalog/issues

For more information about these options, see the `Getting Help`_ page.

.. _Slack invitation: https://openedx.org/slack
.. _community Slack workspace: https://openedx.slack.com/
.. _#wg-frontend channel: https://openedx.slack.com/archives/C04BM6YC7A6
.. _Getting Help: https://openedx.org/getting-help

License
*******

The code in this repository is licensed under the AGPLv3 unless otherwise
noted.

Please see `LICENSE <LICENSE>`_ for details.

Contributing
************

Contributions are very welcome.  Please read `How To Contribute`_ for details.

.. _How To Contribute: https://openedx.org/r/how-to-contribute

This project is currently accepting all types of contributions, bug fixes,
security fixes, maintenance work, or new features.  However, please make sure
to have a discussion about your new feature idea with the maintainers prior to
beginning development to maximize the chances of your change being accepted.
You can start a conversation by creating a new issue on this repo summarizing
your idea.

The Open edX Code of Conduct
****************************

All community members are expected to follow the `Open edX Code of Conduct`_.

.. _Open edX Code of Conduct: https://openedx.org/code-of-conduct/

People
******

The assigned maintainers for this component and other project details may be
found in `Backstage`_. Backstage pulls this data from the ``catalog-info.yaml``
file in this repo.

.. _Backstage: https://open-edx-backstage.herokuapp.com/catalog/default/component/frontend-app-catalog

Reporting Security Issues
*************************

Please do not report security issues in public, and email security@openedx.org instead.

.. |license-badge| image:: https://img.shields.io/github/license/openedx/frontend-app-catalog.svg
    :target: https://github.com/openedx/frontend-app-catalog/blob/master/LICENSE
    :alt: License

.. |status-badge| image:: https://img.shields.io/badge/Status-Maintained-brightgreen

.. |codecov-badge| image:: https://codecov.io/github/openedx/frontend-app-catalog/coverage.svg?branch=master
    :target: https://codecov.io/github/openedx/frontend-app-catalog?branch=master
    :alt: Codecov
