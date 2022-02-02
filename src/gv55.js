'use strict'
const utils = require('./utils.js')

/*
  Parses messages data from GV55 devices
*/
const parse = (raw, d) => {
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
    device: d === 'GV55W' ? 'Queclink-GV55W' : 'Queclink-GV55',
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
    if (typeof parsedData[24] !== 'undefined' && parsedData[24] !== null) {
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
          raw: parsedData[24],
          sos:
            utils.nHexDigit(
              utils.hex2bin(parsedData[24].substring(2, 4)),
              2
            )[0] === '1',
          state: utils.states[parsedData[24].substring(0, 2)],
          input: {
            '1':
              utils.nHexDigit(
                utils.hex2bin(parsedData[24].substring(2, 4)),
                2
              )[1] === '1',
            '2':
              utils.nHexDigit(
                utils.hex2bin(parsedData[24].substring(2, 4)),
                2
              )[0] === '1'
          },
          output: {
            '1':
              utils.nHexDigit(
                utils.hex2bin(parsedData[24].substring(4, 6)),
                2
              )[1] === '1',
            '2':
              utils.nHexDigit(
                utils.hex2bin(parsedData[24].substring(4, 6)),
                2
              )[0] === '1'
          },
          charge: parseFloat(parsedData[4]) > 5
        },
        azimuth: parsedData[9] !== '' ? parseFloat(parsedData[9]) : null,
        altitude: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
        datetime:
          parsedData[13] !== '' ? utils.parseDate(parsedData[13]) : null,
        voltage: {
          battery: parsedData[23] !== '' ? parseFloat(parsedData[23]) : null, // percentage
          inputCharge:
            parsedData[4] !== '' ? parseFloat(parsedData[4]) / 1000 : null
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
          '1': utils.nHexDigit(utils.hex2bin(parsedData[20]), 2)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[20]), 2)[0] === '1'
        },
        output: {
          '1': utils.nHexDigit(utils.hex2bin(parsedData[21]), 2)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[21]), 2)[0] === '1'
        },
        charge: parsedData[8] === '1'
      },
      voltage: {
        battery:
          parsedData[11] !== ''
            ? parseInt(100 * (parseFloat(parsedData[11]) / 5), 10)
            : null, // percentage
        inputCharge:
          parsedData[9] !== '' ? parseFloat(parsedData[9]) / 1000 : null
      },
      lastFixUTCTime:
        parsedData[16] !== '' ? utils.parseDate(parsedData[16]) : null,
      timezoneOffset: parsedData[22]
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
      alarm: utils.getAlarm(command[1], parsedData[5], true),
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
        inputCharge: null
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
        battery: parsedData[23] !== '' ? parseFloat(parsedData[23]) : null, // percentage
        inputCharge:
          parsedData[4] !== '' ? parseFloat(parsedData[4]) / 1000 : null
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
        inputCharge: null
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
        inputCharge: null
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
        inputCharge: null
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
        inputCharge: null
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
        inputCharge: null
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
        inputCharge: null
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
        inputCharge: null
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
        inputCharge: null
      },
      mcc: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
      mnc: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
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
        inputCharge: null
      },
      mcc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      mnc: parsedData[16] !== '' ? parseInt(parsedData[16], 10) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      odometer: null,
      hourmeter: null
    })
  } else {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null)
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
