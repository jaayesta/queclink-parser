# queclink-parser

[![npm version](https://img.shields.io/npm/v/queclink-parser.svg?style=flat-square)](https://www.npmjs.com/package/queclink-parser)
[![npm downloads](https://img.shields.io/npm/dm/queclink-parser.svg?style=flat-square)](https://www.npmjs.com/package/queclink-parser)
[![dependency Status](https://img.shields.io/david/jaayesta/queclink-parser.svg?style=flat-square)](https://david-dm.org/jaayesta/queclink-parser#info=dependencies)
[![devDependency Status](https://img.shields.io/david/dev/jaayesta/queclink-parser.svg?style=flat-square)](https://david-dm.org/jaayesta/queclink-parser#info=devDependencies)

> Parses raw data from Queclink devices (TCP). Devices supported: GV55, GV200, GV300, GV75W, GV300W, GV500, GV600W, GV800W, GMT100, GL50, GL50B, GL300, GL300W

## Installation

```bash
npm i -S queclink-parser
```

## Use

[Try on Tonic](https://tonicdev.com/npm/queclink-parser)
```js

const queclink = require('queclink-parser');

const raw = new Buffer('+RESP:GTFRI,350302,867844003012625,,12372,10,1,0,0.0,0,820.8,-70.514872,-33.361021,20160811154617,0730,0002,7410,C789,00,0.0,00000:15:30,2788,705,164,0D,00,,,20160811154651,061D$');
const data = queclink.parse(raw);

/*
{ raw: '+RESP:GTFRI,350302,867844003012625,,12372,10,1,0,0.0,0,820.8,-70.514872,-33.361021,20160811154617,0730,0002,7410,C789,00,0.0,00000:15:30,2788,705,164,0D,00,,,20160811154651,061D$',
  manufacturer: 'queclink',
  device: 'Queclink-GV200',
  type: 'data',
  imei: '867844003012625',
  protocolVersion: { raw: '350302', deviceType: 'GV200', version: '3.2' },
  temperature: null,
  history: false,
  sentTime: 2016-08-11T15:46:51.000Z,
  serialId: 1565,
  alarm: { type: 'Gps' },
  loc: { type: 'Point', coordinates: [ -70.514872, -33.361021 ] },
  speed: 0,
  gpsStatus: true,
  hdop: 0,
  status: 
   { raw: '0D00',
     sos: false,
     input: { '1': true, '2': false, '3': true, '4': true },
     output: { '1': false, '2': false, '3': false, '4': false },
     charge: true },
  azimuth: 0,
  altitude: 820.8,
  datetime: 2016-08-11T15:46:17.000Z,
  voltage: 
   { battery: null,
     inputCharge: 12.372,
     ada: 2.788,
     adb: 0.705,
     adc: 0.164 },
  mcc: 730,
  mnc: 2,
  lac: 29712,
  cid: 51081,
  odometer: 0,
  hourmeter: 0.25833333333333336 
}
*/

```

## License

[MIT](https://tldrlegal.com/license/mit-license)
