3. Use a Generic Catalog Search Endpoint
-----------------------------------------

Status
------

Proposed (backend implementation pending)

Context
-------

The catalog (course list / explore) page currently shows courses only. The
product requires pathways alongside courses in the same catalog experience —
one shared ranking, one pagination, and shared filter facets, including a new
"Categories" facet covering both courses and pathway types.

The current data source, the edx-search endpoint
``/search/unstable/v0/course_list_search/``, constrains the design:

* edx-search binds every search call to one index, ``course_info``, with
  course-shaped filters, sort, and aggregations; ``SearchEngine`` is
  single-index by design, and the result ``type`` cannot discriminate
  content: every backend emits the legacy ``_doc``.
* There is no pathway model, indexer, or schema in edx-search; pathways
  live in a separate Open edX plugin. The endpoint is therefore
  structurally course-only, and course/pathway discrimination must be
  produced by the application, never by the search engine.

Decision
--------

Do not overload the existing ``course_list_search`` endpoint, and do not
merge separate endpoints client-side. Build a new generic backend catalog
endpoint/index (``/search/unstable/v0/catalog_list_search/``) that returns
mixed course and pathway results.

Until that backend exists, the frontend may temporarily keep calling the
legacy ``course_list_search`` endpoint; migrating the URL
(``getCourseListSearchUrl`` in ``src/data/course-list-search/urls.ts``) is a
follow-up.

Endpoint contract
=================

The new endpoint keeps the ``course_list_search`` conventions — same POST
form-data request and snake_case response envelope (``took``, ``total``,
``max_score``, ``aggs``, ``results``). New semantics:

* **Explicit app-produced result ``type``** — ``course`` or ``pathway`` —
  never ``data.category``/``data.type``: categories are an author-defined
  filter facet.
* **Stable mixed ordering** with a deterministic tiebreak; one ``total``
  and one pagination.
* **Mixed aggregations**: ``category`` and ``org`` span both types;
  course-only facets (``language``, ``modes``, date-derived) are computed
  over course results only or omitted; "Categories" is a filter facet
  only.
* **Type-specific ``data`` payloads**: courses keep ``CourseData``;
  pathways carry ``PathwayData`` with course-only fields absent; unique
  ``id`` per result (the React key); per-type availability replaces the
  hardcoded course enrollment filters.

Frontend changes in this branch
===============================

* ``src/data/course-list-search/types.ts``: ``CatalogListSearchMixedResult``
  / ``CatalogListSearchMixedResponse`` add the mixed contract as a
  discriminated union on the result ``type`` — ``'course' | '_doc'``
  carries ``CourseData``, ``'pathway'`` carries ``PathwayData``. The
  union accepts today's engine ``type: '_doc'`` as course, so no
  frontend change is needed once the backend emits ``course``/``pathway``
  (the ``_doc`` arm can then be removed).
* **Naming and rendering.** ``useCourseListSearch`` became
  ``useCatalogListSearch``; the data-caching hook is ``useCatalogData``.
  The home courses list and catalog data table dispatch each result by
  top-level ``type`` to course/pathway cards; the pathway card is exposed
  via the new plugin slot
  ``org.openedx.frontend.catalog.course_catalog_page.data_table.pathway_card``.
  Existing slot IDs are unchanged; ``courseDataResultsLength`` remains a
  deprecated alias of ``resultsCount``.
* **Categories filter.** The catalog renders a "Categories" filter from
  the backend aggregation under the key ``category``
  (``transformAggregationsToFilterChoices`` in ``src/catalog/utils.ts``).
* ``dev-mock-course-list-search.patch`` is an optional, uncommitted
  demonstration injecting mock category terms (dev-only, not merged);
  production fetch remains the real endpoint.

Alternatives considered
=======================

* **Extend ``course_list_search`` / reuse the ``course_info`` index.**
  Rejected: the endpoint is course-shaped; folding pathways in would
  couple the pathway data model to the course schema, risk course-only
  filters mis-applying to or excluding pathways, and surprise existing
  consumers with unrequested mixed results.
* **Separate pathway endpoint/index plus client-side merge.** Rejected: a
  global ranking, single ``total``, shared pagination and aggregations
  cannot be correctly merged client-side.
* **Separate pathway index behind a backend aggregator serving the new
  catalog endpoint.** Keep ``course_info`` and ``course_list_search``,
  index pathways separately, and have the new endpoint aggregate, rank,
  and paginate across both.

Consequences
------------

Positive:

* One backend source of truth: correct mixed ranking, single
  ``total``/pagination, shared facets, one loading/error state;
  ``course_list_search`` and its consumers stay untouched.
* The frontend is already generic: with the ``_doc`` fallback it works
  against today's backend, and renders mixed results unchanged once the
  new endpoint exists.

Negative:

* A new backend endpoint (and possibly a new index plus aggregator) must
  be built and maintained across all supported engine backends.
* Two endpoints coexist during the transition, with the union type
  encoding ``'_doc'`` as course — a compatibility arm.

Follow-ups:

* Migrate ``getCourseListSearchUrl`` to
  ``/search/unstable/v0/catalog_list_search/``.
* Remove the ``'_doc'`` arm once the backend emits application ``type``
  values.
* Add a pathway ``description`` if the UI needs one; keep ``category`` as
  an indexed filter facet unless a future UI requirement also needs it in
  ``data``.
* Document per-field mixed-aggregation semantics for course-only facets.

References
----------

* edx-search: ``search/urls.py`` (``course_list_search`` →
  ``views._course_discovery``), ``search/api.py``
  (``course_discovery_search``, ``DEFAULT_FILTER_FIELDS``),
  ``search/search_engine_base.py`` (``SearchEngine``, single-index),
  ``search/elastic.py`` (``'_type': '_doc'``).
