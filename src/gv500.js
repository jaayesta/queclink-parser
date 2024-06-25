'use strict'
const utils = require('./utils.js')

/*
  Parses messages data from GV500 devices
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
    device: 'Queclink-GV500',
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
      status: null,
      azimuth: parsedData[10] !== '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] !== '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] !== '' ? utils.parseDate(parsedData[14]) : null,
      voltage: {
        battery:
          parsedData[parsedData.length - 7] !== ''
            ? parseFloat(parsedData[parsedData.length - 7])
            : null, // percentage
        inputCharge:
          parsedData[5] !== '' ? parseFloat(parsedData[5]) / 1000 : null
      },
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      odometer:
        parsedData[parsedData.length - 11] !== ''
          ? parseFloat(parsedData[parsedData.length - 11])
          : null,
      hourmeter:
        parsedData[parsedData.length - 10] !== ''
          ? utils.getHoursForHourmeter(parsedData[parsedData.length - 10])
          : null,
      canbus: {
        vin: parsedData[3] !== '' ? parsedData[3] : null,
        fuelLevel:
          parsedData[parsedData.length - 3] !== ''
            ? parseInt(parsedData[parsedData.length - 3], 10)
            : null, // -3 percentage
        fuelConsumption:
          parsedData[parsedData.length - 4] !== ''
            ? utils.getFuelConsumption(parsedData[parsedData.length - 4])
            : null,
        rpm:
          parsedData[parsedData.length - 5] !== ''
            ? parseInt(parsedData[parsedData.length - 5], 10)
            : null,
        state:
          parsedData[parsedData.length - 6] !== ''
            ? utils.states[parsedData[parsedData.length - 6].substring(0, 2)]
            : null
      }
    })
  } else if (command[1] === 'GTHBD') {
    // Heartbeat. It must response an ACK command
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null)
    })
  } else if (
    command[1] === 'GTGEO' ||
    command[1] === 'GTSPD' ||
    command[1] === 'GTTOW' ||
    command[1] === 'GTRTL' ||
    command[1] === 'GTDOG' ||
    command[1] === 'GTIGL' ||
    command[1] === 'GTHBM'
  ) {
    // Common Alarms
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[6]),
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
        battery: null, // percentage
        inputCharge: null
      },
      mcc: parsedData[15] !== '' ? utils.latamMcc[parseInt(parsedData[15], 10)] : null,
      mnc: parsedData[16] !== '' ? utils.getMNC(parsedData[15], parsedData[16]) : null,
      lac: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      cid: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      odometer:
        parsedData[parsedData.length - 3] !== ''
          ? parseFloat(parsedData.length - 3)
          : null,
      hourmeter: null,
      canbus: null
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
      hourmeter: null,
      canbus: null
    })
  } else if (
    command[1] === 'GTMPN' ||
    command[1] === 'GTMPF' ||
    (command[1] === 'GTBTC') | (command[1] === 'GTCRA') ||
    command[1] === 'GTJDR'
  ) {
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
      mcc: parsedData[12] !== '' ? utils.latamMcc[parseInt(parsedData[12], 10)] : null,
      mnc: parsedData[13] !== '' ? utils.getMNC(parsedData[12], parsedData[13]) : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      odometer: null,
      hourmeter: null,
      canbus: null
    })
  } else if (command[1] === 'GTJDS') {
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
      mcc: parsedData[13] !== '' ? utils.latamMcc[parseInt(parsedData[13], 10)] : null,
      mnc: parsedData[14] !== '' ? utils.getMNC(parsedData[13], parsedData[14]) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      odometer: null,
      hourmeter: null,
      canbus: null
    })
  } else if (command[1] === 'GTBPL' || command[1] === 'GTSTC') {
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
        battery: parsedData[5] !== '' ? parseFloat(parsedData[5]) : null,
        inputCharge: null
      },
      mcc: parsedData[13] !== '' ? utils.latamMcc[parseInt(parsedData[13], 10)] : null,
      mnc: parsedData[14] !== '' ? utils.getMNC(parsedData[13], parsedData[14]) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      odometer: null,
      hourmeter: null,
      canbus: null
    })
  } else if (command[1] === 'GTSTT') {
    // Motion State Changed
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
      mcc: parsedData[13] !== '' ? utils.latamMcc[parseInt(parsedData[13], 10)] : null,
      mnc: parsedData[14] !== '' ? utils.getMNC(parsedData[13], parsedData[14]) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      odometer: null,
      hourmeter: null,
      canbus: null
    })
  } else if (command[1] === 'GTIGN' || command[1] === 'GTIGF') {
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
      mcc: parsedData[13] !== '' ? utils.latamMcc[parseInt(parsedData[13], 10)] : null,
      mnc: parsedData[14] !== '' ? utils.getMNC(parsedData[13], parsedData[14]) : null,
      lac: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      cid: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      odometer: parsedData[19] !== '' ? parseFloat(parsedData[19]) : null,
      hourmeter:
        parsedData[18] !== ''
          ? utils.getHoursForHourmeter(parsedData[20])
          : null,
      canbus: null
    })
  } else if (
    command[1] === 'GTIDN' ||
    command[1] === 'GTSTR' ||
    command[1] === 'GTSTP' ||
    command[1] === 'GTLSP' ||
    command[1] === 'GTIDF'
  ) {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], parsedData[6]),
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
      mcc: parsedData[14] !== '' ? utils.latamMcc[parseInt(parsedData[14], 10)] : null,
      mnc: parsedData[15] !== '' ? utils.getMNC(parsedData[14], parsedData[15]) : null,
      lac: parsedData[16] !== '' ? parseInt(parsedData[16], 16) : null,
      cid: parsedData[17] !== '' ? parseInt(parsedData[17], 16) : null,
      odometer: parsedData[19] !== '' ? parseFloat(parsedData[19]) : null,
      hourmeter: null,
      canbus: null
    })
  } else if (command[1] === 'GTGSS') {
    // GPS Status
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
        battery: null,
        inputCharge: null
      },
      mcc: parsedData[16] !== '' ? utils.latamMcc[parseInt(parsedData[16], 10)] : null,
      mnc: parsedData[17] !== '' ? utils.getMNC(parsedData[16], parsedData[17]) : null,
      lac: parsedData[18] !== '' ? parseInt(parsedData[18], 16) : null,
      cid: parsedData[19] !== '' ? parseInt(parsedData[19], 16) : null,
      odometer: null,
      hourmeter: null,
      canbus: null
    })
  } else if (command[1] === 'GTOPN' || command[1] === 'GTOPF') {
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
      mcc: parsedData[12] !== '' ? utils.latamMcc[parseInt(parsedData[12], 10)] : null,
      mnc: parsedData[13] !== '' ? utils.getMNC(parsedData[12], parsedData[13]) : null,
      lac: parsedData[14] !== '' ? parseInt(parsedData[14], 16) : null,
      cid: parsedData[15] !== '' ? parseInt(parsedData[15], 16) : null,
      odometer: null,
      hourmeter: null,
      canbus: null
    })
  } else if (command[1] === 'GTOBD') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], null),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[29]), parseFloat(parsedData[30])]
      },
      speed: parsedData[26] !== '' ? parseFloat(parsedData[26]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[29]),
        parseFloat(parsedData[30])
      ),
      hdop: parsedData[25] !== '' ? parseFloat(parsedData[25]) : null,
      status: null,
      azimuth: parsedData[27] !== '' ? parseFloat(parsedData[27]) : null,
      altitude: parsedData[28] !== '' ? parseFloat(parsedData[28]) : null,
      datetime: parsedData[31] !== '' ? utils.parseDate(parsedData[31]) : null,
      voltage: {
        battery: null,
        inputCharge:
          parsedData[9] !== '' ? parseFloat(parsedData[9]) / 1000 : null
      },
      mcc: parsedData[32] !== '' ? utils.latamMcc[parseInt(parsedData[32], 10)] : null,
      mnc: parsedData[33] !== '' ? utils.getMNC(parsedData[32], parsedData[33]) : null,
      lac: parsedData[34] !== '' ? parseInt(parsedData[34], 16) : null,
      cid: parsedData[35] !== '' ? parseInt(parsedData[35], 16) : null,
      odometer: parsedData[37] !== '' ? parseFloat(parsedData[37]) : null,
      hourmeter: null,
      canbus: null,
      obd: {
        vin: parsedData[3] !== '' ? parsedData[3] : null,
        obdConnected: parsedData[8] === '1',
        rpm: parsedData[11] !== '' ? parseInt(parsedData[11], 10) : null,
        speed: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
        coolantTemp:
          parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
        fuelConsumption:
          parsedData[14] !== ''
            ? utils.getFuelConsumption(parsedData[14])
            : null,
        DTCclearedDistance:
          parsedData[15] !== '' ? parseFloat(parsedData[15]) : null,
        MILactivatedDistance:
          parsedData[16] !== '' ? parseFloat(parsedData[16]) : null,
        MILstatusOn: parsedData[17] === '1',
        DTCsNumber: parsedData[18] !== '' ? parseInt(parsedData[18], 10) : null,
        troubleCodes: parsedData[19] !== '' ? parsedData[19] : null,
        throttlePosition:
          parsedData[20] !== '' ? parseInt(parsedData[20], 10) : null, // percentage
        engineLoad: parsedData[21] !== '' ? parseInt(parsedData[21], 10) : null, // percentage
        fuelLevel: parsedData[22] !== '' ? parseInt(parsedData[22], 10) : null, // percentage
        obdProtocol:
          parsedData[23] !== '' ? utils.OBDIIProtocols[parsedData[23]] : null,
        odometer: parsedData[24] !== '' ? parseInt(parsedData[24], 10) : null
      }
    })
  } else if (command[1] === 'GTOSM') {
    data = Object.assign(data, {
      alarm: utils.getAlarm(command[1], `${parsedData[5]}${parsedData[6]}`),
      loc: {
        type: 'Point',
        coordinates: [parseFloat(parsedData[30]), parseFloat(parsedData[31])]
      },
      speed: parsedData[27] !== '' ? parseFloat(parsedData[27]) : null,
      gpsStatus: utils.checkGps(
        parseFloat(parsedData[30]),
        parseFloat(parsedData[31])
      ),
      hdop: parsedData[26] !== '' ? parseFloat(parsedData[26]) : null,
      status: null,
      azimuth: parsedData[28] !== '' ? parseFloat(parsedData[28]) : null,
      altitude: parsedData[29] !== '' ? parseFloat(parsedData[29]) : null,
      datetime: parsedData[32] !== '' ? utils.parseDate(parsedData[32]) : null,
      voltage: {
        battery: null,
        inputCharge:
          parsedData[10] !== '' ? parseFloat(parsedData[10]) / 1000 : null
      },
      mcc: parsedData[33] !== '' ? utils.latamMcc[parseInt(parsedData[33], 10)] : null,
      mnc: parsedData[34] !== '' ? utils.getMNC(parsedData[33], parsedData[34]) : null,
      lac: parsedData[35] !== '' ? parseInt(parsedData[35], 16) : null,
      cid: parsedData[36] !== '' ? parseInt(parsedData[36], 16) : null,
      odometer: parsedData[38] !== '' ? parseFloat(parsedData[38]) : null,
      hourmeter: null,
      canbus: null,
      obd: {
        vin: parsedData[3] !== '' ? parsedData[3] : null,
        obdConnected: parsedData[9] === '1',
        rpm: parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null,
        speed: parsedData[13] !== '' ? parseInt(parsedData[13], 10) : null,
        coolantTemp:
          parsedData[14] !== '' ? parseInt(parsedData[14], 10) : null,
        fuelConsumption:
          parsedData[15] !== ''
            ? utils.getFuelConsumption(parsedData[15])
            : null,
        DTCclearedDistance:
          parsedData[16] !== '' ? parseFloat(parsedData[16]) : null,
        MILactivatedDistance:
          parsedData[17] !== '' ? parseFloat(parsedData[17]) : null,
        MILstatusOn: parsedData[18] === '1',
        DTCsNumber: parsedData[19] !== '' ? parseInt(parsedData[19], 10) : null,
        troubleCodes: parsedData[20] !== '' ? parsedData[20] : null,
        throttlePosition:
          parsedData[21] !== '' ? parseInt(parsedData[21], 10) : null, // percentage
        engineLoad: parsedData[22] !== '' ? parseInt(parsedData[22], 10) : null, // percentage
        fuelLevel: parsedData[23] !== '' ? parseInt(parsedData[23], 10) : null, // percentage
        obdProtocol: parsedData[24] !== '' ? parsedData[24] : null,
        odometer: parsedData[25] !== '' ? parseInt(parsedData[25], 10) : null
      }
    })
  } else if (command[1] === 'GTJES') {
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
        inputCharge: null
      },
      mcc: parsedData[20] !== '' ? utils.latamMcc[parseInt(parsedData[20], 10)] : null,
      mnc: parsedData[21] !== '' ? utils.getMNC(parsedData[20], parsedData[21]) : null,
      lac: parsedData[22] !== '' ? parseInt(parsedData[22], 16) : null,
      cid: parsedData[23] !== '' ? parseInt(parsedData[23], 16) : null,
      odometer: parsedData[25] !== '' ? parseFloat(parsedData[25]) : null,
      hourmeter: null,
      canbus: null,
      obdSummary: {
        vin: parsedData[3] !== '' ? parsedData[3] : null,
        fuelConsumption:
          parsedData[6] !== '' ? utils.getFuelConsumption(parsedData[6]) : null,
        maxRpm: parsedData[7] !== '' ? parseInt(parsedData[7], 10) : null,
        averageRpm: parsedData[8] !== '' ? parseInt(parsedData[8], 10) : null,
        maxThrottle: parsedData[9] !== '' ? parseInt(parsedData[9], 10) : null,
        averageThrottle:
          parsedData[10] !== '' ? parseInt(parsedData[10], 10) : null,
        maxEngineLoad:
          parsedData[11] !== '' ? parseInt(parsedData[11], 10) : null,
        averageEngineLoad:
          parsedData[12] !== '' ? parseInt(parsedData[12], 10) : null
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
