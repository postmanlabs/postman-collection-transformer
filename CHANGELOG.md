# Postman Collection Transformer Changelog

#### 2.1.0 (May 12, 2017)
* Descriptions for headers, url query params, url path variables, and request body data are now handled in transformations.
* Fix disabled: true header (`v2`) <-> // (commented) header (`v1`) transformations.
* Fixed bug where both enabled and disabled would appear in transformed entities.
* Request body transformations now follow `v1` - `v2` compliance
* Removed unwanted `enabled: true` properties from query params, headers, and request body data