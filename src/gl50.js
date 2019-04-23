'use strict'
const utils = require('./utils.js')

/*
  Parses messages data from GL50 devices
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
    device: 'Queclink-GL50',
    type: 'data',
    imei: parsedData[2],
    protocolVersion: utils.getProtocolVersion(parsedData[1]),
    temperature: null,
    history: history,
    sentTime: utils.parseDate(parsedData[parsedData.length - 2]),
    serialId: parseInt(parsedData[parsedData.length - 1], 16)
  }

  // GPS
  if (
    command[1] === 'GTCTN' ||
    command[1] === 'GTRTL' ||
    command[1] === 'GTSTR' ||
    command[1] === 'GTDOG'
  ) {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[5]),
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
      datetime: parsedData[15] !== '' ? utils.parseDate(parsedData[15]) : null,
      voltage: {
        battery: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
        inputCharge: false
      },
      mcc: parsedData[16] !== '' ? parseInt(parsedData[16], 10) : null,
      mnc: parsedData[17] !== '' ? parseInt(parsedData[17], 10) : null,
      lac: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      cid: parsedData[19] !== '' ? parseInt(parsedData[19], 16) : null,
      odometer: null,
      hourmeter: null,
      reportCount:
        parsedData[parsedData.length - 4] !== ''
          ? parseInt(parsedData[parsedData.length - 4], 10)
          : null,
      maxCount:
        parsedData[parsedData.length - 3] !== ''
          ? parseInt(parsedData[parsedData.length - 3], 10)
          : null
    })
  } else if (command[1] === 'GTNMR') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], `0${parsedData[5]}`),
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
      datetime: parsedData[15] !== '' ? utils.parseDate(parsedData[15]) : null,
      voltage: {
        battery: parsedData[8] !== '' ? parseFloat(parsedData[8]) : null,
        inputCharge: false
      },
      mcc: parsedData[16] !== '' ? parseInt(parsedData[16], 10) : null,
      mnc: parsedData[17] !== '' ? parseInt(parsedData[17], 10) : null,
      lac: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      cid: parsedData[19] !== '' ? parseInt(parsedData[19], 16) : null,
      odometer: null,
      hourmeter: null,
      reportCount:
        parsedData[parsedData.length - 4] !== ''
          ? parseInt(parsedData[parsedData.length - 4], 10)
          : null,
      maxCount:
        parsedData[parsedData.length - 3] !== ''
          ? parseInt(parsedData[parsedData.length - 3], 10)
          : null
    })
  } else if (command[1] === 'GTLOC') {
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
      odometer: null,
      hourmeter: null,
      reportCount: null,
      maxCount: null
    })
  } else if (command[1] === 'GTPNA') {
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
      datetime:
        parsedData[parsedData.length - 2] !== ''
          ? utils.parseDate(parsedData[parsedData.length - 2])
          : null,
      voltage: {
        battery: null,
        inputCharge: null
      },
      mcc: null,
      mnc: null,
      lac: null,
      cid: null,
      odometer: null,
      hourmeter: null,
      reportCount: null,
      maxCount: null
    })
  } else if (command[1] === 'GTBPL') {
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
        battery: parsedData[6] !== '' ? parseFloat(parsedData[6]) : null,
        inputCharge: false
      },
      mcc: parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
      mnc: parsedData[15] !== '' ? parseInt(parsedData[15], 10) : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      odometer: null,
      hourmeter: null,
      reportCount:
        parsedData[parsedData.length - 4] !== ''
          ? parseInt(parsedData[parsedData.length - 4], 10)
          : null,
      maxCount:
        parsedData[parsedData.length - 3] !== ''
          ? parseInt(parsedData[parsedData.length - 3], 10)
          : null
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
