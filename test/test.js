'use strict';

const queclink = require('../src');
const expect = require('chai').expect;

describe('queclink-parzer', () => {
  describe('parse', () => {
    it('should return UNKNOWN', () => {
      const raw = new Buffer('$$B6869444005480041|AA$GPRMC,194329.000,A,3321.6735,S,07030.7640,W,0.00,0.00,090216,,,A*6C|02.1|01.3|01.7|000000000000|20160209194326|13981188|00000000|32D3A03F|0000|0.6376|0100|995F\r\n');
      const data = queclink.parse(raw);
      expect(data.type).to.eql('UNKNOWN');
      expect(data.raw).to.eql(raw.toString());
    });

    it('should return command speed ok data', () => {
      const raw = new Buffer('+ACK:GTSPD,350302,867844003012625,,0018,20040101000148,0017$');
      const data = queclink.parse(raw);
      expect(data.device).to.eql('Queclink-COMMAND-OK');
      expect(data.type).to.eql('ok');
      expect(data.command).to.eql('SETOVERSPEEDALARM');
      expect(data.serial).to.eql('0017');
    });

    it('should return command di ok data', () => {
      const raw = new Buffer('+ACK:GTOUT,350302,867844003012625,,0018,20040101000148,0017$');
      const data = queclink.parse(raw);
      expect(data.device).to.eql('Queclink-COMMAND-OK');
      expect(data.type).to.eql('ok');
      expect(data.command).to.eql('SETIOSWITCH');
      expect(data.serial).to.eql('0017');
    });

    it('should return command clear mem ok data', () => {
      const raw = new Buffer('+ACK:GTRTO,350302,867844003012625,,0018,20040101000148,0017$');
      const data = queclink.parse(raw);
      expect(data.device).to.eql('Queclink-COMMAND-OK');
      expect(data.type).to.eql('ok');
      expect(data.command).to.eql('CLEARBUF');
      expect(data.serial).to.eql('0017');
    });

    it('should return GV300 data', () => {
      const raw = new Buffer('+RESP:GTFRI,060100,135790246811220,,,00,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,12345:12:34,,,80,210100,,,,20090214093254,11F0$');
      const data = queclink.parse(raw);
      expect(data.raw).to.eql(raw.toString());
      expect(data.device).to.eql('Queclink-GV300');
      expect(data.type).to.eql('data');
      expect(data.imei).to.eql('135790246811220');
      expect(data.protocolVersion.raw).to.eql('060100');
      expect(data.protocolVersion.deviceType).to.eql('GV300');
      expect(data.protocolVersion.version).to.eql('1.0');
      expect(data.temperature).to.be.null;
      expect(data.history).to.be.false;
      expect(data.sentTime).to.eql(new Date('2009-02-14T09:32:54.000Z'));
      expect(data.serialId).to.eql(4592);
      expect(data.alarm.type).to.eql('Gps');
      expect(data.loc.type).to.eql('Point');
      expect(data.loc.coordinates).to.eql([121.354335, 31.222073]);
      expect(data.speed).to.eql(4.3);
      expect(data.gpsStatus).to.be.a.true;
      expect(data.hdop).to.eql(1);
      expect(data.status.raw).to.eql('210100');
      expect(data.status.sos).to.be.false;
      expect(data.status.input[1]).to.be.true;
      expect(data.status.input[2]).to.be.false;
      expect(data.status.input[3]).to.be.false;
      expect(data.status.input[4]).to.be.false;
      expect(data.status.output[1]).to.be.false;
      expect(data.status.output[2]).to.be.false;
      expect(data.status.output[3]).to.be.false;
      expect(data.status.charge).to.be.false;
      expect(data.status.tow).to.be.false;
      expect(data.azimuth).to.eql(92);
      expect(data.altitude).to.eql(70);
      expect(data.datetime).to.eql(new Date('2009-02-14T01:32:54.000Z'));
      expect(data.voltage.battery).to.eql(80);
      expect(data.voltage.inputCharge).to.be.null;
      expect(data.voltage.ada).to.be.null;
      expect(data.voltage.adb).to.be.null;
      expect(data.mcc).to.eql(460);
      expect(data.mnc).to.eql(0);
      expect(data.lac).to.eql(6360);
      expect(data.cid).to.eql(24897);
      expect(data.odometer).to.eql(2000);
      expect(data.hourmeter).to.eql('12345:12:34');
    });

    it('should return GV200 data', () => {
      const raw = new Buffer('+RESP:GTFRI,350302,867844003012625,,12401,10,1,0,0.0,0,816.1,-70.514613,-33.361280,20160811170821,0730,0002,7410,C789,00,0.0,00001:33:08,2788,702,137,08,00,,,20160811180025,07B8$');
      const data = queclink.parse(raw);
      expect(data.raw).to.eql(raw.toString());
      expect(data.device).to.eql('Queclink-GV200');
      expect(data.type).to.eql('data');
      expect(data.imei).to.eql('867844003012625');
      expect(data.protocolVersion.raw).to.eql('350302');
      expect(data.protocolVersion.deviceType).to.eql('GV200');
      expect(data.protocolVersion.version).to.eql('3.2');
      expect(data.temperature).to.be.null;
      expect(data.history).to.be.false;
      expect(data.sentTime).to.eql(new Date('2016-08-11T18:00:25.000Z'));
      expect(data.serialId).to.eql(1976);
      expect(data.alarm.type).to.eql('Gps');
      expect(data.loc.type).to.eql('Point');
      expect(data.loc.coordinates).to.eql([-70.514613, -33.36128]);
      expect(data.speed).to.eql(0);
      expect(data.gpsStatus).to.be.a.true;
      expect(data.hdop).to.eql(0);
      expect(data.status.raw).to.eql('0800');
      expect(data.status.sos).to.be.false;
      expect(data.status.input[1]).to.be.true;
      expect(data.status.input[2]).to.be.false;
      expect(data.status.input[3]).to.be.false;
      expect(data.status.input[4]).to.be.false;
      expect(data.status.output[1]).to.be.false;
      expect(data.status.output[2]).to.be.false;
      expect(data.status.output[3]).to.be.false;
      expect(data.status.output[4]).to.be.false;
      expect(data.status.charge).to.be.true;
      expect(data.azimuth).to.eql(0);
      expect(data.altitude).to.eql(816.1);
      expect(data.datetime).to.eql(new Date('2016-08-11T17:08:21.000Z'));
      expect(data.voltage.battery).to.be.null;
      expect(data.voltage.inputCharge).to.eql(12.401);
      expect(data.voltage.ada).to.eql(2.788);
      expect(data.voltage.adb).to.eql(0.702);
      expect(data.voltage.adc).to.eql(0.137);
      expect(data.mcc).to.eql(730);
      expect(data.mnc).to.eql(2);
      expect(data.lac).to.eql(29712);
      expect(data.cid).to.eql(51081);
      expect(data.odometer).to.eql(0);
      expect(data.hourmeter).to.eql('00001:33:08');
    });

    it('should return GMT100 data', () => {
      const raw = new Buffer('+RESP:GTFRI,080100,135790246811220,,,10,2,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,0,4.3,92,70.0,121.354335,31.222073,20090101000000,0460,0000,18d8,6141,00,2000.0,12345:12:34,,80,,,,,,20090214093254,11F0$');
      const data = queclink.parse(raw);
      expect(data.raw).to.eql(raw.toString());
      expect(data.device).to.eql('Queclink-GMT100');
      expect(data.type).to.eql('data');
      expect(data.imei).to.eql('135790246811220');
      expect(data.protocolVersion.raw).to.eql('080100');
      expect(data.protocolVersion.deviceType).to.eql('GMT100');
      expect(data.protocolVersion.version).to.eql('1.0');
      expect(data.temperature).to.be.null;
      expect(data.history).to.be.false;
      expect(data.sentTime).to.eql(new Date('2009-02-14T09:32:54.000Z'));
      expect(data.serialId).to.eql(4592);
      expect(data.alarm.type).to.eql('Gps');
      expect(data.loc.type).to.eql('Point');
      expect(data.loc.coordinates).to.eql([121.354335, 31.222073]);
      expect(data.speed).to.eql(4.3);
      expect(data.gpsStatus).to.be.a.true;
      expect(data.hdop).to.eql(1);
      expect(data.status.raw).to.eql('31.22207320090101000000');
      expect(data.status.sos).to.be.false;
      expect(data.status.input[1]).to.be.true;
      expect(data.status.input[2]).to.be.false;
      expect(data.status.output[1]).to.be.false;
      expect(data.status.output[2]).to.be.false;
      expect(data.status.charge).to.be.false;
      expect(data.azimuth).to.eql(92);
      expect(data.altitude).to.eql(70);
      expect(data.datetime).to.eql(new Date('2009-02-14T01:32:54.000Z'));
      expect(data.voltage.battery).to.eql(121.354335);
      expect(data.voltage.inputCharge).to.be.null;
      expect(data.voltage.ada).to.eql(92);
      expect(data.voltage.adb).to.be.null;
      expect(data.mcc).to.eql(460);
      expect(data.mnc).to.eql(0);
      expect(data.lac).to.eql(6360);
      expect(data.cid).to.eql(24897);
      expect(data.odometer).to.eql(0);
    });
  });

  describe('isQueclink', () => {
    it('should return true', () => {
      const raw = new Buffer('+RESP:GTFRI,350302,867844003012625,,12401,10,1,0,0.0,0,816.1,-70.514613,-33.361280,20160811170821,0730,0002,7410,C789,00,0.0,00001:33:08,2788,702,137,08,00,,,20160811180025,07B8$');
      const data = queclink.isQueclink(raw);
      expect(data).to.be.true;
    });

    it('should return false', () => {
      const raw = new Buffer('$$B6869444005480041|AA$GPRMC,194329.000,A,3321.6735,S,07030.7640,W,0.00,0.00,090216,,,A*6C|02.1|01.3|01.7|000000000000|20160209194326|13981188|00000000|32D3A03F|0000|0.6376|0100|995F\r\n');
      const data = queclink.isQueclink(raw);
      expect(data).to.be.false;
    });
  });

  describe('isHeartBeat', () => {
    it('should return true', () => {
      const raw = new Buffer('+ACK:GTHBD,350302,867844003012625,,20160811203854,0859$');
      const data = queclink.isHeartBeat(raw);
      expect(data).to.be.true;
    });

    it('should return false', () => {
      const raw = new Buffer('+RESP:GTFRI,350302,867844003012625,,12401,10,1,0,0.0,0,816.1,-70.514613,-33.361280,20160811170821,0730,0002,7410,C789,00,0.0,00001:33:08,2788,702,137,08,00,,,20160811180025,07B8$');
      const data = queclink.isHeartBeat(raw);
      expect(data).to.be.false;
    });
  });

  describe('getAckHeartBeat', () => {
    it('should return raw ACK', () => {
      const protocolVersion = '350302';
      const count = 32;
      const raw = queclink.getAckHeartBeat(protocolVersion, count);
      expect(raw).to.eql('+SACK:GTHBD,350302,32$');
    });
  });

  describe('getRebootCommand', () => {
    it('should return raw REBOOT', () => {
      const password = '000000';
      const serial = 32;
      const raw = queclink.getRebootCommand(password, serial);
      expect(raw).to.eql('AT+GTRTO=000000,3,,,,,,32$');
    });
  });

  describe('parseCommand', () => {
    it('should return raw di on command', () => {
      const data = {
        password: '101010',
        serial: 4112,
        instruction: '2_on',
        previousOutput: {
          '1': true,
          '2': false,
          '3': false,
          '4': true
        }
      };
      const raw = queclink.parseCommand(data);
      expect(raw).to.eql('AT+GTOUT=101010,1,0,0,1,0,0,0,0,0,1,0,0,0,0,,,1010$');
    });

    it('should return raw di off command', () => {
      const data = {
        password: '101010',
        serial: 4112,
        instruction: '2_off',
        previousOutput: {
          '1': true,
          '2': false,
          '3': false,
          '4': true
        }
      };
      const raw = queclink.parseCommand(data);
      expect(raw).to.eql('AT+GTOUT=101010,1,0,0,0,0,0,0,0,0,1,0,0,0,0,,,1010$');
    });

    it('should return raw clear mem command', () => {
      const data = {
        password: '202020',
        serial: 8224,
        instruction: 'clear_mem'
      };
      const raw = queclink.parseCommand(data);
      expect(raw).to.eql('AT+GTRTO=202020,4,BUF,,,,,2020$');
    });

    it('should return raw set speed on command', () => {
      const data = {
        password: '303030',
        serial: 12336,
        instruction: 'set_speed_on',
        speed: 150,
        times: 10,
        interval: 300
      };
      const raw = queclink.parseCommand(data);
      expect(raw).to.eql('AT+GTSPD=303030,4,0,150,10,300,1,1,0,0,,,,,,,,,,,,3030$');
    });

    it('should return raw set speed off command', () => {
      const data = {
        password: '303030',
        serial: 12336,
        instruction: 'set_speed_off',
        speed: 150,
        times: 10,
        interval: 300
      };
      const raw = queclink.parseCommand(data);
      expect(raw).to.eql('AT+GTSPD=303030,0,0,150,10,300,1,1,0,0,,,,,,,,,,,,3030$');
    });

    it('should return raw custom command', () => {
      const data = {
        instruction: 'Custom',
        command: 'AT+GTSPD=303030,0,0,150,10,300,1,1,0,0,,,,,,,,,,,,3030$'
      };
      const raw = queclink.parseCommand(data);
      expect(raw).to.eql('AT+GTSPD=303030,0,0,150,10,300,1,1,0,0,,,,,,,,,,,,3030$');
    });

    it('should return raw custom command', () => {
      const data = {
        password: '404040',
        serial: 16448,
        instruction: 'reboot'
      };
      const raw = queclink.parseCommand(data);
      expect(raw).to.eql('AT+GTRTO=404040,3,,,,,,4040$');
    });

  });

  describe('getImei', () => {
    it('should return null imei', () => {
      const raw = new Buffer('$$B6869444005480041|AA$GPRMC,194329.000,A,3321.6735,S,07030.7640,W,0.00,0.00,090216,,,A*6C|02.1|01.3|01.7|000000000000|20160209194326|13981188|00000000|32D3A03F|0000|0.6376|0100|995F\r\n');
      const imei = queclink.getImei(raw);
      expect(imei).to.be.null;
    });

    it('should return valid imei', () => {
      const raw = new Buffer('+ACK:GTSPD,350302,867844003012625,,0018,20040101000148,0017$');
      const imei = queclink.getImei(raw);
      expect(imei).to.eq('867844003012625');
    });
  });
});
