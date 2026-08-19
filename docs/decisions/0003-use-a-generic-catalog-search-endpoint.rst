========================================
3. Use a Generic Catalog Search Endpoint
========================================

Status
------

Proposed

Context
-------

The catalog (course list / explore) page currently shows courses only. The
product requires pathways alongside courses in the same catalog experience:
one shared ranking, one pagination, and shared filter facets, including a new
"Categories" facet covering both courses and pathway types.

Changing the existing edx-search endpoint
``/search/unstable/v0/course_list_search/`` in place would risk breaking its
current API contract: existing consumers may assume every result is a course,
and mixed results, new ``type`` values, or course-only fields becoming
optional could break them.

Decision
--------

Keep ``/search/unstable/v0/course_list_search/`` exactly as it is. Its
existing consumer contract and the shared legacy internals it relies on stay
unchanged.

Add a new endpoint, POST ``/search/unstable/v0/catalog_list_search/``,
backed by one new mixed logical index, ``catalog_info``. The index name is
configurable via ``CATALOG_INFO_INDEX_NAME``; index metadata is never exposed
in responses. The existing ``course_info`` index remains. During the
coexistence period, courses are duplicated into ``catalog_info``.

Ownership:

* edx-platform owns course documents and normally pathway documents.
* An installed backend extension may own pathway documents instead.
* edx-search owns query and index configuration.

Deployments without pathway support may run course-only catalogs.
Operational rollout/backfill of the new index is out of scope for this ADR.

The new endpoint must support all officially supported edx-search engines
with the same observable contract, and must use a separate API/view path
rather than the course-specific ``course_discovery_search`` semantics.

Endpoint contract
~~~~~~~~~~~~~~~~~

Request
^^^^^^^

The endpoint keeps the existing POST form conventions:

* Optional ``search_string``.
* Zero-based ``page_index``.
* Bounded ``page_size``.
* Repeated ``category``, ``org``, ``language``, and ``modes`` values.

Filtering is OR within a facet and AND across facets. A facet's own
distribution remains expanded while other filters apply. Unknown filter keys
are ignored. ``enable_course_sorting_by_start_date`` is not part of the
contract: the endpoint tolerates and ignores it, and the frontend removes it.

Ordering
^^^^^^^^

* With a search string: backend relevance, descending.
* Without a search string: backend-defined catalog ranking.

Both use globally unique ``id`` ascending as a deterministic tiebreak.
Ordering need not match across engines. Engine adapters that cannot currently
apply the tiebreak must add that capability. There is one ``total`` and
backend pagination.

Search fields
^^^^^^^^^^^^^

``content.display_name`` and ``org`` are the shared baseline search fields
for both result types. Type-specific text fields are searched only with
deliberately comparable weighting.

Response envelope
^^^^^^^^^^^^^^^^^

A successful response preserves the existing snake_case envelope: ``took``,
``total``, ``max_score``, ``aggs``, ``results``. Each result is an
application shape of only:

* ``id`` - guaranteed globally unique upstream.
* ``type`` - ``course`` or ``pathway``.
* ``data`` - the type-specific payload.

Legacy ``_id``/``_index``/``_type``, a ``title`` field, and per-hit scores
are omitted. The frontend may camelCase wire data.

Errors
^^^^^^

* 400 with ``{"error": string}`` for invalid requests.
* 500 for backend or data-integrity failures.

Result type
^^^^^^^^^^^

``result.type`` is solely the entity/rendering discriminator. There is no
separate type filter.

Categories
^^^^^^^^^^

``category`` is normalized at indexing time and is the sole Categories facet
and filter.

* Courses always have category ``course``.
* Every pathway must have a specific category; a missing category, or the
  reserved values ``course``/``pathway``, fails indexing.
* Pathway category input is normalized by trimming, lowercasing, and mapping
  whitespace or underscores to ``-`` (kebab-case).
* Categories are arbitrary registered slugs; the frontend does not hardcode
  them.

Category registry
^^^^^^^^^^^^^^^^^

A backend registry owns the slug → default-language label mapping and an
optional category color pair. When present, both colors are canonical
``#RRGGBB``.

Labels and colors are not indexed; the query response enriches from the
registry: ``aggs.category`` keeps ``terms`` (``{slug: count}``) and adds
``labels`` (``{slug: display_label}``).

Pathway ``data`` includes required ``category`` and ``category_label`` and
optional ``category_background_color``/``category_text_color``. An indexed
slug unknown to the registry is a data-integrity error: log/alert and fail
the response.

Facets
^^^^^^

Exactly four facets: ``category``, ``org``, ``language``, ``modes``.

* Every document has a category.
* Pathway ``org`` means owner/publisher.
* Pathway ``language``/``modes`` come only from explicit pathway metadata
  and may be absent.
* No date-derived facets.

Payloads
^^^^^^^^

Minimum pathway data: ``org``, ``course_count``, ``category``,
``category_label``, and ``content.display_name``. Optional: ``image_url``,
``start``, ``advertised_start``, ``language``, ``modes``, and the color pair.

Courses retain the existing ``CourseData`` shape. ``category`` is indexed for
the facet but is not added to course response ``data`` unless needed.

Category filter UX
^^^^^^^^^^^^^^^^^^

No generic "Pathway" bucket or all-pathways type filter. Bootcamp, tutorial,
and similar are sibling categories. Category labels come from the registry
(default language).

Frontend cutover
^^^^^^^^^^^^^^^^

* Remove ``ENABLE_PATHWAY_PILOT_UI`` at cutover so counted mixed results
  always render.
* Switch the request URL, remove the sort flag and the ``_doc``
  compatibility arm after cutover, and support the new app result shape,
  labels, and category field names.

Unresolved backend assumptions (keep ADR Proposed)
--------------------------------------------------

These backend questions must be resolved before accepting the ADR:

1. **Availability:** Courses currently use enrollment dates to determine
   discoverability. Pathways may use different rules. The assumption is that
   both can map to common fields such as ``available_from`` and
   ``available_until``, but this is not yet verified.
2. **Visibility/access:** Existing restrictions - such as organization,
   catalog visibility, or user permissions - must continue working for
   courses and be defined for pathways. The mixed index must never expose
   content a user cannot access.

The ADR remains Proposed because these questions affect which documents may
safely appear in search results.

Alternatives considered
-----------------------

* **Mutate the legacy endpoint.** Rejected: breaks the existing consumer
  contract.
* **Separate endpoints plus client-side merge.** Rejected: a correct single
  ranking, total, and pagination cannot be merged client-side.
* **Separate indexes behind a backend aggregator.** Rejected: the edx-search
  search abstraction is single-index, and cross-engine score/aggregation
  merging is complex.
* **One mixed index (chosen).** Correct mixed ranking, pagination, and
  facets; legacy untouched.

Consequences
------------

Positive:

* Correct single ranking, total, pagination, and facets.
* Legacy endpoint and its consumers stay untouched.
* The existing single-index search abstraction can query the mixed index.

Negative:

* Courses are duplicated across indexes: extra storage and divergence risk.
* If a backend extension owns pathway documents, the shared index has
  independent producers.
* Every engine needs mixed-index schema/config support; adapters missing
  deterministic sorting must add it.
* A new view/query path must convert engine-shaped hits into the application
  response and enrich categories from the registry.
* Producers must write the mixed documents, and the registry is a hard
  dependency.

Acceptance checks
-----------------

Same contract matrix across all supported engines:

* Mixed relevance ordering, pagination, and id tiebreak.
* Category validation and registry enrichment.
* Facet Boolean behavior and counts.
* Application result shape.
* Legacy endpoint unchanged.
* Validation failures return 400.
* Access leakage behavior, once defined.

References
----------

* edx-search: ``search/urls.py`` (``course_list_search``),
  ``search/views.py`` (``course_list_search`` → ``_course_discovery``),
  ``search/api.py`` (``course_discovery_search``,
  ``DEFAULT_FILTER_FIELDS``), ``search/search_engine_base.py``
  (``SearchEngine``, single-index abstraction), and the engine modules
  (``search/elastic.py``, ``search/meilisearch.py``,
  ``search/typesense.py``).
* This repo: ``src/data/course-list-search/urls.ts`` (endpoint URL) and
  ``src/data/course-list-search/api.ts`` (request form data, sort flag).
