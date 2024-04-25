const queclink = require('.');

var tow = '+RESP:GTTOW,8020040100,866775051514578,GV58LAU,,00,1,2,0.0,184,71.4,117.129187,31.838864,20220903093322,0460,0001,DE10,027A4F1F,05,0,160201,0.0,20220903184328,01D9$'
var dis = '+RESP:GTDIS,8020040100,866775051514578,gv58lau-new,,11,1,1,0.0,0,57.9,117.129207,31.839437,20220903110133,0460,0001,DE10,027A4F1F,00,0.0,20220903190134,03D8$'
var iob = '+RESP:GTIOB,8020040100,866775051514578,GV58LAU,,11,1,1,0.0,185,79.0,117.129363,31.839355,20220903071031,0460,0001,DE10,027A4F1F,01,12,0.0,20220903162032,335B$'
var spd = '+RESP:GTSPD,8020040100,866775050904879,GV58LAU,,00,1,2,9.3,172,-125.5,117.129788,31.837960,20220901051906,0460,0000,550B,0E9E30A5,01,8,0.0,20220901142907,4682$'
var sos = '+RESP:GTSOS,8020040100,866775051514222,,,10,1,2,0.0,0,105.7,117.128819,31.838987,20220902112858,0460,0000,550B,B7A9,00,0.0,20220902203859,0108$'
var rtl = '+RESP:GTRTL,8020040100,866775050902360,GV58LAU,,00,1,2,0.0,192,75.4,117.129320,31.838312,20220901014153,0460,0000,550B,0E9E30A5,01,8,0.0,20220901105154,27D0$'
var dog = '+RESP:GTDOG,8020040100,866775051514222,GV58LAU,,01,1,1,0.0,353,143.9,,,20220902124759,,,,,01,10,0.0,20220902215800,0930$'
var igl = '+BUFF:GTIGL,8020040100,866775050902360,,,00,1,2,0.0,0,119.0,,,20220902113340,,,,,00,0.0,20220902204341,007A$'
var hbm = '+RESP:GTHBM,8020040100,866775051514636,,,21,1,1,74.1,88,42.6,117.155777,31.853153,20220907055211,0460,0000,550A,1FC3,00,2577.5,20220907135211,00A9$'
var vgl = '+RESP:GTVGL,8020040100,866775051514636,,,71,1,0,9.2,43,61.4,117.130234,31.839280,20220907084643,0460,0000,550B,B1E2,00,2655.0,20220907165007,0324$'
var fri1 = '+RESP:GTFRI,8020040100,866775051514636,,,30,1,1,43.3,0,43.8,117.128727,31.838200,20220907084517,0460,0000,550B,3D93,02,3,2654.6,00012:09:13,,,,100,220000,,,,20220907164518,030E$'
var fri2 = '+RESP:GTFRI,8020040100,866775051514636,,,31,1,1,10.1,42,45.9,117.128837,31.839333,20220907084541,0460,0000,550B,B1E2,00,2654.7,00012:09:37,,,,100,220000,,,,20220907164542,0310$'
var fri3 = '+RESP:GTFRI,8020040100,866775051514750,GV58LAU-4750,,10,1,0,0.0,93,76.0,117.129472,31.838465,20220907073039,0460,0000,550B,0E9E30A5,00,0.1,,,,,61,110000,,,,20220907074936,3DB6$'

var eri = '+RESP:GTERI,8020040100,866775050904879,GV58LAU,00000104,12639,12,1,1,0.0,184,97.5,,,20220907102510,,,,,01,10,0.0,00081:51:10,,,,100,410000,,0,203FFFFF,,,,,,,,,,,,,,,,,,,,,,,00FFFFFF,,,,,,,,,,,,,,,,,,,,,,,,,9,0,1,3,,001F,DU_100361,F022A2143F36,0,,,1,6,2,1A2E2AF0,003F,WTH300,AC233FA3545E,1,3252,26,42,2,1,0,,001F,TD_100109,FD6D3DE6D704,0,,,3,2,0,,001F,WTS300,78054101E641,0,,,4,1,0,0000008C,001F,TD_100114,D971858039B3,1,3500,24,5,2,0,0B8A1999,001F,WTS300,78054101E646,1,2954,25,7,10,1,,0017,DegreeT,EC6EC128DA26,0,,8,11,0,00000064,1007,MAG,D325C2B2A2F8,1,0,50,0,9,6,2,,003F,WTH300,AC233FA35461,0,,,,20220907193511,3449$'
var eps = '+RESP:GTEPS,8020040100,866775051514636,,12199,01,1,1,0.0,218,29.9,117.335647,31.825064,20220907062316,0000,0000,0000,0000,00,2598.1,20220907142317,0003$'
var ais = '+RESP:GTAIS,8020040100,866775050902360,GV58LAU,12526,51,1,0,0.0,0,119.0,117.129016,31.839147,20220902113606,0460,0000,550B,0E9E30A5,01,0,0.0,20220902115622,01D6$'
var ida = '+RESP:GTIDA,8020040100,866775050906544,GV58LAU,,DODF95D7,0,1,2,0.0,0,78.0,117.129264,31.839145,20220822111318,0460,0000,550B,0E9E30A5,00,0.0,,,,,20220822191319,4C95$'
var inf = '+RESP:GTINF,8020040100,866775051514461,GV58LAU-4461,11,89860121801394238030,18,0,0,0,,3.86,0,0,,,20220907073540,0,,,,00,00,+0000,0,20220907074942,3E02$'
var cid = '+RESP:GTCID,8020040100,866775051514578,,89860120801319061294,20220907183605,028B$'
var csq = '+RESP:GTCSQ,8020040100,866775051514578,,31,0,20220907183617,028D$'
var ver = '+RESP:GTVER,8020040100,866775051514578,,802004,0112,0101,20220907183635,028F$'
var ati = '+RESP:GTATI,8020040100,866775051514578,,00081031,0112,0101,0107,0102,A4,20220907184558,0299$'
var scs = '+RESP:GTSCS,8020040100,866775051514420,,2,-1.00,0.03,-0.03,0.03,1.00,0.04,0.03,0.04,-1.00,20220908100944,0173$'
var pna = '+RESP:GTPNA,8020040100,866775051514578,,20220907185947,029F$'
var pfa = '+RESP:GTPFA,8020040100,866775051514578,,20220907185924,029E$'
var pdp = '+RESP:GTPDP,8020040100,866775051515005, GV58LAU-5005,20220907084425,3F71$'
var mpn = '+RESP:GTMPN,8020040100,866775051514578,,0,,,,,,,0460,0000,550B,0E9E30AD,00,20220907135328,01C7$'
var mpf = '+RESP:GTMPF,8020040100,866775051514461,GV58LAU-4461,1,0.0,90,32.7,117.130049,31.839343,20220907072045,0460,0001,DE10,027A4F1F,00,20220907072046,3D82$'
var btc = '+RESP:GTBTC,8020040100,866775051514461,GV58LAU-4461,0,0.0,0,66.0,117.129260,31.838317,20220907073520,0460,0001,DE10,027A4F1F,00,20220907080836,3E51$'
var cra = '+RESP:GTCRA,8020040100,866775051514750,GV58LAU-4750,08,3,0.0,0,2.1,117.129271,31.839842,20220906121042,0460,0000,550B,0E9E30A5,00,20220906121043,0057$'
var asc = '+RESP:GTASC,8020040100,866775051515187,gv58lau,0.60,0.16,0.78,0.09,-0.99,0.13,0.79,-0.01,-0.61,1,43.1,269,55.0,117.106906,31.827183,20220906055127,0460,0000,550B,90C1,00,20220906135127,F78D$'
var hbe = '+RESP:GTHBE,8020040100,866775051514602,GV58LAU,,2,0,1,12.3,178,25.6,117.092176,31.814919,20220829063414,0460,0000,550B,045E83ED,05,12,110101,002E002E0057,FFDCFFFF0050,26,0.0,20220829143415,2A18$'
var dom = '+RESP:GTDOM,8020040100,861075020061602,,5,2,,0,28.5,101,66.8,117.206459,31.829773,20150323090457,0460,0001,5504,69D4,00,20150323170458,2970$'
var jdr = '+RESP:GTJDR,8020040100,866775051514578,gv58lau,3,0,,,,,,,,,,,00,20220906094142,005B$'
var jds = '+RESP:GTJDS,8020040100,866775051514578,gv58lau,1,3,1,0.0,301,159.8,117.130287,31.839002,20220906035631,0460,0001,DE11,05FE6667,00,20220906115633,143B$'
var bpl = '+RESP:GTBPL,8020040100,866775051514636,,3.70,0,9.2,43,61.4,,,20220907084643,,,,,00,20220907183835,035C$'
var stt = '+RESP:GTSTT,8020040100,866775051514578,,21,1,0.0,0,59.4,117.129073,31.839189,20220907110740,0460,0001,DE11,05FE6667,05,12,210100,20220907190741,02BB$'
var ign = '+RESP:GTIGN,8020040100,866775051514578,,1,0,0.0,0,59.4,117.129073,31.839189,20220907111325,0460,0001,DE11,05FE6667,05,12,220100,,0.0,20220907191327,02C0$'
var vgn = '+RESP:GTVGN,8020040100,866775051514610,GV58LAU,00,2,33030,0,0.0,61,106.5,,,20220907111355,,,,,05,12,210000,00037:29:43,0.0,20220907202356,2917$'
var igf = '+RESP:GTIGF,8020040100,866775051514578,,629,1,0.0,0,59.4,117.129073,31.839189,20220907111324,0460,0001,DE11,05FE6667,05,11,120000,,0.0,20220907191326,02BD$'
var vgf = '+RESP:GTVGF,8020040100,866775051514610,GV58LAU,00,2,179,0,0.0,0,56.7,117.129301,31.838517,20220905074304,0460,0001,DE11,05FE6667,05,0,110000,00009:23:37,0.0,20220905170424,02DA$'
var pnr = '+RESP:GTPNR,8020040100,866775050904879,GV58LAU,1,,,,,20200101000002,0000$'
var pfr = '+RESP:GTPFR,8020040100,866775050904879,GV58LAU,2,,,,,20220906112636,0054$'
var idn = '+RESP:GTIDN,8020040100,866775051514636,,,,0,17.3,99,44.7,117.131010,31.838832,20220907071625,0460,0000,550B,B7B1,00,2643.4,20220907151854,01E4$'
var str = '+RESP:GTSTR,8020040100,866775051514636,,,,1,48.0,268,42.7,117.131968,31.832302,20220907084327,0460,0000,550B,B366,00,2653.7,20220907164328,0300$'
var stp = '+RESP:GTSTP,8020040100,866775051514636,,,,0,9.2,43,61.4,117.130234,31.839280,20220907084643,0460,0000,550B,B1E2,05,12,210000,2655.0,20220907165003,0323$'
var lsp = '+RESP:GTLSP,8020040100,866775051514636,,,,1,0.0,218,50.5,117.133569,31.834964,20220907083954,0460,0000,550B,38A5,00,2653.2,20220907163955,02F1$'
var gsm = '+RESP:GTGSM,8020040100,866775051514578,GIR,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,0460,0001,DE11,5FE6667,30,00,20220907191946,02C7$'
var gss = '+RESP:GTGSS,8020040100,866775050904879,GV58LAU,0,0,21,,0,0.0,215,8.4,,,20220901011124,,,,,05,0,210101,20220901013917,3B1E$'
var dos = '+RESP:GTDOS,8020040100,866775051514636,,2,0,0,48.4,179,26.7,117.092124,31.816150,20220905015638,0460,0000,550B,6991,05,12,210000,20220905095638,3FEB$'
var rmd = '+RESP:GTRMD,8020040100,866775050902360,GV58LAU,0,0,8.2,352,84.0,,,20220901013520,,,,,01,0,20220901013546,278F$'
var bcs = '+RESP:GTBCS,8020040100,866775051514578,gv58lau,,3,0.0,0,100.5,117.129156,31.839346,20220907024239,0460,0001,DE10,027A4F1F,05,12,210101,0D03,TT123,110E74503C84,1,1,F7E776096185,,,,,20220907104240,0022$'
var bds = '+RESP:GTBDS,8020040100,866775051514578,,,1,0.0,0,129.2,117.129230,31.839215,20220907112802,0460,0001,DE11,05FE6667,05,12,210100,0D03,556,110E74503C84,0,1,7E1E1E09BE4A,0,,,,20220907192803,02DA$'
var baa = '+RESP:GTBAA,8020040100,866775051514156,GV58LAU,1,6,2,08,003F,WTH300,AC233FA3545E,1,3252,25,43,1,0.0,188,111.0,,,20220907112844,,,,,05,12,210302,20220907203845,BB93$'
var bid = '+RESP:GTBID,8020040100,866775051514255,GV58LAU,2,2,008A,CE9BFAF3A557,,2,0102030405060708090A,010203040A0B,2,008A,E0EEDAA9CE7C,,2,010203040A0B0B0B0B0B,010203040A0B,1,0.0,0,213.7,117.128742,31.838863,20220906051123,0460,0000,550B,0E9E30A5,01,10,20220906051124,14FE$'
var clt = '+RESP:GTCLT,8020040100,866775051514065,GV58LAU,0,00000000,00000000,00000080,,,203FFFFF,,2,H1230,2.46,709,50 ,77,,P97.60,,0,0.92,0.61,0.31,11.20,,,0442,,00,0.08,0.00,00FFFFFF,,,,,,,,,,,,,,,,,,,,,0000,0,0,,,,0,,,,,,,0460,0000,550B,0E9E30A5,00,20220711075221,676E$'
var svr = '+RESP:GTSVR,8020040100,866775051515393,GV58LAU,1,780541217821,7000000000000000000000,,1,0.0,165,69.4,117.129187,31.839292,20220830115238,0460,0000,550B,B7A9,01,12,20220830195240,1079$'
var dat1 = '+RESP:GTDAT,8020040100,866775051514578,,wretr,20220907193747,02EA$'
var dat2 = '+RESP:GTDAT,8020040100,866775051514578,,1,,,wretr,1,0.0,0,129.2,117.129230,31.839215,20220907113723,0460,0001,DE11,05FE6667,01,12,,,,,20220907193724,02E7$'

var fri_ = '+RESP:GTFRI,6E0504,868589060064048,,12173,10,3,1,0.0,198,17.6,-71.542960,-32.972193,20240123232112,0730,0001,13EE,0032A502,01,12,1,23.0,198,17.6,-71.542960,-32.972193,20240123232112,0730,0001,13EE,0032A502,01,15,1,0.0,198,17.6,-71.542960,-32.972193,20240123232122,0730,0001,13EE,0032A502,01,12,0.0,0000006:05:06,,,,57,210100,,,,20240123232124,2A27$'
var eri_ = '+RESP:GTERI,6E0504,868589060064048,,00000100,12141,10,2,1,0.0,72,21.1,-71.543877,-32.972460,20240425184703,0730,0001,13EE,0032A502,01,12,1,0.0,72,21.1,-71.543877,-32.972460,20240425184713,0730,0001,13EE,0032A502,01,12,0.0,0000012:47:07,,,,100,210100,0,1,00,13,0,00000001,4000,1,20240425184716,8A7A$'
var fri__ = '+RESP:GTFRI,8020040100,866775051514636,,,30,3,1,43.3,0,43.8,117.128727,31.838200,20220907084517,0460,0000,550B,3D93,02,3,1,43.3,0,43.8,117.128727,31.838200,20220907084517,0460,0000,550B,3D93,02,3,1,43.3,0,43.8,117.128727,31.838200,20220907084517,0460,0000,550B,3D93,02,3,2654.6,00012:09:13,,,,100,220000,,,,20220907164518,030E$'
var eri__ = '+RESP:GTERI,8020040100,866775050904879,GV58LAU,00000104,12639,12,3,1,0.0,184,97.5,,,20220907102510,,,,,01,10,1,0.0,184,97.5,,,20220907102510,,,,,01,10,1,0.0,184,97.5,,,20220907102510,,,,,01,10,0.0,00081:51:10,,,,100,410000,,0,203FFFFF,,,,,,,,,,,,,,,,,,,,,,,00FFFFFF,,,,,,,,,,,,,,,,,,,,,,,,,9,0,1,3,,001F,DU_100361,F022A2143F36,0,,,1,6,2,1A2E2AF0,003F,WTH300,AC233FA3545E,1,3252,26,42,2,1,0,,001F,TD_100109,FD6D3DE6D704,0,,,3,2,0,,001F,WTS300,78054101E641,0,,,4,1,0,0000008C,001F,TD_100114,D971858039B3,1,3500,24,5,2,0,0B8A1999,001F,WTS300,78054101E646,1,2954,25,7,10,1,,0017,DegreeT,EC6EC128DA26,0,,8,11,0,00000064,1007,MAG,D325C2B2A2F8,1,0,50,0,9,6,2,,003F,WTH300,AC233FA35461,0,,,,20220907193511,3449$'
var fri___ = '+RESP:GTFRI,271002,863457051607917,,13098,50,2,1,0.0,268,2269.3,-68.926107,-22.455379,20231204113757,0730,0003,2249,97D48,00,1,0.0,268,2269.3,-68.926107,-22.455379,20231204113806,0730,0003,2249,97D48,00,7602.5,00373:19:50,,,97,210300,,,,20231204113816,53FF$'
const raw = new Buffer(eri_)
console.log(queclink.parse(raw))
// queclink.parse(raw)