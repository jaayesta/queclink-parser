# queclink-parser

[![npm version](https://img.shields.io/npm/v/queclink-parser.svg?style=flat-square)](https://www.npmjs.com/package/queclink-parser)
[![npm downloads](https://img.shields.io/npm/dm/queclink-parser.svg?style=flat-square)](https://www.npmjs.com/package/queclink-parser)
[![dependency Status](https://img.shields.io/david/jaayesta/queclink-parser.svg?style=flat-square)](https://david-dm.org/jaayesta/queclink-parser#info=dependencies)
[![devDependency Status](https://img.shields.io/david/dev/jaayesta/queclink-parser.svg?style=flat-square)](https://david-dm.org/jaayesta/queclink-parser#info=devDependencies)

> Parses raw data from Queclink devices (TCP). Devices suported: GV300, GV300W, GV200, GV55, GMT100, GL300

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
{ 
  raw: '+RESP:GTFRI,270100,135790246811220,,,00,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,12345:12:34,,,80,210100,,,,20090214093254,11F0$',
  manufacturer: 'queclink',
  device: 'Queclink-GV300W',
  type: 'data',
  imei: '135790246811220',
  protocolVersion: { raw: '270100', deviceType: 'GV300W', version: '1.0' },
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
     tow: false,
     input: { '1': true, '2': false, '3': false, '4': false },
     output: { '1': false, '2': false, '3': false },
     charge: false 
   },
  azimuth: 92,
  altitude: 70,
  datetime: 2009-02-14T01:32:54.000Z,
  voltage: { 
    battery: 80, 
    inputCharge: null, 
    ada: null, 
    adb: null 
  },
  mcc: 460,
  mnc: 0,
  lac: 6360,
  cid: 24897,
  odometer: 2000,
  hourmeter: '12345:12:34' 
}
*/

```

## License

[MIT](https://tldrlegal.com/license/mit-license)
