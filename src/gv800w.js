'use strict'
const utils = require('./utils.js')

/*
  Parses messages data from GV800W devices
*/
const parse = raw => {
  raw = raw.substr(0, raw.length - 1)

  const parsedData = raw.split(',')
  const command = parsedData[0].split(':')

  let history = false
  if (utils.patterns.buffer.test(command[0])) {
    history = true
  }

  let data = {
    raw: `${raw.toString()}$`,
    manufacturer: 'queclink',
    device: 'Queclink-GV800W',
    type: 'data',
    imei: parsedData[2],
    protocolVersion: utils.getProtocolVersion(parsedData[1]),
    temperature: null,
    history: history,
    sentTime: utils.parseDate(parsedData[parsedData.length - 2]),
    serialId: parseInt(parsedData[parsedData.length - 1], 16)
  }

  // Gps
  if (command[1] === 'GTFRI') {
    try {
      data = Object.assign(data, {
        alarm: utils.getAlarm(command[1], null),
        loc: {
          type: 'Point',
          coordinates: [parseFloat(parsedData[11]), parseFloat(parsedData[12])]
        },
        speed: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
        gpsStatus: utils.checkGps(
          parseFloat(parsedData[11]),
          parseFloat(parsedData[12])
        ),
        hdop: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
        status: {
          // parsedData[24]
          raw: parsedData[26],
          sos: false,
          input: {
            '1':
              utils.nHexDigit(
                utils.hex2bin(parsedData[26].substring(2, 4)),
                6
              )[5] === '1',
            '2':
              utils.nHexDigit(
                utils.hex2bin(parsedData[26].substring(2, 4)),
                6
              )[4] === '1',
            '3':
              utils.nHexDigit(
                utils.hex2bin(parsedData[26].substring(2, 4)),
                6
              )[3] === '1',
            '4':
              utils.nHexDigit(
                utils.hex2bin(parsedData[26].substring(2, 4)),
                6
              )[2] === '1',
            '5':
              utils.nHexDigit(
                utils.hex2bin(parsedData[26].substring(2, 4)),
                6
              )[1] === '1',
            '6':
              utils.nHexDigit(
                utils.hex2bin(parsedData[26].substring(2, 4)),
                6
              )[0] === '1'
          },
          output: {
            '1':
              utils.nHexDigit(
                utils.hex2bin(parsedData[26].substring(4, 6)),
                5
              )[4] === '1',
            '2':
              utils.nHexDigit(
                utils.hex2bin(parsedData[26].substring(4, 6)),
                5
              )[3] === '1',
            '3':
              utils.nHexDigit(
                utils.hex2bin(parsedData[26].substring(4, 6)),
                5
              )[2] === '1',
            '4':
              utils.nHexDigit(
                utils.hex2bin(parsedData[26].substring(4, 6)),
                5
              )[1] === '1',
            '5':
              utils.nHexDigit(
                utils.hex2bin(parsedData[26].substring(4, 6)),
                5
              )[0] === '1'
          },
          charge: parseFloat(parsedData[4]) > 5,
          state:
            utils.nHexDigit(parsedData[26], 6).substring(0, 2) !== ''
              ? utils.states[utils.nHexDigit(parsedData[26], 6).substring(0, 2)]
              : null
        },
        azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
        altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
        datetime:
          parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
        voltage: {
          battery: parsedData[25] !== '' ? parseFloat(parsedData[25]) : null, // percentage
          inputCharge:
            parsedData[4] !== '' ? parseFloat(parsedData[4]) / 1000 : null,
          ada: parsedData[21] !== '' ? parseFloat(parsedData[21]) / 1000 : null,
          adb: parsedData[22] !== '' ? parseFloat(parsedData[22]) / 1000 : null,
          adc: parsedData[23] !== '' ? parseFloat(parsedData[23]) / 1000 : null,
          add: parsedData[24] !== '' ? parseFloat(parsedData[24]) / 1000 : null
        },
        mcc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
        mnc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
        lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
        cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
        odometer: parsedData[19] !== '' ? parseFloat(parsedData[19]) : null,
        hourmeter:
          parsedData[20] !== ''
            ? utils.getHoursForHourmeter(parsedData[20])
            : null
      })
    } catch (err) {
      return { type: 'UNKNOWN', raw: data.raw.toString() }
    }
  } else if (command[1] === 'GTERI') {
    // GPS with AC100 Devices Connected
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[12]), parseFloat(parsedData[13])]
      },
      speed: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[12]),
        parseFloat(parsedData[13])
      ),
      hdop: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      status: {
        // parsedData[24]
        raw: parsedData[27],
        sos: false,
        input: {
          '1':
            utils.nHexDigit(
              utils.hex2bin(parsedData[27].substring(2, 4)),
              6
            )[5] === '1',
          '2':
            utils.nHexDigit(
              utils.hex2bin(parsedData[27].substring(2, 4)),
              6
            )[4] === '1',
          '3':
            utils.nHexDigit(
              utils.hex2bin(parsedData[27].substring(2, 4)),
              6
            )[3] === '1',
          '4':
            utils.nHexDigit(
              utils.hex2bin(parsedData[27].substring(2, 4)),
              6
            )[2] === '1',
          '5':
            utils.nHexDigit(
              utils.hex2bin(parsedData[27].substring(2, 4)),
              6
            )[1] === '1',
          '6':
            utils.nHexDigit(
              utils.hex2bin(parsedData[27].substring(2, 4)),
              6
            )[0] === '1'
        },
        output: {
          '1':
            utils.nHexDigit(
              utils.hex2bin(parsedData[27].substring(4, 6)),
              5
            )[4] === '1',
          '2':
            utils.nHexDigit(
              utils.hex2bin(parsedData[27].substring(4, 6)),
              5
            )[3] === '1',
          '3':
            utils.nHexDigit(
              utils.hex2bin(parsedData[27].substring(4, 6)),
              5
            )[2] === '1',
          '4':
            utils.nHexDigit(
              utils.hex2bin(parsedData[27].substring(4, 6)),
              5
            )[1] === '1',
          '5':
            utils.nHexDigit(
              utils.hex2bin(parsedData[27].substring(4, 6)),
              5
            )[0] === '1'
        },
        charge: parseFloat(parsedData[4]) > 5,
        state:
          utils.nHexDigit(parsedData[27], 6).substring(0, 2) !== ''
            ? utils.states[utils.nHexDigit(parsedData[27], 6).substring(0, 2)]
            : null
      },
      azimuth: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
      voltage: {
        battery: parsedData[26] !== '' ? parseFloat(parsedData[26]) : null, // percentage
        inputCharge:
          parsedData[5] !== '' ? parseFloat(parsedData[5]) / 1000 : null,
        ada: parsedData[22] !== '' ? parseFloat(parsedData[22]) / 1000 : null,
        adb: parsedData[23] !== '' ? parseFloat(parsedData[23]) / 1000 : null,
        adc: parsedData[24] !== '' ? parseFloat(parsedData[24]) / 1000 : null,
        add: parsedData[25] !== '' ? parseFloat(parsedData[25]) / 1000 : null
      },
      mcc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      mnc: parsedData[16] !== '' ? parseInt(parsedData[16], 10) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      odometer: parsedData[20] !== '' ? parseFloat(parsedData[20]) : null,
      hourmeter:
        parsedData[21] !== ''
          ? utils.getHoursForHourmeter(parsedData[21])
          : null
    })
    // External Data

    const oneWire = utils.nHexDigit(utils.hex2bin(parsedData[4]), 8)[7] !== '0'
    const oneWireConnected = oneWire ? parseInt(parsedData[29], 10) : 0

    let externalData = {
      eriMask: {
        raw: parsedData[4],
        oneWire: oneWire,
        digitFuelSensor: false,
        rpm: false,
        rf: false
      },
      uartDeviceType: null
    }
    if (oneWire) {
      let oneWireDevices = []
      let count = 30
      for (var k = 0; k < oneWireConnected; k++) {
        oneWireDevices.push({
          deviceNumber: parsedData[count],
          deviceType: parsedData[count + 1],
          deviceData: parsedData[count + 2]
            ? utils.getTempInCelciousDegrees(parsedData[count + 2])
            : null
        })
        count += 3
      }
      externalData = Object.assign(externalData, {
        fuelSensorData: null,
        AC100Devices: oneWireDevices
      })
    }
    data = Object.assign(data, {
      externalData: externalData
    })
  } else if (command[1] === 'GTHBD') {
    // Heartbeat. It must response an ACK command
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null)
    })
  } else if (
    command[1] === 'GTTOW' ||
    command[1] === 'GTDIS' ||
    command[1] === 'GTIOB' ||
    command[1] === 'GTSPD' ||
    command[1] === 'GTSOS' ||
    command[1] === 'GTRTL' ||
    command[1] === 'GTPNL' ||
    command[1] === 'GTDOG' ||
    command[1] === 'GTIGL' ||
    command[1] === 'GTHBM'
  ) {
    // Common Alarms
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[5], 'gv800w'),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[11]), parseFloat(parsedData[12])]
      },
      speed: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[11]),
        parseFloat(parsedData[12])
      ),
      hdop: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      mnc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      odometer: parsedData[19] !== '' ? parseFloat(parsedData[19]) : null,
      hourmeter: null
    })
  } else if (command[1] === 'GTEPS' || command[1] === 'GTAIS') {
    // External low battery and Low voltage for analog input
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[5]),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[11]), parseFloat(parsedData[12])]
      },
      speed: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[11]),
        parseFloat(parsedData[12])
      ),
      hdop: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
      voltage: {
        battery: null, // percentage
        inputCharge:
          parsedData[4] !== '' ? parseFloat(parsedData[4]) / 1000 : null,
        ada: null,
        adb: null,
        adc: null,
        add: null
      },
      mcc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      mnc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      odometer: parsedData[19] !== '' ? parseFloat(parsedData[19]) : null,
      hourmeter: null
    })
  } else if (
    command[1] === 'GTPNA' ||
    command[1] === 'GTPFA' ||
    command[1] === 'GTPDP'
  ) {
    // Event report (It uses the last GPS data and MCC info)
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null),
      loc: null,
      speed: null,
      gpsStatus: null,
      hdop: null,
      status: null,
      azimuth: null,
      altitude: null,
      datetime: parsedData[4] !== '' ? utils.parseDate(parsedData[4]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: null,
      mnc: null,
      lac: null,
      cid: null,
      odometer: null,
      hourmeter: null
    })
  } else if (
    command[1] === 'GTMPN' ||
    command[1] === 'GTMPF' ||
    command[1] === 'GTBTC' ||
    command[1] === 'GTCRA' ||
    command[1] === 'GTJDR'
  ) {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[8]), parseFloat(parsedData[9])]
      },
      speed: parsedData[5] !== '' ? parseFloat(parsedData[5]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[8]),
        parseFloat(parsedData[9])
      ),
      hdop: parsedData[4] !== '' ? parseFloat(parsedData[4]) : null,
      status: null,
      azimuth: parsedData[6] !== '' ? parseFloat(parsedData[6]) : null,
      altitude: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      datetime: parsedData[10] !== '' ? utils.parseDate(parsedData[10]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null,
        add: null
      },
      mcc: parsedData[11] !== '' ? parseInt(parsedData[11], 10) : null,
      mnc: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
      lac: parsedData[13] !== '' ? parseInt(parsedData[13], 16) : null,
      cid: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      odometer: null,
      hourmeter: null
    })
  } else if (
    command[1] === 'GTJDS' ||
    command[1] === 'GTANT' ||
    command[1] === 'GTRMD'
  ) {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[4]),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[9]), parseFloat(parsedData[10])]
      },
      speed: parsedData[6] !== '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[9]),
        parseFloat(parsedData[10])
      ),
      hdop: parsedData[5] !== '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] !== '' ? utils.parseDate(parsedData[11]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null,
        add: null
      },
      mcc: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
      mnc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTBPL') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[9]), parseFloat(parsedData[10])]
      },
      speed: parsedData[6] !== '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[9]),
        parseFloat(parsedData[10])
      ),
      hdop: parsedData[5] !== '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] !== '' ? utils.parseDate(parsedData[11]) : null,
      voltage: {
        battery: parsedData[4] !== '' ? parseFloat(parsedData[4]) : null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null,
        add: null
      },
      mcc: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
      mnc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTIGN' || command[1] === 'GTIGF') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[4]),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[9]), parseFloat(parsedData[10])]
      },
      speed: parsedData[6] !== '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[9]),
        parseFloat(parsedData[10])
      ),
      hdop: parsedData[5] !== '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] !== '' ? utils.parseDate(parsedData[11]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null,
        add: null
      },
      mcc: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
      mnc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      odometer: parsedData[18] !== '' ? parseFloat(parsedData[18]) : null,
      hourmeter:
        parsedData[17] !== ''
          ? utils.getHoursForHourmeter(parsedData[17])
          : null
    })
  } else if (command[1] === 'GTIDN' || command[1] === 'GTIDF') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[5]),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[10]), parseFloat(parsedData[11])]
      },
      speed: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[10]),
        parseFloat(parsedData[11])
      ),
      hdop: parsedData[6] !== '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] !== '' ? utils.parseDate(parsedData[12]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null,
        add: null
      },
      mcc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      mnc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      odometer: parsedData[18] !== '' ? parseFloat(parsedData[18]) : null,
      hourmeter: null
    })
  } else if (
    command[1] === 'GTSTR' ||
    command[1] === 'GTSTP' ||
    command[1] === 'GTLSP'
  ) {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[10]), parseFloat(parsedData[11])]
      },
      speed: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[10]),
        parseFloat(parsedData[11])
      ),
      hdop: parsedData[6] !== '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] !== '' ? utils.parseDate(parsedData[12]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null,
        add: null
      },
      mcc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      mnc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      odometer: parsedData[18] !== '' ? parseFloat(parsedData[18]) : null,
      hourmeter: null
    })
  } else if (command[1] === 'GTSTT') {
    // Motion State Changed
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[9]), parseFloat(parsedData[10])]
      },
      speed: parsedData[6] !== '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[9]),
        parseFloat(parsedData[10])
      ),
      hdop: parsedData[5] !== '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] !== '' ? utils.parseDate(parsedData[11]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null,
        add: null
      },
      mcc: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
      mnc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTGPJ') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[5]),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[10]), parseFloat(parsedData[11])]
      },
      speed: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[10]),
        parseFloat(parsedData[11])
      ),
      hdop: parsedData[6] !== '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] !== '' ? utils.parseDate(parsedData[12]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      mnc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTGSS') {
    // GPS Status
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[4]),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[12]), parseFloat(parsedData[13])]
      },
      speed: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[12]),
        parseFloat(parsedData[13])
      ),
      hdop: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      status: null,
      azimuth: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null,
        add: null
      },
      mcc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      mnc: parsedData[16] !== '' ? parseInt(parsedData[16], 10) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTIDA') {
    // iButton
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], `${parsedData[5]},${parsedData[6]}`),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[12]), parseFloat(parsedData[13])]
      },
      speed: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[12]),
        parseFloat(parsedData[13])
      ),
      hdop: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      status: null,
      azimuth: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null,
        add: null
      },
      mcc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      mnc: parsedData[16] !== '' ? parseInt(parsedData[16], 10) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      odometer: parsedData[20] !== '' ? parseFloat(parsedData[20]) : null,
      hourmeter: null
    })
  } else if (command[1] === 'GTTMP') {
    // Temperature Alarm
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[6], [
        parsedData[30],
        parsedData[32]
      ]),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[11]), parseFloat(parsedData[12])]
      },
      speed: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[11]),
        parseFloat(parsedData[12])
      ),
      hdop: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      status: {
        // parsedData[24]
        raw: parsedData[25] + parsedData[26],
        sos: utils.nHexDigit(utils.hex2bin(parsedData[27]), 6)[4] === '1',
        input: {
          '1': utils.nHexDigit(utils.hex2bin(parsedData[27]), 6)[5] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[27]), 6)[4] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[27]), 6)[3] === '1',
          '4': utils.nHexDigit(utils.hex2bin(parsedData[27]), 6)[2] === '1',
          '5': utils.nHexDigit(utils.hex2bin(parsedData[27]), 6)[1] === '1',
          '6': utils.nHexDigit(utils.hex2bin(parsedData[27]), 6)[0] === '1'
        },
        output: {
          '1': utils.nHexDigit(utils.hex2bin(parsedData[27]), 5)[4] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[27]), 5)[3] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[27]), 5)[2] === '1',
          '4': utils.nHexDigit(utils.hex2bin(parsedData[27]), 5)[1] === '1',
          '5': utils.nHexDigit(utils.hex2bin(parsedData[27]), 5)[0] === '1'
        },
        charge: parseFloat(parsedData[4]) > 5
      },
      azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
      voltage: {
        battery: null, // percentage
        inputCharge:
          parsedData[5] !== '' ? parseFloat(parsedData[4]) / 1000 : null,
        ada: parsedData[21] !== '' ? parseFloat(parsedData[21]) / 1000 : null,
        adb: parsedData[22] !== '' ? parseFloat(parsedData[22]) / 1000 : null,
        adc: parsedData[23] !== '' ? parseFloat(parsedData[23]) / 1000 : null,
        add: parsedData[24] !== '' ? parseFloat(parsedData[24]) / 1000 : null
      },
      mcc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      mnc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      odometer: parsedData[19] !== '' ? parseFloat(parsedData[19]) : null,
      hourmeter:
        parsedData[20] !== ''
          ? utils.getHoursForHourmeter(parsedData[20])
          : null
    })
  } else if (command[1] === 'GTCAN') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[4]),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[59]), parseFloat(parsedData[60])]
      },
      speed: parsedData[56] !== '' ? parseFloat(parsedData[56]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[59]),
        parseFloat(parsedData[60])
      ),
      hdop: parsedData[55] !== '' ? parseFloat(parsedData[55]) : null,
      status: null,
      azimuth: parsedData[57] !== '' ? parseFloat(parsedData[57]) : null,
      altitude: parsedData[58] !== '' ? parseFloat(parsedData[58]) : null,
      datetime: parsedData[61] !== '' ? utils.parseDate(parsedData[61]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null,
        add: null
      },
      mcc: parsedData[62] !== '' ? parseInt(parsedData[62], 10) : null,
      mnc: parsedData[63] !== '' ? parseInt(parsedData[63], 10) : null,
      lac: parsedData[64] !== '' ? parseInt(parsedData[64], 16) : null,
      cid: parsedData[65] !== '' ? parseInt(parsedData[65], 16) : null,
      odometer: null,
      hourmeter: null,
      can: {
        mask: '',
        comunicationOk: parsedData[5] === '1',
        vin: parsedData[7] !== '' ? parsedData[7] : null,
        ignitionKey: parsedData[8] !== '' ? parseInt(parsedData[8], 10) : null,
        distance: parsedData[9] !== '' ? parsedData[9] : null,
        fuelUsed: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null, // float
        rpm: parsedData[11] !== '' ? parseInt(parsedData[11], 10) : null, // int
        speed: parsedData[12] !== '' ? parseFloat(parsedData[12]) : null,
        coolantTemp:
          parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
        fuelConsumption: parsedData[14] !== '' ? parsedData[14] : null,
        fuelLevel: parsedData[15] !== '' ? parsedData[15] : null,
        range: parsedData[16] !== '' ? parsedData[16] : null,
        acceleratorPressure:
          parsedData[17] !== '' ? parseFloat(parsedData[17]) : null, // %
        engineHours: parsedData[18] !== '' ? parseFloat(parsedData[18]) : null, // hours
        drivingTime: parsedData[19] !== '' ? parseFloat(parsedData[19]) : null, // hours
        idleTime: parsedData[20] !== '' ? parseFloat(parsedData[20]) : null, // hours
        idleFuelUsed: parsedData[21] !== '' ? parseFloat(parsedData[21]) : null, // liters
        axleWight: parsedData[22] !== '' ? parseFloat(parsedData[22]) : null, // kg
        tachograph: parsedData[23] !== '' ? parsedData[23] : null,
        detailedInfo: parsedData[24] !== '' ? parsedData[24] : null,
        lights: parsedData[25] !== '' ? parsedData[25] : null,
        doors: parsedData[26] !== '' ? parsedData[26] : null,
        overSpeedTime:
          parsedData[27] !== '' ? parseFloat(parsedData[27]) : null, // hours
        overSpeedEngineTime:
          parsedData[28] !== '' ? parseFloat(parsedData[28]) : null, // hours
        expansionMask: parsedData[29] !== '' ? parsedData[29] : null,
        addBlueLevel: parsedData[30] !== '' ? parsedData[30] : null,
        axleWight1st: parsedData[31] !== '' ? parsedData[31] : null,
        axleWight3rd: parsedData[32] !== '' ? parsedData[32] : null,
        axleWight4rd: parsedData[33] !== '' ? parsedData[33] : null,
        tachographOverSpeedSignal:
          parsedData[34] !== '' ? parsedData[34] : null,
        tachographMotionState: parsedData[35] !== '' ? parsedData[35] : null,
        tachographDrivingDirection:
          parsedData[36] !== '' ? parsedData[36] : null,
        analogInput: parsedData[37] !== '' ? parsedData[37] : null,
        engineBrakingFactor: parsedData[38] !== '' ? parsedData[38] : null,
        pedalBrakingFactor: parsedData[39] !== '' ? parsedData[39] : null,
        totalAcceleratorKickDowns:
          parsedData[40] !== '' ? parseInt(parsedData[40], 10) : null,
        totalEffectiveEngineSpeedTime:
          parsedData[41] !== '' ? parseFloat(parsedData[41]) : null, // hours
        totalCruiseControlTime:
          parsedData[42] !== '' ? parseFloat(parsedData[42]) : null, // hours
        totalAcceleratorKickDownTime:
          parsedData[43] !== '' ? parseFloat(parsedData[43]) : null, // hours
        totalBrakeApplications:
          parsedData[44] !== '' ? parseInt(parsedData[44]) : null,
        tachographDriver1Number: parsedData[45] !== '' ? parsedData[45] : null,
        tachographDriver2Number: parsedData[46] !== '' ? parsedData[46] : null,
        tachographDriver1Name: parsedData[47] !== '' ? parsedData[47] : null,
        tachographDriver2Name: parsedData[48] !== '' ? parsedData[48] : null,
        registrationNumber: parsedData[49] !== '' ? parsedData[49] : null,
        expansionInformation: parsedData[50] !== '' ? parsedData[50] : null,
        rapidBraking: parsedData[51] !== '' ? parsedData[51] : null,
        rapidAccelerations: parsedData[52] !== '' ? parsedData[52] : null
      }
    })
  } else if (command[1] === 'GTDAT') {
    data = Object.assign(data, {
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[12]), parseFloat(parsedData[13])]
      },
      speed: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[12]),
        parseFloat(parsedData[13])
      ),
      hdop: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      status: null,
      azimuth: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null,
        add: null
      },
      mcc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      mnc: parsedData[16] !== '' ? parseInt(parsedData[16], 10) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      odometer: null,
      hourmeter: null,
      serialData: parsedData[7] !== '' ? parsedData[7] : null
    })

    // Checks if its a temperature GTDAT -> DT
    if (/^>DT/.test(parsedData[7])) {
      const parsedSerialData =
        parsedData[7] !== '' ? parsedData[7].split('|') : ''
      let externalData = {
        eriMask: {
          raw: '00000000',
          digitFuelSensor: false,
          AC100: false,
          reserved: false,
          fuelLevelPercentage: false,
          fuelVolume: false
        },
        uartDeviceType: 'Camaleon',
        fuelSensorData: null
      }
      let AC100Devices = [
        {
          deviceNumber: `${parsedData[2]}|1`,
          deviceType: '1',
          deviceData:
            parsedSerialData[3] !== '' ? parseFloat(parsedSerialData[3]) : null
        }
      ]
      if (parsedSerialData[4] !== '') {
        AC100Devices.push({
          deviceNumber: `${parsedData[2]}|2`,
          deviceType: '1',
          deviceData:
            parsedSerialData[4] !== '' ? parseFloat(parsedSerialData[4]) : null
        })
      }
      externalData = Object.assign(externalData, {
        AC100Devices: AC100Devices
      })
      data = Object.assign(data, {
        alarm: utils.getAlarm('GTERI', null),
        externalData: externalData
      })
    } else if (/^>ET/.test(parsedData[7])) {
      // Temp Alarms
      // GTTMP
      const parsedSerialData =
        parsedData[7] !== '' ? parsedData[7].split('|') : ''
      const alarm = utils.getAlarm('GTTMP', `${parsedSerialData[2]}0`, [
        `${parsedData[2]}|${parsedSerialData[2]}`,
        parsedSerialData[4]
      ])
      data = Object.assign(data, {
        alarm: alarm
      })
    } else if (/^>ID/.test(parsedData[7])) {
      // Checks if its a iButton GTDAT -> DT
      const parsedSerialData =
        parsedData[7] !== '' ? parsedData[7].split('|') : ''
      const driverID = parsedSerialData[2] ? parsedSerialData[2] : ''
      const alarm = utils.getAlarm('GTIDA', `${driverID},1`)
      data = Object.assign(data, {
        alarm: alarm
      })
    } else {
      // Normal GTDAT
      data = Object.assign(data, {
        alarm: utils.getAlarm(command[1], null)
      })
    }
  } else if (command[1] === 'GTDOS') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], `${parsedData[4]},${parsedData[5]}`),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[10]), parseFloat(parsedData[11])]
      },
      speed: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[10]),
        parseFloat(parsedData[11])
      ),
      hdop: parsedData[6] !== '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] !== '' ? utils.parseDate(parsedData[12]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null,
        add: null
      },
      mcc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      mnc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      odometer: null,
      hourmeter: null
    })
  } else {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], raw.toString())
    })
  }
  // Check gps data
  if (data.loc !== null && typeof data.loc !== 'undefined') {
    if (
      data.loc.coordinates[0] === 0 ||
      isNaN(data.loc.coordinates[0]) ||
      data.loc.coordinates[1] === 0 ||
      isNaN(data.loc.coordinates[1])
    ) {
      data.loc = null
    }
  }
  return data
}

module.exports = {
  parse: parse
}
