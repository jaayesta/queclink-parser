#### 0.2.14 (2016-10-20)

#### 0.2.13 (2016-10-20)

#### 0.2.12 (2016-10-19)

#### 0.2.11 (2016-10-18)

##### Chores

* **package:**
  * Update yarn.lock ([6d1c2bfa](https://github.com/jaayesta/queclink-parser/commit/6d1c2bfadca2b1db3cbbb4b0898f729d3394fb3c))
  * Update eslint ([49d7af96](https://github.com/jaayesta/queclink-parser/commit/49d7af967cc9d396fd06ef9027f9ae732d6f7008))
  * Add contributors ([e5257002](https://github.com/jaayesta/queclink-parser/commit/e525700282cfb3f21b4d6e3c8aabd79a46cb694a))
  * Update dependencies ([ee6ae837](https://github.com/jaayesta/queclink-parser/commit/ee6ae837a9ac0ab02c5f7784bd9c48af95211fa3))
  * Update dependencies ([776e2e70](https://github.com/jaayesta/queclink-parser/commit/776e2e70ae69b30e37e4d187b1ff20c5470c05c7))
  * Add support to yarnpkg ([1ccafcb9](https://github.com/jaayesta/queclink-parser/commit/1ccafcb95cceda79a806b0c51b3854be24787081))
  * update mocha to version 3.1.2 ([5ac65abc](https://github.com/jaayesta/queclink-parser/commit/5ac65abc83e9838b8cee901a3561a5448fe15a61))
  * update mocha to version 3.1.1 ([6f6cb6db](https://github.com/jaayesta/queclink-parser/commit/6f6cb6db85ac6c3bff6901985e38b876bf9607e4))
  * update lodash to version 4.16.4 ([6cebd98a](https://github.com/jaayesta/queclink-parser/commit/6cebd98a3e88c2a6a6382250c17dace699f85feb))
  * update eslint to version 3.7.1 ([5c7f034f](https://github.com/jaayesta/queclink-parser/commit/5c7f034ffc124785f844ae17bbaecbf9b0757f65))
  * update lodash to version 4.16.3 ([2aec0db5](https://github.com/jaayesta/queclink-parser/commit/2aec0db5e64888cfbc0b62c85d336787b3d3dfd9))
  * update eslint to version 3.7.0 ([13880b14](https://github.com/jaayesta/queclink-parser/commit/13880b14830c69f69e4104ee4824e1cff0768878))

##### New Features

* **parser:** Add manufacturer to data ([3f49062c](https://github.com/jaayesta/queclink-parser/commit/3f49062cb83375390a4cd71fe53a1cceae293a9a))

#### 0.2.10 (2016-10-13)

#### 0.2.9 (2016-10-13)

##### Chores

* **messages:** Add "en" and "es" messages ([95b8c869](https://github.com/jaayesta/queclink-parser/commit/95b8c86977154aedb667c2213c3737bcc80c3bb9))

##### New Features

* **parser:** Add message to ack commands ([23d87951](https://github.com/jaayesta/queclink-parser/commit/23d87951f8f64ec2fa7796bbb69d4ae1c9786b7d))

#### 0.2.8 (2016-9-12)

#### 0.2.7 (2016-9-12)

##### Bug Fixes

* **parse:** Only parse if queclink valid data. ([c3cc7915](https://github.com/jaayesta/queclink-parser/commit/c3cc7915faf1d468dc44b7e1f9217c3099dd4055))

#### 0.2.6 (2016-9-5)

#### 0.2.5 (2016-8-31)

#### 0.2.4 (2016-8-31)

#### 0.2.3 (2016-8-30)

##### Bug Fixes

* **parser:** Fix getimei and add tests ([e05e1f23](https://github.com/jaayesta/queclink-parser/commit/e05e1f237fc78158661b9cd702ab59fbd5ac1489))

#### 0.2.2 (2016-8-30)

#### 0.2.1 (2016-8-25)

### 0.2.0 (2016-8-23)

#### 0.1.3 (2016-8-11)

#### 0.1.2 (2016-8-11)

##### Chores

* **src:** Only import extend module from lodash ([90108cb3](https://github.com/jaayesta/queclink-parser/commit/90108cb3f42576f7378b8e52766697398d344e4b))
* **test:** Add tests ([7737d74f](https://github.com/jaayesta/queclink-parser/commit/7737d74f3cafb57eaa490d58c5e28911364497ac))
* **package:** Update dependencies and add devDependencies for tests ([f12f1449](https://github.com/jaayesta/queclink-parser/commit/f12f1449447bdd46acd81e7eb2b66d1f46247071))

##### Bug Fixes

* **getAckCommand:** Fix get command ([b7878fa9](https://github.com/jaayesta/queclink-parser/commit/b7878fa9de0797bf6bda9440a1068d49f3341233))

#### 0.1.1 (2016-08-11)

* Added sos in status and mV to V in analog inputs in GV200 ([4bea809](https://github.com/jaayesta/queclink-parser/commit/4bea809))
* Fixed error in input status. ([ae876ce](https://github.com/jaayesta/queclink-parser/commit/ae876ce))
* Idling duration to int. ([99d08f5](https://github.com/jaayesta/queclink-parser/commit/99d08f5))
* Some data validation added and parse hex int lac, cell id and parse int mcc and mnc. ([f4d15b2](https://github.com/jaayesta/queclink-parser/commit/f4d15b2))
* Suport added for GPS Status alarms. ([d5c21b7](https://github.com/jaayesta/queclink-parser/commit/d5c21b7))
* Support added to a couple of alarms missed before. ([7d10c2a](https://github.com/jaayesta/queclink-parser/commit/7d10c2a))

### 0.1.0 (2016-08-10)

* Added support for new version devices GV200 and GV300 and deleted heartbeat unuseful data. ([58da8d2](https://github.com/jaayesta/queclink-parser/commit/58da8d2))
* Fixed parse Outputs commands. ([764b829](https://github.com/jaayesta/queclink-parser/commit/764b829))
* Remove data from readme. ([bd2c4dc](https://github.com/jaayesta/queclink-parser/commit/bd2c4dc))

#### 0.0.5 (2016-07-29)

* Added support to GV200. Fixed some errors in input/output status and altitude always float. ([ea1ba57](https://github.com/jaayesta/queclink-parser/commit/ea1ba57))

#### 0.0.4 (2016-07-28)

* Fixed error in some alarm. Deleted ERI message support. ([324cff7](https://github.com/jaayesta/queclink-parser/commit/324cff7))
* Fixed error with buffer data. ([8a136fe](https://github.com/jaayesta/queclink-parser/commit/8a136fe))
* Fixed some jamming report parser. ([58bafe3](https://github.com/jaayesta/queclink-parser/commit/58bafe3))
* No parseFloat to hourmeter. ([e86b6b7](https://github.com/jaayesta/queclink-parser/commit/e86b6b7))
* Some validations added and use info in readme. ([86afcf8](https://github.com/jaayesta/queclink-parser/commit/86afcf8))

#### 0.0.3 (2016-07-27)

* Add suport to buffer and add information to protocolversion in returned data. ([44f4cf6](https://github.com/jaayesta/queclink-parser/commit/44f4cf6))
* Fixed getAlarm ([3c18b5d](https://github.com/jaayesta/queclink-parser/commit/3c18b5d))
* Uncomment parse GMT100 in parse function and fix errors. ([c5fc4fc](https://github.com/jaayesta/queclink-parser/commit/c5fc4fc))

#### 0.0.2 (2016-07-27)

* Fix dependencies error. ([ae9cffe](https://github.com/jaayesta/queclink-parser/commit/ae9cffe))
* Fix errors and suport to GMT100 devices added. ([cd2a566](https://github.com/jaayesta/queclink-parser/commit/cd2a566))

#### 0.0.1 (2016-07-27)

* First commit. ([b000eb1](https://github.com/jaayesta/queclink-parser/commit/b000eb1))
