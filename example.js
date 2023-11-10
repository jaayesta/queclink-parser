const queclink = require('.');

var mess = '+RESP:GTFRI,6E0100,866775050906585,GV310LAU,12093,10,1,2,0.0,131,100.2,117.129250,31.839233,20220524060603,0460,0000,550B,0E9E30A5,00,100.0,00000:03:32,12000,12300,99,100,210100,,,,20220524060606,0021$';
var eri = '+RESP:GTERI,6E0100,100000000000306,GV310LAU,00000002,,10,1,1,12.0,0,93.0,117.129271,31.839336,20210812071324,0460,0000,550B,B7B1,00,15.1,,,1648,,0,110001,2,1,28FBCA9C0A000092,1,019C,20210812151326,8A59$';
var eri2 = '+RESP:GTERI,6E0100,866775050906668,GV310LAU,00000002,,10,1,1,12.0,0,88.7,117.129265,31.839253,20220620104346,0460,0001,DE10,027A4F1F,00,15.1,,,1648,,100,220100,2,3,2836369E0A0000C7,1,01C7,283E1E41030000B5,1,01B3,28C54DC5080000F2,1,01AF,20220620104347,02BE$';
var info = '+RESP:GTTOW,6E0100,866775050906767,GV310LAU,3,00,1,0,0.0,267,65.5,117.129388,31.838345,20220713055257,0460,0000,550B,0E9E30A5,01,7,23.7,1,32,20220713055448,1384$';
var eps = '+RESP:GTEPS,6E0200,866775050906544,GV310LAU_123,12390,01,1,0,0.3,0,86.0,117.129153,31.839230,20220818073645,0460,0001,DE10,027A4F1F,00,100.0,20220818170650,01B7$';
var tmp = '+RESP:GTTMP,6E0100,866775050906858,GV310LAU,,12291,01,1,1,0.0,227,64.0,117.129126,3 1.839297,20220711080448,0460,0000,550B,0E9E30A5,00,10.1,,3456,0,4353,10,01,,,,280453CB08000091,,27,20220711160449,599E$';
var cra = '+RESP:GTCRA,6E0200,866775050906544,,05,0,0.0,18,113.5,117.129345,31.839108,20220826023413,0460,0000,550B,0E9E30A5,00,20220826103415,1C65$';
var jds = '+RESP:GTJDS,6E0100,866775050906767,GV310LAU,1,3,0,3.8,173,62.3,117.129874,31.838456,20220714051457,0460,0000,550B,0E9E30A5,01,32,20220714131539,476B$';
var ant = '+RESP:GTANT,6E0200,866775050906544,GV310LAU,0,0,1.7,0,52.0,117.129292,31.838311,20220825024128,0460,0000,550B,0E9E30A5,00,20220825024333,10AB$';
var rmd = '+RESP:GTRMD,6E0100,866775050906684,GV310LAU_123,1,0,0.0,259,60.0,117.129291,31.839 294,20220831083741,0460,0000,550B,0E9E30A5,00,20220831180919,0003$';
var bpl = '+RESP:GTBPL,6E0100,866775050906932,,3.61,2,0.0,186,80.4,117.129363,31.838143,20220817023201,0460,0000,550B,0E9E30A5,00,20220817023202,01DB$';
var ign = '+RESP:GTIGN,6E0100,866775050906940,GV310LAU,863,0,0.0,186,69.9,117.129340,31.838973,20220630055647,0460,0000,550B,0E9E30A5,01,4,,0.0,20220630061015,00A8$';
var str = '+RESP:GTSTR,6E0100,866775050906767,GV310LAU,,,0,39.7,269,60.5,117.082767,31.832155,2 0220624054817,0460,0000,550B,0E9E30A5,00,0.7,20220624054819,1492$';
var stt = '+BUFF:GTSTT,6E0100,866775050906130,GV310LAU,21,0,0.0,165,81.5,117.129521,31.838534,2 0220630010318,0460,0001,DE11,05FE6667,00,20220630090320,B344$';
var gss = '+RESP:GTGSS,6E0100,866775050906858,GV310LAU,0,0,21,,0,0.0,170,73.2,117.129202,31.839 432,20220708011105,0460,0000,550B,0E9E30A5,01,4,20220708092106,34A7$';
var ida = '+BUFF:GTIDA,6E0100,866775050906544,GV310LAU,,D0DF95D7,0,1,2,0.0,0,78.0,117.129264,31.839145,20220822111318,0460,0000,550B,0E9E30A5,00,0.0,,,,,20220822191319,4C95$';
var dat_short = '+RESP:GTDAT,6E0100,866775050906684,,2132,20220901074329,082F$';
var dat_long = '+RESP:GTDAT,6E0100,866775050906684,,,,,2132,1,0.0,187,65.4,117.129372,31.838884,20220901074343,0460,0000,550B,0E9E30A5,00,,,,,20220901074345,0830$';
var dtt_short = '+RESP:GTDTT,6E0200,866775050906544,GV310LAU,,,0,9,123456789,20220823144523,669D$';
var dtt_long = '+RESP:GTDTT,6E0100,866775050906767,,,,0,9,123456789,2,0.0,279,72.8,117.129300,31.838850,20220712055707,0460,0000,550B,0E9E30A5,00,,,,,20220712055708,0111$';
var dos = '+RESP:GTDOS,6E0100,866775050906767,,1,0,2,0.0,248,87.8,117.129293,31.839724,20220721034754,0460,0000,550B,0E9E30A5,00,20220721034755,0370$';
var cid = '+RESP:GTCID,6E0200,866775050906544,,898602a51244f5103329,20220823172829,6D71$';
var csq = '+RESP:GTCSQ,6E0100,866775050906858,GV310LAU,31,,20220708184826,3C4E$';
var ver = '+RESP:GTVER,6E0100,866775050906684,GV310LAU,6E,0138,0103,20220812063401,0079$';
var bcs = '+RESP:GTBCS,6E0200,866775051515393,GV310LAU,,1,0.0,0,127.3,117.129427,31.839283,20220901022731,0460,0000,550B,B7B1,01,12,1D03,GV310LAU_BT,B908A4800DB1,1,1,F7E776096185,,,,,20220901102731,2472$';
var bds = '+RESP:GTBDS,6E0200,866775051515393,GV310LAU,,1,0.0,0,87.1,117.129505,31.839294,20220902060131,0460,0000,550B,B1E2,01,12,1D03,GV310LAU_BT,B908A4800DB1,1,1,F7E776096185,0,,,,20220902140133,3EA1$';
var baa = '+RESP:GTBAA,6E0200,866775051515393,GV310LAU,FE,3,2,12,000A,CE9BFAF3A557,,1,0.0,178,105.8,117.129270,31.838753,20220901093915,0460,0000,550B,B7A9,01,12,20220901173916,28EA$';
const raw = new Buffer(baa);
console.log(queclink.parse(raw))
