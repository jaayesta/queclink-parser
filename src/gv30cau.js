'use strict'
const utils = require('./utils.js')

/*
  Parses messages data from GV30CAU devices
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
    device: 'Queclink-GV30CAU',
    type: 'data',
    imei: parsedData[2],
    protocolVersion: utils.getProtocolVersion(parsedData[1]),
    temperature: null,
    history,
    sentTime: utils.parseDate(parsedData[parsedData.length - 2]),
    serialId: parseInt(parsedData[parsedData.length - 1], 16)
  }
  // Gps
  if (command[1] === 'GTFRI') {
    try {
      const number = parsedData[6] !== '' ? parseInt(parsedData[6], 10) : 1
      const satelliteInfo = utils.includeSatellites(parsedData[18])
      const gnssTriggerType = utils.includeGnssTrigger(parsedData[18]) ? 1 : 0
      const accuracyInfo = utils.includeGnnsAccuracy(parsedData[18]) ? 3 : 0
      const index =
        6 + (12 + satelliteInfo + gnssTriggerType + accuracyInfo) * number

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
            1:
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[index + 7], 10).substring(6, 8)
                ),
                4
              )[3] === '1',
            2:
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[index + 7], 10).substring(6, 8)
                ),
                4
              )[2] === '1'
          },
          output: {
            1:
              utils.nHexDigit(
                utils.hex2bin(
                  utils.nHexDigit(parsedData[index + 7], 10).substring(8, 10)
                ),
                3
              )[2] === '1'
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
              : null
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
          satelliteInfo &&
          parsedData[index - (satelliteInfo + accuracyInfo) + 1] !== ''
            ? parseInt(
                parsedData[index - (satelliteInfo + accuracyInfo) + 1],
                10
              )
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
        const moreData = []
        for (let i = 1; i < number; i++) {
          const gnssIx =
            7 + (12 + satelliteInfo + gnssTriggerType + accuracyInfo) * i
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

        data = Object.assign(data, { moreData })
      }
    } catch (err) {
      return { type: 'UNKNOWN', raw: data.raw.toString() }
    }
  } else if (command[1] === 'GTERI') {
    // GPS with Extended Report Information (no BT/CAN/fuel sensor for GV30CAU)
    const number = parsedData[7] !== '' ? parseInt(parsedData[7], 10) : 1
    const satelliteInfo = utils.includeSatellites(parsedData[19])
    const gnssTriggerType = utils.includeGnssTrigger(parsedData[19]) ? 1 : 0
    const accuracyInfo = utils.includeGnnsAccuracy(parsedData[19]) ? 3 : 0
    const index =
      7 + (12 + satelliteInfo + gnssTriggerType + accuracyInfo) * number

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
        raw: parsedData[index + 7],
        sos: false,
        input: {
          1:
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[index + 7], 10).substring(6, 8)
              ),
              4
            )[3] === '1',
          2:
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[index + 7], 10).substring(6, 8)
              ),
              4
            )[2] === '1'
        },
        output: {
          1:
            utils.nHexDigit(
              utils.hex2bin(
                utils.nHexDigit(parsedData[index + 7], 10).substring(8, 10)
              ),
              3
            )[2] === '1'
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
            : null
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
        satelliteInfo &&
        parsedData[index - (satelliteInfo + accuracyInfo) + 1] !== ''
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
          : null
    })

    // More than 1 GNSS report in data
    if (number > 1) {
      const moreData = []
      for (let i = 1; i < number; i++) {
        const gnssIx =
          8 + (12 + satelliteInfo + gnssTriggerType + accuracyInfo) * i
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

      data = Object.assign(data, { moreData })
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
          2: utils.nHexDigit(utils.hex2bin(parsedData[21][1]), 4)[2] === '1',
          1: utils.nHexDigit(utils.hex2bin(parsedData[21][1]), 4)[3] === '1'
        },
        output: {
          1: utils.nHexDigit(utils.hex2bin(parsedData[22][1]), 4)[3] === '1'
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
        ada: parsedData[18] !== '' ? parseFloat(parsedData[18]) / 1000 : null
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
    const number = parsedData[6] !== '' ? parseInt(parsedData[6], 10) : 1
    const posAppendMask = parsedData[18]
      ? utils.nHexDigit(utils.hex2bin(parsedData[18]), 8)
      : null

    // If get satellites is configured
    const satelliteInfo = posAppendMask && posAppendMask[7] === '1' ? 1 : 0
    const accuracyInfo = posAppendMask && posAppendMask[4] === '1' ? 3 : 0
    const index = 6 + (12 + satelliteInfo + accuracyInfo) * number

    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[5], 'gv30cau'),
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
        ada: null
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
        satelliteInfo &&
        parsedData[index - (satelliteInfo + accuracyInfo) + 1] !== ''
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
          : parseInt(parsedData[4], 10) === 3
            ? parsedData[index + 3]
            : null,
      hourmeter: null
    })
  } else if (command[1] === 'GTEPS' || command[1] === 'GTAIS') {
    // External low battery and voltage for analog input
    const number = parsedData[6] !== '' ? parseInt(parsedData[6], 10) : 1
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
        ada: null
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
        parsedData[index + 1] !== '' ? parseFloat(parsedData[index + 1]) : null,
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
        ada: null
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
        ada: null
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
        ada: null
      },
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
      odometer: null,
      hourmeter: null
    })
  } else if (
    command[1] === 'GTJDR' ||
    command[1] === 'GTRMD' ||
    command[1] === 'GTCRA' ||
    command[1] === 'GTBPL' ||
    command[1] === 'GTSTT'
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
        ada: null
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
      odometer: null,
      hourmeter: null
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
        ada: null
      },
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
        ada: null
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
        ada: null
      },
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
        ada: null
      },
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
        ada: null
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
      usedSatellites: parsedData[5] !== '' ? parseInt(parsedData[5], 16) : null,
      satellites:
        satelliteInfo && parsedData[index] !== ''
          ? parseInt(parsedData[index], 10)
          : null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTVER') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(
        command[1],
        [parsedData[5], parsedData[6]],
        'gv30cau'
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
        ada: null
      },
      mcc: null,
      mnc: null,
      lac: null,
      cid: null,
      satellites: null,
      odometer: null,
      hourmeter: null
    })
  } else if (command[1] === 'GTVGN' || command[1] === 'GTVGF') {
    // Virtual ignition
    let index = 18 // position append mask
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
        ada: null
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
        parsedData[index + 2] !== '' ? parseFloat(parsedData[index + 2]) : null,
      hourmeter: parsedData[index + 1] !== '' ? parsedData[index + 1] : null
    })
  } else if (command[1] === 'GTGSM') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null),
      fixType: parsedData[3] !== '' ? parsedData[3] : null
    })
    const antData = []
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
  } else if (command[1] === 'GTASC') {
    // Calibration data for XYZ-axis acceleration sensor
    let index = 24 // position append mask
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
        ada: null
      },
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
    let index = 18 // position append mask
    let satelliteInfo = false

    // If get satellites is configured
    if (utils.includeSatellites(parsedData[index])) {
      index += 1
      satelliteInfo = true
    }

    const maxAcc = parsedData[index + 1] !== '' ? parsedData[index + 1] : null
    const avgAcc = parsedData[index + 2] !== '' ? parsedData[index + 2] : null
    const duration =
      parsedData[index + 3] !== ''
        ? parseFloat(parsedData[index + 3]) / 100
        : null
    const speed = parsedData[8] !== '' ? parseFloat(parsedData[8]) : null

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
      speed,
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
        ada: null
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
      maxAcceleration: {
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
      duration,
      odometer:
        parsedData[index + 4] !== '' ? parseFloat(parsedData[index + 4]) : null,
      hourmeter: null
    })
  } else if (command[1] === 'GTDOS') {
    // Wave Shape 1 Output Status
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
        ada: null
      },
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
      odometer: null,
      hourmeter: null
    })
  } else {
    // Default: unrecognized command
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
  parse
}
