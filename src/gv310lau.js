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
      let satelliteInfo = utils.includeSatellites(parsedData[18])
      let accuracyInfo = utils.includeGnnsAccuracy(parsedData[18]) ? 3 : 0
      let index = 6 + (12 + satelliteInfo + accuracyInfo) * number

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
        mcc: parsedData[14] !== '' ? utils.latamMcc[parseInt(parsedData[14], 10)] : null,
        mnc: parsedData[15] !== '' ? utils.getMNC(parsedData[14], parsedData[15]) : null,
        lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
        cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
        satellites:
          satelliteInfo && parsedData[index - (satelliteInfo + accuracyInfo) + 1] !== ''
            ? parseInt(parsedData[index - (satelliteInfo + accuracyInfo) + 1], 10)
            : null,
        Hdop:
          accuracyInfo && parsedData[index - accuracyInfo + 1] !== ''
            ? parseFloat(parsedData[index - accuracyInfo + 1])
            : null,
        Vdop:
          accuracyInfo && parsedData[index - accuracyInfo + 2] !== ''
            ? parseFloat(parsedData[index - accuracyInfo + 2])
            : null,
        Ddop:
          accuracyInfo && parsedData[index] !== ''
            ? parseFloat(parsedData[index])
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

      // More than 1 GNSS report in data
      if (number > 1) {
        let moreData = []
        for (let i = 1; i < number; i++) {
          let gnssIx = 7 + (12 + satelliteInfo + accuracyInfo) * i
          moreData.push({
            index: i,
            loc: {
              type: 'Point',
              coordinates: [
                parseFloat(parsedData[gnssIx + 4]),
                parseFloat(parsedData[gnssIx + 5])
              ]
            },
            speed:
              parsedData[gnssIx + 1] !== ''
                ? parseFloat(parsedData[gnssIx + 1])
                : null,
            gpsStatus: utils.checkGps(
              parseFloat(parsedData[gnssIx + 4]),
              parseFloat(parsedData[gnssIx + 5])
            ),
            hdop:
              parsedData[gnssIx] !== '' ? parseFloat(parsedData[gnssIx]) : null,
            azimuth:
              parsedData[gnssIx + 2] !== ''
                ? parseFloat(parsedData[gnssIx + 2])
                : null,
            altitude:
              parsedData[gnssIx + 3] !== ''
                ? parseFloat(parsedData[gnssIx + 3])
                : null,
            datetime:
              parsedData[gnssIx + 6] !== ''
                ? utils.parseDate(parsedData[gnssIx + 6])
                : null,
            mcc:
              parsedData[gnssIx + 7] !== ''
                ? parseInt(parsedData[gnssIx + 7], 10)
                : null,
            mnc:
              parsedData[gnssIx + 8] !== ''
                ? parseInt(parsedData[gnssIx + 8], 10)
                : null,
            lac:
              parsedData[gnssIx + 9] !== ''
                ? parseInt(parsedData[gnssIx + 9], 16)
                : null,
            cid:
              parsedData[gnssIx + 10] !== ''
                ? parseInt(parsedData[gnssIx + 10], 16)
                : null,
            satellites:
              satelliteInfo && parsedData[gnssIx + 12] !== ''
                ? parseInt(parsedData[gnssIx + 12], 10)
                : null,
            Hdop:
              accuracyInfo && parsedData[gnssIx + 13] !== ''
                ? parseFloat(parsedData[gnssIx + 13], 10)
                : null,
            Vdop:
              accuracyInfo && parsedData[gnssIx + 14] !== ''
                ? parseFloat(parsedData[gnssIx + 14], 10)
                : null,
            Ddop:
              accuracyInfo && parsedData[gnssIx + 15] !== ''
                ? parseFloat(parsedData[gnssIx + 15], 10)
                : null
          })
        }

        data = Object.assign(data, { moreData: moreData })
      }
    } catch (err) {
      return { type: 'UNKNOWN', raw: data.raw.toString() }
    }
  } else if (command[1] === 'GTERI') {
    // GPS with AC100 and/or Bluetoth Devices Connected
    let number = parsedData[7] !== '' ? parseInt(parsedData[7], 10) : 1
    let satelliteInfo = utils.includeSatellites(parsedData[19])
    let accuracyInfo = utils.includeGnnsAccuracy(parsedData[19]) ? 3 : 0
    let index = 7 + (12 + satelliteInfo + accuracyInfo) * number

    // External Data
    const digitFuelSensor =
      utils.nHexDigit(utils.hex2bin(parsedData[4]), 11)[10] === '1'
    const AC100 = utils.nHexDigit(utils.hex2bin(parsedData[4]), 11)[9] === '1'
    const canData =
      utils.nHexDigit(utils.hex2bin(parsedData[4]), 11)[8] === '1'
    const fuelLevelPercentage =
      utils.nHexDigit(utils.hex2bin(parsedData[4]), 11)[7] === '1'
    const fuelVolume =
      utils.nHexDigit(utils.hex2bin(parsedData[4]), 11)[6] === '1'
    const bluetoothAccessory =
      utils.nHexDigit(utils.hex2bin(parsedData[4]), 11)[2] === '1'

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
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      satellites:
        satelliteInfo && parsedData[index - (satelliteInfo + accuracyInfo) + 1] !== ''
          ? parseInt(parsedData[index - (satelliteInfo + accuracyInfo) + 1])
          : null,
      Hdop:
        accuracyInfo && parsedData[index - accuracyInfo + 1] !== ''
          ? parseFloat(parsedData[index - accuracyInfo + 1])
          : null,
      Vdop:
        accuracyInfo && parsedData[index - accuracyInfo + 2] !== ''
          ? parseFloat(parsedData[index - accuracyInfo + 2])
          : null,
      Ddop:
        accuracyInfo && parsedData[index] !== ''
          ? parseFloat(parsedData[index])
          : null,
      odometer:
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null,
      hourmeter:
        parsedData[index + 2] !== ''
          ? utils.getHoursForHourmeter(parsedData[index + 2])
          : null,
    })

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
        canData: canData,
        fuelLevelPercentage: fuelLevelPercentage,
        fuelVolume: fuelVolume,
        bluetoothAccessory: bluetoothAccessory
      },
      uartDeviceType:
        parsedData[index + 8] !== ''
          ? utils.uartDeviceTypes[parsedData[index + 8]]
          : null
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

    if (canData) {
      let newIndex = digitFuelSensor && !AC100 ? index + 9 + 1 : !digitFuelSensor && AC100 ? index + 9 + 4 : digitFuelSensor && AC100 ? index + 9 + 5 : index + 9
      let canInfo = utils.getCanData(parsedData, newIndex)
      data = Object.assign(data, { can: canInfo })
      index = index + 49

      if (canInfo?.totalDistance) {
        data.gpsOdometer = data.odometer
        data.odometer = canInfo.totalDistance
      }

      if (canInfo?.engineHours) {
        data.gpsHourmeter = data.hourmeter
        data.hourmeter = canInfo.engineHours
      }

      if (canInfo?.speed) {
        data.gpsSpeed = data.speed
        data.speed = canInfo.speed
      }
    }

    // Bluetooth Accessories
    if (bluetoothAccessory) {
      let btIndex = digitFuelSensor ? index + 10 : index + 9
      let btDevices = utils.getBleData(parsedData, btIndex)
      externalData = Object.assign(externalData, {
        btDevices: btDevices
      })
    }

    data = Object.assign(data, {
      externalData: externalData
    })

    // More than 1 GNSS report in data
    if (number > 1) {
      let moreData = []
      for (let i = 1; i < number; i++) {
        let gnssIx = 8 + (12 + satelliteInfo + accuracyInfo) * i
        moreData.push({
          index: i,
          loc: {
            type: 'Point',
            coordinates: [
              parseFloat(parsedData[gnssIx + 4]),
              parseFloat(parsedData[gnssIx + 5])
            ]
          },
          speed:
            parsedData[gnssIx + 1] !== ''
              ? parseFloat(parsedData[gnssIx + 1])
              : null,
          gpsStatus: utils.checkGps(
            parseFloat(parsedData[gnssIx + 4]),
            parseFloat(parsedData[gnssIx + 5])
          ),
          hdop:
            parsedData[gnssIx] !== '' ? parseFloat(parsedData[gnssIx]) : null,
          azimuth:
            parsedData[gnssIx + 2] !== ''
              ? parseFloat(parsedData[gnssIx + 2])
              : null,
          altitude:
            parsedData[gnssIx + 3] !== ''
              ? parseFloat(parsedData[gnssIx + 3])
              : null,
          datetime:
            parsedData[gnssIx + 6] !== ''
              ? utils.parseDate(parsedData[gnssIx + 6])
              : null,
          mcc:
            parsedData[gnssIx + 7] !== ''
              ? parseInt(parsedData[gnssIx + 7], 10)
              : null,
          mnc:
            parsedData[gnssIx + 8] !== ''
              ? parseInt(parsedData[gnssIx + 8], 10)
              : null,
          lac:
            parsedData[gnssIx + 9] !== ''
              ? parseInt(parsedData[gnssIx + 9], 16)
              : null,
          cid:
            parsedData[gnssIx + 10] !== ''
              ? parseInt(parsedData[gnssIx + 10], 16)
              : null,
          satellites:
            satelliteInfo && parsedData[gnssIx + 12] !== ''
              ? parseInt(parsedData[gnssIx + 12], 10)
              : null,
          Hdop:
            accuracyInfo && parsedData[gnssIx + 13] !== ''
              ? parseFloat(parsedData[gnssIx + 13], 10)
              : null,
          Vdop:
            accuracyInfo && parsedData[gnssIx + 14] !== ''
              ? parseFloat(parsedData[gnssIx + 14], 10)
              : null,
          Ddop:
            accuracyInfo && parsedData[gnssIx + 15] !== ''
              ? parseFloat(parsedData[gnssIx + 15], 10)
              : null
        })
      }

      data = Object.assign(data, { moreData: moreData })
    }
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
        SIM_ICC: parsedData[5] !== '' ? parsedData[5] : null,
        networkType:
          parsedData[10] !== '' ? utils.networkTypes[parsedData[10]] : null,
        RSSI: parsedData[6] !== '' ? parseInt(parsedData[6], 10) : null,
        RSSI_quality:
          parsedData[10] !== ''
            ? utils.getSignalStrength(
              utils.networkTypes[parsedData[10]],
              parseInt(parsedData[6], 10)
            )
            : null, // Signal Strength
        RSSI_percentage:
          parsedData[10] !== ''
            ? utils.getSignalPercentage(
              utils.networkTypes[parsedData[10]],
              parseInt(parsedData[6], 10)
            )
            : null, // Signal Percetange
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
    let posAppendMask = parsedData[18] ? utils
      .nHexDigit(utils.hex2bin(parsedData[18]), 8) : null

    // If get satellites is configured
    let satelliteInfo = posAppendMask && posAppendMask[7] === '1' ? 1 : 0
    let accuracyInfo = posAppendMask && posAppendMask[4] === '1' ? 3 : 0
    let index = 6 + (12 + satelliteInfo + accuracyInfo) * number

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
      mcc: parsedData[14] !== '' ? utils.latamMcc[parseInt(parsedData[14], 10)] : null,
      mnc: parsedData[15] !== '' ? utils.getMNC(parsedData[14], parsedData[15]) : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      satellites:
        satelliteInfo && parsedData[index - (satelliteInfo + accuracyInfo) + 1] !== ''
          ? parseInt(parsedData[index - (satelliteInfo + accuracyInfo) + 1])
          : null,
      Hdop:
        accuracyInfo && parsedData[index - accuracyInfo + 1] !== ''
          ? parseFloat(parsedData[index - accuracyInfo + 1], 10)
          : null,
      Vdop:
        accuracyInfo && parsedData[index - accuracyInfo + 2] !== ''
          ? parseFloat(parsedData[index - accuracyInfo + 2], 10)
          : null,
      Ddop:
        accuracyInfo && parsedData[index] !== ''
          ? parseFloat(parsedData[index], 10)
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
    let index = 6 + 12 * number // position append mask
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
      mcc: parsedData[14] !== '' ? utils.latamMcc[parseInt(parsedData[14], 10)] : null,
      mnc: parsedData[15] !== '' ? utils.getMNC(parsedData[14], parsedData[15]) : null,
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
    let index = 7 + 12 * number // position append mask
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
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
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
  } else if (command[1] === 'GTPNR' || command[1] === 'GTPFR') {
    // Power on/off reason
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[4]),
      loc: null,
      speed: null,
      gpsStatus: null,
      hdop: null,
      status: null,
      azimuth: null,
      altitude: null,
      datetime: parsedData[9] !== '' ? utils.parseDate(parsedData[9]) : null,
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
      mcc: parsedData[11] !== '' ? utils.latamMcc[parseInt(parsedData[11], 10)] : null,
      mnc: parsedData[12] !== '' ? utils.getMNC(parsedData[11], parsedData[12]) : null,
      lac: parsedData[13] !== '' ? parseInt(parsedData[13], 16) : null,
      cid: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      odometer: null,
      hourmeter: null
    })
  } else if (
    command[1] === 'GTJDR' ||
    command[1] === 'GTANT' ||
    command[1] === 'GTRMD' ||
    command[1] === 'GTCRA' ||
    command[1] === 'GTBPL' ||
    command[1] === 'GTSTT' ||
    command[1] === 'GTAVC' ||
    command[1] === 'GTWPB'
  ) {
    let index = 16 // position append mask
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
      mcc: parsedData[12] !== '' ? utils.latamMcc[parseInt(parsedData[12], 10)] : null,
      mnc: parsedData[13] !== '' ? utils.getMNC(parsedData[12], parsedData[13]) : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTCRG') {
    let number = parsedData[5] !== '' ? parseInt(parsedData[5]) : 1
    let start = 6

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[4]),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      }
    })

    let more = []
    for (let i = 1; i <= number; i++) {
      more.push({
        id: parsedData[start] !== '' ? parseInt(parsedData[start]) : null,
        loc: {
          type: 'Point',
          coordinates: [
            parseFloat(parsedData[start + 5]),
            parseFloat(parsedData[start + 6])
          ]
        },
        speed:
          parsedData[start + 2] !== ''
            ? parseFloat(parsedData[start + 2])
            : null,
        gpsStatus: utils.checkGps(
          parseFloat(parsedData[start + 5]),
          parseFloat(parsedData[start + 6])
        ),
        hdop:
          parsedData[start + 1] !== ''
            ? parseFloat(parsedData[start + 1])
            : null,
        azimuth:
          parsedData[start + 3] !== ''
            ? parseFloat(parsedData[start + 3])
            : null,
        altitude:
          parsedData[start + 4] !== ''
            ? parseFloat(parsedData[start + 4])
            : null,
        datetime:
          parsedData[start + 7] !== ''
            ? utils.parseDate(parsedData[start + 7])
            : null
      })
      start += 8
    }

    data = Object.assign(data, {
      gnssData: more
    })
  } else if (command[1] === 'GTJDS') {
    let index = 17 // position append mask
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
      mcc: parsedData[13] !== '' ? utils.latamMcc[parseInt(parsedData[13], 10)] : null,
      mnc: parsedData[14] !== '' ? utils.getMNC(parsedData[13], parsedData[14]) : null,
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
    let index = 16 // position append mask
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
      mcc: parsedData[12] !== '' ? utils.latamMcc[parseInt(parsedData[12], 10)] : null,
      mnc: parsedData[13] !== '' ? utils.getMNC(parsedData[12], parsedData[13]) : null,
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
    let index = 17 // position append mask
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
      mcc: parsedData[13] !== '' ? utils.latamMcc[parseInt(parsedData[13], 10)] : null,
      mnc: parsedData[14] !== '' ? utils.getMNC(parsedData[13], parsedData[14]) : null,
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
    let index = 17 // position append mask
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
      mcc: parsedData[13] !== '' ? utils.latamMcc[parseInt(parsedData[13], 10)] : null,
      mnc: parsedData[14] !== '' ? utils.getMNC(parsedData[13], parsedData[14]) : null,
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
  } else if (command[1] === 'GTGSS') {
    // GPS Status
    let index = 19 // position append mask
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
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
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
    let index = 7 + 12 * number // position append mask
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[19])) {
      index = 7 + 13 * number
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
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
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
    let index = 67 // position append mask
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
      mcc: parsedData[63] !== '' ? utils.latamMcc[parseInt(parsedData[63], 10)] : null,
      mnc: parsedData[64] !== '' ? utils.getMNC(parsedData[63], parsedData[64]) : null,
      lac: parsedData[65] !== '' ? parseInt(parsedData[65], 16) : null,
      cid: parsedData[66] !== '' ? parseInt(parsedData[66], 16) : null,
      satellites:
        satelliteInfo && parsedData[index]
          ? parseInt(parsedData[index], 10)
          : null,
      odometer: null,
      hourmeter: null,
      can: utils.getCanData(parsedData, 5)
    }
    )
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
      let index = 19 // position append mask
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
        mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
        mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
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
      let index = 20 // position append mask
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
        mcc: parsedData[16] !== '' ? utils.latamMcc[parseInt(parsedData[16], 10)] : null,
        mnc: parsedData[17] !== '' ? utils.getMNC(parsedData[16], parsedData[17]) : null,
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
    let index = 17 // position append mask
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
      mcc: parsedData[13] !== '' ? utils.latamMcc[parseInt(parsedData[13], 10)] : null,
      mnc: parsedData[14] !== '' ? utils.getMNC(parsedData[13], parsedData[14]) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTDOM') {
    // Waveform beeing monitored
    let index = 18 // position append mask
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], [parsedData[4], parsedData[5]]),
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
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer: null,
      hourmeter: null
    })
    // } else if (command[1] === 'GTCID') {
    //   data = Object.assign(data, {
    //     alarm: utils.getAlarm(command[1], parsedData[4], 'gv310lau'),
    //     loc: {
    //       type: 'Point',
    //       coordinates: [null, null]
    //     },
    //     speed: null,
    //     gpsStatus: null,
    //     hdop: null,
    //     status: null,
    //     azimuth: null,
    //     altitude: null,
    //     datetime: parsedData[5] !== '' ? utils.parseDate(parsedData[5]) : null,
    //     voltage: {
    //       battery: null,
    //       inputCharge: null,
    //       ada: null,
    //       adb: null,
    //       adc: null
    //     },
    //     mcc: null,
    //     mnc: null,
    //     lac: null,
    //     cid: null,
    //     satellites: null,
    //     odometer: null,
    //     hourmeter: null
    //   })
    // } else if (command[1] === 'GTCSQ') {
    //   data = Object.assign(data, {
    //     alarm: utils.getAlarm(command[1], parsedData[5]),
    //     loc: {
    //       type: 'Point',
    //       coordinates: [null, null]
    //     },
    //     speed: null,
    //     gpsStatus: null,
    //     hdop: null,
    //     status: null,
    //     azimuth: null,
    //     altitude: null,
    //     datetime: parsedData[6] !== '' ? utils.parseDate(parsedData[6]) : null,
    //     voltage: {
    //       battery: null,
    //       inputCharge: null,
    //       ada: null,
    //       adb: null,
    //       adc: null
    //     },
    //     mcc: null,
    //     mnc: null,
    //     lac: null,
    //     cid: null,
    //     satellites: null,
    //     odometer: null,
    //     hourmeter: null
    //   })
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
    let index = 16 // position append mask
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null, 'gv310lau'),
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
        accessoryInfo: {
          accessory: null,
          model: null,
          name: null,
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
        accessoryData: {
          temperature: null,
          humidity: null,
          mode: null,
          event: null,
          tirePresure: null,
          timestamp: null,
          enhancedTemperature: null,
          magDevice: {
            id: null,
            eventCounter: null,
            magnetState: null
          },
          relay: {
            configResult: null,
            state: null
          }
        },
        disconnectionReason:
          parsedData[index + 7] !== '' && command[1] === 'GTBDS'
            ? utils.disconnectionReasons[parsedData[index + 7]]
            : null
      }
    })
  } else if (command[1] === 'GTBAA') {
    // Bluetooth alarms
    let satelliteInfo = false
    let appendIx = 8
    let appendMask = utils.nHexDigit(utils.hex2bin(parsedData[appendIx]), 16)
    let btAccessory = parsedData[5]
    let aNameIx = appendIx + parseInt(appendMask[15])
    let aMacIx = aNameIx + parseInt(appendMask[14])
    let aStatIx = aMacIx + parseInt(appendMask[13])
    let aBatIx = aStatIx + parseInt(appendMask[12])
    let aTmpIx = aBatIx + parseInt(appendMask[11])
    let aHumIx = aTmpIx + parseInt(appendMask[10])
    let ioIx = aHumIx + parseInt(appendMask[8])
    let aEvIx = appendMask[8] === '1' && appendMask[7] === '1'
      ? ioIx + 3 : ioIx + parseInt(appendMask[7])
    let pressIx = appendMask[7] === '1' && appendMask[6] === '1'
      ? aEvIx + 2 : aEvIx + parseInt(appendMask[6])
    let timeIx = pressIx + parseInt(appendMask[5])
    let eTmpIx = timeIx + parseInt(appendMask[4])
    let magIx = eTmpIx + parseInt(appendMask[3])
    let aBatpIx = appendMask[3] === '1' && appendMask[2] === '1'
      ? magIx + 3 : magIx + parseInt(appendMask[2])
    let relIx = aBatpIx + parseInt(appendMask[1])

    let newIndex = relIx + 1 + parseInt(appendMask[1])
    let satIndex = newIndex + 11

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[satIndex])) {
      satIndex += 1
      satelliteInfo = true
    }

    let bleInfo = {
      accesory:
        btAccessory !== '' ? utils.bluetoothAccessories[btAccessory] : null,
      model: parsedData[6] !== '' ? parseInt(parsedData[6]) : null,
      name:
        parsedData[aNameIx] !== '' && appendMask[15] === '1'
          ? parsedData[aNameIx]
          : null,
      role: null,
      type: null,
      mac:
        parsedData[aMacIx] !== '' && appendMask[14] === '1'
          ? parsedData[aMacIx]
          : null,
      status:
        parsedData[aStatIx] !== '' && appendMask[13] === '1'
          ? parseInt(parsedData[aStatIx])
          : null,
      batteryLevel:
        parsedData[aBatIx] !== '' && appendMask[12] === '1'
          ? parseInt(parsedData[aBatIx])
          : null,
      batteryPercentage:
        parsedData[aBatpIx] !== '' && appendMask[2] === '1'
          ? parseFloat(parsedData[aBatpIx])
          : null
    }

    let bleData = {
      temperature:
        parsedData[aTmpIx] !== '' && appendMask[11] === '1'
          ? parseInt(parsedData[aTmpIx])
          : null,
      humidity:
        parsedData[aHumIx] !== '' && appendMask[10] === '1'
          ? parseInt(parsedData[aHumIx])
          : null,
      event:
        parsedData[aEvIx] !== '' && appendMask[7] === '1'
          ? parseInt(parsedData[aEvIx])
          : null,
      tirePresure:
        parsedData[pressIx] !== '' && appendMask[6] === '1'
          ? parseInt(parsedData[pressIx])
          : null,
      timestamp:
        parsedData[timeIx] !== '' && appendMask[5] === '1'
          ? utils.parseDate(parsedData[timeIx])
          : null,
      enhancedTemperature:
        parsedData[eTmpIx] !== '' && appendMask[4] === '1'
          ? parseFloat(parsedData[eTmpIx])
          : null,
      magDevice: {
        id:
          parsedData[magIx] !== '' && appendMask[3] === '1'
            ? parsedData[magIx]
            : null,
        eventCounter:
          parsedData[magIx + 1] !== '' && appendMask[3] === '1'
            ? parseInt(parsedData[magIx + 1])
            : null,
        magnetState:
          parsedData[magIx + 2] !== '' && appendMask[3] === '1'
            ? parseInt(parsedData[magIx + 2])
            : null
      },
      relay: {
        configResult:
          parsedData[relIx] !== '' && appendMask[1] === '1'
            ? utils.relayBLEResults[parsedData[relIx]]
            : null,
        state:
          parsedData[relIx + 1] !== '' && appendMask[1] === '1'
            ? parseInt(parsedData[relIx + 1])
            : null
      }
    }

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[7], [parsedData[4], bleInfo.mac, bleData]),
      loc: {
        type: 'Point',
        coordinates: [
          parseFloat(parsedData[newIndex + 4]),
          parseFloat(parsedData[newIndex + 5])
        ]
      },
      speed:
        parsedData[newIndex + 1] !== ''
          ? parseFloat(parsedData[newIndex + 1])
          : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[newIndex + 4]),
        parseFloat(parsedData[newIndex + 5])
      ),
      hdop:
        parsedData[newIndex] !== '' ? parseFloat(parsedData[newIndex]) : null,
      status: null,
      azimuth:
        parsedData[newIndex + 2] !== ''
          ? parseFloat(parsedData[newIndex + 2])
          : null,
      altitude:
        parsedData[newIndex + 3] !== ''
          ? parseFloat(parsedData[newIndex + 3])
          : null,
      datetime:
        parsedData[newIndex + 6] !== ''
          ? utils.parseDate(parsedData[newIndex + 6])
          : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc:
        parsedData[newIndex + 7] !== ''
          ? parseInt(parsedData[newIndex + 7], 10)
          : null,
      mnc:
        parsedData[newIndex + 8] !== ''
          ? parseInt(parsedData[newIndex + 8], 10)
          : null,
      lac:
        parsedData[newIndex + 9] !== ''
          ? parseInt(parsedData[newIndex + 9], 16)
          : null,
      cid:
        parsedData[newIndex + 10] !== ''
          ? parseInt(parsedData[newIndex + 10], 16)
          : null,
      satellites:
        satelliteInfo && parsedData[satIndex] !== ''
          ? parseInt(parsedData[satIndex])
          : null,
      odometer: null,
      hourmeter: null,
      bluetooth: {
        raw: null,
        connected: btAccessory !== '',
        bluetoothInfo: {
          name:
            parsedData[aNameIx] !== '' && appendMask[15] === '1'
              ? parsedData[aNameIx]
              : null,
          mac:
            parsedData[aMacIx] !== '' && appendMask[14] === '1'
              ? parsedData[aMacIx]
              : null
        },
        accessoryInfo: bleInfo,
        accessoryData: bleData
      }
    })
  } else if (command[1] === 'GTBID') {
    // Bluetooth beacon detection
    let number = parsedData[4] !== '' ? parseInt(parsedData[4]) : 1
    let index = 4
    let appMk, extra
    for (let i = 1; i <= number; i++) {
      appMk = utils.sumOnes(parsedData[index + 2])
      extra =
        parsedData[index + 5] === '0'
          ? 1
          : parsedData[index + 5] === '1'
            ? 3
            : parsedData[index + 5] === '2' ? 2 : 0
      index += 2 + appMk + extra
    }
    let satelliteInfo = false
    let satIndex = index + 12

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[satIndex])) {
      satIndex += 1
      satelliteInfo = true
    }

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null, 'gv310lau'),
      loc: {
        type: 'Point',
        coordinates: [
          parseFloat(parsedData[index + 5]),
          parseFloat(parsedData[index + 6])
        ]
      },
      speed:
        parsedData[index + 2] !== '' ? parseFloat(parsedData[index + 2]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[index + 5]),
        parseFloat(parsedData[index + 6])
      ),
      hdop:
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null,
      status: null,
      azimuth:
        parsedData[index + 3] !== '' ? parseFloat(parsedData[index + 3]) : null,
      altitude:
        parsedData[index + 4] !== '' ? parseFloat(parsedData[index + 4]) : null,
      datetime:
        parsedData[index + 7] !== ''
          ? utils.parseDate(parsedData[index + 7])
          : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc:
        parsedData[index + 8] !== ''
          ? parseInt(parsedData[index + 8], 10)
          : null,
      mnc:
        parsedData[index + 9] !== ''
          ? parseInt(parsedData[index + 9], 10)
          : null,
      lac:
        parsedData[index + 10] !== ''
          ? parseInt(parsedData[index + 10], 16)
          : null,
      cid:
        parsedData[index + 11] !== ''
          ? parseInt(parsedData[index + 11], 16)
          : null,
      satellites:
        satelliteInfo && parsedData[satIndex] !== ''
          ? parseInt(parsedData[satIndex])
          : null,
      odometer: null,
      hourmeter: null
    })

    let btDevices = []
    let btIndex = 5
    for (let i = 1; i <= number; i++) {
      let appendMask = utils.nHexDigit(
        utils.hex2bin(parsedData[btIndex + 1]),
        8
      )
      let macIx = btIndex + 1 + parseInt(appendMask[6])
      let batIx = macIx + parseInt(appendMask[4])
      let sigIx = batIx + parseInt(appendMask[1])
      let typeIx = sigIx + parseInt(appendMask[0])
      btDevices.push({
        model:
          parsedData[btIndex] !== ''
            ? utils.beaconModels[parsedData[btIndex]]
            : null,
        appendMask:
          parsedData[btIndex + 1] !== '' ? parsedData[btIndex + 1] : null,
        mac:
          appendMask[6] === '1' && parsedData[macIx] !== ''
            ? parsedData[macIx]
            : null,
        battery:
          appendMask[4] === '1' && parsedData[batIx] !== ''
            ? parseInt(parsedData[batIx]) / 1000
            : null,
        signalStrength:
          appendMask[1] === '1' && parsedData[sigIx] !== ''
            ? parseInt(parsedData[sigIx])
            : null,
        type:
          appendMask[0] === '1' && parsedData[typeIx] !== ''
            ? utils.beaconTypes[parsedData[typeIx]]
            : null,
        data:
          appendMask[0] === '1' && parsedData[typeIx + 1] !== ''
            ? {
              idMfrData:
                parsedData[typeIx] === '0' && parsedData[typeIx + 1] !== ''
                  ? parsedData[typeIx + 1]
                  : null,
              uuid:
                parsedData[typeIx] === '1' && parsedData[typeIx + 1] !== ''
                  ? parsedData[typeIx + 1]
                  : null,
              major:
                parsedData[typeIx] === '1' && parsedData[typeIx + 2] !== ''
                  ? parsedData[typeIx + 2]
                  : null,
              minor:
                parsedData[typeIx] === '1' && parsedData[typeIx + 3] !== ''
                  ? parsedData[typeIx + 3]
                  : null,
              nid:
                parsedData[typeIx] === '2' && parsedData[typeIx + 1] !== ''
                  ? parsedData[typeIx + 1]
                  : null,
              bid:
                parsedData[typeIx] === '2' && parsedData[typeIx + 2] !== ''
                  ? parsedData[typeIx + 2]
                  : null
            }
            : null
      })
      let extra =
        parsedData[typeIx] === '0'
          ? 1
          : parsedData[typeIx] === '1' ? 3 : parsedData[typeIx] === '2' ? 2 : 0
      btIndex = typeIx + 1 + extra
    }

    let bluetoothData = {
      connectedDevices: number,
      btDevices: btDevices
    }

    data = Object.assign(data, {
      bluetoothData: bluetoothData
    })
  } else if (command[1] === 'GTVGN' || command[1] === 'GTVGF') {
    // Virtual ignition
    let index = 18 // possition append mask
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], [parsedData[6], parsedData[5]]),
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
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      odometer:
        parsedData[index + 2] !== '' ? parseFloat(parsedData[index + 2]) : null,
      hourmeter: parsedData[index + 1] !== '' ? parsedData[index + 1] : null
    })
  } else if (command[1] === 'GTGSM') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null),
      fixType: parsedData[3] !== '' ? parsedData[3] : null
    })
    let antData = []
    var index = 4
    for (let i = 0; i < 6; i++) {
      antData.push({
        mcc: parsedData[index] !== '' ? parseInt(parsedData[index], 10) : null,
        mnc:
          parsedData[index + 1] !== ''
            ? parseInt(parsedData[index + 1], 10)
            : null,
        lac:
          parsedData[index + 2] !== '' ||
            parsedData[index + 2].toUpperCase() === 'FFFF'
            ? parseInt(parsedData[index + 2], 16)
            : null,
        cid:
          parsedData[index + 3] !== '' ||
            parsedData[index + 3].toUpperCase() === 'FFFF'
            ? parseInt(parsedData[index + 3], 16)
            : null,
        rxLevel:
          parsedData[index + 4] !== ''
            ? utils.getSignalStrength(
              'GSM',
              parseInt(parsedData[index + 4], 10)
            )
            : null,
        rxSignalPercentage:
          parsedData[index + 4] !== ''
            ? utils.getSignalPercentage(
              'GSM',
              parseInt(parsedData[index + 4], 10)
            )
            : null
      })
      index += 6
    }
    data = Object.assign(data, {
      neighborCells: antData,
      mcc: parsedData[index] !== '' ? parseInt(parsedData[index], 10) : null,
      mnc:
        parsedData[index + 1] !== ''
          ? parseInt(parsedData[index + 1], 10)
          : null,
      lac:
        parsedData[index + 2] !== '' ||
          parsedData[index + 2].toUpperCase() === 'FFFF'
          ? parseInt(parsedData[index + 2], 16)
          : null,
      cid:
        parsedData[index + 3] !== '' ||
          parsedData[index + 3].toUpperCase() === 'FFFF'
          ? parseInt(parsedData[index + 3], 16)
          : null,
      rxLevel:
        parsedData[index + 4] !== ''
          ? utils.getSignalStrength('GSM', parseInt(parsedData[index + 4], 10))
          : null,
      rxSignalPercentage:
        parsedData[index + 4] !== ''
          ? utils.getSignalPercentage(
            'GSM',
            parseInt(parsedData[index + 4], 10)
          )
          : null
    })
  } else if (command[1] === 'GTCLT') {
    // CANBUS Alarm
    let index = 71 // position append mask
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

    let alarmMask1 =
      parsedData[5] !== ''
        ? utils
          .nHexDigit(utils.hex2bin(parsedData[5]), 32)
          .split('')
          .reverse()
          .join('')
        : null
    let alarmMask2 =
      parsedData[6] !== ''
        ? utils
          .nHexDigit(utils.hex2bin(parsedData[6]), 32)
          .split('')
          .reverse()
          .join('')
        : null
    let alarmMask3 =
      parsedData[7] !== ''
        ? utils
          .nHexDigit(utils.hex2bin(parsedData[7]), 32)
          .split('')
          .reverse()
          .join('')
        : null
    let inicatorsBin =
      parsedData[28] !== ''
        ? utils.nHexDigit(utils.hex2bin(parsedData[28]), 16)
        : null
    let lights =
      parsedData[29] !== ''
        ? utils.nHexDigit(utils.hex2bin(parsedData[29]), 8)
        : null
    let doors =
      parsedData[30] !== ''
        ? utils.nHexDigit(utils.hex2bin(parsedData[30]), 8)
        : null
    let canExpansionMask =
      parsedData[33] !== ''
        ? utils
          .nHexDigit(utils.hex2bin(parsedData[33]), 32)
          .split('')
          .reverse()
          .join('')
        : null
    let expansionBin =
      parsedData[54] !== ''
        ? utils
          .nHexDigit(utils.hex2bin(parsedData[54]), 16)
          .split('')
          .reverse()
          .join('')
        : null
    let tachographBin =
      parsedData[27] !== ''
        ? utils
          .nHexDigit(utils.hex2bin(parsedData[27]), 8)
          .split('')
          .reverse()
          .join('')
        : null
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[6], [
        parsedData[index + 11],
        parsedData[index + 13]
      ]),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[64]), parseFloat(parsedData[65])]
      },
      speed: parsedData[61] !== '' ? parseFloat(parsedData[61]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[64]),
        parseFloat(parsedData[65])
      ),
      hdop: parsedData[60] !== '' ? parseFloat(parsedData[60]) : null,
      canBusDataMask: parsedData[10] !== '' ? parsedData[10] : null,
      azimuth: parsedData[62] !== '' ? parseFloat(parsedData[62]) : null,
      altitude: parsedData[63] !== '' ? parseFloat(parsedData[63]) : null,
      datetime: parsedData[66] !== '' ? utils.parseDate(parsedData[66]) : null,
      mcc: parsedData[67] !== '' ? utils.latamMcc[parseInt(parsedData[67], 10)] : null,
      mnc: parsedData[68] !== '' ? utils.getMNC(parsedData[67], parsedData[68]) : null,
      lac: parsedData[69] !== '' ? parseInt(parsedData[69], 16) : null,
      cid: parsedData[70] !== '' ? parseInt(parsedData[70], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer: null,
      hourmeter: null,
      configuredAlarms: {
        alarm1: {
          raw: parsedData[5] !== '' ? parsedData[5] : null,
          oilLevelLowIndicator: alarmMask1 ? alarmMask1[28] === '1' : null,
          serviceCallIndicator: alarmMask1 ? alarmMask1[27] === '1' : null,
          airbagsIndicator: alarmMask1 ? alarmMask1[26] === '1' : null,
          checkEngineIndicator: alarmMask1 ? alarmMask1[25] === '1' : null,
          ABSFailureIndicator: alarmMask1 ? alarmMask1[23] === '1' : null,
          engineHotIndicator: alarmMask1 ? alarmMask1[22] === '1' : null,
          oilPressureIndicator: alarmMask1 ? alarmMask1[21] === '1' : null,
          brakeSystemFailureIndicator: alarmMask1
            ? alarmMask1[20] === '1'
            : null,
          batteryIndicator: alarmMask1 ? alarmMask1[19] === '1' : null,
          coolantLevelLowIndicator: alarmMask1 ? alarmMask1[18] === '1' : null,
          brakeFluidLowIndicator: alarmMask1 ? alarmMask1[17] === '1' : null,
          webcastIndicator: alarmMask1 ? alarmMask1[16] === '1' : null,
          trunkIndicator: alarmMask1 ? alarmMask1[15] === '1' : null,
          doorsIndicator: alarmMask1 ? alarmMask1[14] === '1' : null,
          frontFogLightsIndicator: alarmMask1 ? alarmMask1[13] === '1' : null,
          rearFogLightsIndicator: alarmMask1 ? alarmMask1[12] === '1' : null,
          highBeamsIndicator: alarmMask1 ? alarmMask1[11] === '1' : null,
          lowBeamsIndicator: alarmMask1 ? alarmMask1[10] === '1' : null,
          runningLightsIndicator: alarmMask1 ? alarmMask1[9] === '1' : null,
          reverseGearIndicator: alarmMask1 ? alarmMask1[8] === '1' : null,
          centralLockIndicator: alarmMask1 ? alarmMask1[7] === '1' : null,
          handbrakeIndicator: alarmMask1 ? alarmMask1[6] === '1' : null,
          clutchPedalIndicator: alarmMask1 ? alarmMask1[5] === '1' : null,
          brakePedalIndicator: alarmMask1 ? alarmMask1[4] === '1' : null,
          cruiseControlIndicator: alarmMask1 ? alarmMask1[3] === '1' : null,
          airConditioningIndicator: alarmMask1 ? alarmMask1[2] === '1' : null,
          driverSeatbeltIndicator: alarmMask1 ? alarmMask1[1] === '1' : null,
          fuelLowIndicator: alarmMask1 ? alarmMask1[0] === '1' : null
        },
        alarm2: {
          raw: parsedData[6] !== '' ? parsedData[6] : null,
          hood: alarmMask2 ? alarmMask2[21] === '1' : null,
          trunk: alarmMask2 ? alarmMask2[20] === '1' : null,
          rearRightDoor: alarmMask2 ? alarmMask2[19] === '1' : null,
          rearLeftDoor: alarmMask2 ? alarmMask2[18] === '1' : null,
          passengeDoor: alarmMask2 ? alarmMask2[17] === '1' : null,
          driverDoor: alarmMask2 ? alarmMask2[16] === '1' : null,
          hazadrLights: alarmMask2 ? alarmMask2[5] === '1' : null,
          readFogLights: alarmMask2 ? alarmMask2[4] === '1' : null,
          fronFogLights: alarmMask2 ? alarmMask2[3] === '1' : null,
          highBeam: alarmMask2 ? alarmMask2[2] === '1' : null,
          lowBeam: alarmMask2 ? alarmMask2[1] === '1' : null,
          runningLights: alarmMask2 ? alarmMask2[0] === '1' : null
        },
        alarm3: {
          raw: parsedData[7] !== '' ? parsedData[7] : null,
          overHighRPM: alarmMask3 ? alarmMask3[3] === '1' : null,
          underHighRPM: alarmMask3 ? alarmMask3[2] === '1' : null,
          overLowRPM: alarmMask3 ? alarmMask3[1] === '1' : null,
          underLowRPM: alarmMask3 ? alarmMask3[0] === '1' : null
        }
      },
      can: {
        vin: parsedData[11] !== '' ? parseInt(parsedData[11]) : null,
        ignitionKey:
          parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
        distance: parsedData[13] !== '' ? parsedData[13] : null,
        fuelUsed: parsedData[14] !== '' ? parseFloat(parsedData[14]) : null, // float
        rpm: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null, // int
        speed: parsedData[16] !== '' ? parseFloat(parsedData[16]) : null,
        coolantTemp:
          parsedData[17] !== '' ? parseInt(parsedData[17], 10) : null,
        fuelConsumption: parsedData[18] !== '' ? parsedData[18] : null,
        fuelLevel: parsedData[19] !== '' ? parsedData[19] : null,
        range: parsedData[20] !== '' ? parsedData[20] : null,
        acceleratorPressure:
          parsedData[21] !== '' ? parseFloat(parsedData[21]) : null, // %
        engineHours: parsedData[22] !== '' ? parseFloat(parsedData[22]) : null,
        drivingTime: parsedData[23] !== '' ? parseFloat(parsedData[23]) : null,
        idleTime: parsedData[24] !== '' ? parseFloat(parsedData[24]) : null,
        idleFuelUsed: parsedData[25] !== '' ? parseFloat(parsedData[25]) : null,
        axleWight2: parsedData[26] !== '' ? parseInt(parsedData[26]) : null,
        tachograph: {
          raw: parsedData[27] !== '' ? parsedData[27] : null,
          validDriverData: tachographBin ? tachographBin[7] === '1' : null,
          insertedDriverCard: tachographBin ? tachographBin[5] === '1' : null,
          driverWorkingState: tachographBin
            ? utils.dWorkingStates[parseInt(tachographBin.substring(3, 5), 2)]
            : null,
          drivingTimeState: tachographBin
            ? utils.dTimeStates[parseInt(tachographBin.substring(5, 8), 2)]
            : null
        },
        indicators: {
          raw: parsedData[28] !== '' ? parsedData[28] : null,
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
          raw: parsedData[29] !== '' ? parsedData[29] : null,
          running: lights ? lights[0] === '1' : null,
          lowBeams: lights ? lights[1] === '1' : null,
          frontFog: lights ? lights[2] === '1' : null,
          rearFog: lights ? lights[3] === '1' : null,
          hazard: lights ? lights[4] === '1' : null
        },
        doors: {
          raw: parsedData[30] !== '' ? parsedData[30] : null,
          driver: doors ? doors[0] === '1' : null,
          passenger: doors ? doors[1] === '1' : null,
          rearLeft: doors ? doors[2] === '1' : null,
          rearRight: doors ? doors[3] === '1' : null,
          trunk: doors ? doors[4] === '1' : null,
          hood: doors ? doors[5] === '1' : null
        },
        overSpeedTime: parsedData[31] !== '' ? parsedData[31] : null,
        overSpeedEngineTime: parsedData[32] !== '' ? parsedData[32] : null,
        canReportExpansionMask: {
          raw: parsedData[33] !== '' ? parsedData[33] : null,
          engineTorque: canExpansionMask ? canExpansionMask[23] === '1' : null,
          rapidAccelerations: canExpansionMask
            ? canExpansionMask[22] === '1'
            : null,
          rapidBrakings: canExpansionMask ? canExpansionMask[21] === '1' : null,
          expansionInformation: canExpansionMask
            ? canExpansionMask[20] === '1'
            : null,
          registrationNumber: canExpansionMask
            ? canExpansionMask[19] === '1'
            : null,
          tachographDriver2Name: canExpansionMask
            ? canExpansionMask[18] === '1'
            : null,
          tachographDriver1Name: canExpansionMask
            ? canExpansionMask[17] === '1'
            : null,
          tachographDriver2Card: canExpansionMask
            ? canExpansionMask[16] === '1'
            : null,
          tachographDriver1Card: canExpansionMask
            ? canExpansionMask[15] === '1'
            : null,
          totalBrakeApplications: canExpansionMask
            ? canExpansionMask[14] === '1'
            : null,
          totalAcceleratorKickDownTime: canExpansionMask
            ? canExpansionMask[13] === '1'
            : null,
          totalCruiseControlTime: canExpansionMask
            ? canExpansionMask[12] === '1'
            : null,
          totalEffectiveEngineSpeedTime: canExpansionMask
            ? canExpansionMask[11] === '1'
            : null,
          totalAcceleratorKickDown: canExpansionMask
            ? canExpansionMask[10] === '1'
            : null,
          pedalBrakingFactor: canExpansionMask
            ? canExpansionMask[9] === '1'
            : null,
          engineBrakingFactor: canExpansionMask
            ? canExpansionMask[8] === '1'
            : null,
          analogInputValue: canExpansionMask
            ? canExpansionMask[7] === '1'
            : null,
          tachographDrivingDirection: canExpansionMask
            ? canExpansionMask[6] === '1'
            : null,
          tachographVehicleMotionSignal: canExpansionMask
            ? canExpansionMask[5] === '1'
            : null,
          tachographOverspeedSignal: canExpansionMask
            ? canExpansionMask[4] === '1'
            : null,
          AxleWeight4: canExpansionMask ? canExpansionMask[3] === '1' : null,
          AxleWeight3: canExpansionMask ? canExpansionMask[2] === '1' : null,
          AxleWeight1: canExpansionMask ? canExpansionMask[1] === '1' : null,
          adBlueLevel: canExpansionMask ? canExpansionMask[0] === '1' : null
        },
        canExpanded: {
          adBlueLevel:
            parsedData[34] !== '' ? parseFloat(parsedData[34]) : null,
          axleWeight1: parsedData[35] !== '' ? parseInt(parsedData[35]) : null,
          axleWeight3: parsedData[36] !== '' ? parseInt(parsedData[36]) : null,
          axleWeight4: parsedData[37] !== '' ? parseInt(parsedData[37]) : null,
          tachographOverspeedSignal:
            parsedData[38] !== '' ? parseInt(parsedData[38]) : null,
          tachographVehicleMotionSignal:
            parsedData[39] !== '' ? parseInt(parsedData[39]) : null,
          tachographDrivingDirection:
            parsedData[40] !== '' ? parseInt(parsedData[40]) : null,
          analogInputValue:
            parsedData[41] !== '' ? parseInt(parsedData[41]) : null,
          engineBrakingFactor:
            parsedData[42] !== '' ? parseInt(parsedData[42]) : null,
          pedalBrakingFactor:
            parsedData[43] !== '' ? parseInt(parsedData[43]) : null,
          totalAcceleratorKickDown:
            parsedData[44] !== '' ? parseInt(parsedData[44]) : null,
          totalEffectiveEngineSpeedTime:
            parsedData[45] !== '' ? parseFloat(parsedData[45]) : null,
          totalCruiseControlTime:
            parsedData[46] !== '' ? parseFloat(parsedData[46]) : null,
          totalAcceleratorKickDownTime:
            parsedData[47] !== '' ? parseFloat(parsedData[47]) : null,
          totalBrakeApplications:
            parsedData[48] !== '' ? parseInt(parsedData[48]) : null,
          tachographDriver1Card:
            parsedData[49] !== '' ? parseInt(parsedData[49]) : null,
          tachographDriver2Card:
            parsedData[50] !== '' ? parseInt(parsedData[50]) : null,
          tachographDriver1Name: parsedData[51] !== '' ? parsedData[51] : null,
          tachographDriver2Name: parsedData[52] !== '' ? parsedData[52] : null,
          registrationNumber:
            parsedData[53] !== '' ? parseInt(parsedData[53]) : null,
          expansionInformation: {
            raw: parsedData[54] !== '' ? parsedData[54] : null,
            webasto: expansionBin ? expansionBin[0] === '1' : null,
            brakeFluidLowIndicator: expansionBin
              ? expansionBin[1] === '1'
              : null,
            coolantLevelLowIndicator: expansionBin
              ? expansionBin[2] === '1'
              : null,
            batteryIndicator: expansionBin ? expansionBin[3] === '1' : null,
            brakeSystemFailureIndicator: expansionBin
              ? expansionBin[4] === '1'
              : null,
            oilPressureIndicator: expansionBin ? expansionBin[5] === '1' : null,
            engineHotIndicator: expansionBin ? expansionBin[6] === '1' : null,
            ABSFailureIndicator: expansionBin ? expansionBin[7] === '1' : null,
            checkEngineIndicator: expansionBin ? expansionBin[9] === '1' : null,
            airbagsIndicator: expansionBin ? expansionBin[10] === '1' : null,
            serviceCallIndicator: expansionBin
              ? expansionBin[11] === '1'
              : null,
            oilLevelLowIndicator: expansionBin ? expansionBin[12] === '1' : null
          },
          rapidBrakings:
            parsedData[55] !== '' ? parseInt(parsedData[55]) : null,
          rapidAccelerations:
            parsedData[56] !== '' ? parseInt(parsedData[56]) : null,
          engineTorque:
            parsedData[57] !== '' ? parseFloat(parsedData[57]) : null
        }
      }
    })
  } else if (command[1] === 'GTSVR') {
    // Primary Stolen Vehicle Recovery
    // Primary: GV310LAU - Ghost: GV58LAU
    let index = 19 // possition append mask
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
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      odometer:
        parsedData[index + 2] !== '' ? parseFloat(parsedData[index + 2]) : null,
      hourmeter: parsedData[index + 1] !== '' ? parsedData[index + 1] : null,
      bluetooth: {
        mac: parsedData[5] !== '' ? parsedData[5] : null,
        svrInfo: parsedData[6] !== '' ? parsedData[6] : null
      }
    })
  } else if (command[1] === 'GTLBA') {
    // Low Battery for FR433 devices
    let index = 17 // possition append mask
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], [parsedData[4], parsedData[5]]),
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
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTASC') {
    // Calibrarion data for XYZ-axis acceleration sensor
    let index = 24 // possition append mask
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
        coordinates: [parseFloat(parsedData[17]), parseFloat(parsedData[18])]
      },
      speed: parsedData[14] !== '' ? parseFloat(parsedData[14]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[17]),
        parseFloat(parsedData[18])
      ),
      hdop: parsedData[13] !== '' ? parseFloat(parsedData[13]) : null,
      status: null,
      azimuth: parsedData[15] !== '' ? parseFloat(parsedData[15]) : null,
      altitude: parsedData[16] !== '' ? parseFloat(parsedData[16]) : null,
      datetime: parsedData[19] !== '' ? utils.parseDate(parsedData[19]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[20] !== '' ? utils.latamMcc[parseInt(parsedData[20], 10)] : null,
      mnc: parsedData[21] !== '' ? utils.getMNC(parsedData[20], parsedData[21]) : null,
      lac: parsedData[22] !== '' ? parseInt(parsedData[22], 16) : null,
      cid: parsedData[23] !== '' ? parseInt(parsedData[23], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      calibration: {
        xForward: parsedData[4] !== '' ? parseFloat(parsedData[4]) : null,
        yForward: parsedData[5] !== '' ? parseFloat(parsedData[5]) : null,
        zForward: parsedData[6] !== '' ? parseFloat(parsedData[6]) : null,
        xSide: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
        ySide: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
        zSide: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
        xVertical: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
        yVertical: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
        zVertical: parsedData[12] !== '' ? parseFloat(parsedData[12]) : null
      },
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTHBE') {
    // Harsh Behavior Information
    // Only works when GTHBM is in mode 5
    let index = 18 // possition append mask
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

    let maxAcc = parsedData[index + 1] !== '' ? parsedData[index + 1] : null
    let avgAcc = parsedData[index + 2] !== '' ? parsedData[index + 2] : null
    let duration =
      parsedData[index + 3] !== '' ? parseFloat(parsedData[index + 3]) : null

    data = Object.assign(data, {
      alarm: utils.getAlarm(
        command[1],
        [parsedData[5], parsedData[6]],
        [maxAcc, duration]
      ),
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
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      maxAcceleration: {
        // Acceleration in m/s2
        raw: maxAcc,
        x: maxAcc
          ? utils.getAccelerationMagnitude(maxAcc.substring(0, 4), 4)
          : null,
        y: maxAcc
          ? utils.getAccelerationMagnitude(maxAcc.substring(4, 8), 4)
          : null,
        z: maxAcc
          ? utils.getAccelerationMagnitude(maxAcc.substring(8, 12), 4)
          : null
      },
      avgAcceleration: {
        // Acceleration in m/s2
        raw: avgAcc,
        x: avgAcc
          ? utils.getAccelerationMagnitude(avgAcc.substring(0, 4), 4)
          : null,
        y: avgAcc
          ? utils.getAccelerationMagnitude(avgAcc.substring(4, 8), 4)
          : null,
        z: avgAcc
          ? utils.getAccelerationMagnitude(avgAcc.substring(8, 12), 4)
          : null
      },
      duration: duration,
      odometer:
        parsedData[index + 4] !== '' ? parseFloat(parsedData[index + 4]) : null,
      hourmeter: null
    })
  } else if (command[1] === 'GTAUR') {
    // Result of AU100 Configuration
    // Not verified yet (possible error in documentation)
    let index = 21 // possition append mask
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], [
        parsedData[4],
        parsedData[5],
        parsedData[6]
      ]),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[14]), parseFloat(parsedData[15])]
      },
      speed: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[14]),
        parseFloat(parsedData[15])
      ),
      hdop: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      status: null,
      azimuth: parsedData[12] !== '' ? parseFloat(parsedData[12]) : null,
      altitude: parsedData[13] !== '' ? parseFloat(parsedData[13]) : null,
      datetime: parsedData[16] !== '' ? utils.parseDate(parsedData[16]) : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[17] !== '' ? utils.latamMcc[parseInt(parsedData[17], 10)] : null,
      mnc: parsedData[18] !== '' ? utils.getMNC(parsedData[17], parsedData[18]) : null,
      lac: parsedData[19] !== '' ? parseInt(parsedData[19], 16) : null,
      cid: parsedData[20] !== '' ? parseInt(parsedData[20], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      odometer: null,
      hourmeter: null
    })
  } else {
    // GTBAR report is not parsed because it only supports one device
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
