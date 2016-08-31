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
