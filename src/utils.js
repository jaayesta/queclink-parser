'use strict'

const langEs = require('./messages/es.json')
const langEn = require('./messages/en.json')
const langs = { es: langEs, en: langEn }

/*
  Data patterns
*/
const patterns = {
  message: /^\+RESP.+\$$/,
  ack: /^\+ACK.+\$$/,
  buffer: /^\+BUFF.+\$$/,
  heartbeat: /^\+ACK:GTHBD.+\$$/
}

/*
  Homologued devices
*/
const devices = {
  '52': 'GL50',
  '55': 'GL50B',
  '02': 'GL200',
  '04': 'GV200',
  '06': 'GV300',
  '08': 'GMT100',
  '09': 'GV50P', // GV50 Plus
  '0F': 'GV55',
  '10': 'GV55 LITE',
  '11': 'GL500',
  '1A': 'GL300',
  '1F': 'GV500',
  '25': 'GV300', // New Version
  '35': 'GV200', // New Version
  '27': 'GV300W',
  '2F': 'GV55', // New Version
  '30': 'GL300', // New Version
  '36': 'GV500', // New Version
  '2C': 'GL300W', // New version
  '3F': 'GMT100', // New version
  F8: 'GV800W',
  '41': 'GV75W',
  FC: 'GV600W'
}

/*
  Possible device's motions states
*/
const states = {
  '16': 'Tow',
  '1A': 'Fake Tow',
  '11': 'Ignition Off Rest',
  '12': 'Ignition Off Moving',
  '21': 'Ingition On Rest',
  '22': 'Ignition On Moving',
  '41': 'Sensor Rest',
  '42': 'Sensor Motion',
  '': 'Unknown'
}

/*
  Possible OBDII Protoccols
*/
const OBDIIProtocols = {
  '0': 'Unknown',
  '1': 'J1850 PWM',
  '2': 'J1850 VPW',
  '3': 'ISO 9141-2',
  '4': 'ISO 14230',
  '5': 'ISO 14230',
  '6': 'ISO 15765',
  '7': 'ISO 15765',
  '8': 'ISO 15765',
  '9': 'ISO 15765',
  A: 'J1939'
}

/*
  Uart Devices
*/
const uartDeviceTypes = {
  '0': 'No device',
  '1': 'Digit Fuel Sensor',
  '2': 'AC100 1 Wire Bus'
}

/*
  Gets the Queclink Device Type
*/
const getDevice = raw => {
  raw = raw.substr(0, raw.length - 1)
  const parsedData = raw.split(',')
  const protocol = getProtocolVersion(parsedData[1])
  return protocol.deviceType
}

/*
  Gets the protocol version
*/
const getProtocolVersion = protocol => {
  return {
    raw: protocol,
    deviceType: devices.hasOwnProperty(protocol.substring(0, 2))
      ? devices[protocol.substring(0, 2)]
      : null,
    version: `${parseInt(protocol.substring(2, 4), 16)}.${parseInt(
      protocol.substring(4, 6),
      16
    )}`
  }
}

/*
  Checks if the location has a valid gps position
*/
const checkGps = (lng, lat) => {
  // loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
  if (lng !== 0 && lat !== 0 && !isNaN(lng) && !isNaN(lat)) {
    return true
  }
  return false
}

/*
  Gets the temperature from AC100 device in celcious degrees
*/
const getTempInCelciousDegrees = hexTemp => {
  if (hexTemp.substring(0, 4) === 'FFFF') {
    hexTemp = hexTemp.substring(4)
  }
  const binTemp = nHexDigit(hex2bin(hexTemp), 16)
  if (binTemp.substring(0, 5) === '11111') {
    // Negative value
    return (parseInt('FFFF', 16) - parseInt(hexTemp, 16) + 1) * -0.0625
  }
  return parseFloat(hex2dec(hexTemp)) * 0.0625
}

/*
  Gets fuel consumption from string
*/
const getFuelConsumption = fuelString => {
  try {
    if (
      fuelString.indexOf('NaN') === -1 &&
      fuelString.indexOf('Inf') === -1 &&
      fuelString.indexOf('inf') === -1
    ) {
      return parseFloat(fuelString)
    } else {
      return null
    }
  } catch (e) {
    return null
  }
}

/*
  Returns hormeter in hours from string hourmeter
  in format HHHHH:MM:SS
*/
const getHoursForHourmeter = hourmeter => {
  try {
    const hours = parseInt(hourmeter.split(':')[0], 10)
    const minutes = parseInt(hourmeter.split(':')[1], 10)
    const seconds = parseInt(hourmeter.split(':')[2], 10)
    return hours + (minutes + seconds / 60) / 60
  } catch (e) {
    return null
  }
}

/*
  Gets the alarm type
*/
const getAlarm = (command, report, extra = false) => {
  const messages = langs['es']
  if (
    command === 'GTFRI' ||
    command === 'GTERI' ||
    command === 'GTPNL' ||
    command === 'GTPFL' ||
    command === 'GTSTR' ||
    command === 'GTCTN'
  ) {
    return { type: 'Gps' }
  } else if (command === 'GTCAN') {
    const reportType = parseInt(report, 10)
    return {
      type: 'Gps',
      status: 'CAN_Bus',
      report: reportType
      // message: messages[command].replace('data', reportType)
    }
  } else if (command === 'GTOBD') {
    return { type: 'Gps', status: 'OBDII' }
  } else if (command === 'GTJES') {
    return { type: 'OBDII_Summary', message: messages[command] }
  } else if (command === 'GTOSM') {
    const reportID = report[0]
    const reportType = report[1]
    return {
      type: 'OBDII_Monitor',
      status: reportType === '0' ? 'Inside' : 'Outside',
      message: messages[command][reportID][reportType]
    }
  } else if (command === 'GTOPN') {
    return { type: 'OBDII_Connected', status: true, message: messages[command] }
  } else if (command === 'GTOPF') {
    return {
      type: 'OBDII_Connected',
      status: false,
      message: messages[command]
    }
  } else if (command === 'GTRTL') {
    return { type: 'Gps', status: 'Requested' }
  } else if (command === 'GTGSM') {
    return {
      type: 'GSM_Report',
      message: messages[command]
    }
  } else if (command === 'GTINF') {
    return { type: 'General_Info_Report' }
  } else if (command === 'GTDIS') {
    let reportID = parseInt(report[0], 10)
    const reportType = parseInt(report[1], 10)
    if (extra === true && reportID === 1) {
      reportID = 2
    } else if (
      ['gv800w', 'gv600w', 'gv300w', 'gv75w', 'GMT100'].includes(extra)
    ) {
      reportID += 1
    }
    return {
      type: 'DI',
      number: reportID,
      status: reportType === 1,
      message: messages[command][reportType].replace('port', reportID)
    }
  } else if (command === 'GTNMR') {
    const reportType = report[1]
    return {
      type: 'Movement',
      status: reportType === '1',
      message: messages[command][reportType]
    }
  } else if (command === 'GTTOW') {
    return { type: 'Towing', message: messages[command] }
  } else if (command === 'GTSOS') {
    return { type: 'SOS_Button', message: messages[command] }
  } else if (command === 'GTSPD') {
    const reportType = parseInt(report[1], 10)
    return {
      type: 'Over_Speed',
      status: reportType === 0,
      message: messages[command][reportType]
    }
  } else if (command === 'GTIGL') {
    const reportType = parseInt(report[1], 16)
    return {
      type: 'DI',
      number: 1,
      status: reportType === 0,
      message: messages[command][reportType === 0 ? '1' : '0']
    }
  } else if (command === 'GTIGN') {
    const duration = report !== '' ? parseInt(report, 10) : null
    return {
      type: 'DI',
      number: 1,
      status: true,
      duration: duration,
      message: messages[command]
    }
  } else if (command === 'GTIGF') {
    const duration = report !== '' ? parseInt(report, 10) : null
    return {
      type: 'DI',
      number: 1,
      status: false,
      duration: duration,
      message: messages[command]
    }
  } else if (command === 'GTPNA') {
    return { type: 'Power', status: true, message: messages[command] }
  } else if (command === 'GTPFA') {
    return { type: 'Power', status: false, message: messages[command] }
  } else if (command === 'GTMPN' || command === 'GTEPN') {
    // Change for connected to power supply
    return { type: 'Charge', status: true, message: messages[command] }
  } else if (command === 'GTMPF' || command === 'GTEPF') {
    return { type: 'Charge', status: false, message: messages[command] }
  } else if (command === 'GTBTC') {
    return { type: 'Charging', status: true, message: messages[command] }
  } else if (command === 'GTSTC') {
    return { type: 'Charging', status: false, message: messages[command] }
  } else if (command === 'GTBPL') {
    return { type: 'Low_Battery', message: messages[command] }
  } else if (command === 'GTIDN') {
    return { type: 'Idling', status: true, message: messages[command] }
  } else if (command === 'GTIDF') {
    const duration = report !== '' ? parseInt(report, 10) : null
    return {
      type: 'Idling',
      status: false,
      duration: duration,
      message: messages[command]
    }
  } else if (command === 'GTJDR') {
    return {
      type: 'Jamming',
      status: true,
      gps: false,
      message: messages[command]
    }
  } else if (command === 'GTJDS') {
    return {
      type: 'Jamming',
      status: report === '2',
      gps: false,
      message: messages[command][report]
    }
  } else if (command === 'GTGPJ') {
    // GPS Jamming
    return {
      type: 'Jamming',
      status: report === '3',
      gps: true,
      message: messages[command][report]
    }
  } else if (command === 'GTEPS') {
    return { type: 'External_Low_battery', message: messages[command] }
  } else if (command === 'GTAIS' || command === 'GTMAI') {
    const reportID = parseInt(report[0], 10)
    const reportType = parseInt(report[1], 10)
    if (reportID === 2) {
      return { type: 'SOS_Button', message: messages[command][reportID] }
    }
    return { type: 'AI', number: reportID, status: reportType === '0' }
  } else if (command === 'GTANT') {
    return {
      type: 'GPS_Antena',
      status: report === '0',
      message: messages[command][report]
    }
    // } else if (command === 'GTSTR') {
    //   return {
    //     type: 'Vehicle_Start_Status',
    //     status: true,
    //     message: messages[command]
    //   }
  } else if (command === 'GTSTP' || command === 'GTLSP') {
    return {
      type: 'Vehicle_Start_Status',
      status: false,
      message: messages[command]
    }
  } else if (command === 'GTRMD') {
    return {
      type: 'Roaming',
      status: report === '1',
      message: messages[command][report]
    }
  } else if (command === 'GTHBD') {
    return { type: 'Heartbeat', message: messages[command] }
  } else if (command === 'GTSTT') {
    return { type: 'Motion_State_Changed', message: messages[command] }
  } else if (command === 'GTPDP') {
    return { type: 'GPRS_Connection_Established', message: messages[command] }
  } else if (command === 'GTGSS') {
    return {
      type: 'Gps_Status',
      status: report === '1',
      message: messages[command][typeof report !== 'undefined' ? report : '0']
    }
  } else if (command === 'GTTMP') {
    const number = parseInt(report[0], 10)
    const temperature = extra[1] !== '' ? parseFloat(extra[1]) : null
    return {
      type: 'Outside_Temperature',
      number: number,
      deviceID: extra[0],
      status: report[1] === '0', // 0 means outside the range, 1 means inside
      temperature: temperature,
      message: messages[command][report[1]].replace('()', `(${temperature}°C)`)
    }
  } else if (command === 'GTFLA') {
    const before =
      report.split(',')[0] !== null ? parseInt(report.split(',')[0], 10) : 0
    const now =
      report.split(',')[1] !== null ? parseInt(report.split(',')[1], 10) : 0
    const consumption = before - now
    return {
      type: 'Unusual_Fuel_Consumption',
      status: consumption,
      message: messages[command].replace('consumption', consumption)
    }
  } else if (command === 'GTIDA') {
    const status =
      report.split(',')[1] !== null ? parseInt(report.split(',')[1], 10) : null
    const driverID = report.split(',')[0] !== null ? report.split(',')[0] : null
    return {
      type: 'Driver_Identification',
      status: status === 1,
      driverID: driverID,
      message: messages[command][status]
    }
  } else if (command === 'GTDOS') {
    const outputId = report.split(',')[0]
      ? parseInt(report.split(',')[0], 10)
      : null
    const outputStatus = report.split(',')[0] ? report.split(',')[1] : null
    return {
      type: 'DO',
      number: outputId,
      status: outputStatus === '1',
      message: messages[command][outputStatus].replace('port', outputId)
    }
  } else if (command === 'GTDAT') {
    return {
      type: 'Serial_Data',
      data: report,
      message: messages[command]
    }
  } else if (command === 'GTDTT') {
    return {
      type: 'Transparent_Data',
      dataType: extra,
      data: report,
      message: messages[command]
    }
  } else if (command === 'GTSOA') {
    return {
      type: 'Shell_Open',
      message: messages[command]
    }
  } else if (command === 'GTNMD') {
    return {
      type: 'Movement',
      status: report === '0',
      message: messages[command][report]
    }
  } else if (command === 'GTHBM') {
    /*
      status:
        0: braking
        1: acceleration
        2: turning
        3: braking turning
        4: acceleration turning
        5: unknown harsh behavior
      */
    // const reportID = parseInt(report[0], 10)
    const reportType = report[1]
    return {
      type: 'Harsh_Behavior',
      status: parseInt(reportType, 10),
      message: messages[command][reportType]
    }
  } else if (command === 'GTCRA') {
    return {
      type: 'Crash',
      status: true,
      counter: report,
      message: messages[command]
    }
  } else if (command === 'GTGEO') {
    return {
      type: 'Device_Geofence'
    }
  } else {
    return {
      type: command,
      message: messages[command] ? messages[command] : ''
    }
  }
}

/*
  Converst num to base number
*/
const ConvertBase = num => {
  return {
    from: function (baseFrom) {
      return {
        to: function (baseTo) {
          return parseInt(num, baseFrom).toString(baseTo)
        }
      }
    }
  }
}

/*
  Converts binary to decimal number
*/
const bin2dec = num => {
  return ConvertBase(num)
    .from(2)
    .to(10)
}

/*
  Converts binary to hexadecimal number
*/
const bin2hex = num => {
  return ConvertBase(num)
    .from(2)
    .to(16)
}

/*
  Converts decimal to binary number
*/
const dec2bin = num => {
  return ConvertBase(num)
    .from(10)
    .to(2)
}

/*
  Converts decimal to hexadecimal number
*/
const dec2hex = num => {
  return ConvertBase(num)
    .from(10)
    .to(16)
}

/*
  Converts hexadecimal to binary number
*/
const hex2bin = num => {
  return ConvertBase(num)
    .from(16)
    .to(2)
}

/*
  Converts hexadecimal to decimal number
*/
const hex2dec = num => {
  return ConvertBase(num)
    .from(16)
    .to(10)
}

/*
  Return hexadecimal number with n digits
*/
const nHexDigit = (num, n) => {
  let hex = num
  while (hex.length < n) {
    hex = `0${hex}`
  }
  return hex
}

/*
  Parses date
*/
const parseDate = date => {
  return new Date(
    `${date.replace(
      /(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,
      '$1-$2-$3T$4:$5:$6'
    )}+00:00`
  )
}

module.exports = {
  langs: langs,
  patterns: patterns,
  OBDIIProtocols: OBDIIProtocols,
  states: states,
  uartDeviceTypes: uartDeviceTypes,
  getDevice: getDevice,
  getProtocolVersion: getProtocolVersion,
  checkGps: checkGps,
  getTempInCelciousDegrees: getTempInCelciousDegrees,
  getFuelConsumption: getFuelConsumption,
  getHoursForHourmeter: getHoursForHourmeter,
  getAlarm: getAlarm,
  bin2dec: bin2dec,
  bin2hex: bin2hex,
  dec2bin: dec2bin,
  dec2hex: dec2hex,
  hex2bin: hex2bin,
  hex2dec: hex2dec,
  nHexDigit: nHexDigit,
  parseDate: parseDate
}
