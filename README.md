# queclink-parser

[![npm version](https://img.shields.io/npm/v/queclink-parser.svg?style=flat-square)](https://www.npmjs.com/package/queclink-parser)
[![npm downloads](https://img.shields.io/npm/dm/queclink-parser.svg?style=flat-square)](https://www.npmjs.com/package/queclink-parser)
[![dependency Status](https://img.shields.io/david/jaayesta/queclink-parser.svg?style=flat-square)](https://david-dm.org/jaayesta/queclink-parser#info=dependencies)
[![devDependency Status](https://img.shields.io/david/dev/jaayesta/queclink-parser.svg?style=flat-square)](https://david-dm.org/jaayesta/queclink-parser#info=devDependencies)

Parses raw data from Queclink devices (TCP). Devices suported: GV300, GV200, GMT100

## Installation

```bash
npm i -S queclink-parser
```

## Use

```js

const queclink = require('queclink-parser');

const raw = new Buffer('+RESP:GTFRI,250504,135790246811220,,,00,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,12345:12:34,,,80,210100,,,,20090214093254,11F0$');
const data = queclink.parse(raw);

/*
{ 
  raw: '+RESP:GTFRI,350302,867844003012625,,12372,10,1,0,0.0,0,820.8,-70.514872,-33.361021,20160811154617,0730,0002,7410,C789,00,0.0,00000:15:30,2788,705,164,0D,00,,,20160811154651,061D$',
  device: 'Queclink-GV200',
  type: 'data',
  imei: '867844003012625',
  protocolVersion: { raw: '350302', deviceType: 'GV200', version: '3.2' },
  temperature: null,
  history: false,
  sentTime: 2016-08-11T15:46:51.000Z,
  serialId: 61,
  alarm: { type: 'Gps' },
  loc: { type: 'Point', coordinates: [ -70.514872, -33.361021 ] },
  speed: 0,
  gpsStatus: true,
  hdop: 0,
  status: 
   { raw: '0D00',
     sos: true,
     input: { '1': true, '2': true, '3': false, '4': true },
     output: { '1': false, '2': false, '3': false, '4': false },
     charge: true 
   },
  azimuth: 0,
  altitude: 820.8,
  datetime: 2016-08-11T15:46:17.000Z,
  voltage: 
   { battery: null,
     inputCharge: 12.372,
     ada: 2.788,
     adb: 0.705,
     adc: 0.164 
   },
  mcc: 730,
  mnc: 2,
  lac: 29712,
  cid: 51081,
  odometer: 0,
  hourmeter: '00000:15:30' 
}
*/

```
