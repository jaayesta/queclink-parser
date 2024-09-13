'use strict'
const utils = require('./utils.js')

/**
 * Parses messages data from GV200 devices
 *
 * @param {string} originalRaw -
 * @returns {Object<string, *>}
 */
const parse = originalRaw => {
  const lastIndex = originalRaw.length - 1
  const raw = originalRaw.substring(0, lastIndex)

  const parsedData = raw.split(',')
  const command = parsedData[0].split(':')

  let history = false
  if (utils.patterns.buffer.test(command[0])) {
    history = true
    if (originalRaw[lastIndex] !== '$') {
      return { type: 'UNKNOWN', raw: originalRaw }
    }
  }

  let data = {
    raw: `${raw.toString()}$`,
    manufacturer: 'queclink',
    device: 'Queclink-GV200',
    type: 'data',
    imei: parsedData[2],
    protocolVersion: utils.getProtocolVersion(parsedData[1]),
    temperature: null,
    history: history,
    sentTime: utils.parseDate(parsedData[parsedData.length - 2]),
    serialId: parseInt(parsedData[parsedData.length - 1], 16)
  }

  // GPS
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
          raw: parsedData[24] + parsedData[25],
          sos: false,
          input: {
            '4':
              utils.nHexDigit(utils.hex2bin(parsedData[24][1]), 4)[0] === '1',
            '3':
              utils.nHexDigit(utils.hex2bin(parsedData[24][1]), 4)[1] === '1',
            '2':
              utils.nHexDigit(utils.hex2bin(parsedData[24][1]), 4)[2] === '1',
            '1': utils.nHexDigit(utils.hex2bin(parsedData[24][1]), 4)[3] === '1'
          },
          output: {
            '4':
              utils.nHexDigit(utils.hex2bin(parsedData[25][1]), 4)[0] === '1',
            '3':
              utils.nHexDigit(utils.hex2bin(parsedData[25][1]), 4)[1] === '1',
            '2':
              utils.nHexDigit(utils.hex2bin(parsedData[25][1]), 4)[2] === '1',
            '1': utils.nHexDigit(utils.hex2bin(parsedData[25][1]), 4)[3] === '1'
          },
          charge: parseFloat(parsedData[4]) > 5
        },
        azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
        altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
        datetime:
          parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
        voltage: {
          battery: null, // percentage
          inputCharge:
            parsedData[4] !== '' ? parseFloat(parsedData[4]) / 1000 : null,
          ada: parsedData[21] !== '' ? parseFloat(parsedData[21]) / 1000 : null,
          adb: parsedData[22] !== '' ? parseFloat(parsedData[22]) / 1000 : null,
          adc: parsedData[23] !== '' ? parseFloat(parsedData[23]) / 1000 : null
        },
        mcc: parsedData[14] !== '' ? utils.latamMcc[parseInt(parsedData[14], 10)] : null,
        mnc: parsedData[15] !== '' ? utils.getMNC(parsedData[14], parsedData[15]) : null,
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
        raw: parsedData[25] + parsedData[26],
        sos: false,
        input: {
          '4': utils.nHexDigit(utils.hex2bin(parsedData[25][1]), 4)[0] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[25][1]), 4)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[25][1]), 4)[2] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[25][1]), 4)[3] === '1'
        },
        output: {
          '4': utils.nHexDigit(utils.hex2bin(parsedData[26][1]), 4)[0] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[26][1]), 4)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[26][1]), 4)[2] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[26][1]), 4)[3] === '1'
        },
        charge: parseFloat(parsedData[5]) > 5
      },
      azimuth: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
      voltage: {
        battery: null, // percentage
        inputCharge:
          parsedData[5] !== '' ? parseFloat(parsedData[5]) / 1000 : null,
        ada: parsedData[22] !== '' ? parseFloat(parsedData[22]) / 1000 : null,
        adb: parsedData[23] !== '' ? parseFloat(parsedData[23]) / 1000 : null,
        adc: parsedData[24] !== '' ? parseFloat(parsedData[24]) / 1000 : null
      },
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      odometer: parsedData[20] !== '' ? parseFloat(parsedData[20]) : null,
      hourmeter:
        parsedData[21] !== ''
          ? utils.getHoursForHourmeter(parsedData[21])
          : null
    })

    // External Data
    const digitFuelSensor =
      utils.nHexDigit(utils.hex2bin(parsedData[4]), 5)[4] === '1'
    const AC100 = utils.nHexDigit(utils.hex2bin(parsedData[4]), 5)[3] === '1'
    const reserved = utils.nHexDigit(utils.hex2bin(parsedData[4]), 5)[2] === '1'
    const fuelLevelPercentage =
      utils.nHexDigit(utils.hex2bin(parsedData[4]), 5)[1] === '1'
    const fuelVolume =
      utils.nHexDigit(utils.hex2bin(parsedData[4]), 5)[0] === '1'
    const fuelSensorData = digitFuelSensor ? parsedData[28] : null
    const ac100DevicesConnected =
      AC100 && digitFuelSensor
        ? parseInt(parsedData[29], 10)
        : AC100 && !digitFuelSensor ? parseInt(parsedData[28], 10) : 0

    let externalData = {
      eriMask: {
        raw: parsedData[4],
        digitFuelSensor: digitFuelSensor,
        AC100: AC100,
        reserved: reserved,
        fuelLevelPercentage: fuelLevelPercentage,
        fuelVolume: fuelVolume
      },
      uartDeviceType: utils.uartDeviceTypes[parsedData[27]]
    }

    // Fuel Sensor
    if (parsedData[27] === '1') {
      if (digitFuelSensor && !AC100) {
        externalData = Object.assign(externalData, {
          fuelSensorData: {
            data: fuelSensorData,
            sensorType: parsedData[29],
            percentage:
              fuelLevelPercentage && parsedData[30] !== ''
                ? parseInt(parsedData[30], 10)
                : null,
            volume:
              fuelVolume && fuelLevelPercentage && parsedData[31] !== ''
                ? parseInt(parsedData[31], 10)
                : fuelVolume && !fuelLevelPercentage && parsedData[30] !== ''
                  ? parseInt(parsedData[30], 10)
                  : null
          },
          AC100Devices: null
        })
      } else if (!digitFuelSensor && AC100) {
        let ac100Devices = []
        let count = 29
        for (var i = 0; i < ac100DevicesConnected; i++) {
          ac100Devices.push({
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
          AC100Devices: ac100Devices
        })
      } else if (digitFuelSensor && AC100) {
        let ac100Devices = []
        let count =
          fuelVolume && fuelLevelPercentage
            ? 33
            : fuelVolume && !fuelLevelPercentage ? 32 : 31
        for (var j = 0; j < ac100DevicesConnected; j++) {
          ac100Devices.push({
            deviceNumber: parsedData[count],
            deviceType: parsedData[count + 1],
            deviceData: parsedData[count + 2]
              ? utils.getTempInCelciousDegrees(parsedData[count + 2])
              : null
          })
          count += 3
        }
        externalData = Object.assign(externalData, {
          fuelSensorData: {
            data: fuelSensorData,
            sensorType: parsedData[30],
            percentage:
              fuelLevelPercentage && parsedData[31] !== ''
                ? parseInt(parsedData[31], 10)
                : null,
            volume:
              fuelVolume && fuelLevelPercentage && parsedData[32] !== ''
                ? parseInt(parsedData[32], 10)
                : fuelVolume && !fuelLevelPercentage && parsedData[31] !== ''
                  ? parseInt(parsedData[31], 10)
                  : null
          },
          AC100Devices: ac100Devices
        })
      }
    } else if (parsedData[27] === '2') {
      // AC100 1 Wire Bus
      if (!digitFuelSensor && AC100) {
        let ac100Devices = []
        let count = 29
        for (var k = 0; k < ac100DevicesConnected; k++) {
          ac100Devices.push({
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
          AC100Devices: ac100Devices
        })
      } else if (digitFuelSensor && !AC100) {
        externalData = Object.assign(externalData, {
          fuelSensorData: {
            data: fuelSensorData,
            sensorType: null,
            percentage: null,
            volume: null
          },
          AC100Devices: null
        })
      } else if (digitFuelSensor && AC100) {
        let ac100Devices = []
        let count = 29
        for (var l = 0; l < ac100DevicesConnected; l++) {
          ac100Devices.push({
            deviceNumber: parsedData[count],
            deviceType: parsedData[count + 1],
            deviceData: parsedData[count + 2]
              ? utils.getTempInCelciousDegrees(parsedData[count + 2])
              : null
          })
          count += 3
        }
        externalData = Object.assign(externalData, {
          fuelSensorData: {
            data: fuelSensorData,
            sensorType: null,
            percentage: null,
            volume: null
          },
          AC100Devices: ac100Devices
        })
      }
    }
    data = Object.assign(data, {
      externalData: externalData
    })
  } else if (command[1] === 'GTHBD') {
    // Heartbeat. It must response an ACK command
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null)
    })
  } else if (command[1] === 'GTINF') {
    // General Info Report
    let status = null
    try {
      status = {
        // parsedData[24]
        raw: parsedData[18] + parsedData[19],
        sos: false,
        input: {
          '4': utils.nHexDigit(utils.hex2bin(parsedData[18][1]), 4)[0] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[18][1]), 4)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[18][1]), 4)[2] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[18][1]), 4)[3] === '1'
        },
        output: {
          '4': utils.nHexDigit(utils.hex2bin(parsedData[19][1]), 4)[0] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[19][1]), 4)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[19][1]), 4)[2] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[19][1]), 4)[3] === '1'
        },
        charge: parsedData[8] === '1'
      }
    } catch (err) {
      data.sentTime = utils.parseDate(parsedData[parsedData.length - 3])
    }
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null),
      state: utils.states[parsedData[4]],
      gsmInfo: {
        SIM_ICC: parsedData[5],
        RSSI_dBm: parsedData[6],
        RSSI_quality:
          parsedData[7] !== ''
            ? 100 * parseInt(parseFloat(parsedData[7]) / 7, 10)
            : null // Percentage
      },
      backupBattery: {
        using: parsedData[10] === '1',
        voltage: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
        charging: parsedData[12] === '1'
      },
      externalGPSAntenna: parsedData[15] === '0',
      status: status,
      voltage: {
        battery:
          parsedData[11] !== ''
            ? parseInt(100 * (parseFloat(parsedData[11]) / 5), 10)
            : null, // percentage
        inputCharge:
          parsedData[17] !== '' ? parseFloat(parsedData[17]) / 1000 : null,
        ada: null,
        adb: null,
        adc: null
      },
      lastFixUTCTime:
        parsedData[16] !== '' ? utils.parseDate(parsedData[16]) : null,
      timezoneOffset: parsedData[20]
    })
  } else if (
    command[1] === 'GTTOW' ||
    command[1] === 'GTDIS' ||
    command[1] === 'GTIOB' ||
    command[1] === 'GTSPD' ||
    command[1] === 'GTSOS' ||
    command[1] === 'GTRTL' ||
    command[1] === 'GTDOG' ||
    command[1] === 'GTIGL' ||
    command[1] === 'GTHBM'
  ) {
    // Common Alarms
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
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[14] !== '' ? utils.latamMcc[parseInt(parsedData[14], 10)] : null,
      mnc: parsedData[15] !== '' ? utils.getMNC(parsedData[14], parsedData[15]) : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      odometer: parsedData[19] !== '' ? parseFloat(parsedData[19]) : null,
      hourmeter: null
    })
  } else if (command[1] === 'GTAIS' || command[1] === 'GTMAI') {
    // Low voltage for analog input
    const alarm = utils.getAlarm(command[1], parsedData[5])
    data = Object.assign(data, {
      alarm: alarm,
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
          parsedData[4] !== '' && command[1] === 'GTAIS'
            ? parseFloat(parsedData[4])
            : null,
        ada:
          alarm.number === 1 && parsedData[4] !== ''
            ? parseFloat(parsedData[4]) / 1000
            : null,
        adb:
          alarm.number === 2 && parsedData[4] !== ''
            ? parseFloat(parsedData[4]) / 1000
            : null,
        adc:
          alarm.type === 'SOS_Button' && parsedData[4] !== ''
            ? parseFloat(parsedData[4]) / 1000
            : null
      },
      mcc: parsedData[14] !== '' ? utils.latamMcc[parseInt(parsedData[14], 10)] : null,
      mnc: parsedData[15] !== '' ? utils.getMNC(parsedData[14], parsedData[15]) : null,
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
        adb: null,
        adc: null
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
        adc: null
      },
      mcc: parsedData[11] !== '' ? utils.latamMcc[parseInt(parsedData[11], 10)] : null,
      mnc: parsedData[12] !== '' ? utils.getMNC(parsedData[11], parsedData[12]) : null,
      lac: parsedData[13] !== '' ? parseInt(parsedData[13], 16) : null,
      cid: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      odometer: null,
      hourmeter: null
    })
  } else if (
    command[1] === 'GTJDS' ||
    command[1] === 'GTANT' ||
    command[1] === 'GTRMD' ||
    command[1] === 'GTSTC'
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
        adc: null
      },
      mcc: parsedData[12] !== '' ? utils.latamMcc[parseInt(parsedData[12], 10)] : null,
      mnc: parsedData[13] !== '' ? utils.getMNC(parsedData[12], parsedData[13]) : null,
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
        adc: null
      },
      mcc: parsedData[12] !== '' ? utils.latamMcc[parseInt(parsedData[12], 10)] : null,
      mnc: parsedData[13] !== '' ? utils.getMNC(parsedData[12], parsedData[13]) : null,
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
        adc: null
      },
      mcc: parsedData[12] !== '' ? utils.latamMcc[parseInt(parsedData[12], 10)] : null,
      mnc: parsedData[13] !== '' ? utils.getMNC(parsedData[12], parsedData[13]) : null,
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
        adc: null
      },
      mcc: parsedData[13] !== '' ? utils.latamMcc[parseInt(parsedData[13], 10)] : null,
      mnc: parsedData[14] !== '' ? utils.getMNC(parsedData[13], parsedData[14]) : null,
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
        adc: null
      },
      mcc: parsedData[13] !== '' ? utils.latamMcc[parseInt(parsedData[13], 10)] : null,
      mnc: parsedData[14] !== '' ? utils.getMNC(parsedData[13], parsedData[14]) : null,
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
        adc: null
      },
      mcc: parsedData[12] !== '' ? utils.latamMcc[parseInt(parsedData[12], 10)] : null,
      mnc: parsedData[13] !== '' ? utils.getMNC(parsedData[12], parsedData[13]) : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
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
        adc: null
      },
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
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
        adb: null,
        adc: null
      },
      mcc: parsedData[13] !== '' ? utils.latamMcc[parseInt(parsedData[13], 10)] : null,
      mnc: parsedData[14] !== '' ? utils.getMNC(parsedData[13], parsedData[14]) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      odometer: null,
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
        raw: parsedData[24] + parsedData[25],
        sos: utils.hex2bin(parsedData[24][1])[1] === '1',
        input: {
          '4': utils.hex2bin(parsedData[25][1])[3] === '1',
          '3': utils.hex2bin(parsedData[25][1])[2] === '1',
          '2': utils.hex2bin(parsedData[25][1])[1] === '1',
          '1': utils.hex2bin(parsedData[25][1])[0] === '1'
        },
        output: {
          '4': utils.hex2bin(parsedData[26][1])[3] === '1',
          '3': utils.hex2bin(parsedData[26][1])[2] === '1',
          '2': utils.hex2bin(parsedData[26][1])[1] === '1',
          '1': utils.hex2bin(parsedData[26][1])[0] === '1'
        },
        charge: parseFloat(parsedData[4]) > 5
      },
      azimuth: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
      voltage: {
        battery: null, // percentage
        inputCharge:
          parsedData[5] !== '' ? parseFloat(parsedData[4]) / 1000 : null,
        ada: parsedData[22] !== '' ? parseFloat(parsedData[22]) / 1000 : null,
        adb: parsedData[23] !== '' ? parseFloat(parsedData[23]) / 1000 : null,
        adc: parsedData[24] !== '' ? parseFloat(parsedData[24]) / 1000 : null
      },
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      odometer: parsedData[20] !== '' ? parseFloat(parsedData[20]) : null,
      hourmeter:
        parsedData[21] !== ''
          ? utils.getHoursForHourmeter(parsedData[21])
          : null
    })
  } else if (command[1] === 'GTFLA') {
    // Unusual fuel consumption
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], `${parsedData[5]},${parsedData[6]}`),
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
        adb: null,
        adc: null
      },
      mcc: parsedData[14] !== '' ? utils.latamMcc[parseInt(parsedData[14], 10)] : null,
      mnc: parsedData[15] !== '' ? utils.getMNC(parsedData[14], parsedData[15]) : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
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
        adc: null
      },
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      odometer: parsedData[20] !== '' ? parseFloat(parsedData[20]) : null,
      hourmeter: null
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
        adc: null
      },
      mcc: parsedData[62] !== '' ? utils.latamMcc[parseInt(parsedData[62], 10)] : null,
      mnc: parsedData[63] !== '' ? utils.getMNC(parsedData[62], parsedData[63]) : null,
      lac: parsedData[64] !== '' ? parseInt(parsedData[64], 16) : null,
      cid: parsedData[65] !== '' ? parseInt(parsedData[65], 16) : null,
      odometer: null,
      hourmeter: null,
      can: {
        comunicationOk: parsedData[5] === '1',
        vin: parsedData[7] !== '' ? parsedData[7] : null,
        ignitionKey:
          parsedData[8] !== '' ? parseInt(parsedData[8], 10) === '2' : null, // 0: Ignition off, 1: Ignition on, 2: Engine on
        odometer:
          parsedData[9] !== ''
            ? parseInt(parsedData[9], 10) / 100 / 1000
            : null, // hectometers: 100 metros. Lo paso a kilometros.
        fuelUsed: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null, // float. Litros
        rpm: parsedData[11] !== '' ? parseInt(parsedData[11], 10) : null, // int
        speed: parsedData[12] !== '' ? parseFloat(parsedData[12]) : null,
        coolantTemp:
          parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
        fuelConsumption: parsedData[14],
        fuelLevel: parsedData[15],
        range:
          parsedData[16] !== ''
            ? parseInt(parsedData[16], 10) / 100 / 1000
            : null,
        acceleratorPressure:
          parsedData[17] !== '' ? parseInt(parsedData[17], 10) : null,
        engineHours: parsedData[18] !== '' ? parseFloat(parsedData[18]) : null,
        drivingTime: parsedData[19] !== '' ? parseFloat(parsedData[19]) : null,
        idleTime: parsedData[20] !== '' ? parseFloat(parsedData[20]) : null,
        idleFuelUsed: parsedData[21] !== '' ? parseFloat(parsedData[21]) : null,
        axleWight: parsedData[22] !== '' ? parsedData[22] : null,
        tachograph: parsedData[23] !== '' ? parsedData[23] : null,
        detailedInfo: {
          raw: parsedData[24], // Contains detailed information of vehicle
          lowFuelOn:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[0] === '1',
          seatBeltOn:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[1] === '1',
          airConditioningOn:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[2] === '1',
          cruiseControlOn:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[3] === '1',
          brakePedalOn:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[4] === '1',
          clutchPedalOn:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[5] === '1',
          handBrakeON:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[6] === '1',
          centralLockOn:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[7] === '1',
          reverseGearOn:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[8] === '1',
          runningLightsOn:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[9] === '1',
          lowBeamsOn:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[10] === '1',
          highBeamsOn:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[11] === '1',
          rearFogLightsOn:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[12] === '1',
          frontFogLightsOn:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[13] === '1',
          doorsOpened:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[14] === '1', // any door
          trunkOpened:
            utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)[15] === '1'
        },
        lights: {
          raw: parsedData[25],
          runningLightsOn:
            utils.nHexDigit(utils.hex2bin(parsedData[25]), 8)[0] === '1',
          lowBeamsOn:
            utils.nHexDigit(utils.hex2bin(parsedData[25]), 8)[1] === '1',
          highBeamsOn:
            utils.nHexDigit(utils.hex2bin(parsedData[25]), 8)[2] === '1',
          frontFogOn:
            utils.nHexDigit(utils.hex2bin(parsedData[25]), 8)[3] === '1',
          rearFogOn:
            utils.nHexDigit(utils.hex2bin(parsedData[25]), 8)[4] === '1',
          hazardLightsOn:
            utils.nHexDigit(utils.hex2bin(parsedData[25]), 8)[5] === '1',
          reserved1:
            utils.nHexDigit(utils.hex2bin(parsedData[25]), 8)[6] === '1',
          reserved2:
            utils.nHexDigit(utils.hex2bin(parsedData[25]), 8)[7] === '1'
        },
        doors: {
          raw: parsedData[26],
          driverDoorOpened:
            utils.nHexDigit(utils.hex2bin(parsedData[26]), 8)[0] === '1',
          passengerDoorOpened:
            utils.nHexDigit(utils.hex2bin(parsedData[26]), 8)[1] === '1',
          rearLeftDoorOpened:
            utils.nHexDigit(utils.hex2bin(parsedData[26]), 8)[2] === '1',
          rearRightDoorOpened:
            utils.nHexDigit(utils.hex2bin(parsedData[26]), 8)[3] === '1',
          trunkDoorOpened:
            utils.nHexDigit(utils.hex2bin(parsedData[26]), 8)[4] === '1',
          bootDoorOpened:
            utils.nHexDigit(utils.hex2bin(parsedData[26]), 8)[5] === '1',
          reserved1:
            utils.nHexDigit(utils.hex2bin(parsedData[26]), 8)[6] === '1',
          reserved2:
            utils.nHexDigit(utils.hex2bin(parsedData[26]), 8)[7] === '1'
        },
        // 26
        indicators: {
          raw: parsedData[51],
          webastoOn:
            utils.nHexDigit(utils.hex2bin(parsedData[51]), 16)[0] === '1',
          brakeFluidLow:
            utils.nHexDigit(utils.hex2bin(parsedData[51]), 16)[1] === '1',
          coolantLow:
            utils.nHexDigit(utils.hex2bin(parsedData[51]), 16)[2] === '1',
          batteryIndicatorOn:
            utils.nHexDigit(utils.hex2bin(parsedData[51]), 16)[3] === '1',
          brakeSystemFailure:
            utils.nHexDigit(utils.hex2bin(parsedData[51]), 16)[4] === '1',
          oilPressureOn:
            utils.nHexDigit(utils.hex2bin(parsedData[51]), 16)[5] === '1',
          engineHot:
            utils.nHexDigit(utils.hex2bin(parsedData[51]), 16)[6] === '1',
          ABSFailure:
            utils.nHexDigit(utils.hex2bin(parsedData[51]), 16)[7] === '1',
          checkEngineOn:
            utils.nHexDigit(utils.hex2bin(parsedData[51]), 16)[9] === '1',
          airbagIndicatorOn:
            utils.nHexDigit(utils.hex2bin(parsedData[51]), 16)[10] === '1',
          serviceCallIndicatorOn:
            utils.nHexDigit(utils.hex2bin(parsedData[51]), 16)[11] === '1',
          oilLow: utils.nHexDigit(utils.hex2bin(parsedData[51]), 16)[12] === '1'
        },
        overSpeedTime: parsedData[27],
        overSpeedEngineTime: parsedData[28]
      }
    })
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
        adc: null
      },
      mcc: parsedData[13] !== '' ? utils.latamMcc[parseInt(parsedData[13], 10)] : null,
      mnc: parsedData[14] !== '' ? utils.getMNC(parsedData[13], parsedData[14]) : null,
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
