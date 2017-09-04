# Postman Collection Transformer Changelog

#### v2.2.0 (September 4, 2017)
* :feat: Added support for transformations to and from the `v2.1.0` format. #66, #67, #68
* :arrow_up: Updated dependencies #65
* :bug: Enforced an object structure for V2 collection request URLs. #62
* :bug: Prevented empty descriptions from showing up across transformations. #61

#### 2.1.5 (June 28, 2017)
* Allowed both: `key` and `id` as identifiers for path variables in v2 collections #60

#### 2.1.4 (June 19, 2017)
* No code changes

#### 2.1.3 (June 09, 2017)
* Fixed a bug in the URL parse implementation, by copying the parser & unparser from the sdk

#### 2.1.2 (May 25, 2017)
* Handle an edge case where an unhandled ID is provided in the `requestObject`

#### 2.1.1 (May 22, 2017)
* Fixed a bug where the `requestObject` was missing when doing v2 to v1 conversions
* Added the ability to convert single responses as well

#### 2.1.0 (May 12, 2017)
* Descriptions for headers, url query params, url path variables, and request body data are now handled in transformations.
* Fix disabled: true header (`v2`) <-> // (commented) header (`v1`) transformations.
* Fixed bug where both enabled and disabled would appear in transformed entities.
* Request body transformations now follow `v1` - `v2` compliance
* Removed unwanted `enabled: true` properties from query params, headers, and request body data
