# frontend-app-catalog

[![License](https://img.shields.io/github/license/openedx/frontend-app-catalog.svg)](https://github.com/openedx/frontend-app-catalog/blob/master/LICENSE)
![Status](https://img.shields.io/badge/Status-Maintained-brightgreen)
[![Codecov](https://codecov.io/github/openedx/frontend-app-catalog/coverage.svg?branch=master)](https://codecov.io/github/openedx/frontend-app-catalog?branch=master)

## Purpose

This is the Catalog micro-frontend application, currently under development.

**What is the domain of this MFE?**

- Home / Index page
- Course About page
- Course Catalog page

These are public-facing pages intended for unauthenticated users.
The goal is to replace legacy views in `edx-platform` with modern, React and Paragon-based implementations.

## Installing

As of the [Open edX Ulmo release](https://docs.openedx.org/en/latest/community/release_notes/ulmo/ulmo_catalog.html),
this MFE can be installed and configured to replace the legacy Home, Course About, and Course Catalog pages.

This involves

* Hosting the MFE bundle
* Setting `CATALOG_MICROFRONTEND_URL`
* Setting `ENABLE_CATALOG_MICROFRONTEND` to `True`

### Installing in Tutor

The following Tutor plugin code can be used to install and configure this MFE in a Tutor environment.

```python3
from tutormfe.hooks import MFE_APPS
from tutor import hooks

@MFE_APPS.add()
def _add_catalog_mfe(mfes):
    mfes["catalog"] = {
        "repository": "https://github.com/openedx/frontend-app-catalog.git",
        "port": 1998,
        "version": "master", # optional, will default to the Open edX current tag.
    }
    return mfes

catalog_mfe_url = """
CATALOG_MICROFRONTEND_URL = "http://{{ MFE_HOST }}/catalog"
"""

catalog_mfe_url_dev = """
CATALOG_MICROFRONTEND_URL = "http://{{ MFE_HOST }}:{{ get_mfe('catalog').port }}/catalog"
"""

env_items = [
    (
        "openedx-common-settings",
        catalog_mfe_url,
    ),
    (
        "openedx-development-settings",
        catalog_mfe_url_dev,
    ),
    (
        "openedx-lms-common-settings",
        "ENABLE_CATALOG_MICROFRONTEND = True",
    ),
]

for item in env_items:
    hooks.Filters.ENV_PATCHES.add_item(item)
```

> [!WARNING]
> The `ulmo.1` release does not include [the updated version of `edx-search`](https://github.com/openedx/edx-search/releases/tag/v4.4.0)
> required for this MFE to function correctly.
>
> This will be resolved for `ulmo.2` and future Open edX releases, as it has been addressed by https://github.com/openedx/openedx-platform/pull/37948 and https://github.com/openedx/openedx-platform/pull/37949.
> 
> To use this MFE with `ulmo.1`, the following Tutor plugin can be used:
> ```python3
> from tutor import hooks
> 
> INSTALL_SEARCH_440 = r"""
> RUN --mount=type=cache,target=/openedx/.cache/pip,sharing=shared \
>     pip install "edx-search==4.4.0"
> """
> 
> hooks.Filters.ENV_PATCHES.add_items([
>     ("openedx-dockerfile-post-python-requirements", INSTALL_SEARCH_440),
>     ("openedx-dev-dockerfile-post-python-requirements", INSTALL_SEARCH_440),
> ])

## Getting Started

### Prerequisites

The [Tutor](https://github.com/overhangio/tutor) platform is a prerequisite for developing an MFE.
Utilize [relevant tutor-mfe documentation](https://github.com/overhangio/tutor-mfe#mfe-development) to guide you through
the process of MFE development within the Tutor environment.

### Cloning and Startup

1. Clone the repo:

> `git clone https://github.com/openedx/frontend-app-catalog.git`

2. Use the version of node in the `.nvmrc` file.

> The current version of the micro-frontend build scripts supports the node version in `.nvmrc`.
> Using other major versions of node *may* work, but this is unsupported.  For
> convenience, this repository includes an .nvmrc file to help in setting the
> correct node version via [`nvm`](https://github.com/nvm-sh/nvm).

3. Install npm dependencies:

> `cd frontend-app-catalog && npm ci`

4. Mount the frontend-app-catalog MFE in Tutor:

> `tutor mounts add <your-tutor-project-dir>/frontend-app-catalog`

5. Build the Docker image:

> `tutor images build catalog-dev`

6. Launch the development server with Tutor:

> `tutor dev start catalog`


The dev server is running at [http://apps.local.openedx.io:1998/catalog/](http://apps.local.openedx.io:1998/catalog/).

If you start Tutor with `tutor dev start catalog`
that should give you everything you need as a companion to this frontend.

### Internationalization

Please see refer to the [frontend-platform i18n howto](https://github.com/openedx/frontend-platform/blob/master/docs/how_tos/i18n.rst) for documentation on
internationalization.

### Plugins

This MFE can be customized using [Frontend Plugin Framework](https://github.com/openedx/frontend-plugin-framework).

The parts of this MFE that can be customized in that manner are documented [here](/src/plugin-slots).

## Getting Help

If you're having trouble, we have discussion forums at
https://discuss.openedx.org where you can connect with others in the community.

Our real-time conversations are on Slack. You can request a [Slack
invitation](https://openedx.org/slack), then join our [community Slack workspace](https://openedx.org/slack).  Because this is a
frontend repository, the best place to discuss it would be in the [#wg-frontend
channel](https://openedx.slack.com/archives/C04BM6YC7A6).

For anything non-trivial, the best path is to open an issue in this repository
with as many details about the issue you are facing as you can provide.

https://github.com/openedx/frontend-app-catalog/issues

For more information about these options, see the [Getting Help](https://openedx.org/getting-help) page.

## License

The code in this repository is licensed under the AGPLv3 unless otherwise
noted.

Please see [LICENSE](LICENSE) for details.

## Contributing

Contributions are very welcome.  Please read [How To Contribute](https://openedx.org/r/how-to-contribute) for details.

This project is currently accepting all types of contributions, bug fixes,
security fixes, maintenance work, or new features.  However, please make sure
to have a discussion about your new feature idea with the maintainers prior to
beginning development to maximize the chances of your change being accepted.
You can start a conversation by creating a new issue on this repo summarizing
your idea.

## The Open edX Code of Conduct

All community members are expected to follow the [Open edX Code of Conduct](https://openedx.org/code-of-conduct/).

## People

The assigned maintainers for this component and other project details may be
found in [Backstage](https://open-edx-backstage.herokuapp.com/catalog/default/component/frontend-app-catalog). Backstage pulls this data from the `catalog-info.yaml`
file in this repo.

## Reporting Security Issues

Please do not report security issues in public, and email security@openedx.org instead.
