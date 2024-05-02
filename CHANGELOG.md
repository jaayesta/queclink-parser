#### 1.9.5 (2024-05-02)

##### Bug Fixes

* **gv58lau:**  device battery and bt relay status fixed ([2d54419d](https://github.com/jaayesta/queclink-parser/commit/2d54419d7569854bcf2acb691377e188799bc701))

#### 1.9.4 (2024-04-26)

#### 1.9.3 (2024-04-26)

#### 1.9.2 (2024-04-26)

##### Bug Fixes

* **replace:**  fix some event parse ([35b00fb2](https://github.com/jaayesta/queclink-parser/commit/35b00fb29f461e88f0337584067732962e24e252))
* **gv310lau:**
  *  change elements in BT relay info for ERI report ([1ee49db7](https://github.com/jaayesta/queclink-parser/commit/1ee49db79e9d4bb97dda8feb388d886432d3f91b))
  *  fix message for bt relay in BAA report ([09f9c33e](https://github.com/jaayesta/queclink-parser/commit/09f9c33e8b2817fbc5ee3868a8d441c1f5865a37))
  *  change in index offset when raw includes satellites count. ([cbae5db9](https://github.com/jaayesta/queclink-parser/commit/cbae5db981859654210b713ffdcf27a8496ce68a))

#### 1.9.1 (2024-03-13)

#### 1.8.6 (2024-03-13)

##### New Features

* **gv300w:**  added field moreData when number > 1 ([389bb1ba](https://github.com/jaayesta/queclink-parser/commit/389bb1ba2cd48806635600a9964f09581fbb8f22))
* **moreData:**  new field in case that number > 1 ([c507ec67](https://github.com/jaayesta/queclink-parser/commit/c507ec677ce3c79c77d1f7c5ea712d530398cddb))
* **clean:**  cleaned unused reports ([8e395f0d](https://github.com/jaayesta/queclink-parser/commit/8e395f0d97a90d3bbe005e356f04144b87ce6452))
* **ble-info:**  added info for BID and ERI reports ([8288af44](https://github.com/jaayesta/queclink-parser/commit/8288af44b00cc9e268f6191132f6e56d47ebe7bf))
* **bluetooth:**  added some bluetooth functions ([25468239](https://github.com/jaayesta/queclink-parser/commit/25468239b46185179e0c3f1f6551bbb72ed50bfa))
* **events:**  added support to common events and notificartions ([3dfe8a35](https://github.com/jaayesta/queclink-parser/commit/3dfe8a35eb603df48bd77d75f7b7e43aac7f544d))
* **resp:**  added  FRI messages (incomplete ERI) ([3af3c01c](https://github.com/jaayesta/queclink-parser/commit/3af3c01c2cc048b7d41d504a3cbf7e610f158636))
* **gv58lau:**  added position related report ([4c84715d](https://github.com/jaayesta/queclink-parser/commit/4c84715d9d5404502d8020f8a1983a2f98653281))
* **new-device:**  added GV58LAU ([66a97c78](https://github.com/jaayesta/queclink-parser/commit/66a97c789cefbc5ea9facc0830269d271953cf14))

##### Bug Fixes

* **test:**  fix jamming test ([c41ac059](https://github.com/jaayesta/queclink-parser/commit/c41ac059ddffa19bea1768af0e6e349041d789f5))
* **HBE:**  added status and modified type ([48debc9b](https://github.com/jaayesta/queclink-parser/commit/48debc9b79ba571fd81bc09d38591dc2bfda7c66))
* **bluetooth-id:**  correction in data ([ac4f3585](https://github.com/jaayesta/queclink-parser/commit/ac4f3585ed009c4dd90ebf6cc8a9c0263d37b4df))
* **position:**  added support for multiple points ([aeb4617f](https://github.com/jaayesta/queclink-parser/commit/aeb4617f1c7dd4eb30e572039fd09b5dcbc5ef8e))
* **messages:**
  *  corrected PNR and PFR texts ([f4af5d6f](https://github.com/jaayesta/queclink-parser/commit/f4af5d6f8bd7d4c8ae117ed57edd8689055be74b))
  *  understandable messages for PNR and PFR ([630a381e](https://github.com/jaayesta/queclink-parser/commit/630a381e94bfdfbb066c5f170feb4529d7b34741))
* **GV310LAU:**  some corrections ([52dde926](https://github.com/jaayesta/queclink-parser/commit/52dde92661c49a1d1a9b1803fbd0bcc8287a7632))
* **bluetooth:**  added BT data to main bluetooth info for BAA ([24b6c236](https://github.com/jaayesta/queclink-parser/commit/24b6c236bf5d23feae763101a11c7234e0a26eb6))
* **gv310lau:**  correction in coordinates for BCS and BDS messages ([386e634c](https://github.com/jaayesta/queclink-parser/commit/386e634c37ec4b8f61c0ad0f596532dbffb3aa7a))

#### 1.8.5 (2024-01-11)

#### 1.8.4 (2024-01-11)

##### Bug Fixes

* **replace:**  new 'replace' deleted in utils. ([37598dfc](https://github.com/jaayesta/queclink-parser/commit/37598dfc8017fbbf8d0ea2ed40228c3f31408f7e))

#### 1.8.3 (2024-01-08)

#### 1.8.2 (2024-01-08)

#### 1.8.1 (2024-01-08)

### 1.8.0 (2024-01-08)

### 1.6.0 (2024-01-08)

##### New Features

* **GV310LAU:**
  *  support for new CAN message ([740b9766](https://github.com/jaayesta/queclink-parser/commit/740b9766fc316a2190628d9567912e77881a77d6))
  *  support CRD & ACC message ([96ad6b97](https://github.com/jaayesta/queclink-parser/commit/96ad6b97b6b8aace45c1975fdfddd2faf6b28bd0))
  *  support CRG message ([97535bfc](https://github.com/jaayesta/queclink-parser/commit/97535bfcdbeed0806916f5b7bda694baacafdeec))
  *  support AVC message ([5da24cbd](https://github.com/jaayesta/queclink-parser/commit/5da24cbd4cf74454a6a11273f51fac7d801f4d1c))
  *  support DOM message ([556d4094](https://github.com/jaayesta/queclink-parser/commit/556d409475e594758ea2b9d9485ea3c5552b79e9))
  *  support AUR message ([8ee6ea25](https://github.com/jaayesta/queclink-parser/commit/8ee6ea25401c15d986d35e8d085118238ccbd329))
  *  support for new ASC & HBE message ([c2e9d7bc](https://github.com/jaayesta/queclink-parser/commit/c2e9d7bc3279deda612979508cbbf20ed6685137))
  *  support for new WPB message and corrections ([af2e8968](https://github.com/jaayesta/queclink-parser/commit/af2e89682aa5b1b6f4efcf51c7dcc0ebde83e5b8))
  *  support for new LBA message ([62bdd3a0](https://github.com/jaayesta/queclink-parser/commit/62bdd3a050b2dbf8f977e49e1b5642508d7b68d3))
  *  support for new GTSVR message ([e0f702c9](https://github.com/jaayesta/queclink-parser/commit/e0f702c9249859fa29f3d5821fa957bd00e995a9))
  *  support for new GTPNR message ([cf332566](https://github.com/jaayesta/queclink-parser/commit/cf332566b7d067b29335115e553460889de5ee15))
  *  support for GTPNR and GTPFR ([b116ed25](https://github.com/jaayesta/queclink-parser/commit/b116ed259277b183e270ea200509807941437e9c))
  *  support for GTCLT ([2cc96e2d](https://github.com/jaayesta/queclink-parser/commit/2cc96e2dfd0e363f8dee853a20ae6741691f9e47))
  *  support for GTGSM ([d302a452](https://github.com/jaayesta/queclink-parser/commit/d302a4524f441c159661337883bb00984f388a23))
  *  support for GTVGF ([95acd6be](https://github.com/jaayesta/queclink-parser/commit/95acd6be9fb2130ab859e9aa866f28d107bbd62f))
  *  support for GTVGN ([5c796f14](https://github.com/jaayesta/queclink-parser/commit/5c796f14c9b4fbeeccd7370cd74e77fce9cd2ae9))
  *  support for GTJDR ([5153d32b](https://github.com/jaayesta/queclink-parser/commit/5153d32baa87d3d7e2a7a0b72c1689e13028dc28))
  *  support for GTBID ([f0141dd8](https://github.com/jaayesta/queclink-parser/commit/f0141dd8fb1d0a8671530863913b29e6be21ea85))
  *  support for BT data in GTERI ([84978903](https://github.com/jaayesta/queclink-parser/commit/84978903f4dadbf613cee08695bcb1918697c77c))
  *  support for BT data in GTERI ([1fa5f3d7](https://github.com/jaayesta/queclink-parser/commit/1fa5f3d797744d41c5b9911249acae78a8b129b0))
  *  bluetooth beacon accessory (incomplete) ([09a606fb](https://github.com/jaayesta/queclink-parser/commit/09a606fbb552f6deed8c21f7295c49d602c3dd40))
  *  New BT elements in BCS & BDS ([3fe8ab7b](https://github.com/jaayesta/queclink-parser/commit/3fe8ab7b086c4088467d3b18cea52bbd4efb83fb))
  *  bluetooth accessories ([429fd42b](https://github.com/jaayesta/queclink-parser/commit/429fd42bd91a4ad365d653ec6b26c16c203fec84))
  *  bluetooth accessories (incomplete) ([995d86eb](https://github.com/jaayesta/queclink-parser/commit/995d86eb310cc7e29dc2e0567f8c1972c96c97dd))
  *  bluetooth connected/disconnected ([0550cff1](https://github.com/jaayesta/queclink-parser/commit/0550cff1920d1d64d837ec51222ca05e3f284c89))
  *  parse and messages for CID, CSQ and VER ([8ed00766](https://github.com/jaayesta/queclink-parser/commit/8ed0076695b269023ed1e41a82992ea5ceffc0ea))
  *  parse for GSS, CAN, IDA, DAT, DTT and DOS ([02a0fb4e](https://github.com/jaayesta/queclink-parser/commit/02a0fb4ed0807a106ac8b295856660fafb4d748c))
  *  parse for power, batt, jamming and crash ([efe77794](https://github.com/jaayesta/queclink-parser/commit/efe777941a32184ccee155d7e76ecbcdf1e0589e))
  *  parse for info, EPS and TMP ([7d072fef](https://github.com/jaayesta/queclink-parser/commit/7d072fefbd65e2a1e7f2c0f83b7ecfad73f7d521))
* **GV310L:**  parse for FRI, ERI and INF messages ([2c20aaf1](https://github.com/jaayesta/queclink-parser/commit/2c20aaf16909e2c8f06e267ba73b0ce64e24f958))
* **messages:**
  *  detail in VGL text ([3d33db8b](https://github.com/jaayesta/queclink-parser/commit/3d33db8b52ae4c0306b267e4ac402d66f36a5648))
  *  detail in HBM text ([9b02e5b2](https://github.com/jaayesta/queclink-parser/commit/9b02e5b210051586474a42a16b980ef8b7e1991e))
* **VGL:**  virtual ignition detection ([16e97327](https://github.com/jaayesta/queclink-parser/commit/16e973277c00cac55f20e3eb4726b4b380c403ef))
* **dog:**  get reason for device reboot ([8b4cec14](https://github.com/jaayesta/queclink-parser/commit/8b4cec1467a63eabcaf462ccca831b34501410bc))

##### Bug Fixes

* **test:**  fix alarm test ([2c7abfd2](https://github.com/jaayesta/queclink-parser/commit/2c7abfd2225e66a180e3a9cbcac2540b3e81da80))
* **conflict:**  fix last merge conflicts ([cee2ffd2](https://github.com/jaayesta/queclink-parser/commit/cee2ffd2afa6bfc5bab36a6a1d0e1b539c7b52a8))
* **GV310LAU:**  CAN message ([2a07a396](https://github.com/jaayesta/queclink-parser/commit/2a07a3960a43d71618ba94a731aac64dfe3f0234))
* **GTCLT:**  line with error ([377cff09](https://github.com/jaayesta/queclink-parser/commit/377cff09446d21f16b0021be1a12373a401b73ea))
* **messages:**
  *  detail in VGL text ([d59daa82](https://github.com/jaayesta/queclink-parser/commit/d59daa82fbc40ca9ac89e6c7d813ba2d5350da48))
  *  correction in VGL text ([d462d72b](https://github.com/jaayesta/queclink-parser/commit/d462d72be4287c84409c0814dbeb10ebe1d31fed))
  *  new ACKs & DOG messages ([31ca8ff1](https://github.com/jaayesta/queclink-parser/commit/31ca8ff1afce267f8c6b7f482d03b12866281d7f))
* **DOG:**  better messages ([a264c439](https://github.com/jaayesta/queclink-parser/commit/a264c4394412b2970a9a6bb21950d43a439a2836))

##### Other Changes

* **examples:**
  *  examples for this dev ([38d586ac](https://github.com/jaayesta/queclink-parser/commit/38d586ac11eac439c3c70d15a8d6aa0f264151db))
  *  examples for this dev ([d2ac1248](https://github.com/jaayesta/queclink-parser/commit/d2ac1248ef96112cc0f4bec15fb581b3a4628c6d))
  *  examples for this dev ([befa2630](https://github.com/jaayesta/queclink-parser/commit/befa26302f18fd21983a7328a76af88cfa8818ab))

#### 1.5.5 (2023-10-13)

#### 1.5.4 (2023-10-13)

#### 1.5.3 (2023-10-13)

#### 1.5.2 (2023-10-13)

#### 1.5.1 (2023-10-13)

##### New Features

* **ack:**  datetime added to ack data ([6b66e8e9](https://github.com/jaayesta/queclink-parser/commit/6b66e8e93977c06469f0132125d23e91c88e9dfd))

##### Bug Fixes

* **lint:**  se corrigen test y console.log ([724fc6ee](https://github.com/jaayesta/queclink-parser/commit/724fc6eeeab90dee82b1a99687a57476ba3af58a))

### 1.5.0 (2023-03-08)

##### Bug Fixes

* **ACK:**  command field added to ACK generic commands ([bd5f8701](https://github.com/jaayesta/queclink-parser/commit/bd5f870172e86f654f74ecfabfe8de7b85139a88))

#### 1.4.3 (2023-03-04)

##### New Features

* **overSpeed:**  overspeedtype added to over speed alarm ([fc3554d4](https://github.com/jaayesta/queclink-parser/commit/fc3554d4b48b7da43b62931272fa048b68d1f736))

#### 1.4.2 (2023-01-16)

##### Bug Fixes

* **messages:**  fixes empty messages in events not supported directly. Adds raw message as message ([fa8eaf92](https://github.com/jaayesta/queclink-parser/commit/fa8eaf92b66623ea6ff53d6febc52e570d16b487))

#### 1.4.1 (2022-02-28)

##### New Features

* **gv500map:**  suport for gv500Map added ([6155dcbb](https://github.com/jaayesta/queclink-parser/commit/6155dcbb2a4feb8383e357beeca06c7d4feed4eb))

### 1.4.0 (2022-02-02)

##### New Features

* **gv55w:**  support for gv55w added ([6e6cde95](https://github.com/jaayesta/queclink-parser/commit/6e6cde95be791134f993059883db1184a52bac9a))

#### 1.3.21 (2021-11-03)

##### Bug Fixes

* **buff:**  buff pattern fixed ([882ebc02](https://github.com/jaayesta/queclink-parser/commit/882ebc02c1a7a483937086cc8f0415cd3a346121))

#### 1.3.20 (2021-09-23)

##### Bug Fixes

* **parse:**  add end character to all patterns ([44cf0796](https://github.com/jaayesta/queclink-parser/commit/44cf0796f07c5006f12e709a70e02e39b4188c6c))

#### 1.3.19 (2021-08-05)

##### Bug Fixes

* **gv600w:**  fix parse gv600w GTDAT short format ([bd995505](https://github.com/jaayesta/queclink-parser/commit/bd99550501610c5b9c8843b268e415a3fcb26247))

#### 1.3.18 (2021-06-22)

##### New Features

* **devices:**  support for GV600 series added ([4dc0c779](https://github.com/jaayesta/queclink-parser/commit/4dc0c779e2245c7a8802f4e24f222863268e27b9))

#### 1.3.17 (2021-04-23)

#### 1.3.16 (2020-10-28)

#### 1.3.15 (2020-08-13)

#### 1.3.14 (2020-07-30)

#### 1.3.13 (2020-07-20)

#### 1.3.12 (2020-07-13)

#### 1.3.11 (2020-02-28)

#### 1.3.10 (2020-02-24)

#### 1.3.9 (2020-01-31)

#### 1.3.8 (2020-01-15)

#### 1.3.7 (2020-01-10)

#### 1.3.6 (2020-01-09)

#### 1.3.5 (2020-01-09)

#### 1.3.4 (2019-10-16)

#### 1.3.3 (2019-06-05)

#### 1.3.2 (2019-06-05)

#### 1.3.1 (2019-04-23)

### 1.3.0 (2019-04-23)

### 1.2.0 (2019-03-07)

#### 1.1.4 (2019-01-22)

##### Bug Fixes

* **reportType:**  Report Type parser fixed for GTERI commands. ([2576ec71](https://github.com/jaayesta/queclink-parser/commit/2576ec716feb8b5b198ce8d3d577fdcc42e29183))
* **GV300W:**  GTERI report parser for GV300W with AC100 devices fixed ([fe1d02b0](https://github.com/jaayesta/queclink-parser/commit/fe1d02b085067e52fbeb05b0d2870edb2fe82d56))

#### 1.1.3 (2019-01-16)

#### 1.1.2 (2019-01-16)

#### 1.1.1 (2018-10-10)

##### Bug Fixes

* **gmt100:**  Correct GIS port alarms for gmt100. ([374af391](https://github.com/jaayesta/queclink-parser/commit/374af39106c29d9b4d4e7041cf7dd04b955d3c3c))

### 1.1.0 (2018-10-10)

##### New Features

* **GMT100:**  support for NMD alarms added to GMT100 devices. ([d025e5e3](https://github.com/jaayesta/queclink-parser/commit/d025e5e3e2919997b38dac997959605e5ba87d19))

#### 1.0.10 (2018-07-24)

#### 1.0.9 (2018-07-24)

#### 1.0.8 (2018-06-27)

#### 1.0.7 (2018-06-11)

#### 1.0.6 (2018-06-01)

#### 1.0.5 (2018-03-27)

#### 1.0.4 (2018-02-01)

#### 1.0.3 (2018-01-30)

#### 1.0.2 (2018-01-18)

#### 1.0.1 (2017-12-31)

##### Chores

* **package:**  update mocha to v4.1.0 ([44212cae](https://github.com/jaayesta/queclink-parser/commit/44212cae52ffd11458fb566771f19a5644a06d1b))

##### Bug Fixes

* **parser:**  fix parser GTINF with invalid data ([517daf67](https://github.com/jaayesta/queclink-parser/commit/517daf674d7be7a31a38d1a167b57acfa2aea55b))

## 1.0.0 (2017-12-28)

##### Chores

* **package:**  update dependencies ([b785d952](https://github.com/jaayesta/queclink-parser/commit/b785d95241ce4603d5a0dcf45081726142dd5510))

##### New Features

* **package:**
  *  update min node version to v8 ([d3ab7fc9](https://github.com/jaayesta/queclink-parser/commit/d3ab7fc931edb45032462a1c1e253db4f3a85388))
  *  remove lodash and moment ([b4c2a655](https://github.com/jaayesta/queclink-parser/commit/b4c2a65528ad0f5a3602f09326fc1b5e5b939264))

##### Code Style Changes

* **js:**  migrate to standardjs ([27c9edcb](https://github.com/jaayesta/queclink-parser/commit/27c9edcb8f4a486925e82aa409e98f2c78aae6a3))

#### 0.3.34 (2017-8-23)

#### 0.3.33 (2017-6-30)

#### 0.3.32 (2017-5-5)

#### 0.3.31 (2017-5-5)

#### 0.3.30 (2017-4-13)

#### 0.3.29 (2017-3-17)

#### 0.3.29 (2017-3-17)

#### 0.3.28 (2017-3-2)

#### 0.3.27 (2017-2-23)

#### 0.3.26 (2017-2-22)

#### 0.3.25 (2017-2-18)

#### 0.3.24 (2017-2-17)

#### 0.3.23 (2017-2-17)

#### 0.3.22 (2017-2-17)

#### 0.3.21 (2017-2-17)

##### Chores

* **package:** Upgrade eslint to v3.15.0 ([a03250e6](https://github.com/jaayesta/queclink-parser/commit/a03250e60da179bb7a081327934841b132fc5d93))
* **nvm:** Update to node v7 ([7c333936](https://github.com/jaayesta/queclink-parser/commit/7c333936e8afc76e0815991cde72b043249aea34))

##### Bug Fixes

* **parser:** Se agrego validacion del dato parsedData[24]. Fix #9 ([9404427a](https://github.com/jaayesta/queclink-parser/commit/9404427a2caadec022253bb9378c3f70424f6bc9))

#### 0.3.20 (2017-2-2)

#### 0.3.19 (2017-1-30)

#### 0.3.19 (2017-1-30)

#### 0.3.18 (2017-1-26)

#### 0.3.17 (2017-1-25)

#### 0.3.16 (2017-1-25)

#### 0.3.15 (2017-1-14)

##### Chores

* **travis:**
  * Add cache yarn ([fc970039](https://github.com/jaayesta/queclink-parser/commit/fc9700396c40c2f5269b0d03bf56fc3a85339dd9))
  * Update node versions ([2a8027f1](https://github.com/jaayesta/queclink-parser/commit/2a8027f1e19037366f77fda260905c0ad5cd6d22))
* **package:**
  * Upgrade min node version to v6 ([365a40ff](https://github.com/jaayesta/queclink-parser/commit/365a40ff82467c42f9e8a5a31621dc29cb2f5233))
  * Update dependencies ([398ec2b8](https://github.com/jaayesta/queclink-parser/commit/398ec2b849b9174b63469ae9fc84a5e52c6aa620))

#### 0.3.14 (2017-1-13)

#### 0.3.13 (2016-12-7)

##### Chores

* **package:** Update dependencies ([e80c849e](https://github.com/jaayesta/queclink-parser/commit/e80c849ee245a1f3e7e6b7b65a110376bd974f3e))

##### Bug Fixes

* **parser:** Return UNKNOWN if GV200 strange data ([57a401fb](https://github.com/jaayesta/queclink-parser/commit/57a401fbe4c6146df8e875f5860797cac277468a))

#### 0.3.12 (2016-11-29)

#### 0.3.11 (2016-11-25)

#### 0.3.10 (2016-11-18)

#### 0.3.9 (2016-11-18)

#### 0.3.8 (2016-11-11)

#### 0.3.7 (2016-11-3)

#### 0.3.6 (2016-11-3)

#### 0.3.5 (2016-11-3)

#### 0.3.4 (2016-11-2)

#### 0.3.3 (2016-11-2)

#### 0.3.2 (2016-11-2)

#### 0.3.1 (2016-11-2)

### 0.3.0 (2016-11-2)

##### Chores

* **package:**
  * Update yarn ([0dc6ea87](https://github.com/jaayesta/queclink-parser/commit/0dc6ea8701d2e2e289535de8a2f72cb226d80dbe))
  * Update eslint ([0ab45caa](https://github.com/jaayesta/queclink-parser/commit/0ab45caac1a5ac6155807dc448a4dcb2d8679bd7))
* **test:** Add alarm tests ([f0357dd0](https://github.com/jaayesta/queclink-parser/commit/f0357dd0d332edaa95a387f68308412ea45c993f))

##### New Features

* **messages:**
  * Add message to alarm ([38a19655](https://github.com/jaayesta/queclink-parser/commit/38a19655bde2bd0fd6769e7ad80095f208596fe7))
  * Add new spanish messages ([33103a42](https://github.com/jaayesta/queclink-parser/commit/33103a4261f2a6110840d7caa5602669a6391643))

##### Bug Fixes

* **parser:** Fix parse alarms ([2de4dc46](https://github.com/jaayesta/queclink-parser/commit/2de4dc4625a9a916a815c41edc4ef2413aa58589))

#### 0.2.24 (2016-10-28)

#### 0.2.23 (2016-10-28)

#### 0.2.22 (2016-10-28)

#### 0.2.21 (2016-10-28)

#### 0.2.20 (2016-10-24)

##### Bug Fixes

* **parser:** Fix parse coordinates ([28c94cae](https://github.com/jaayesta/queclink-parser/commit/28c94cae4f773c50464da012763ee417950aff88))

#### 0.2.19 (2016-10-24)

##### Bug Fixes

* **parser:** Fix parse coordinates ([7601677c](https://github.com/jaayesta/queclink-parser/commit/7601677c4050ebb4bc9cf8709bae7530f5a8f18a))

#### 0.2.18 (2016-10-24)

##### Bug Fixes

* **parser:** Fix parse coordinates ([0e493ed6](https://github.com/jaayesta/queclink-parser/commit/0e493ed601d88e352093abf2f01acc04a1328c5b))

#### 0.2.17 (2016-10-24)

##### Chores

* **package:** Update moment ([081568e5](https://github.com/jaayesta/queclink-parser/commit/081568e51610ad16f4fe57cd06eb7f2ad4f8f63f))

##### Bug Fixes

* **parser:** Acept duration and toggle in parseCommand. Fix serial and counter in parse ack ([205257ee](https://github.com/jaayesta/queclink-parser/commit/205257ee55948b8e47d0092fcf614b0cbbcd7eea))

#### 0.2.16 (2016-10-24)

#### 0.2.15 (2016-10-24)

##### Bug Fixes

* **test:** Fix input status test ([1e37125b](https://github.com/jaayesta/queclink-parser/commit/1e37125b04a40603050cdfa15bbc118f88a660e1))

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
