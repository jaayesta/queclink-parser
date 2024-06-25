'use strict'
const utils = require('./utils.js')

/*
  Parses messages data from GV300 devices
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
    device: 'Queclink-GV300',
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
          raw: parsedData[24],
          sos: false,
          input: {
            '1':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[24], 10).substring(6, 8)
                ),
                4
              )[3] === '1',
            '2':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[24], 10).substring(6, 8)
                ),
                4
              )[2] === '1',
            '3':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[24], 10).substring(6, 8)
                ),
                4
              )[1] === '1',
            '4':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[24], 10).substring(6, 8)
                ),
                4
              )[0] === '1'
          },
          output: {
            '1':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[24], 10).substring(8, 10)
                ),
                3
              )[2] === '1',
            '2':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[24], 10).substring(8, 10)
                ),
                3
              )[1] === '1',
            '3':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[24], 10).substring(8, 10)
                ),
                3
              )[0] === '1'
          },
          charge: parseFloat(parsedData[4]) > 5,
          state:
            utils.nHexDigit(parsedData[24], 10).substring(4, 6) !== ''
              ? utils.states[ // eslint-disable-line
                utils.nHexDigit(parsedData[24], 10).substring(4, 6)
              ]
              : null
        },
        azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
        altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
        datetime:
          parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
        voltage: {
          battery: parsedData[23] !== '' ? parseFloat(parsedData[23]) : null, // percentage
          inputCharge:
            parsedData[4] !== '' ? parseFloat(parsedData[4]) / 1000 : null,
          ada: parsedData[21] !== '' ? parseFloat(parsedData[21]) / 1000 : null,
          adb: parsedData[22] !== '' ? parseFloat(parsedData[22]) / 1000 : null
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
        raw: parsedData[25],
        sos: false,
        input: {
          '1':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[25], 10).substring(6, 8)
              ),
              4
            )[3] === '1',
          '2':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[25], 10).substring(6, 8)
              ),
              4
            )[2] === '1',
          '3':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[25], 10).substring(6, 8)
              ),
              4
            )[1] === '1',
          '4':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[25], 10).substring(6, 8)
              ),
              4
            )[0] === '1'
        },
        output: {
          '1':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[25], 10).substring(8, 10)
              ),
              3
            )[2] === '1',
          '2':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[25], 10).substring(8, 10)
              ),
              3
            )[1] === '1',
          '3':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[25], 10).substring(8, 10)
              ),
              3
            )[0] === '1'
        },
        charge: parseFloat(parsedData[5]) > 5,
        state:
          utils.nHexDigit(parsedData[25], 10).substring(4, 6) !== ''
            ? utils.states[utils.nHexDigit(parsedData[25], 10).substring(4, 6)]
            : null
      },
      azimuth: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
      voltage: {
        battery: parsedData[24] !== '' ? parseFloat(parsedData[24]) : null, // percentage
        inputCharge:
          parsedData[5] !== '' ? parseFloat(parsedData[5]) / 1000 : null,
        ada: parsedData[22] !== '' ? parseFloat(parsedData[22]) / 1000 : null,
        adb: parsedData[23] !== '' ? parseFloat(parsedData[23]) / 1000 : null
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
      uartDeviceType: utils.uartDeviceTypes[parsedData[26]]
    }

    // Fuel Sensor
    if (parsedData[26] === '1') {
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
    } else if (parsedData[26] === '2') {
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
      status: {
        // parsedData[24]
        raw: parsedData[18] + parsedData[19],
        sos: false,
        input: {
          '4': utils.nHexDigit(utils.hex2bin(parsedData[20][1]), 4)[0] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[20][1]), 4)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[20][1]), 4)[2] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[20][1]), 4)[3] === '1'
        },
        output: {
          '4': utils.nHexDigit(utils.hex2bin(parsedData[19][1]), 4)[0] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[19][1]), 4)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[19][1]), 4)[2] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[19][1]), 4)[3] === '1'
        },
        charge: parsedData[8] === '1'
      },
      voltage: {
        battery:
          parsedData[11] !== ''
            ? parseInt(100 * (parseFloat(parsedData[11]) / 5), 10)
            : null, // percentage
        inputCharge:
          parsedData[17] !== '' ? parseFloat(parsedData[17]) / 1000 : null,
        ada: parsedData[18] !== '' ? parseFloat(parsedData[18]) / 1000 : null,
        adb: parsedData[19] !== '' ? parseFloat(parsedData[19]) / 1000 : null
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
        adb: null
      },
      mcc: parsedData[14] !== '' ? utils.latamMcc[parseInt(parsedData[14], 10)] : null,
      mnc: parsedData[15] !== '' ? utils.getMNC(parsedData[14], parsedData[15]) : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      odometer: parsedData[19] !== '' ? parseFloat(parsedData[19]) : null,
      hourmeter: null
    })
  } else if (command[1] === 'GTTMP') {
    // Temperature Alarm
    let number = parsedData[7] !== '' ? parseInt(parsedData[7], 10) : 1
    let index = 8 + 12 * number // odometer
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[6], [
        parsedData[index + 9],
        parsedData[index + 11]
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
        raw: `${parsedData[index + 4]}${parsedData[index + 5]}`,
        sos: false,
        input: {
          '4':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 4][1]), 4)[0] ===
            '1',
          '3':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 4][1]), 4)[1] ===
            '1',
          '2':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 4][1]), 4)[2] ===
            '1',
          '1':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 4][1]), 4)[3] ===
            '1'
        },
        output: {
          '3':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 5][1]), 4)[1] ===
            '1',
          '2':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 5][1]), 4)[2] ===
            '1',
          '1':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 5][1]), 4)[3] ===
            '1'
        },
        charge: parseFloat(parsedData[5]) > 5,
        state: null
      },
      azimuth: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
      voltage: {
        battery: null, // percentage
        inputCharge:
          parsedData[5] !== '' ? parseFloat(parsedData[5]) / 1000 : null,
        ada:
          parsedData[index + 2] !== ''
            ? parseFloat(parsedData[index + 2]) / 1000
            : null,
        adb:
          parsedData[index + 3] !== ''
            ? parseFloat(parsedData[index + 3]) / 1000
            : null
      },
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      odometer: parsedData[index] !== '' ? parseFloat(parsedData[index]) : null,
      hourmeter:
        parsedData[index + 1] !== ''
          ? utils.getHoursForHourmeter(parsedData[index + 1])
          : null
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
        battery: parsedData[23] !== '' ? parseFloat(parsedData[23]) : null, // percentage
        inputCharge:
          parsedData[4] !== '' ? parseFloat(parsedData[4]) / 1000 : null,
        ada: parsedData[21] !== '' ? parseFloat(parsedData[21]) : null,
        adb: parsedData[22] !== '' ? parseFloat(parsedData[22]) : null
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
        adb: null
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
        adb: null
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
        adb: null
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
        adb: null
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
        adb: null
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
        adb: null
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
        adb: null
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
        adb: null
      },
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
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
        adb: null
      },
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      odometer: parsedData[20] !== '' ? parseFloat(parsedData[20]) : null,
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
