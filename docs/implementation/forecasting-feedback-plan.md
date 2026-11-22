# PREM forecasting and verified feedback loop

Status: **planned; no forecasting code or schema has been implemented.** This plan extends Phase 9 in `MASTER_WORKLIST.md`. Each numbered gate is a bounded task; stop for review at every pause before proceeding. Forecast publication depends on data rights, data sufficiency, temporal validation, privacy, and human approval.

## Product boundary

PREM may eventually provide locality/project-level market trend forecasts with uncertainty. It must not present a guaranteed sale price, investment recommendation, or unsupported property-level valuation. Forecasts can remain internal until data quality and backtests justify a public experience. If evidence is insufficient, return an explicit “insufficient data” result.

Before implementation, the owner must choose the launch geography, nesting levels, property/transaction segments, target unit, forecast horizons, update cadence, and intended user decision. India → Maharashtra → MMR → city → locality is an example hierarchy only; Mira-Bhayandar/Mumbai is not assumed to be the approved launch market.

## Data and licensing rules

- Prefer verified registered-sale observations and owner-authorized broker transaction records, subject to source-specific rights and privacy review.
- Verify current official-source access and reuse terms from authoritative sources before ingestion. Section 57 records may be authoritative while bulk access, personal-data handling, and republication still require separate review.
- Treat portal asking prices as a separate `listing_ask` data class, never as transaction ground truth. Do not scrape where terms prohibit it.
- Treat synthetic datasets as development fixtures only. They cannot support a market claim or train a production model.
- Record provenance, license/permission basis, observed date, retrieval/import time, units, verification/quality status, deduplication key, and correction history for every source record.
- Minimize and avoid personal identifiers. Apply aggregation and small-cell suppression when required by privacy, data rights, or source terms.

## Distinguish the model concepts

1. **Multilevel model / partial pooling:** learns static or slowly changing relationships across nested cohorts (for example, property attributes and locality effects). Bayesian or mixed-effects regression is one candidate. This models group-level variation; by itself it does not reconcile time-series forecasts.
2. **Hierarchical time-series reconciliation:** produces forecasts at several aggregate and local levels, then reconciles them so totals and subseries are coherent. Evaluate bottom-up and MinT/MinTrace-style approaches only after a geography/series hierarchy is defined.
3. **Continual learning / retraining:** updates a later model version when new verified outcomes arrive. It learns from actual observations available by the cutoff, never from PREM's previous predicted values.

Classical baselines should come first. Evaluate StatsForecast and HierarchicalForecast (and Darts only if its workflow is a better fit) for technical fit, license, maintenance, deployment and reproducibility before selecting dependencies. More complex neural models are out of scope until simple baselines and data sufficiency pass review.

## Proposed data contract (for review, not a committed schema)

Use UUID primary keys unless existing BidMetric conventions or an integration constraint makes another type preferable. Keep source actuals, model artifacts/metadata, forecast output, and forecast evaluation logically separate.

| Entity | Purpose and required invariants |
|---|---|
| `forecast_source_catalog` | Source owner, rights/license reference, allowed purpose, source class, retrieval method, attribution, and review/expiry status. |
| `observed_market_outcomes` | Verified observed prices only: geography/entity, property/transaction cohort, observation period, price, currency/area units, source key, verification status, observed/import timestamps. No predicted-value source type. |
| `training_dataset_snapshots` | Immutable cutoff, target/feature definition versions, source record set or content-addressed artifact, row count, date range, quality summary, and reproducibility hash. |
| `model_registry` | Version, algorithm/library, hyperparameters, code revision, training snapshot, feature/target definitions, training period, artifact URI/hash, evaluation and model-card reference, candidate/champion status. Keep model binaries outside ordinary database rows. |
| `forecast_runs` | Immutable run metadata: model/snapshot version, as-of timestamp, cutoff, horizons, target definition, geography hierarchy, code revision, status and creator/service identity. A completed run cannot be edited. |
| `forecast_predictions` | Append-only run output: series/entity key, geography level, target period, horizon, point estimate, lower/upper or quantiles, unit, created timestamp, and explanatory/provenance references. No update/delete after run completion. |
| `forecast_outcome_matches` | Link a matured prediction to an eligible actual outcome with matching method, time tolerance, match confidence, and audit timestamp. Never replace the original prediction. |
| `forecast_evaluations` | Versioned run/horizon/segment metrics, sample size, evaluated period, interval coverage/calibration, bias, and calculation version. |
| `model_deployments` | Append-only promotion/rollback events, environment, approval, effective time, and notes. |

Do not place this schema in the exposed client surface by default. Decide whether it belongs in a private schema or a narrowly exposed schema with RLS and service-only write access. Public reads, if ever approved, should use a safe projection with row and column minimization. Migration verification must happen in an isolated database; the active BidMetric project is not a test environment.

## Time-aware training and evaluation

- Define target values and normalization explicitly: nominal price, inflation-adjusted price, or price per square foot; define carpet/built-up area convention and currency/period alignment.
- Snapshot both labels and features as known at the training cutoff. A later correction must create an auditable new observation/snapshot; do not rewrite the old model's training view.
- Use chronological rolling-origin evaluation for each chosen horizon. Each fold trains only on observations available before its forecast origin and evaluates against later realized actuals. Reserve a final recent period as a holdout.
- Compare simple carry-forward, seasonal-naive where seasonality exists, and transparent trend/index baselines before advanced models. Document sparse-series and missing-period behavior.
- Report MAE, RMSE, MASE, bias, directional accuracy where useful, interval coverage/PICP and a proper interval score such as Winkler. MAPE can misbehave near zero and must not be used without a justified alternative/interpretation.
- For multilevel forecasts, evaluate both local-series accuracy and aggregate coherence. Do not claim locality-level skill based only on an aggregate MMR metric.
- Keep held-out forecasts immutable. A forecast only becomes eligible for evaluation/matching after its target period matures and a verified actual is available.

## Feedback loop and immutability

The permitted loop is:

`verified actuals available by cutoff → immutable training snapshot → model version → immutable forecast run → matured target period → verified actual outcome → match and evaluation → reviewed candidate model`

Forecast outputs, model estimates, listing asks, and synthetic fixtures must never enter `observed_market_outcomes` or a training snapshot as actual labels. Retraining appends a new snapshot and model version; it does not mutate prior forecasts. Automated retraining may produce a candidate but must not promote it without human review.

Use database grants/RLS plus server-side validation for this boundary; do not rely on frontend checks. Add acceptance tests for unauthorized writes, attempted forecast edits/deletes, future-data leakage, prediction-to-label contamination, match correctness, metric calculations, and reproducibility before any model is promoted.

## Staged pauses and acceptance

1. **Pause 1 — data/scope audit:** approve geography, target, segments, source rights, and a sample data-quality report before migrations or modeling.
2. **Pause 2 — ledger MVP:** review an isolated migration, baseline script, immutable forecast output, and reproducible sample run.
3. **Pause 3 — outcome loop:** review verified actual ingestion, maturity/matching rules, and a no-predictions-as-labels check.
4. **Pause 4 — evaluation:** review temporal folds, per-horizon metrics, uncertainty calibration, sample counts, and the internal dashboard.
5. **Pause 5 — retraining:** review a second candidate version, shadow comparison, model card, drift rules, and explicit promotion decision.

Production/public acceptance requires all of the following:

- Every training row is an observed actual available before that fold's cutoff; temporal leakage checks pass.
- Predictions and completed runs are append-only and reconstructable from the recorded code, model and data snapshot versions.
- Matured forecasts match only eligible observed outcomes using documented entity/time rules.
- Per-horizon and segment metrics reproduce independently; uncertainty intervals are reported and calibrated to the extent data permits.
- Retraining demonstrably excludes predictions, estimates, prohibited listing data, and synthetic fixtures.
- RLS/grants prevent client writes to training, forecast, and evaluation records; only approved projections are readable.
- Data rights, privacy, sample sufficiency, public wording, and model promotion receive human approval.
