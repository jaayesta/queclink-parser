const queclink = require('queclink-parser');

const raw = new Buffer('+RESP:GTFRI,060100,135790246811220,,,00,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,12345:12:34,,,80,210100,,,,20090214093254,11F0$');
queclink.parse(raw);
