'use strict'
const utils = require('./utils.js')

/*
  Parses messages data from GV310LAU devices
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
    device: 'Queclink-GV310LAU',
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
      let number = parsedData[6] !== '' ? parseInt(parsedData[6], 10) : 1
      let index = 6 + 12 * number // odometer
      let satelliteInfo = false

      // If get satellites is configured
      if (utils.includeSatellites(parsedData[18])) {
        index += 1
        satelliteInfo = true
      }

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
          // parsedData[26]
          raw: parsedData[index + 7],
          sos: false,
          input: {
            '1':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[index + 7], 10).substring(6, 8)
                ),
                4
              )[3] === '1',
            '2':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[index + 7], 10).substring(6, 8)
                ),
                4
              )[2] === '1',
            '3':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[index + 7], 10).substring(6, 8)
                ),
                4
              )[1] === '1',
            '4':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[index + 7], 10).substring(6, 8)
                ),
                4
              )[0] === '1'
          },
          output: {
            '1':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[index + 7], 10).substring(8, 10)
                ),
                3
              )[2] === '1',
            '2':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[index + 7], 10).substring(8, 10)
                ),
                3
              )[1] === '1',
            '3':
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[index + 7], 10).substring(8, 10)
                ),
                3
              )[0] === '1'
          },
          charge: parseFloat(parsedData[4]) > 5,
          state:
            utils.nHexDigit(parsedData[index + 7], 10).substring(4, 6) !== ''
              ? utils.states[ // eslint-disable-line
                utils.nHexDigit(parsedData[index + 7], 10).substring(4, 6)
              ]
              : null
        },
        azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
        altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
        datetime:
          parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
        voltage: {
          battery:
            parsedData[index + 6] !== ''
              ? parseFloat(parsedData[index + 6])
              : null, // percentage
          inputCharge:
            parsedData[4] !== '' ? parseFloat(parsedData[4]) / 1000 : null,
          ada:
            parsedData[index + 4] !== ''
              ? parseFloat(parsedData[index + 3]) / 1000
              : null,
          adb:
            parsedData[index + 5] !== ''
              ? parseFloat(parsedData[index + 4]) / 1000
              : null,
          adc:
            parsedData[index + 6] !== ''
              ? parseFloat(parsedData[index + 5]) / 1000
              : null
        },
        mcc: parsedData[13] !== '' ? parseInt(parsedData[14], 10) : null,
        mnc: parsedData[14] !== '' ? parseInt(parsedData[15], 10) : null,
        lac: parsedData[15] !== '' ? parseInt(parsedData[16], 16) : null,
        cid: parsedData[16] !== '' ? parseInt(parsedData[17], 16) : null,
        satellites:
          satelliteInfo && parsedData[index] !== ''
            ? parseInt(parsedData[index], 10)
            : null,
        odometer:
          parsedData[index + 1] !== ''
            ? parseFloat(parsedData[index + 1])
            : null,
        hourmeter:
          parsedData[index + 2] !== ''
            ? utils.getHoursForHourmeter(parsedData[index + 2])
            : null
      })
    } catch (err) {
      return { type: 'UNKNOWN', raw: data.raw.toString() }
    }
  } else if (command[1] === 'GTERI') {
    // GPS with AC100 Devices Connected
    let number = parsedData[7] !== '' ? parseInt(parsedData[7], 10) : 1
    let index = 7 + 12 * number // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[19])) {
      index += 1
      satelliteInfo = true
    }

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
        // parsedData[index + 7]
        raw: parsedData[index + 7],
        sos: false,
        input: {
          '1':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[index + 7], 10).substring(6, 8)
              ),
              4
            )[3] === '1',
          '2':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[index + 7], 10).substring(6, 8)
              ),
              4
            )[2] === '1',
          '3':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[index + 7], 10).substring(6, 8)
              ),
              4
            )[1] === '1',
          '4':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[index + 7], 10).substring(6, 8)
              ),
              4
            )[0] === '1'
        },
        output: {
          '1':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[index + 7], 10).substring(8, 10)
              ),
              3
            )[2] === '1',
          '2':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[index + 7], 10).substring(8, 10)
              ),
              3
            )[1] === '1',
          '3':
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[index + 7], 10).substring(8, 10)
              ),
              3
            )[0] === '1'
        },
        charge: parseFloat(parsedData[5]) > 5,
        state:
          utils.nHexDigit(parsedData[index + 7], 10).substring(4, 6) !== ''
            ? utils.states[ // eslint-disable-line
              utils.nHexDigit(parsedData[index + 7], 10).substring(4, 6)
            ]
            : null
      },
      azimuth: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
      voltage: {
        battery:
          parsedData[index + 6] !== ''
            ? parseFloat(parsedData[index + 6])
            : null, // percentage
        inputCharge:
          parsedData[5] !== '' ? parseFloat(parsedData[5]) / 1000 : null,
        ada:
          parsedData[index + 3] !== ''
            ? parseFloat(parsedData[index + 3]) / 1000
            : null,
        adb:
          parsedData[index + 4] !== ''
            ? parseFloat(parsedData[index + 4]) / 1000
            : null,
        adc:
          parsedData[index + 5] !== ''
            ? parseFloat(parsedData[index + 5]) / 1000
            : null
      },
      mcc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      mnc: parsedData[16] !== '' ? parseInt(parsedData[16], 10) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseFloat(parsedData[index])
          : null,
      odometer:
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null,
      hourmeter:
        parsedData[index + 2] !== ''
          ? utils.getHoursForHourmeter(parsedData[index + 2])
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

    const fuelSensorData = digitFuelSensor ? parsedData[index + 9] : null
    const ac100DevicesConnected =
      AC100 && digitFuelSensor
        ? parseInt(parsedData[index + 10], 10)
        : AC100 && !digitFuelSensor ? parseInt(parsedData[index + 9], 10) : 0

    let externalData = {
      eriMask: {
        raw: parsedData[4],
        digitFuelSensor: digitFuelSensor,
        AC100: AC100,
        reserved: reserved,
        fuelLevelPercentage: fuelLevelPercentage,
        fuelVolume: fuelVolume
      },
      uartDeviceType: utils.uartDeviceTypes[parsedData[index + 8]]
    }

    if (parsedData[index + 8] === '1') {
      // Fuel Sensor
      if (digitFuelSensor && !AC100) {
        externalData = Object.assign(externalData, {
          fuelSensorData: {
            data: fuelSensorData,
            sensorType: parsedData[index + 11],
            percentage:
              fuelLevelPercentage && parsedData[index + 12] !== ''
                ? parseInt(parsedData[index + 12], 10)
                : null,
            volume:
              fuelVolume && fuelLevelPercentage && parsedData[index + 12] !== ''
                ? parseInt(parsedData[index + 13], 10)
                : fuelVolume &&
                  !fuelLevelPercentage &&
                  parsedData[index + 12] !== ''
                  ? parseInt(parsedData[index + 12], 10)
                  : null
          },
          AC100Devices: null
        })
      } else if (!digitFuelSensor && AC100) {
        let ac100Devices = []
        let count = index + 11
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
            : fuelVolume && !fuelLevelPercentage ? index + 13 : index + 12
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
            sensorType: parsedData[index + 11],
            percentage:
              fuelLevelPercentage && parsedData[index + 12] !== ''
                ? parseInt(parsedData[index + 12], 10)
                : null,
            volume:
              fuelVolume && fuelLevelPercentage && parsedData[index + 13] !== ''
                ? parseInt(parsedData[index + 13], 10)
                : fuelVolume &&
                  !fuelLevelPercentage &&
                  parsedData[index + 12] !== ''
                  ? parseInt(parsedData[index + 12], 10)
                  : null
          },
          AC100Devices: ac100Devices
        })
      }
    } else if (parsedData[index + 8] === '2') {
      // AC100 1 Wire Bus
      if (!digitFuelSensor && AC100) {
        let ac100Devices = []
        let count = index + 10
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
        let count = index + 12
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
        networkType: utils.networkTypes[parsedData[10]],
        RSSI: parseInt(parsedData[6], 10),
        RSSI_quality: utils.getSignalStrength(
          utils.networkTypes[parsedData[10]],
          parseInt(parsedData[6], 10)
        ), // Signal Strength
        RSSI_percentage: utils.getSignalPercentage(
          utils.networkTypes[parsedData[10]],
          parseInt(parsedData[6], 10)
        ), // Signal Percetange
        GSM_quality:
          parsedData[7] !== ''
            ? 100 * parseInt(parseFloat(parsedData[7]) / 7, 10)
            : null // Percentage
      },
      backupBattery: {
        using: parsedData[11] !== '' && parseFloat(parsedData[11]) < 4.5,
        voltage: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
        charging: parsedData[12] === '1'
      },
      externalGPSAntenna: utils.externalGPSAntennaOptions[parsedData[15]],
      status: {
        raw: parsedData[18] + parsedData[19] + parsedData[20],
        sos: false,
        input: {
          '4': utils.nHexDigit(utils.hex2bin(parsedData[21][1]), 4)[0] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[21][1]), 4)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[21][1]), 4)[2] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[21][1]), 4)[3] === '1'
        },
        output: {
          '4': utils.nHexDigit(utils.hex2bin(parsedData[22][1]), 4)[0] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[22][1]), 4)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[22][1]), 4)[2] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[22][1]), 4)[3] === '1'
        },
        charge: parsedData[12] === '1'
      },
      voltage: {
        battery:
          parsedData[11] !== ''
            ? parseInt(100 * (parseFloat(parsedData[11]) / 4.5), 10)
            : null, // percentage
        inputCharge:
          parsedData[9] !== '' ? parseFloat(parsedData[9]) / 1000 : null,
        ada: parsedData[18] !== '' ? parseFloat(parsedData[18]) / 1000 : null,
        adb: parsedData[19] !== '' ? parseFloat(parsedData[19]) / 1000 : null,
        adc: parsedData[20] !== '' ? parseFloat(parsedData[20]) / 1000 : null
      },
      lastFixUTCTime:
        parsedData[16] !== '' ? utils.parseDate(parsedData[16]) : null,
      timezoneOffset: parsedData[23]
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
    command[1] === 'GTVGL' ||
    command[1] === 'GTHBM'
  ) {
    // Common Alarms
    let number = parsedData[6] !== '' ? parseInt(parsedData[6], 10) : 1
    let index = 6 + 12 * number // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[18])) {
      index += 1
      satelliteInfo = true
    }

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[5], 'gv310lau'),
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
      mcc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      mnc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      odometer:
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null,
      overspeedStatus:
        parseInt(parsedData[4], 10) === 1 || parseInt(parsedData[4], 10) === 3
          ? parsedData[index + 2] === '1'
          : null,
      lastSpeedStateDuration:
        parseInt(parsedData[4], 10) === 2
          ? parsedData[index + 2]
          : parseInt(parsedData[4], 10) === 3 ? parsedData[index + 3] : null,
      hourmeter: null
    })
  } else if (command[1] === 'GTEPS' || command[1] === 'GTAIS') {
    // External low battery and Low voltage for analog input
    let number = parsedData[6] !== '' ? parseInt(parsedData[6], 10) : 1
    let index = 6 + 12 * number // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[18])) {
      index += 1
      satelliteInfo = true
    }

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
        battery: parsedData[4] !== '' ? parseFloat(parsedData[4]) / 1000 : null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      mnc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      odometer:
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null,
      hourmeter: null
    })
  } else if (command[1] === 'GTTMP') {
    // Temperature Alarm
    let number = parsedData[7] !== '' ? parseInt(parsedData[7], 10) : 1
    let index = 7 + 12 * number // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[19])) {
      index += 1
      satelliteInfo = true
    }

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[6], [
        parsedData[index + 11],
        parsedData[index + 13]
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
        raw: `${parsedData[index + 6]}${parsedData[index + 7]}`,
        sos: false,
        input: {
          '4':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 6][1]), 4)[0] ===
            '1',
          '3':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 6][1]), 4)[1] ===
            '1',
          '2':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 6][1]), 4)[2] ===
            '1',
          '1':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 6][1]), 4)[3] ===
            '1'
        },
        output: {
          '3':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 7][1]), 4)[1] ===
            '1',
          '2':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 7][1]), 4)[2] ===
            '1',
          '1':
            utils.nHexDigit(utils.hex2bin(parsedData[index + 7][1]), 4)[3] ===
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
          parsedData[index + 3] !== ''
            ? parseFloat(parsedData[index + 3]) / 1000
            : null,
        adb:
          parsedData[index + 4] !== ''
            ? parseFloat(parsedData[index + 4]) / 1000
            : null,
        adc:
          parsedData[index + 5] !== ''
            ? parseFloat(parsedData[index + 5]) / 1000
            : null
      },
      mcc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      mnc: parsedData[16] !== '' ? parseInt(parsedData[16], 10) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer:
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null,
      hourmeter:
        parsedData[index + 2] !== ''
          ? utils.getHoursForHourmeter(parsedData[index + 2])
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
    command[1] === 'GTBTC'
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
      mcc: parsedData[11] !== '' ? parseInt(parsedData[11], 10) : null,
      mnc: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
      lac: parsedData[13] !== '' ? parseInt(parsedData[13], 16) : null,
      cid: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTCRA') {
    // Crash report
    let index = 16 // position append mask
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[16])) {
      index += 1
      satelliteInfo = true
    }

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
      mcc: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
      mnc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer: null,
      hourmeter: null
    })
  } else if (
    command[1] === 'GTANT' ||
    command[1] === 'GTRMD' ||
    command[1] === 'GTBPL'
  ) {
    let index = 16 // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[16])) {
      index += 1
      satelliteInfo = true
    }

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
      mcc: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
      mnc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTJDS') {
    let index = 17 // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[17])) {
      index += 1
      satelliteInfo = true
    }

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[4]),
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
      mcc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      mnc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTIGN' || command[1] === 'GTIGF') {
    let index = 16 // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

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
      mcc: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
      mnc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer:
        parsedData[index + 2] !== '' ? parseFloat(parsedData[index + 2]) : null,
      hourmeter:
        parsedData[index + 1] !== ''
          ? utils.getHoursForHourmeter(parsedData[index + 1])
          : null
    })
  } else if (command[1] === 'GTIDN' || command[1] === 'GTIDF') {
    let index = 17 // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

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
      mcc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      mnc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer:
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null,
      hourmeter: null
    })
  } else if (
    command[1] === 'GTSTR' ||
    command[1] === 'GTSTP' ||
    command[1] === 'GTLSP'
  ) {
    let index = 17 // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

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
      mcc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      mnc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer:
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null,
      hourmeter: null
    })
  } else if (command[1] === 'GTSTT') {
    let index = 16 // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

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
      mcc: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
      mnc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTGSS') {
    // GPS Status
    let index = 19 // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

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
      mcc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      mnc: parsedData[16] !== '' ? parseInt(parsedData[16], 10) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      usedSatellites: parsedData[5] !== '' ? parseInt(parsedData[5], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTIDA') {
    // iButton
    let number = parsedData[7] !== '' ? parseInt(parsedData[7], 10) : 1
    let index = 7 + 12 * number // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

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
      mcc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      mnc: parsedData[16] !== '' ? parseInt(parsedData[16], 10) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer:
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null,
      hourmeter: null
    })
  } else if (command[1] === 'GTCAN') {
    let index = 67 // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

    let inicatorsBin =
      parsedData[24] !== ''
        ? utils.nHexDigit(utils.hex2bin(parsedData[24]), 16)
        : null
    let lights =
      parsedData[25] !== ''
        ? utils.nHexDigit(utils.hex2bin(parsedData[25]), 8)
        : null
    let doors =
      parsedData[26] !== ''
        ? utils.nHexDigit(utils.hex2bin(parsedData[26]), 8)
        : null

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[4]),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[60]), parseFloat(parsedData[61])]
      },
      speed: parsedData[57] !== '' ? parseFloat(parsedData[57]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[60]),
        parseFloat(parsedData[61])
      ),
      hdop: parsedData[56] !== '' ? parseFloat(parsedData[56]) : null,
      status: null,
      azimuth: parsedData[58] !== '' ? parseFloat(parsedData[58]) : null,
      altitude: parsedData[59] !== '' ? parseFloat(parsedData[59]) : null,
      datetime: parsedData[62] !== '' ? utils.parseDate(parsedData[62]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[63] !== '' ? parseInt(parsedData[63], 10) : null,
      mnc: parsedData[64] !== '' ? parseInt(parsedData[64], 10) : null,
      lac: parsedData[65] !== '' ? parseInt(parsedData[65], 16) : null,
      cid: parsedData[66] !== '' ? parseInt(parsedData[66], 16) : null,
      satellites:
        satelliteInfo && parsedData[index]
          ? parseInt(parsedData[index], 10)
          : null,
      odometer: null,
      hourmeter: null,
      can: {
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
        engineHours: parsedData[18] !== '' ? parseFloat(parsedData[18]) : null,
        drivingTime: parsedData[19] !== '' ? parseFloat(parsedData[19]) : null,
        idleTime: parsedData[20] !== '' ? parseFloat(parsedData[20]) : null,
        idleFuelUsed: parsedData[21] !== '' ? parseFloat(parsedData[21]) : null,
        axleWight: parsedData[22] !== '' ? parsedData[22] : null,
        tachograph: parsedData[23] !== '' ? parsedData[23] : null,
        indicators: {
          raw: parsedData[24] !== '' ? parsedData[24] : null,
          lowFuel: inicatorsBin ? inicatorsBin[0] === '1' : null,
          driverSeatbelt: inicatorsBin ? inicatorsBin[1] === '1' : null,
          airConditioning: inicatorsBin ? inicatorsBin[2] === '1' : null,
          cruiseControl: inicatorsBin ? inicatorsBin[3] === '1' : null,
          brakePedal: inicatorsBin ? inicatorsBin[4] === '1' : null,
          clutchPedal: inicatorsBin ? inicatorsBin[5] === '1' : null,
          handbrake: inicatorsBin ? inicatorsBin[6] === '1' : null,
          centralLock: inicatorsBin ? inicatorsBin[7] === '1' : null,
          reverseGear: inicatorsBin ? inicatorsBin[8] === '1' : null,
          runningLights: inicatorsBin ? inicatorsBin[9] === '1' : null,
          lowBeams: inicatorsBin ? inicatorsBin[10] === '1' : null,
          highBeams: inicatorsBin ? inicatorsBin[11] === '1' : null,
          rearFogLights: inicatorsBin ? inicatorsBin[12] === '1' : null,
          frontFogLights: inicatorsBin ? inicatorsBin[13] === '1' : null,
          doors: inicatorsBin ? inicatorsBin[14] === '1' : null,
          trunk: inicatorsBin ? inicatorsBin[15] === '1' : null
        },
        lights: {
          raw: parsedData[25] !== '' ? parsedData[25] : null,
          running: lights ? lights[0] === '1' : null,
          lowBeams: lights ? lights[1] === '1' : null,
          frontFog: lights ? lights[2] === '1' : null,
          rearFog: lights ? lights[3] === '1' : null,
          hazard: lights ? lights[4] === '1' : null
        },
        doors: {
          raw: parsedData[26] !== '' ? parsedData[26] : null,
          driver: doors ? doors[0] === '1' : null,
          passenger: doors ? doors[1] === '1' : null,
          rearLeft: doors ? doors[2] === '1' : null,
          rearRight: doors ? doors[3] === '1' : null,
          trunk: doors ? doors[4] === '1' : null,
          hood: doors ? doors[5] === '1' : null
        },
        overSpeedTime: parsedData[27] !== '' ? parsedData[27] : null,
        overSpeedEngineTime: parsedData[28] !== '' ? parsedData[28] : null,
        adblueLevel: parsedData[30] !== '' ? parsedData[30] : null
      }
    })
  } else if (command[1] === 'GTDAT') {
    let dataIndex = 4
    // Short format
    if (parsedData.length === 7) {
      data = Object.assign(data, {
        loc: null,
        speed: null,
        gpsStatus: null,
        hdop: null,
        status: null,
        azimuth: null,
        altitude: null,
        datetime: null,
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
        satellites: null,
        odometer: null,
        hourmeter: null
      })
    } else {
      dataIndex = 7
      let index = 19 // odometer
      let satelliteInfo = false

      // If get satellites is configured
      if (utils.includeSatellites(parsedData[index])) {
        index += 1
        satelliteInfo = true
      }

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
        datetime:
          parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
        voltage: {
          battery: null,
          inputCharge: null,
          ada: null,
          adb: null,
          adc: null
        },
        mcc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
        mnc: parsedData[16] !== '' ? parseInt(parsedData[16], 10) : null,
        lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
        cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
        satellites:
          satelliteInfo && parsedData[index] !== ''
            ? parseInt(parsedData[index], 10)
            : null,
        odometer: null,
        hourmeter: null
      })
    }

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
        alarm: utils.getAlarm(command[1], parsedData[dataIndex])
      })
    }
  } else if (command[1] === 'GTDTT') {
    // short format
    if (parsedData.length === 11) {
      data = Object.assign(data, {
        alarm: utils.getAlarm(command[1], parsedData[8], parsedData[6]),
        loc: null,
        speed: null,
        gpsStatus: null,
        hdop: null,
        status: null,
        azimuth: null,
        altitude: null,
        datetime: null,
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
        satellites: null,
        odometer: null,
        hourmeter: null
      })
    } else {
      // Long format
      let index = 20 // odometer
      let satelliteInfo = false

      // If get satellites is configured
      if (utils.includeSatellites(parsedData[index])) {
        index += 1
        satelliteInfo = true
      }

      data = Object.assign(data, {
        alarm: utils.getAlarm(command[1], parsedData[8], parsedData[6]),
        loc: {
          type: 'Point',
          coordinates: [parseFloat(parsedData[13]), parseFloat(parsedData[14])]
        },
        speed: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
        gpsStatus: utils.checkGps(
          parseFloat(parsedData[13]),
          parseFloat(parsedData[14])
        ),
        hdop: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
        status: null,
        azimuth: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
        altitude: parsedData[12] !== '' ? parseFloat(parsedData[12]) : null,
        datetime:
          parsedData[15] !== '' ? utils.parseDate(parsedData[15]) : null,
        voltage: {
          battery: null,
          inputCharge: null,
          ada: null,
          adb: null,
          adc: null
        },
        mcc: parsedData[16] !== '' ? parseInt(parsedData[16], 10) : null,
        mnc: parsedData[17] !== '' ? parseInt(parsedData[17], 10) : null,
        lac: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
        cid: parsedData[19] !== '' ? parseInt(parsedData[19], 16) : null,
        satellites:
          satelliteInfo && parsedData[index] !== ''
            ? parseInt(parsedData[index], 10)
            : null,
        odometer: null,
        hourmeter: null
      })
    }
  } else if (command[1] === 'GTDOS') {
    let index = 17 // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

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
      mcc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      mnc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTCID') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[4], 'gv310lau'),
      loc: {
        type: 'Point',
        coordinates: [null, null]
      },
      speed: null,
      gpsStatus: null,
      hdop: null,
      status: null,
      azimuth: null,
      altitude: null,
      datetime: parsedData[5] !== '' ? utils.parseDate(parsedData[5]) : null,
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
      satellites: null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTCSQ') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[5], 'gv310lau'),
      loc: {
        type: 'Point',
        coordinates: [null, null]
      },
      speed: null,
      gpsStatus: null,
      hdop: null,
      status: null,
      azimuth: null,
      altitude: null,
      datetime: parsedData[6] !== '' ? utils.parseDate(parsedData[6]) : null,
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
      satellites: null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTVER') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(
        command[1],
        [parsedData[5], parsedData[6]],
        'gv310lau'
      ),
      loc: {
        type: 'Point',
        coordinates: [null, null]
      },
      speed: null,
      gpsStatus: null,
      hdop: null,
      status: null,
      azimuth: null,
      altitude: null,
      datetime: parsedData[7] !== '' ? utils.parseDate(parsedData[7]) : null,
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
      satellites: null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTBCS' || command[1] === 'GTBDS') {
    // Bluetooth connection/desconnection
    let index = 16 // odometer
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[5], 'gv310lau'),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[11]), parseFloat(parsedData[12])]
      },
      speed: parsedData[6] !== '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[11]),
        parseFloat(parsedData[12])
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
      mcc: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
      mnc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      odometer: null,
      hourmeter: null,
      bluetooth: {
        raw: parsedData[index + 1],
        connected: parsedData[index + 6] !== '',
        bluetoothInfo: {
          name:
            parsedData[index + 2] !== '' &&
            utils.nHexDigit(utils.hex2bin(parsedData[index + 1]), 16)[15] ===
              '1'
              ? parsedData[index + 2]
              : null,
          mac:
            parsedData[index + 3] !== '' &&
            utils.nHexDigit(utils.hex2bin(parsedData[index + 1]), 16)[14] ===
              '1'
              ? parsedData[index + 3]
              : null
        },
        peerInfo: {
          role:
            parsedData[index + 4] !== '' &&
            utils.nHexDigit(utils.hex2bin(parsedData[index + 1]), 16)[7] === '1'
              ? utils.peerRoles[parsedData[index + 4]]
              : null,
          type:
            parsedData[index + 5] !== '' &&
            utils.nHexDigit(utils.hex2bin(parsedData[index + 1]), 16)[5] === '1'
              ? utils.peerAddressesTypes[parsedData[index + 5]]
              : null,
          mac:
            parsedData[index + 6] !== '' &&
            utils.nHexDigit(utils.hex2bin(parsedData[index + 1]), 16)[4] === '1'
              ? parsedData[index + 6]
              : null
        },
        disconnectionReason:
          parsedData[index + 7] !== '' && command[1] === 'GTBDS'
            ? utils.disconnectionReasons[parsedData[index + 7]]
            : null
      }
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
