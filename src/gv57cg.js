'use strict'
const utils = require('./utils.js')

/*
  Parses messages data from GV58LAU devices
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
    device: 'Queclink-GV57CG',
    type: 'data',
    imei: parsedData[2],
    protocolVersion: utils.getProtocolVersion(parsedData[1]),
    // temperature: null,
    history: history,
    sentTime: utils.parseDate(parsedData[parsedData.length - 2]),
    serialId: parseInt(parsedData[parsedData.length - 1], 16)
  }

  // Gps
  // "+RESP:GTFRI,8020060402,864696060060852,GV57CG,,10,1,0,,,,,,,0730,0001,13EE,0032A502,03,0,0,0.0,0000000:00:00,,,,0,210100,,,,20240925144523,0011$"
  if (command[1] === 'GTFRI') {
    try {
      let number = parsedData[6] !== '' ? parseInt(parsedData[6], 10) : 1
      let satelliteInfo = utils.includeSatellites(parsedData[18])
      let gnssInfo = utils.includeGnssTrigger(parsedData[18])
      let index = 6 + (12 + satelliteInfo + gnssInfo) * number + 1

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
          raw: parsedData[index + 6],
          sos: false,
          input: {
            '2':
              utils.nHexDigit(
                utils.hex2bin(parsedData[index + 6].substring(2, 4)),
                8
              )[6] === '1',
            '1':
              utils.nHexDigit(
                utils.hex2bin(parsedData[index + 6].substring(2, 4)),
                8
              )[7] === '1'
          },
          output: {
            '3':
              utils.nHexDigit(
                utils.hex2bin(parsedData[index + 6].substring(4, 6)),
                8
              )[5] === '1',
            '2':
              utils.nHexDigit(
                utils.hex2bin(parsedData[index + 6].substring(4, 6)),
                8
              )[6] === '1',
            '1':
              utils.nHexDigit(
                utils.hex2bin(parsedData[index + 6].substring(4, 6)),
                8
              )[7] === '1'
          },
          charge: parseFloat(parsedData[4]) > 5,
          state: utils.states[parsedData[index + 6].substring(0, 2)]
        },
        azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
        altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
        datetime:
          parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
        voltage: {
          battery:
            parsedData[index + 5] !== ''
              ? parseFloat(parsedData[index + 5])
              : null,
          inputCharge:
            parsedData[4] !== '' ? parseFloat(parsedData[4]) / 1000 : null
        },
        mcc:
          parsedData[14] !== ''
            ? utils.latamMcc[parseInt(parsedData[14], 10)]
            : null,
        mnc:
          parsedData[15] !== ''
            ? utils.getMNC(parsedData[14], parsedData[15])
            : null,
        lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
        cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
        satellites:
          satelliteInfo && parsedData[index - (satelliteInfo + gnssInfo)] !== ''
            ? parseInt(parsedData[index - (satelliteInfo + gnssInfo)], 10)
            : null,
        gnssTrigger:
          gnssInfo && parsedData[index - gnssInfo] !== ''
            ? utils.gnssTriggerTypes[parsedData[index - gnssInfo]]
            : null,
        odometer:
          parsedData[index] !== '' ? parseFloat(parsedData[index]) : null,
        hourmeter:
          parsedData[index + 1] !== ''
            ? utils.getHoursForHourmeter(parsedData[index + 1])
            : null
      })

      // More than 1 GNSS report in data
      if (number > 1) {
        let moreData = []
        for (let i = 1; i < number; i++) {
          let gnssIx = 7 + (12 + gnssInfo + satelliteInfo) * i

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
              satelliteInfo && parsedData[gnssIx + satelliteInfo + 11] !== ''
                ? parseInt(parsedData[gnssIx + satelliteInfo + 11], 10)
                : null,
            gnssTrigger:
              gnssInfo &&
              parsedData[gnssIx + satelliteInfo + gnssInfo + 11] !== ''
                ? utils.gnssTriggerTypes[
                  parsedData[gnssIx + satelliteInfo + gnssInfo + 11]
                ]
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
    let gnssInfo = utils.includeGnssTrigger(parsedData[19])
    let index = 7 + (12 + satelliteInfo + gnssInfo) * number + 1

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
        raw: parsedData[index + 6],
        sos: false,
        input: {
          '2':
            utils.nHexDigit(
              utils.hex2bin(parsedData[index + 6].substring(2, 4)),
              8
            )[6] === '1',
          '1':
            utils.nHexDigit(
              utils.hex2bin(parsedData[index + 6].substring(2, 4)),
              8
            )[7] === '1'
        },
        output: {
          '3':
            utils.nHexDigit(
              utils.hex2bin(parsedData[index + 6].substring(4, 6)),
              8
            )[5] === '1',
          '2':
            utils.nHexDigit(
              utils.hex2bin(parsedData[index + 6].substring(4, 6)),
              8
            )[6] === '1',
          '1':
            utils.nHexDigit(
              utils.hex2bin(parsedData[index + 6].substring(4, 6)),
              8
            )[7] === '1'
        },
        charge: parseFloat(parsedData[5]) > 5,
        state: utils.states[parsedData[index + 6].substring(0, 2)]
      },
      azimuth: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
      voltage: {
        battery:
          parsedData[index + 5] !== ''
            ? parseFloat(parsedData[index + 5])
            : null, // percentage
        inputCharge:
          parsedData[5] !== '' ? parseFloat(parsedData[5]) / 1000 : null
      },
      mcc:
        parsedData[15] !== ''
          ? utils.latamMcc[parseInt(parsedData[15], 10)]
          : null,
      mnc:
        parsedData[16] !== ''
          ? utils.getMNC(parsedData[15], parsedData[16])
          : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      satellites:
        satelliteInfo && parsedData[index - (satelliteInfo + gnssInfo)] !== ''
          ? parseInt(parsedData[index - (satelliteInfo + gnssInfo)], 10)
          : null,
      gnssTrigger:
        gnssInfo && parsedData[index - gnssInfo] !== ''
          ? utils.gnssTriggerTypes[parsedData[index - gnssInfo]]
          : null,
      odometer: parsedData[index] !== '' ? parseFloat(parsedData[index]) : null,
      hourmeter:
        parsedData[index + 1] !== ''
          ? utils.getHoursForHourmeter(parsedData[index + 1])
          : null
    })
    // External Data
    const canData = utils.nHexDigit(utils.hex2bin(parsedData[4]), 32)[8] === '1'
    const bandData =
      utils.nHexDigit(utils.hex2bin(parsedData[4]), 32)[16] === '1'

    let externalData = {
      eriMask: {
        raw: parsedData[4],
        canData: canData,
        bandData: bandData
      }
    }

    // TO-DO: agregar datos de bandData

    // Bluetooth Accessories
    // if (bluetoothAccessory) {
    //   let btDevices = []
    //   let btIndex

    //   if (canData) {
    //     btIndex = index + 57
    //   } else {
    //     btIndex = index + 8
    //   }

    //   let cnt = btIndex + 1
    //   let btNum = parsedData[btIndex] !== '' ? parseInt(parsedData[btIndex]) : 1

    //   for (let c = 0; c < btNum; c++) {
    //     let appendMask = utils.nHexDigit(utils.hex2bin(parsedData[cnt + 4]), 16)

    //     let aNameIx = cnt + 4 + parseInt(appendMask[15])
    //     let aMacIx = aNameIx + parseInt(appendMask[14])
    //     let aStatIx = aMacIx + parseInt(appendMask[13])
    //     let aBatIx = aStatIx + parseInt(appendMask[12])
    //     let aTmpIx = aBatIx + parseInt(appendMask[11])
    //     let aHumIx = aTmpIx + parseInt(appendMask[10])
    //     let ioIx = aHumIx + parseInt(appendMask[8])
    //     let modeIx =
    //       appendMask[8] === '1' ? ioIx + 2 + parseInt(appendMask[7]) : ioIx
    //     let aEvIx = appendMask[7] === '1' ? modeIx + 1 : modeIx
    //     let pressIx = aEvIx + parseInt(appendMask[6])
    //     let timeIx = pressIx + parseInt(appendMask[5])
    //     let eTmpIx = timeIx + parseInt(appendMask[4])
    //     let magIx = eTmpIx + parseInt(appendMask[3])
    //     let aBatpIx =
    //       appendMask[3] === '1' ? magIx + 2 + parseInt(appendMask[2]) : eTmpIx
    //     let relIx = aBatpIx + parseInt(appendMask[1])

    //     btDevices.push({
    //       index: parsedData[cnt],
    //       type: utils.bluetoothAccessories[parsedData[cnt + 1]],
    //       model:
    //         parsedData[cnt + 2] !== ''
    //           ? utils.bluetoothModels[parsedData[cnt + 1]][parsedData[cnt + 2]]
    //           : utils.bluetoothAccessories[parsedData[cnt + 1]],
    //       appendMask: parsedData[cnt + 4],
    //       rawData:
    //         parsedData[cnt + 3] !== ''
    //           ? {
    //             raw: parsedData[cnt + 3],
    //             fuelLevel:
    //                 `${parsedData[cnt + 1]}${parsedData[cnt + 2]}` === '10'
    //                   ? parsedData[cnt + 3]
    //                   : null,
    //             temperature:
    //                 `${parsedData[cnt + 1]}${parsedData[cnt + 2]}` === '20'
    //                   ? utils.getBtTempHumData(
    //                     parsedData[cnt + 3].substring(4, 8)
    //                   )
    //                   : `${parsedData[cnt + 1]}${parsedData[cnt + 2]}` === '21'
    //                     ? parsedData[cnt + 3] // Conversion not specified in documentation
    //                     : `${parsedData[cnt + 1]}${parsedData[cnt + 2]}` ===
    //                       '62'
    //                       ? utils.getBtTempHumData(
    //                         parsedData[cnt + 3].substring(0, 4)
    //                       )
    //                       : ['64', '65'].includes(
    //                         `${parsedData[cnt + 1]}${parsedData[cnt + 2]}`
    //                       )
    //                         ? parseInt(
    //                           parsedData[cnt + 3].substring(4, 8),
    //                           16
    //                         ) / 100
    //                         : null,
    //             humidity:
    //                 `${parsedData[cnt + 1]}${parsedData[cnt + 2]}` === '20'
    //                   ? utils.getBtTempHumData(
    //                     parsedData[cnt + 3].substring(4, 8)
    //                   )
    //                   : `${parsedData[cnt + 1]}${parsedData[cnt + 2]}` === '62'
    //                     ? utils.getBtTempHumData(
    //                       parsedData[cnt + 3].substring(4, 8)
    //                     )
    //                     : ['64', '65'].includes(
    //                       `${parsedData[cnt + 1]}${parsedData[cnt + 2]}`
    //                     )
    //                       ? parseInt(parsedData[cnt + 3].substring(0, 4), 16) /
    //                         100
    //                       : null
    //           }
    //           : null,
    //       name:
    //         parsedData[aNameIx] !== '' && appendMask[15] === '1'
    //           ? parsedData[aNameIx]
    //           : null,
    //       mac:
    //         parsedData[aMacIx] !== '' && appendMask[14] === '1'
    //           ? parsedData[aMacIx]
    //           : null,
    //       status:
    //         parsedData[aStatIx] !== '' && appendMask[13] === '1'
    //           ? parseInt(parsedData[aStatIx])
    //           : null,
    //       batteryLevel:
    //         parsedData[aBatIx] !== '' && appendMask[12] === '1'
    //           ? parseInt(parsedData[aBatIx])
    //           : null,
    //       batteryPercentage:
    //         parsedData[aBatpIx] !== '' && appendMask[2] === '1'
    //           ? parseFloat(parsedData[aBatpIx])
    //           : null,
    //       accessoryData: {
    //         rawData: parsedData[cnt + 3] !== '' ? parsedData[cnt + 3] : null,
    //         temperature:
    //           parsedData[aTmpIx] !== '' && appendMask[11] === '1'
    //             ? parseInt(parsedData[aTmpIx])
    //             : null,
    //         humidity:
    //           parsedData[aHumIx] !== '' && appendMask[10] === '1'
    //             ? parseInt(parsedData[aHumIx])
    //             : null,
    //         outputStatus:
    //           parsedData[ioIx] !== '' && appendMask[8] === '1'
    //             ? parsedData[ioIx]
    //             : null,
    //         inputStatus:
    //           parsedData[ioIx + 1] !== '' && appendMask[8] === '1'
    //             ? parsedData[ioIx + 1]
    //             : null,
    //         analogInputStatus:
    //           parsedData[ioIx + 2] !== '' && appendMask[8] === '1'
    //             ? parsedData[ioIx + 2]
    //             : null,
    //         mode:
    //           parsedData[modeIx] !== '' && appendMask[7] === '1'
    //             ? parseInt(parsedData[modeIx])
    //             : null,
    //         event:
    //           parsedData[aEvIx] !== '' && appendMask[7] === '1'
    //             ? parseInt(parsedData[aEvIx])
    //             : null,
    //         tirePresure:
    //           parsedData[pressIx] !== '' && appendMask[6] === '1'
    //             ? parseInt(parsedData[pressIx])
    //             : null,
    //         timestamp:
    //           parsedData[timeIx] !== '' && appendMask[5] === '1'
    //             ? utils.parseDate(parsedData[timeIx])
    //             : null,
    //         enhancedTemperature:
    //           parsedData[eTmpIx] !== '' && appendMask[4] === '1'
    //             ? parseFloat(parsedData[eTmpIx])
    //             : null,
    //         magDevice: {
    //           id:
    //             parsedData[magIx] !== '' && appendMask[3] === '1'
    //               ? parsedData[magIx]
    //               : null,
    //           eventCounter:
    //             parsedData[magIx + 1] !== '' && appendMask[3] === '1'
    //               ? parseInt(parsedData[magIx + 1])
    //               : null,
    //           magnetState:
    //             parsedData[magIx + 2] !== '' && appendMask[3] === '1'
    //               ? parseInt(parsedData[magIx + 2])
    //               : null
    //         },
    //         relay: {
    //           state:
    //             parsedData[relIx] !== '' && appendMask[1] === '1'
    //               ? parseInt(parsedData[relIx])
    //               : null
    //         }
    //       }
    //     })
    //     cnt = appendMask[1] === '1' ? relIx + 1 : relIx + 2
    //     cnt = parsedData[cnt + 3] !== '' ? cnt - 1 : cnt
    //   }
    //   externalData = Object.assign(externalData, {
    //     btDevices: btDevices
    //   })
    // }

    data = Object.assign(data, {
      externalData: externalData
    })

    // More than 1 GNSS report in data
    if (number > 1) {
      let moreData = []
      for (let i = 1; i < number; i++) {
        let gnssIx = 8 + (12 + gnssInfo + satelliteInfo) * i
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
            satelliteInfo && parsedData[gnssIx + satelliteInfo + 11] !== ''
              ? parseInt(parsedData[gnssIx + satelliteInfo + 11], 10)
              : null,
          gnssTrigger:
            gnssInfo &&
            parsedData[gnssIx + satelliteInfo + gnssInfo + 11] !== ''
              ? utils.gnssTriggerTypes[
                parsedData[gnssIx + satelliteInfo + gnssInfo + 11]
              ]
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
      externalGPSAntenna: null,
      status: {
        raw: `${parsedData[21]}${parsedData[22]}`,
        sos: false,
        input: {
          '2': utils.nHexDigit(utils.hex2bin(parsedData[21]), 8)[6] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[21]), 8)[7] === '1'
        },
        output: {
          '3': utils.nHexDigit(utils.hex2bin(parsedData[22]), 8)[5] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[22]), 8)[6] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[22]), 8)[7] === '1'
        },
        charge: parsedData[12] === '1'
      },
      voltage: {
        battery:
          parsedData[11] !== ''
            ? parseInt(100 * (parseFloat(parsedData[11]) / 4.5), 10)
            : null, // percentage
        inputCharge:
          parsedData[9] !== '' ? parseFloat(parsedData[9]) / 1000 : null
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
    let index = 6 + 12 * number // position append mask
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[5], 'gv58lau'),
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
      azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
      // voltage: {
      //   battery: null,
      //   inputCharge: null
      // },
      mcc:
        parsedData[14] !== ''
          ? utils.latamMcc[parseInt(parsedData[14], 10)]
          : null,
      mnc:
        parsedData[15] !== ''
          ? utils.getMNC(parsedData[14], parsedData[15])
          : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      // status: includeStatus
      //   ? {
      //     raw: parsedData[index + 1],
      //     sos: false,
      //     input: {
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[7] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[6] === '1'
      //     },
      //     output: {
      //       '3':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[5] === '1',
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[6] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[7] === '1'
      //     },
      //   charge: null,
      //   state: utils.states[parsedData[index + 1].substring(0, 2)]
      // }
      // : null,
      odometer:
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null
      // hourmeter: null
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
      // status: null,
      azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
      voltage: {
        battery: parsedData[4] !== '' ? parseFloat(parsedData[4]) / 1000 : null,
        inputCharge: null
      },
      mcc:
        parsedData[14] !== ''
          ? utils.latamMcc[parseInt(parsedData[14], 10)]
          : null,
      mnc:
        parsedData[15] !== ''
          ? utils.getMNC(parsedData[14], parsedData[15])
          : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      odometer:
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null
      // hourmeter: null
    })
  } else if (
    command[1] === 'GTPNA' ||
    command[1] === 'GTPFA' ||
    command[1] === 'GTPDP'
  ) {
    // Event report (It uses the last GPS data and MCC info)
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null),
      // loc: null,
      // speed: null,
      // gpsStatus: null,
      // hdop: null,
      // status: null,
      // azimuth: null,
      // altitude: null,
      datetime: parsedData[4] !== '' ? utils.parseDate(parsedData[4]) : null
      // voltage: {
      //   battery: null,
      //   inputCharge: null
      // },
      // mcc: null,
      // mnc: null,
      // lac: null,
      // cid: null,
      // odometer: null,
      // hourmeter: null
    })
  } else if (command[1] === 'GTPNR' || command[1] === 'GTPFR') {
    // Power on/off reason
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[4]),
      datetime: parsedData[9] !== '' ? utils.parseDate(parsedData[9]) : null
    })
  } else if (
    command[1] === 'GTMPN' ||
    command[1] === 'GTMPF' ||
    command[1] === 'GTBTC' ||
    command[1] === 'GTDRM'
  ) {
    var index = 15
    let satelliteInfo = false
    // let includeStatus =
    //   parsedData[index] !== '' ? parseInt(parsedData[index]) > 3 : null

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

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
      azimuth: parsedData[6] !== '' ? parseFloat(parsedData[6]) : null,
      altitude: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      datetime: parsedData[10] !== '' ? utils.parseDate(parsedData[10]) : null,
      // voltage: {
      //   battery: null,
      //   inputCharge: null
      // },
      mcc:
        parsedData[11] !== ''
          ? utils.latamMcc[parseInt(parsedData[11], 10)]
          : null,
      mnc:
        parsedData[12] !== ''
          ? utils.getMNC(parsedData[11], parsedData[12])
          : null,
      lac: parsedData[13] !== '' ? parseInt(parsedData[13], 16) : null,
      cid: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null
      // status: includeStatus
      //   ? {
      //     raw: parsedData[index + 1],
      //     sos: false,
      //     input: {
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[7] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[6] === '1'
      //     },
      //     output: {
      //       '3':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[5] === '1',
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[6] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[7] === '1'
      //     },
      //     charge: null,
      //     state: utils.states[parsedData[index + 1].substring(0, 2)]
      //   }
      //   : null,
      // odometer: null,
      // hourmeter: null
    })
  } else if (
    command[1] === 'GTJDR' ||
    command[1] === 'GTANT' ||
    command[1] === 'GTRMD' ||
    command[1] === 'GTCRA' ||
    command[1] === 'GTBPL' ||
    command[1] === 'GTSTT'
  ) {
    let index = 16 // position append mask
    let satelliteInfo = false
    // let includeStatus =
    //   parsedData[index] !== '' ? parseInt(parsedData[index]) > 3 : null

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
      azimuth: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] !== '' ? utils.parseDate(parsedData[11]) : null,
      // voltage: {
      //   battery: null,
      //   inputCharge: null
      // },
      mcc:
        parsedData[12] !== ''
          ? utils.latamMcc[parseInt(parsedData[12], 10)]
          : null,
      mnc:
        parsedData[13] !== ''
          ? utils.getMNC(parsedData[12], parsedData[13])
          : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null
      // status: includeStatus
      //   ? {
      //     raw: parsedData[index + 1],
      //     sos: false,
      //     input: {
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[7] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[6] === '1'
      //     },
      //     output: {
      //       '3':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[5] === '1',
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[6] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[7] === '1'
      //     },
      //     charge: null,
      //     state: utils.states[parsedData[index + 1].substring(0, 2)]
      //   }
      //   : null,
      // odometer: null,
      // hourmeter: null
    })
  } else if (command[1] === 'GTJDS') {
    let index = 17 // position append mask
    let satelliteInfo = false
    // let includeStatus =
    //   parsedData[index] !== '' ? parseInt(parsedData[index]) > 3 : null

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[17])) {
      index += 1
      satelliteInfo = true
    }

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[4], parsedData[5]),
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
      azimuth: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] !== '' ? utils.parseDate(parsedData[12]) : null,
      // voltage: {
      //   battery: null,
      //   inputCharge: null
      // },
      mcc:
        parsedData[13] !== ''
          ? utils.latamMcc[parseInt(parsedData[13], 10)]
          : null,
      mnc:
        parsedData[14] !== ''
          ? utils.getMNC(parsedData[13], parsedData[14])
          : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null
      // status: includeStatus
      //   ? {
      //     raw: parsedData[index + 1],
      //     sos: false,
      //     input: {
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[7] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[6] === '1'
      //     },
      //     output: {
      //       '3':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[5] === '1',
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[6] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[7] === '1'
      //     },
      //     charge: null,
      //     state: utils.states[parsedData[index + 1].substring(0, 2)]
      //   }
      //   : null,
      // odometer: null,
      // hourmeter: null
    })
  } else if (command[1] === 'GTIGN' || command[1] === 'GTIGF') {
    let index = 16 // position append mask
    let satelliteInfo = false
    let includeStatus =
      parsedData[index] !== '' ? parseInt(parsedData[index]) > 3 : null

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
      azimuth: parsedData[7] !== '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] !== '' ? utils.parseDate(parsedData[11]) : null,
      voltage: {
        battery: null,
        inputCharge: null
      },
      mcc:
        parsedData[12] !== ''
          ? utils.latamMcc[parseInt(parsedData[12], 10)]
          : null,
      mnc:
        parsedData[13] !== ''
          ? utils.getMNC(parsedData[12], parsedData[13])
          : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      status: includeStatus
        ? {
          raw: parsedData[index + 1],
          sos: false,
          input: {
            '2':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(2, 4)),
                  8
                )[6] === '1',
            '1':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(2, 4)),
                  8
                )[7] === '1'
          },
          output: {
            '3':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(4, 6)),
                  8
                )[5] === '1',
            '2':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(4, 6)),
                  8
                )[6] === '1',
            '1':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(4, 6)),
                  8
                )[7] === '1'
          },
          charge: null,
          state: utils.states[parsedData[index + 1].substring(0, 2)]
        }
        : null,
      odometer: includeStatus
        ? parsedData[index + 3] !== ''
          ? parseFloat(parsedData[index + 3])
          : null
        : parsedData[index + 2] !== ''
          ? parseFloat(parsedData[index + 2])
          : null,
      hourmeter: includeStatus
        ? parsedData[index + 2] !== ''
          ? utils.getHoursForHourmeter(parsedData[index + 2])
          : null
        : parsedData[index + 1] !== ''
          ? utils.getHoursForHourmeter(parsedData[index + 1])
          : null
    })
  } else if (command[1] === 'GTIDN' || command[1] === 'GTIDF') {
    let index = 17 // position append mask
    let satelliteInfo = false
    // let includeStatus =
    //   parsedData[index] !== '' ? parseInt(parsedData[index]) > 3 : null

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
      azimuth: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] !== '' ? utils.parseDate(parsedData[12]) : null,
      // voltage: {
      //   battery: null,
      //   inputCharge: null
      // },
      mcc:
        parsedData[13] !== ''
          ? utils.latamMcc[parseInt(parsedData[13], 10)]
          : null,
      mnc:
        parsedData[14] !== ''
          ? utils.getMNC(parsedData[13], parsedData[14])
          : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      // status: includeStatus
      //   ? {
      //     raw: parsedData[index + 1],
      //     sos: false,
      //     input: {
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[7] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[6] === '1'
      //     },
      //     output: {
      //       '3':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[5] === '1',
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[6] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[7] === '1'
      //     },
      //     charge: null,
      //     state: utils.states[parsedData[index + 1].substring(0, 2)]
      //   }
      //   : null,
      odometer:
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null
      // hourmeter: null
    })
  } else if (
    command[1] === 'GTSTR' ||
    command[1] === 'GTSTP' ||
    command[1] === 'GTLSP'
  ) {
    let index = 17 // position append mask
    let satelliteInfo = false
    // let includeStatus =
    //   parsedData[index] !== '' ? parseInt(parsedData[index]) > 3 : null

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
      azimuth: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] !== '' ? utils.parseDate(parsedData[12]) : null,
      // voltage: {
      //   battery: null,
      //   inputCharge: null
      // },
      mcc:
        parsedData[13] !== ''
          ? utils.latamMcc[parseInt(parsedData[13], 10)]
          : null,
      mnc:
        parsedData[14] !== ''
          ? utils.getMNC(parsedData[13], parsedData[14])
          : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      // status: includeStatus
      //   ? {
      //     raw: parsedData[index + 1],
      //     sos: false,
      //     input: {
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[7] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[6] === '1'
      //     },
      //     output: {
      //       '3':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[5] === '1',
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[6] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[7] === '1'
      //     },
      //     charge: null,
      //     state: utils.states[parsedData[index + 1].substring(0, 2)]
      //   }
      //   : null,
      odometer:
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null
      // hourmeter: null
    })
  } else if (command[1] === 'GTGSS') {
    // GPS Status
    let index = 19 // position append mask
    let satelliteInfo = false
    // let includeStatus =
    //   parsedData[index] !== '' ? parseInt(parsedData[index]) > 3 : null

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
      azimuth: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
      // voltage: {
      //   battery: null,
      //   inputCharge: null
      // },
      mcc:
        parsedData[15] !== ''
          ? utils.latamMcc[parseInt(parsedData[15], 10)]
          : null,
      mnc:
        parsedData[16] !== ''
          ? utils.getMNC(parsedData[15], parsedData[16])
          : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      usedSatellites: parsedData[5] !== '' ? parseInt(parsedData[5], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null
      // status: includeStatus
      //   ? {
      //     raw: parsedData[index + 1],
      //     sos: false,
      //     input: {
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[7] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[6] === '1'
      //     },
      //     output: {
      //       '3':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[5] === '1',
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[6] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[7] === '1'
      //     },
      //     charge: null,
      //     state: utils.states[parsedData[index + 1].substring(0, 2)]
      //   }
      //   : null,
      // odometer: null,
      // hourmeter: null
    })
    // } else if (command[1] === 'GTIDA') {
    //   // bluetooth identification
    //   let number = parsedData[7] !== '' ? parseInt(parsedData[7], 10) : 1
    //   let index = 7 + 12 * number // position append mask
    //   let satelliteInfo = false

    //   // If get satellites is configured
    //   if (utils.includeSatellites(parsedData[index])) {
    //     index += 1
    //     satelliteInfo = true
    //   }

    //   data = Object.assign(data, {
    //     alarm: utils.getAlarm(command[1], `${parsedData[5]},${parsedData[6]}`),
    //     loc: {
    //       type: 'Point',
    //       coordinates: [parseFloat(parsedData[12]), parseFloat(parsedData[13])]
    //     },
    //     speed: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
    //     gpsStatus: utils.checkGps(
    //       parseFloat(parsedData[12]),
    //       parseFloat(parsedData[13])
    //     ),
    //     hdop: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
    //     status: null,
    //     azimuth: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
    //     altitude: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
    //     datetime: parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
    //     voltage: {
    //       battery: null,
    //       inputCharge: null
    //     },
    //     mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
    //     mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
    //     lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
    //     cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
    //     satellites:
    //       satelliteInfo && parsedData[index] !== ''
    //         ? parseInt(parsedData[index], 10)
    //         : null,
    //     odometer:
    //       parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null,
    //     hourmeter: null
    //   })
  } else if (command[1] === 'GTDAT') {
    let dataIndex = 4
    // Short format
    if (parsedData.length === 7) {
      data = Object.assign(data, {
        datetime: parsedData[5] !== '' ? utils.parseDate(parsedData[5]) : null
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
        mcc:
          parsedData[15] !== ''
            ? utils.latamMcc[parseInt(parsedData[15], 10)]
            : null,
        mnc:
          parsedData[16] !== ''
            ? utils.getMNC(parsedData[15], parsedData[16])
            : null,
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

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[dataIndex])
    })
  } else if (command[1] === 'GTDOS') {
    let index = 17 // position append mask
    let satelliteInfo = false
    // let includeStatus =
    //   parsedData[index] !== '' ? parseInt(parsedData[index]) > 3 : null

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
      azimuth: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] !== '' ? utils.parseDate(parsedData[12]) : null,
      // voltage: {
      //   battery: null,
      //   inputCharge: null
      // },
      mcc:
        parsedData[13] !== ''
          ? utils.latamMcc[parseInt(parsedData[13], 10)]
          : null,
      mnc:
        parsedData[14] !== ''
          ? utils.getMNC(parsedData[13], parsedData[14])
          : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null
      // status: includeStatus
      //   ? {
      //     raw: parsedData[index + 1],
      //     sos: false,
      //     input: {
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[7] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[6] === '1'
      //     },
      //     output: {
      //       '3':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[5] === '1',
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[6] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[7] === '1'
      //     },
      //     charge: null,
      //     state: utils.states[parsedData[index + 1].substring(0, 2)]
      //   }
      //   : null,
      // odometer: null,
      // hourmeter: null
    })
  } else if (command[1] === 'GTDOM') {
    // Waveform beeing monitored
    let index = 18 // position append mask
    let satelliteInfo = false
    // let includeStatus =
    //   parsedData[index] !== '' ? parseInt(parsedData[index]) > 3 : null

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
      azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
      // voltage: {
      //   battery: null,
      //   inputCharge: null
      // },
      mcc:
        parsedData[14] !== ''
          ? utils.latamMcc[parseInt(parsedData[14], 10)]
          : null,
      mnc:
        parsedData[15] !== ''
          ? utils.getMNC(parsedData[14], parsedData[15])
          : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null
      // status: includeStatus
      //   ? {
      //     raw: parsedData[index + 1],
      //     sos: false,
      //     input: {
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[7] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[6] === '1'
      //     },
      //     output: {
      //       '3':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[5] === '1',
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[6] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[7] === '1'
      //     },
      //     charge: null,
      //     state: utils.states[parsedData[index + 1].substring(0, 2)]
      //   }
      //   : null,
      // odometer: null,
      // hourmeter: null
    })
  } else if (command[1] === 'GTVER') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(
        command[1],
        [parsedData[5], parsedData[6]],
        'gv58lau'
      )
    })
  } else if (command[1] === 'GTVGN' || command[1] === 'GTVGF') {
    // Virtual ignition
    let index = 18 // possition append mask
    let satelliteInfo = false
    let includeStatus =
      parsedData[index] !== '' ? parseInt(parsedData[index]) > 3 : null

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
      azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
      voltage: {
        battery: null,
        inputCharge: null
      },
      mcc:
        parsedData[14] !== ''
          ? utils.latamMcc[parseInt(parsedData[14], 10)]
          : null,
      mnc:
        parsedData[15] !== ''
          ? utils.getMNC(parsedData[14], parsedData[15])
          : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      status: includeStatus
        ? {
          raw: parsedData[index + 1],
          sos: false,
          input: {
            '2':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(2, 4)),
                  8
                )[6] === '1',
            '1':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(2, 4)),
                  8
                )[7] === '1'
          },
          output: {
            '3':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(4, 6)),
                  8
                )[5] === '1',
            '2':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(4, 6)),
                  8
                )[6] === '1',
            '1':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(4, 6)),
                  8
                )[7] === '1'
          },
          charge: null,
          state: utils.states[parsedData[index + 1].substring(0, 2)]
        }
        : null,
      odometer: includeStatus
        ? parsedData[index + 3] !== ''
          ? parseFloat(parsedData[index + 3])
          : null
        : parsedData[index + 2] !== ''
          ? parseFloat(parsedData[index + 2])
          : null,
      hourmeter: includeStatus
        ? parsedData[index + 2] !== ''
          ? utils.getHoursForHourmeter(parsedData[index + 2])
          : null
        : parsedData[index + 1] !== ''
          ? utils.getHoursForHourmeter(parsedData[index + 1])
          : null
    })
  } else if (command[1] === 'GTGSM') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null),
      fixType: parsedData[3] !== '' ? parsedData[3] : null
    })
    let antData = []
    let index = 4
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

    let includeStatus =
      parsedData[index] !== '' ? parseInt(parsedData[index]) > 3 : null

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
      alarm: utils.getAlarm(command[1], parsedData[6]),
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
      mcc:
        parsedData[67] !== ''
          ? utils.latamMcc[parseInt(parsedData[67], 10)]
          : null,
      mnc:
        parsedData[68] !== ''
          ? utils.getMNC(parsedData[67], parsedData[68])
          : null,
      lac: parsedData[69] !== '' ? parseInt(parsedData[69], 16) : null,
      cid: parsedData[70] !== '' ? parseInt(parsedData[70], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      status: includeStatus
        ? {
          raw: parsedData[index + 1],
          sos: false,
          input: {
            '2':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(2, 4)),
                  8
                )[6] === '1',
            '1':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(2, 4)),
                  8
                )[7] === '1'
          },
          output: {
            '3':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(4, 6)),
                  8
                )[5] === '1',
            '2':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(4, 6)),
                  8
                )[6] === '1',
            '1':
                utils.nHexDigit(
                  utils.hex2bin(parsedData[index + 1].substring(4, 6)),
                  8
                )[7] === '1'
          },
          charge: null,
          state: utils.states[parsedData[index + 1].substring(0, 2)]
        }
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
        inputCharge: null
      },
      mcc:
        parsedData[15] !== ''
          ? utils.latamMcc[parseInt(parsedData[15], 10)]
          : null,
      mnc:
        parsedData[16] !== ''
          ? utils.getMNC(parsedData[15], parsedData[16])
          : null,
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
  } else if (command[1] === 'GTASC') {
    // Calibrarion data for XYZ-axis acceleration sensor
    let index = 24 // possition append mask
    let satelliteInfo = false

    // let includeStatus =
    //   parsedData[index] !== '' ? parseInt(parsedData[index]) > 3 : null

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
      azimuth: parsedData[15] !== '' ? parseFloat(parsedData[15]) : null,
      altitude: parsedData[16] !== '' ? parseFloat(parsedData[16]) : null,
      datetime: parsedData[19] !== '' ? utils.parseDate(parsedData[19]) : null,
      // voltage: {
      //   battery: null,
      //   inputCharge: null
      // },
      mcc:
        parsedData[20] !== ''
          ? utils.latamMcc[parseInt(parsedData[20], 10)]
          : null,
      mnc:
        parsedData[21] !== ''
          ? utils.getMNC(parsedData[20], parsedData[21])
          : null,
      lac: parsedData[22] !== '' ? parseInt(parsedData[22], 16) : null,
      cid: parsedData[23] !== '' ? parseInt(parsedData[23], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      // status: includeStatus
      //   ? {
      //     raw: parsedData[index + 1],
      //     sos: false,
      //     input: {
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[7] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[6] === '1'
      //     },
      //     output: {
      //       '3':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[5] === '1',
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[6] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[7] === '1'
      //     },
      //     charge: null,
      //     state: utils.states[parsedData[index + 1].substring(0, 2)]
      //   }
      //   : null,
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
      }
      // odometer: null,
      // hourmeter: null
    })
  } else if (command[1] === 'GTHBE') {
    // Harsh Behavior Information
    // Only works when GTHBM is in mode 5
    let index = 18 // possition append mask
    let satelliteInfo = false
    // let includeStatus =
    //   parsedData[index] !== '' ? parseInt(parsedData[index]) > 3 : null

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
      azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
      // voltage: {
      //   battery: null,
      //   inputCharge: null
      // },
      mcc:
        parsedData[14] !== ''
          ? utils.latamMcc[parseInt(parsedData[14], 10)]
          : null,
      mnc:
        parsedData[15] !== ''
          ? utils.getMNC(parsedData[14], parsedData[15])
          : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index])
          : null,
      // status: includeStatus
      //   ? {
      //     raw: parsedData[index + 1],
      //     sos: false,
      //     input: {
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[7] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(2, 4)),
      //             8
      //           )[6] === '1'
      //     },
      //     output: {
      //       '3':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[5] === '1',
      //       '2':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[6] === '1',
      //       '1':
      //           utils.nHexDigit(
      //             utils.hex2bin(parsedData[index + 1].substring(4, 6)),
      //             8
      //           )[7] === '1'
      //     },
      //     charge: null,
      //     state: utils.states[parsedData[index + 1].substring(0, 2)]
      //   }
      //   : null,
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
        parsedData[index + 4] !== '' ? parseFloat(parsedData[index + 4]) : null
      // hourmeter: null
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
