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
  raw: '+RESP:GTFRI,250504,135790246811220,,,00,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,12345:12:34,,,80,210100,,,,20090214093254,11F0$',
  device: 'Queclink-GV300',
  type: 'data',
  imei: '135790246811220',
  protocolVersion: { raw: '250504', deviceType: 'GV300', version: '5.4' },
  temperature: null,
  history: false,
  sentTime: 2009-02-14T09:32:54.000Z,
  serialId: 11,
  alarm: { type: 'Gps' },
  loc: { type: 'Point', coordinates: [ 121.354335, 31.222073 ] },
  speed: 4.3,
  gpsStatus: true,
  hdop: 1,
  status: 
   { raw: '210100',
     sos: false,
     input: { '1': false, '2': true, '3': false },
     output: { '1': true, '2': false },
     charge: false },
  azimuth: '92',
  altitude: 70.0,
  datetime: 2009-02-14T01:32:54.000Z,
  voltage: { battery: 80, inputCharge: null, ada: null, adb: null },
  mcc: '0460',
  mnc: '0000',
  lac: 18,
  cid: 6141,
  odometer: 2000,
  hourmeter: '12345:12:34' 
}
*/

```
