const queclink = require('.');

var tow = '+RESP:GTTOW,8020060402,867488060596284,GV57CG,,00,1,3,0.0,0,180.6,117.129144,31.838861,20230524034505,0460,0001,DF5C,027A4F1F,01,7,0.2,20230524034505,01B8$'
var dis = '+RESP:GTDIS,8020060402,867488060596284,GV57CG,,60,1,1,0.0,0,138.5,117.129051,31.839786,20230519083404,0460,0001,DF5C,05FE6667,01,4,0.0,20230519083405,04BD$'
var iob = '+RESP:GTIOB,8020060402,867488060596284,GV57CG,,10,1,1,0.0,182,85.3,117.129200,31.839163,20230523025618,0460,0001,DF5C,05FE6667,01,6,0.4,20230522192619,0218$'
var spd = '+RESP:GTSPD,8020060402,867488060596284,GV57CG,,00,1,1,0.4,0,220.2,117.129759,31.839433,20230523062932,0460,0001,DF5C,027A4F1F,01,4,0.0,20230523160033,0B6A$'
var sos = '+RESP:GTSOS,8020060402,867488060596284,GV57CG,,60,1,0,0.0,351,67.3,117.129029,31.840100,20230524034859,0460,0001,DF5C,05FE6667,01,2,0.0,20230524035256,01D2$'
var rtl = '+RESP:GTRTL,8020060402,867488060596284,GV57CG,,00,1,2,263.8,351,67.3,117.129029,31.840100,20230524034844,0460,0001,DF5C,05FE6667,01,6,0.0,20230524034845,01C8$'
var dog = '+RESP:GTDOG,8020060402,867488060596284,GV57CG,,63,1,2,0.0,171,104.6,117.129097,31.839252,20230524035637,0460,0001,DF5C,05FE6667,01,10,0.3,20230524035638,01E5$'
var igl = '+RESP:GTIGL,8020060402,867488060596284,GV57CG,,01,1,1,0.0,0,48.6,117.129292,31.839412,20230524035846,0460,0001,DF5C,05FE6667,01,10,0.4,20230524035847,0201$'
var vgl = '+RESP:GTVGL,8020060402,867488060596284,GV57CG,,50,1,1,0.0,0,81.6,117.129297,31.839118,20230519072153,0460,0001,DF5C,05FE6667,01,1,0.7,20230519072154,03B9$'
var hbm = '+RESP:GTHBM,8020060402,866775051515393,GV57CG,,01,1,1,20.9,266,49.8,117.104300,31.822967,20231221034050,0460,0001,DF5C,05A3F70B,01,1,19.0,20231221034051,005D$'
var fri = '+RESP:GTFRI,8020060402,864696060004173,GV57CG,11985,10,1,1,0.0,0,118.5,117.129306,31.839197,20230808033438,0460,0001,DF5C,05FE6667,03,15,0,123.5,00123:04:44,12496,,,100,210000,,,,20230808033438,01B3$'
var eri = '+RESP:GTERI,8020060402,867488060672911,GV57CG,00008000,11975,10,1,1,0.0,0,119.9,117.129559,31.839319,20231207025940,0460,0000,550B,085BE2AA,03,6,0,11.5,,0,,,100,210300,,4,8,20231207025940,5686$'
var esp = '+RESP:GTEPS,8020060402,135790246811220,GV57CG,13500,00,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,01,15,2000.0,20090214093254,11F0$'
var ais = '+RESP:GTAIS,8020060402,135790246811220,GV57CG,1980,11,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,01,15,2000.0,20090214093254,11F0$'
var gsm = '+RESP:GTGSM,8020060402,867488060596284,FRI,0460,0001,DF5C,02A90902,38,,0460,0001,DF5C,0DD0833A,55,,0460,0011,691D,0690271C,52,,0460,0011,691D,0DE98A34,38,,0460,0011,691D,0DE98A34,27,,0460,0011,691D,0DE98A34,29,,0460,0001,DF5C,05FE6667,24,00,20230524054409,031B$'
var inf = '+RESP:GTINF,8020060402,867488060596284,GV57CG,21,89860122801846641616,57,0,1,14594,,3.80,0,1,,,20230524051219,0,1200,,,01,00,+0000,0,20230524051220,0268$'
var gps = '+RESP:GTGPS,8020060402,135790246811220,GV57CG,,,,003F,,,20230524051345,20230524051346,11F0$'
var alm = '+RESP:GTALM,8020060402,866775051629715,GV57CG,1,1,1,BSI,cmnet,cmnet_name,cmnet_password,3gnet,3gnet_name,3gnet_password,1,,,\^,20231218071618,71C5$'
var cid = '+RESP:GTCID,8020060402,864696060004173,GV57CG,89860118801541301090,20230810112751,04EA$'
var csq = '+RESP:GTCSQ,8020060402,135790246811220,GV57CG,16,0,20090214093254,11F0$'
var ver = '+RESP:GTVER,8020060402,135790246811220,GV57CG,802006,0100,0101,20090214093254,11F0$'
var bat = '+RESP:GTBAT,8020060402,135790246811220,GV57CG,1,12000,,4.40,0,0,20230524052049,11F0$'
var ios = '+RESP:GTIOS,8020060402,135790246811220,GV57CG,,7531,,,01,00,20090214093254,11F0$'
var tmz = '+RESP:GTTMZ,8020060402,866775051508042,GV57CG,+0000,0,0,20220630032656,2B45$'
var aif = '+RESP:GTAIF,8020060402,866775051629715,GV57CG,cmnet,cmnet_name,cmnet_password,3gnet,3gnet_name,3gnet_password,898600e0123955608398,24,0,B7B1,10.57.5.91,211.138.180.4,211.138.180.5,0,,,,20231218061747,714A$'
var gsv = '+RESP:GTGSV,8020060402,359464036001111,GV57CG,11,30,24,31,30,32,28,32,29,12,0,14,17,16,18,20,0,22,24,24,0,25,0,20230524052627,000F$'
var scs = '+RESP:GTSCS,8020060402,865585040006649,GV57CG,2,-0.06,0.88,-0.48,-0.97,0.05,0.22,0.22,0.48,0.85,20230524132442,1F59$'
var pna = '+RESP:GTPNA,8020060402,135790246811220,GV57CG,20230524052727,11F0$'
var pfa = '+RESP:GTPFA,8020060402,135790246811220,GV57CG,20230524052727,11F0$'
var pdp = '+RESP:GTPDP,8020060402,135790246811220,GV57CG,20230524052727,11F0$'
var mpn = '+RESP:GTMPN,8020060402,867488060596284,GV57CG,0,0.0,0,102.0,117.129386,31.839097,20230524052848,0460,0001,DF5C,05FE6667,01,15,20230524052849,02C8$'
var mpf = '+RESP:GTMPF,8020060402,867488060596284,GV57CG,1,0.8,0,75.4,117.129447,31.839062,20230524052829,0460,0001,DF5C,05FE6667,01,15,20230524052831,02BF$'
var btc = '+RESP:GTBTC,8020060402,867488060596284,GV57CG,1,0.0,0,48.8,117.129191,31.839340,20230524051506,0460,0001,DF5C,05FE6667,01,13,20230524051507,0277$'
var drm = '+RESP:GTDRM,8020060402,867488060596284,GV57CG,1,0.2,0,98.3,117.129404,31.839095,20230524052844,0460,0001,DF5C,05FE6667,01,15,20230524052846,02C3$'
var jdr = '+RESP:GTJDR,8020060402,867488060596250,GV57CG,2,0,0.0,0,29.7,117.129806,31.838006,20230412075358,0460,0000,691D,6141,01,7,20230412075457,0214$'
var jds = '+RESP:GTJDS,8020060402,867488060596250,GV57CG,1,2,3,0.0,0,101.2,117.130039,31.838552,20230412060702,0460,0001,DF5C,05FE6667,01,1,20230412060703,016E$'
var stc = '+RESP:GTSTC,8020060402,867488060596284,GV57CG,,3,0.0,0,112.7,117.129268,31.838801,20230524023737,0460,0001,DF5C,027A4F1F,01,9,20230523190737,0131$'
var bpl = '+RESP:GTBPL,8020060402,867488060596722,GV57CG,3.63,4,2.3,0,54.8,117.128785,31.839313,20230522052652,0460,0001,DF5C,027A4F1F,01,1,20230522052654,413B$'
var stt = '+RESP:GTSTT,8020060402,867488060596284,GV57CG,21,1,0.0,0,94.0,117.129389,31.839152,20230524052926,0460,0001,DF5C,05FE6667,01,15,20230524052928,02CA$'
var ign = '+RESP:GTIGN,8020060402,867488060596284,GV57CG,0,0,0.0,0,85.4,117.129377,31.839155,20230524053546,0460,0001,DF5C,05FE6667,01,15,00012:25:35,0.2,20230524053548,02DF$'
var vgn = '+RESP:GTVGN,8020060402,867488060595385,GV57CG,00,5,14653,4,2.1,0,38.1,117.129642,31.838044,20230524051923,0460,0000,550B,B7B1,01,3,12345:12:34,0.0,20230524051924,002E$'
var igf = '+RESP:GTIGF,8020060402,867488060596284,GV57CG,418,1,0.0,0,85.4,117.129377,31.839155,20230524053545,0460,0001,DF5C,05FE6667,01,15,00012:25:35,0.2,20230524053547,02DA$'
var vgf = '+RESP:GTVGF,8020060402,867488060595385,GV57CG,00,5,10127,3,1.1,0,75.8,117.129668,31.838718,20230524052215,0460,0000,550B,B7B1,01,11,12345:12:34,0.0,20230524052216,0034$'
var idf = '+RESP:GTIDF,8020060402,867488060596284,GV57CG,11,81,1,0.0,0,86.2,117.129261,31.839339,20230524054122,0460,0001,DF5C,05FE6667,01,15,0.0,20230524054123,0309$'
var gss = '+RESP:GTGSS,8020060402,867488060596284,GV57CG,1,9,11,,3,0.0,0,89.2,117.129248,31.838906,20230524045125,0460,0001,DF5C,05FE6667,01,9,20230524045126,0240$'
var str = '+RESP:GTSTR,8020060402,867488060596284,GV57CG,,,1,1.8,0,81.2,117.129328,31.839300,20230524053825,0460,0001,DF5C,05FE6667,01,15,0.0,20230524053827,02F9$'
var stp = '+RESP:GTSTP,8020060402,867488060596284,GV57CG,,,1,0.0,0,90.4,117.129304,31.839352,20230524053856,0460,0001,DF5C,05FE6667,01,15,0.0,20230524053856,02FB$'
var lsp = '+RESP:GTLSP,8020060402,867488060596284,GV57CG,,,1,0.0,0,86.2,117.129261,31.839339,20230524054055,0460,0001,DF5C,05FE6667,01,15,0.0,20230524054056,0306$'
var idn = '+RESP:GTIDN,8020060402,867488060596284,GV57CG,,,1,0.0,0,86.2,117.129261,31.839339,20230524054001,0460,0001,DF5C,05FE6667,01,15,0.0,20230524054002,0300$'
var dos = '+RESP:GTDOS,8020060402,867488060596284,GV57CG,1,0,0,3.6,0,57.6,117.129139,31.839739,20230524035840,0460,0001,DF5C,05FE6667,01,9,20230524035841,01FD$'
var rmd = '+RESP:GTRMD,8020060402,867488060596284,GV57CG,3,0,2.0,0,180.6,117.129144,31.838861,20230524032220,0460,0001,DF5C,027A4F1F,01,7,20230524032224,017D$'
var pnr = '+RESP:GTPNR,8020060402,863835020303983,GV57CG,0,,,,,20150407094557,0633$'
var pfr = '+RESP:GTPFR,8020060402,863835020303983,GV57CG,0,,,,,20150407094557,0633$'
var cra = '+RESP:GTCRA,8020060402,867488060596284,GV57CG,06,1,1.0,0,222.0,117.129815,31.839434,20230523062909,0460,0001,DF5C,027A4F1F,01,3,20230523160010,0B67$'
var asc = '+RESP:GTASC,8020060402,867488060595542,GV57CG,0.86,0.52,0.01,0.52,-0.86,0.01,0.01,0.00,-1.00,1,12.6,267,39.7,117.115453,31.827255,20230523055431,0460,0001,DF5C,05F7B315,01,10,20230523135432,03BC$'
var hbe = '+RESP:GTHBE,8020060402,866775051515393,GV57CG,,2,0,1,42.5,0,42.6,117.101321,31.827725,20231221034214,0460,0001,DF5C,05F7B40B,01,1,002500040054,FFE2FFFF0051,10,19.8,20231221034215,006B$'

var data = {
    "imei": 864696060046190,
    "datetime": "2024-09-23T22:02:36.639Z",
    "instruction": "1_on",
    "action": "Cortar Corriente",
    "device": "queclink",
    "password": "gv300w",
    "device_serie": "GV",
    "previousOutput": {
      "1": false,
      "2": false,
      "3": false
    },
    "previousToggle": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    },
    "previousDuration": {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0
    }
  }

console.log(queclink.parseCommand(data))
// const raw = new Buffer(hbe)
// console.log(queclink.parse(raw))
// queclink.parse(raw)