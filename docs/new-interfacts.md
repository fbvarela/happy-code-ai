# Environmental Hazards Specification

## Purpose

This specification defines the environmental hazard scoring system for the Happy Code artifact generator, enabling users to evaluate and compare projects based on five distinct hazard categories (floodings, radiation, radioactivity, water pollution, air pollution) plus a composite global score. It exists so that generated artifact descriptions can include quantified environmental risk data for downstream CLI consumption.

## Requirements

### Requirement: Hazard Category Definition

The system SHALL define exactly five hazard categories — floodings, radiation, radioactivity, water pollution, and air pollution — each with a unique identifier, a human-readable label, and a numeric score range of 0 to 100.

#### Scenario: Category listing

- GIVEN a request for available hazard categories
- WHEN the system returns the category list
- THEN the response contains exactly five entries with identifiers `floodings`, `radiation`, `radioactivity`, `water_pollution`, and `air_pollution`

#### Scenario: Score range validation

- GIVEN a hazard score value
- WHEN the value is outside the 0–100 range
- THEN the system rejects it with a validation error

### Requirement: Per-Category Score

The system SHALL store and return an individual integer score (0–100) for each of the five hazard categories, defaulting to `null` when not yet assessed.

#### Scenario: Default null scores

- GIVEN a newly created hazard record with no assessments
- WHEN the record is retrieved
- THEN all five category scores are `null`

#### Scenario: Setting a category score

- GIVEN a hazard record and a valid score for `water_pollution`
- WHEN the score is updated to 73
- THEN the `water_pollution` field returns `73` and other fields remain unchanged

### Requirement: Global Hazard Score

The system SHALL compute a global hazard score as the arithmetic mean of all non-null category scores, rounded to one decimal place, and return `null` when fewer than one category has been assessed.

#### Scenario: Global from all five scores

- GIVEN scores of 20, 40, 60, 80, and 100 for the five categories
- WHEN the global score is computed
- THEN the result is `60.0`

#### Scenario: Global with partial data

- GIVEN scores of 30 and 50 for two categories and `null` for the rest
- WHEN the global score is computed
- THEN the result is `40.0`

#### Scenario: Global with no data

- GIVEN all five category scores are `null`
- WHEN the global score is computed
- THEN the result is `null`

### Requirement: Input Validation

The system SHALL validate that all five category scores are provided before accepting a record as complete, and SHALL reject requests missing any non-null category with a clear error message.

#### Scenario: Complete record accepted

- GIVEN all five scores are non-null integers between 0 and 100
- WHEN the record is submitted
- THEN it is accepted and the global score is computed

#### Scenario: Missing category rejected

- GIVEN four scores are provided and `air_pollution` is omitted
- WHEN the record is submitted
- THEN the system returns a validation error listing the missing category

### Requirement: Output Serialization

The system SHALL serialize hazard data as a JSON object containing the five category keys, their integer scores (or `null`), and the computed `globalScore` (number or `null`).

#### Scenario: Full serialization

- GIVEN a complete hazard record with scores [10, 20, 30, 40, 50]
- WHEN the record is serialized
- THEN the output is `{"floodings":10,"radiation":20,"radioactivity":30,"water_pollution":40,"air_pollution":50,"globalScore":30.0}`

#### Scenario: Partial serialization

- GIVEN a record with only `floodings: 60` set
- WHEN the record is serialized
- THEN the output includes `null` for the four unset categories and `globalScore: 60.0`
