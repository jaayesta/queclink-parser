'use strict'

const { describe, it } = require('mocha')
const queclink = require('../src')
const utils = require('../src/utils')
const { expect } = require('chai')

describe('queclink-parzer', () => {
  describe('parse', () => {
    it('should return UNKNOWN', () => {
      const raw = Buffer.from(
        '$$B6869444005480041|AA$GPRMC,194329.000,A,3321.6735,S,07030.7640,W,0.00,0.00,090216,,,A*6C|02.1|01.3|01.7|000000000000|20160209194326|13981188|00000000|32D3A03F|0000|0.6376|0100|995F\r\n'
      )
      const data = queclink.parse(raw)
      expect(data.type).to.eql('UNKNOWN')
      expect(data.raw).to.eql(raw.toString())
    })

    it('should return command speed ok data', () => {
      const raw = Buffer.from(
        '+ACK:GTSPD,350302,867844003012625,,0018,20040101000148,0017$'
      )
      const data = queclink.parse(raw)
      expect(data.manufacturer).to.eql('queclink')
      expect(data.device).to.eql('Queclink-COMMAND-OK')
      expect(data.type).to.eql('ok')
      expect(data.command).to.eql('SETOVERSPEEDALARM')
      expect(data.message).to.eql('Ajuste de la alarma de exceso de velocidad')
      expect(data.serial).to.eql(24)
      expect(data.counter).to.eql(23)
    })

    it('should return command di ok data', () => {
      const raw = Buffer.from(
        '+ACK:GTOUT,350302,867844003012625,,0018,20040101000148,0017$'
      )
      const data = queclink.parse(raw)
      expect(data.manufacturer).to.eql('queclink')
      expect(data.device).to.eql('Queclink-COMMAND-OK')
      expect(data.type).to.eql('ok')
      expect(data.command).to.eql('SETIOSWITCH')
      expect(data.message).to.eql('Cambio de estado en las salidas digitales')
      expect(data.serial).to.eql(24)
      expect(data.counter).to.eql(23)
    })

    it('should return command clear mem ok data', () => {
      const raw = Buffer.from(
        '+ACK:GTRTO,350401,867844003101634,,RESET,005f,20161102204524,028C$'
      )
      const data = queclink.parse(raw)
      expect(data.manufacturer).to.eql('queclink')
      expect(data.device).to.eql('Queclink-COMMAND-OK')
      expect(data.type).to.eql('ok')
      expect(data.command).to.eql('CLEARBUF')
      expect(data.message).to.eql('Memoria interna vaciada')
      expect(data.serial).to.eql(95)
      expect(data.counter).to.eql(652)
    })

    it('should return command reboot ok data', () => {
      const raw = Buffer.from(
        '+ACK:GTRTO,350401,867844003101634,,REBOOT,0060,20161102204545,028F$'
      )
      const data = queclink.parse(raw)
      expect(data.manufacturer).to.eql('queclink')
      expect(data.device).to.eql('Queclink-COMMAND-OK')
      expect(data.type).to.eql('ok')
      expect(data.command).to.eql('REBOOT')
      expect(data.message).to.eql('Dispositivo Reiniciado')
      expect(data.serial).to.eql(96)
      expect(data.counter).to.eql(655)
    })

    it('should return GV300 data', () => {
      const raw = Buffer.from(
        '+RESP:GTFRI,060100,135790246811220,,,00,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,12345:12:34,,,80,210100,,,,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.raw).to.eql(raw.toString())
      expect(data.manufacturer).to.eql('queclink')
      expect(data.device).to.eql('Queclink-GV300')
      expect(data.type).to.eql('data')
      expect(data.imei).to.eql('135790246811220')
      expect(data.protocolVersion.raw).to.eql('060100')
      expect(data.protocolVersion.deviceType).to.eql('GV300')
      expect(data.protocolVersion.version).to.eql('1.0')
      expect(data.temperature).to.be.a('null')
      expect(data.history).to.equal(false)
      expect(data.sentTime).to.eql(new Date('2009-02-14T09:32:54.000Z'))
      expect(data.serialId).to.eql(4592)
      expect(data.alarm.type).to.eql('Gps')
      expect(data.loc.type).to.eql('Point')
      expect(data.loc.coordinates).to.eql([121.354335, 31.222073])
      expect(data.speed).to.eql(4.3)
      expect(data.gpsStatus).to.equal(true)
      expect(data.hdop).to.eql(1)
      expect(data.status.raw).to.eql('210100')
      expect(data.status.sos).to.equal(false)
      expect(data.status.input[1]).to.equal(true)
      expect(data.status.input[2]).to.equal(false)
      expect(data.status.input[3]).to.equal(false)
      expect(data.status.input[4]).to.equal(false)
      expect(data.status.output[1]).to.equal(false)
      expect(data.status.output[2]).to.equal(false)
      expect(data.status.output[3]).to.equal(false)
      expect(data.status.charge).to.equal(false)
      expect(data.azimuth).to.eql(92)
      expect(data.altitude).to.eql(70)
      expect(data.datetime).to.eql(new Date('2009-02-14T01:32:54.000Z'))
      expect(data.voltage.battery).to.eql(80)
      expect(data.voltage.inputCharge).to.be.a('null')
      expect(data.voltage.ada).to.be.a('null')
      expect(data.voltage.adb).to.be.a('null')
      expect(data.mcc).to.eql(460)
      expect(data.mnc).to.eql(0)
      expect(data.lac).to.eql(6360)
      expect(data.cid).to.eql(24897)
      expect(data.odometer).to.eql(2000)
      expect(data.hourmeter).to.eql('12345:12:34')
    })

    it('should return GV200 data', () => {
      const raw = Buffer.from(
        '+RESP:GTFRI,350302,867844003012625,,12401,10,1,0,0.0,0,816.1,-70.514613,-33.361280,20160811170821,0730,0002,7410,C789,00,0.0,00001:33:08,2788,702,137,08,00,,,20160811180025,07B8$'
      )
      const data = queclink.parse(raw)
      expect(data.raw).to.eql(raw.toString())
      expect(data.manufacturer).to.eql('queclink')
      expect(data.device).to.eql('Queclink-GV200')
      expect(data.type).to.eql('data')
      expect(data.imei).to.eql('867844003012625')
      expect(data.protocolVersion.raw).to.eql('350302')
      expect(data.protocolVersion.deviceType).to.eql('GV200')
      expect(data.protocolVersion.version).to.eql('3.2')
      expect(data.temperature).to.be.a('null')
      expect(data.history).to.equal(false)
      expect(data.sentTime).to.eql(new Date('2016-08-11T18:00:25.000Z'))
      expect(data.serialId).to.eql(1976)
      expect(data.alarm.type).to.eql('Gps')
      expect(data.loc.type).to.eql('Point')
      expect(data.loc.coordinates).to.eql([-70.514613, -33.36128])
      expect(data.speed).to.eql(0)
      expect(data.gpsStatus).to.equal(true)
      expect(data.hdop).to.eql(0)
      expect(data.status.raw).to.eql('0800')
      expect(data.status.sos).to.equal(false)
      expect(data.status.input[1]).to.equal(false)
      expect(data.status.input[2]).to.equal(false)
      expect(data.status.input[3]).to.equal(false)
      expect(data.status.input[4]).to.equal(true)
      expect(data.status.output[1]).to.equal(false)
      expect(data.status.output[2]).to.equal(false)
      expect(data.status.output[3]).to.equal(false)
      expect(data.status.output[4]).to.equal(false)
      expect(data.status.charge).to.equal(true)
      expect(data.azimuth).to.eql(0)
      expect(data.altitude).to.eql(816.1)
      expect(data.datetime).to.eql(new Date('2016-08-11T17:08:21.000Z'))
      expect(data.voltage.battery).to.be.a('null')
      expect(data.voltage.inputCharge).to.eql(12.401)
      expect(data.voltage.ada).to.eql(2.788)
      expect(data.voltage.adb).to.eql(0.702)
      expect(data.voltage.adc).to.eql(0.137)
      expect(data.mcc).to.eql(730)
      expect(data.mnc).to.eql(2)
      expect(data.lac).to.eql(29712)
      expect(data.cid).to.eql(51081)
      expect(data.odometer).to.eql(0)
      expect(data.hourmeter).to.eql('00001:33:08')
    })

    it('should return GMT100 data', () => {
      const raw = Buffer.from(
        '+RESP:GTFRI,080100,135790246811220,,,10,2,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,0,4.3,92,70.0,121.354335,31.222073,20090101000000,0460,0000,18d8,6141,00,2000.0,12345:12:34,,80,,,,,,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.raw).to.eql(raw.toString())
      expect(data.manufacturer).to.eql('queclink')
      expect(data.device).to.eql('Queclink-GMT100')
      expect(data.type).to.eql('data')
      expect(data.imei).to.eql('135790246811220')
      expect(data.protocolVersion.raw).to.eql('080100')
      expect(data.protocolVersion.deviceType).to.eql('GMT100')
      expect(data.protocolVersion.version).to.eql('1.0')
      expect(data.temperature).to.be.a('null')
      expect(data.history).to.equal(false)
      expect(data.sentTime).to.eql(new Date('2009-02-14T09:32:54.000Z'))
      expect(data.serialId).to.eql(4592)
      expect(data.alarm.type).to.eql('Gps')
      expect(data.loc.type).to.eql('Point')
      expect(data.loc.coordinates).to.eql([121.354335, 31.222073])
      expect(data.speed).to.eql(4.3)
      expect(data.gpsStatus).to.equal(true)
      expect(data.hdop).to.eql(1)
      expect(data.status.raw).to.eql('31.22207320090101000000')
      expect(data.status.sos).to.equal(false)
      expect(data.status.input[1]).to.equal(true)
      expect(data.status.input[2]).to.equal(true)
      expect(data.status.output[1]).to.equal(false)
      expect(data.status.output[2]).to.equal(true)
      expect(data.status.charge).to.equal(false)
      expect(data.azimuth).to.eql(92)
      expect(data.altitude).to.eql(70)
      expect(data.datetime).to.eql(new Date('2009-02-14T01:32:54.000Z'))
      expect(data.voltage.battery).to.eql(121.354335)
      expect(data.voltage.inputCharge).to.be.a('null')
      expect(data.voltage.ada).to.eql(0.092)
      expect(data.mcc).to.eql(460)
      expect(data.mnc).to.eql(0)
      expect(data.lac).to.eql(6360)
      expect(data.cid).to.eql(24897)
      expect(data.odometer).to.eql(0)
    })
  })

  describe('isQueclink', () => {
    it('should return true', () => {
      const raw = Buffer.from(
        '+RESP:GTFRI,350302,867844003012625,,12401,10,1,0,0.0,0,816.1,-70.514613,-33.361280,20160811170821,0730,0002,7410,C789,00,0.0,00001:33:08,2788,702,137,08,00,,,20160811180025,07B8$'
      )
      const data = queclink.isQueclink(raw)
      expect(data).to.equal(true)
    })

    it('should return false', () => {
      const raw = Buffer.from(
        '$$B6869444005480041|AA$GPRMC,194329.000,A,3321.6735,S,07030.7640,W,0.00,0.00,090216,,,A*6C|02.1|01.3|01.7|000000000000|20160209194326|13981188|00000000|32D3A03F|0000|0.6376|0100|995F\r\n'
      )
      const data = queclink.isQueclink(raw)
      expect(data).to.equal(false)
    })
  })

  describe('isHeartBeat', () => {
    it('should return true', () => {
      const raw = Buffer.from(
        '+ACK:GTHBD,350302,867844003012625,,20160811203854,0859$'
      )
      const data = queclink.isHeartBeat(raw)
      expect(data).to.equal(true)
    })

    it('should return false', () => {
      const raw = Buffer.from(
        '+RESP:GTFRI,350302,867844003012625,,12401,10,1,0,0.0,0,816.1,-70.514613,-33.361280,20160811170821,0730,0002,7410,C789,00,0.0,00001:33:08,2788,702,137,08,00,,,20160811180025,07B8$'
      )
      const data = queclink.isHeartBeat(raw)
      expect(data).to.equal(false)
    })
  })

  describe('getAckHeartBeat', () => {
    it('should return raw ACK', () => {
      const protocolVersion = '350302'
      const count = 32
      const raw = queclink.getAckHeartBeat(protocolVersion, count)
      expect(raw).to.eql('+SACK:GTHBD,350302,32$')
    })
  })

  describe('getRebootCommand', () => {
    it('should return raw REBOOT', () => {
      const password = '000000'
      const serial = 32
      const raw = queclink.getRebootCommand(password, serial)
      expect(raw).to.eql('AT+GTRTO=000000,3,,,,,,32$')
    })
  })

  describe('parseCommand', () => {
    it('should return raw di on command GV serie', () => {
      const data = {
        password: '101010',
        serial: 4112,
        instruction: '2_on',
        device_serie: 'GV',
        previousOutput: {
          '1': true,
          '2': false,
          '3': false,
          '4': true
        }
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql('AT+GTOUT=101010,1,0,0,1,0,0,0,0,0,1,0,0,0,0,,,1010$')
    })
    it('should return raw di on command GMT serie', () => {
      const data = {
        password: '101010',
        serial: 4112,
        instruction: '2_on',
        device_serie: 'GMT',
        previousOutput: {
          '1': true,
          '2': false,
          '3': false,
          '4': true
        }
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql('AT+GTOUT=101010,1,0,0,0,0,0,,,,,,,,1010$')
    })

    it('should return raw di off command GV serie', () => {
      const data = {
        password: '101010',
        serial: 4112,
        instruction: '2_off',
        device_serie: 'GV',
        previousOutput: {
          '1': true,
          '2': false,
          '3': false,
          '4': true
        }
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql('AT+GTOUT=101010,1,0,0,0,0,0,0,0,0,1,0,0,0,0,,,1010$')
    })
    it('should return raw di off command GMT serie', () => {
      const data = {
        password: '101010',
        serial: 4112,
        instruction: '1_off',
        device_serie: 'GMT',
        previousOutput: {
          '1': true,
          '2': false,
          '3': false,
          '4': true
        }
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql('AT+GTOUT=101010,0,0,0,0,0,0,,,,,,,,1010$')
    })

    it('should return raw di on with duration command', () => {
      const data = {
        password: '101010',
        serial: 4112,
        instruction: '2_on',
        previousOutput: {
          '1': false,
          '2': true,
          '3': false,
          '4': false
        },
        previousDuration: {
          '1': 0,
          '2': 15,
          '3': 0,
          '4': 0
        },
        previousToggle: {
          '1': 0,
          '2': 1,
          '3': 0,
          '4': 0
        }
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql('AT+GTOUT=101010,0,0,0,1,15,1,0,0,0,0,0,0,0,0,,,1010$')
    })

    it('should return raw clear mem command GV serie', () => {
      const data = {
        password: '202020',
        serial: 8224,
        instruction: 'clear_mem',
        device_serie: 'GV'
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql('AT+GTRTO=202020,4,BUF,,,,,2020$')
    })
    it('should return raw clear mem command GMT serie', () => {
      const data = {
        password: '202020',
        serial: 8224,
        instruction: 'clear_mem',
        device_serie: 'GMT'
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql('AT+GTRTO=202020,D,,,,,,2020$')
    })

    it('should return raw set speed on command GV serie', () => {
      const data = {
        password: '303030',
        serial: 12336,
        instruction: 'set_speed_on',
        speed: 150,
        times: 10,
        interval: 300,
        device_serie: 'GV'
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql(
        'AT+GTSPD=303030,4,0,150,10,300,0,0,0,0,,,,,,,,,,,,3030$'
      )
    })
    it('should return raw set speed on command GMT serie', () => {
      const data = {
        password: '303030',
        serial: 12336,
        instruction: 'set_speed_on',
        speed: 150,
        times: 10,
        interval: 300,
        device_serie: 'GMT'
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql(
        'AT+GTSPD=303030,3,0,150,10,300,0,0,0,0,,,,,,,,,,,,3030$'
      )
    })
    it('should return raw set speed on command gv55', () => {
      const data = {
        password: 'gv55',
        serial: 12336,
        instruction: 'set_speed_on',
        speed: 150,
        times: 10,
        interval: 300,
        device_serie: 'GV'
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql(
        'AT+GTSPD=gv55,3,0,150,10,300,0,0,0,0,,,,,,,,,,,,3030$'
      )
    })

    it('should return raw set speed off command GV serie', () => {
      const data = {
        password: '303030',
        serial: 12336,
        instruction: 'set_speed_off',
        speed: 150,
        times: 10,
        interval: 300,
        device_serie: 'GV'
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql(
        'AT+GTSPD=303030,0,0,150,10,300,0,0,0,0,,,,,,,,,,,,3030$'
      )
    })
    it('should return raw set temp alarm on command', () => {
      const data = {
        password: '303030',
        serial: 12336,
        instruction: 'temp_alarm_on',
        sensorId: '28FF96B5A2150187',
        alarmId: 0,
        minTemp: -30,
        maxTemp: -20
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql(
        'AT+GTTMP=303030,0,3,28FF96B5A2150187,,,-30,-20,,,2,10,,,0,0,0,0,,,,,3030$'
      )
    })
    it('should return raw set temp alarm off command', () => {
      const data = {
        password: '303030',
        serial: 12336,
        instruction: 'temp_alarm_off',
        sensorId: '28FF96B5A2150187',
        alarmId: 0,
        minTemp: -30,
        maxTemp: -20
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql(
        'AT+GTTMP=303030,0,0,28FF96B5A2150187,,,-30,-20,,,2,10,,,0,0,0,0,,,,,3030$'
      )
    })
    it('should return raw set speed off command GMT serie', () => {
      const data = {
        password: '303030',
        serial: 12336,
        instruction: 'set_speed_off',
        speed: 150,
        times: 10,
        interval: 300,
        device_serie: 'GMT'
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql(
        'AT+GTSPD=303030,0,0,150,10,300,0,0,0,0,,,,,,,,,,,,3030$'
      )
    })

    it('should return raw custom command', () => {
      const data = {
        instruction: 'Custom',
        command: 'AT+GTSPD=303030,0,0,150,10,300,1,1,0,0,,,,,,,,,,,,3030$'
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql(
        'AT+GTSPD=303030,0,0,150,10,300,1,1,0,0,,,,,,,,,,,,3030$'
      )
    })

    it('should return raw custom command', () => {
      const data = {
        password: '404040',
        serial: 16448,
        instruction: 'reboot'
      }
      const raw = queclink.parseCommand(data)
      expect(raw).to.eql('AT+GTRTO=404040,3,,,,,,4040$')
    })
  })

  describe('getImei', () => {
    it('should return null imei', () => {
      const raw = Buffer.from(
        '$$B6869444005480041|AA$GPRMC,194329.000,A,3321.6735,S,07030.7640,W,0.00,0.00,090216,,,A*6C|02.1|01.3|01.7|000000000000|20160209194326|13981188|00000000|32D3A03F|0000|0.6376|0100|995F\r\n'
      )
      const imei = queclink.getImei(raw)
      expect(imei).to.be.a('null')
    })

    it('should return valid imei', () => {
      const raw = Buffer.from(
        '+ACK:GTSPD,350302,867844003012625,,0018,20040101000148,0017$'
      )
      const imei = queclink.getImei(raw)
      expect(imei).to.eq('867844003012625')
    })
  })

  describe('alarms', () => {
    it('should return GTDIS alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTDIS,060100,135790246811220,,,20,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('DI')
      expect(data.alarm.number).to.eq(2)
      expect(data.alarm.status).to.equal(false)
      expect(data.alarm.message).to.eq('Entrada digital 2 desactivada')
    })
    it('should return GTTOW alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTTOW,060100,135790246811220,,,10,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Towing')
      expect(data.alarm.message).to.eq('Vehículo remolcado')
    })
    it('should return GTSOS alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTSOS,060100,135790246811220,,,00,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('SOS_Button')
      expect(data.alarm.message).to.eq('Botón SOS presionado')
    })
    it('should return GTSPD alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTSPD,060100,135790246811220,,,00,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Over_Speed')
      expect(data.alarm.status).to.equal(true)
      expect(data.alarm.message).to.eq('Exceso de Velocidad')
    })
    it('should return GTIGL alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTIGL,060100,135790246811220,,,00,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('DI')
      expect(data.alarm.number).to.eq(1)
      expect(data.alarm.status).to.equal(true)
      expect(data.alarm.message).to.eq('Entrada digital 1 activada')
    })
    it('should return GTIGF alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTIGF,060100,135790246811220,,1200,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,12345:12:34,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('DI')
      expect(data.alarm.number).to.eq(1)
      expect(data.alarm.status).to.equal(false)
      expect(data.alarm.message).to.eq('Entrada digital 1 desactivada')
    })
    it('should return GTPNA alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTPNA,060100,135790246811220,,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Power')
      expect(data.alarm.status).to.equal(true)
      expect(data.alarm.message).to.eq('Dispositivo Encendido')
    })
    it('should return GTPFA alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTPFA,060100,135790246811220,,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Power')
      expect(data.alarm.status).to.equal(false)
      expect(data.alarm.message).to.eq('Dispositivo Apagado')
    })
    it('should return GTMPN alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTMPN,060100,135790246811220,,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Charge')
      expect(data.alarm.status).to.equal(true)
      expect(data.alarm.message).to.eq('Conectado a la fuente de poder')
    })
    it('should return GTMPF alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTMPF,060100,135790246811220,,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Charge')
      expect(data.alarm.status).to.equal(false)
      expect(data.alarm.message).to.eq('Desconectado de la fuente de poder')
    })
    it('should return GTSTC alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTSTC,060100,135790246811220,,,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Charging')
      expect(data.alarm.status).to.equal(false)
      expect(data.alarm.message).to.eq('Se dejo de cargar batería')
    })
    it('should return GTBPL alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTBPL,060100,135790246811220,,3.53,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Low_Battery')
      expect(data.alarm.message).to.eq('Batería baja')
    })
    it('should return GTIDN alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTIDN,060100,135790246811220,,,,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Idling')
      expect(data.alarm.status).to.equal(true)
      expect(data.alarm.message).to.eq('Vehículo en Ralenti')
    })
    it('should return GTIDF alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTIDF,060100,135790246811220,,22,300,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Idling')
      expect(data.alarm.status).to.equal(false)
      expect(data.alarm.message).to.eq('Vehículo fuera de Ralenti')
    })
    it('should return GTJDS alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTJDS,040408,135790246811220,,2,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Jamming')
      expect(data.alarm.status).to.equal(true)
      expect(data.alarm.message).to.eq('Vehículo Jammeado')
    })
    it('should return GTJDR alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTJDR,040408,135790246811220,,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Jamming')
      expect(data.alarm.status).to.equal(true)
      expect(data.alarm.message).to.eq('Vehículo Jammeado')
    })
    it('should return GTEPS alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTEPS,060100,135790246811220,,13500,00,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('External_Low_battery')
      expect(data.alarm.message).to.eq('Batería de Fuente de Poder Baja')
    })
    it('should return GTMAI alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTMAI,040100,135790246811220,,1980,11,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('AI')
      expect(data.alarm.number).to.eq(1)
      expect(data.alarm.status).to.equal(false)
    })
    it('should return GTAIS alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTAIS,040100,135790246811220,,13500,00,1,1,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('AI')
      expect(data.alarm.number).to.eq(0)
      expect(data.alarm.status).to.equal(false)
    })
    it('should return GTANT alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTANT,040100,135790246811220,,0,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('GPS_Antena')
      expect(data.alarm.status).to.equal(true)
      expect(data.alarm.message).to.eq('Antena GPS conectada')
    })
    it('should return GTSTR alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTSTR,060100,135790246811220,,,,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Vehicle_Start_Status')
      expect(data.alarm.status).to.equal(true)
      expect(data.alarm.message).to.eq('Partida de vehículo iniciada')
    })
    it('should return GTLSP alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTLSP,060100,135790246811220,,,,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Vehicle_Start_Status')
      expect(data.alarm.status).to.equal(false)
      expect(data.alarm.message).to.eq('Partida de vehículo finalizada')
    })
    it('should return GTSTP alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTSTP,060100,135790246811220,,,,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,2000.0,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Vehicle_Start_Status')
      expect(data.alarm.status).to.equal(false)
      expect(data.alarm.message).to.eq('Partida de vehículo finalizada')
    })
    it('should return GTRMD alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTRMD,060228,862170011507322,,1,0,0.0,0,83.9,117.201281,31.833017,20130917071326,0460,0000,5678,2079,00,20130917071330,00A4$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Roaming')
      expect(data.alarm.status).to.equal(true)
      expect(data.alarm.message).to.eq('Roaming activado')
    })
    it('should return GTSTT alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTSTT,060100,135790246811220,,16,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Motion_State_Changed')
      expect(data.alarm.message).to.eq('Movimiento de dispositivo detectado')
    })
    it('should return GTPDP alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTPDP,060100,135790246811220,,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('GPRS_Connection_Established')
      expect(data.alarm.message).to.eq('Conexión GPRS establecida')
    })
    it('should return GTGSS alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTGSS,060100,135790246811220,,1,9,11,,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Gps_Status')
      expect(data.alarm.status).to.equal(true)
      expect(data.alarm.message).to.eq('Señal GPS recuperada')
    })
    it('should return GTGSS alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTGSS,060100,135790246811220,,0,9,11,,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Gps_Status')
      expect(data.alarm.status).to.equal(false)
      expect(data.alarm.message).to.eq('Sin señal GPS')
    })
    it('should return GTTMP alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTTMP,04040B,862170013467608,NMX_Beta,,0,31,1,0,0.4,0,2.2,121.390957,31.164567,20130115083120,0460,0000,1877,0873,00,0.0,00000:00:00,2791,2639,2691,09,09,,,,28967B41040000F1,,25,20130115163122,01AA$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Outside_Temperature')
      expect(data.alarm.number).to.eq(3)
      expect(data.alarm.status).to.equal(false)
      expect(data.alarm.message).to.eq('Regreso a temperatura dentro de rango')
    })
    it('should return GTFLA alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTFLA,040408,135790246811220,,2,92,70,0,4.3,92,70.0,121.354335,31.222073,20090214013254,0460,0000,18d8,6141,00,20090214093254,11F0$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Unusual_Fuel_Consumption')
      expect(data.alarm.status).to.eq(22)
      expect(data.alarm.message).to.eq('Combustible reducido en 22%')
    })
    it('should return GTIDA alarm', () => {
      const raw = Buffer.from(
        '+RESP:GTIDA,06020A,862170013895931,,,D2C4FBC5,1,1,1,0.8,0,22.2,117.198630,31.845229,20120802121626,0460,0000,5663,2BB9,00,0.0,,,,,20120802121627,008E$'
      )
      const data = queclink.parse(raw)
      expect(data.alarm.type).to.eq('Driver_Identification')
      expect(data.alarm.driverID).to.eq('D2C4FBC5')
      expect(data.alarm.status).to.equal(true)
      expect(data.alarm.message).to.eq('Conductor identificado autorizado')
    })

    it('should return UNKNOWN if strange GV200 data', () => {
      const raw = Buffer.from(
        '+RESP:GTFRI,350302,867844003012625,,12401,10,1,0,0.0,0,816.1,-70.514613,-33.361280,20160811170821,0730,0002,7410,C789,00,0.0,00001:33:08,2788,702,137B8$'
      )
      const data = queclink.parse(raw)
      expect(data.raw).to.eql(raw.toString())
      expect(data.type).to.eql('UNKNOWN')
    })

    it('should return a date', () => {
      const date = utils.parseDate('20160811170821')
      expect(date).to.eql(new Date('2016-08-11T17:08:21+00:00'))
    })
  })
})
