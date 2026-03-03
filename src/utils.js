'use strict'

const langEs = require('./messages/es.json')
const langEn = require('./messages/en.json')
const langs = { es: langEs, en: langEn }

/*
  Data patterns
*/
const patterns = {
  message: /^\+RESP.+\$$/,
  buffer: /^\+BUFF/,
  ack: /^\+ACK.+\$$/,
  nack: /^\+NACK.+\$$/,
  heartbeat: /^\+ACK:GTHBD.+\$$/
}

/*
  Possible NACK Causes
*/
const nackCauses = {
  '0': 'Clave o parámetros incorrectos',
  '1': 'Comando no soportado',
  '2': 'Comando no permitido en este momento'
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
  '50': 'GV55W',
  '10': 'GV55 LITE',
  '11': 'GL500',
  '1A': 'GL300',
  '1F': 'GV500',
  '5E': 'GV500MAP',
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
  FC: 'GV600W',
  '6E': 'GV310LAU',
  '802004': 'GV58LAU',
  '802006': 'GV57CG',
  C301: 'GL533CG'
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
  Possible Uart Devices
*/
const uartDeviceTypes = {
  '0': 'No device',
  '1': 'Digit Fuel Sensor',
  '2': 'AC100 1 Wire Bus',
  '5': 'CANBUS device',
  '6': 'AU100 device',
  '7': 'RF433 accessory'
}

/*
  Possible Data Types for DTT
*/
const dataTypes = {
  '0': 'Binary',
  '1': 'Hexadecimal'
}
/*
  Possible Network Types
*/
const networkTypes = {
  '0': '2G',
  '1': '3G',
  '2': '4G',
  '99': 'Unknow'
}

/*
  Possible Jammed Network Types
*/
const jammingNetworkTypes = {
  '1': '2G',
  '2': '4G',
  '3': '2G, 3G y 4G',
  '4': '3G',
  '5': '2G y 3G'
}

/*
  Possible GPS Antena Status
*/
const externalGPSAntennaOptions = {
  '0': 'Working',
  '1': 'Detected in open circuit state',
  '3': 'Unknow state',
  '': 'Unknow'
}

/*
  Possible GPS Signal Strength
*/
const gpsSignalStrength = {
  '0': 'Unknown',
  '1': 'Great',
  '2': 'Good',
  '3': 'Normal',
  '4': 'Weak'
}

/*
  Possible Peer roles in Bluetooth
*/
const peerRoles = {
  '0': 'Master',
  '1': 'Slave'
}

/*
  Possible Peer addesses type for Bluetooth
*/
const peerAddressesTypes = {
  '0': 'Public',
  '1': 'Random'
}

/*
  Possible Reasons for bluetooth disconnection
*/
const disconnectionReasons = {
  '0': 'Normal',
  '4': 'Device  pairing fails'
}

/*
  Possible Accesories Types of Bluetooth
*/
const bluetoothAccessories = {
  '0': 'No bluetooth Accessory',
  '1': 'Escort sensor',
  '2': 'Beacon temperature sensor',
  '3': 'Bluetooth beacon accessory',
  '4': 'BLE CAN100',
  '6': 'Beacon Multi-Functional Sensor',
  '7': 'Technoton Accesory',
  '8': 'BLE I/O expander',
  '10': 'Fuel or angle sensor',
  '11': 'Magnet Sensor',
  '12': 'BLE TPMS sensor',
  '13': 'Relay Sensor'
}

/*
  Possible Accesories Models for Bluetooth Accessories
*/
const bluetoothModels = {
  '1': {
    '0': 'TD_BLE fuel sensor',
    '3': 'Angle sensor'
  },
  '2': {
    '0': 'WTS300 (Temperature sensor)',
    '1': 'Temperature ELA'
  },
  '4': {
    '0': 'BLE CAN100'
  },
  '6': {
    '2': 'WTH300 (Temperature and Humidity Sensor)',
    '3': 'RHT ELA (Temperature and Humidity Sensor)',
    '4': 'WMS301 (Door Sensor with embedded Temperature and Humidity Sensor)',
    '5': 'WTH301 (Temperature and Humidity Sensor)'
  },
  '7': {
    '0': 'DUT-E S7',
    '1': 'DFM 100S7',
    '2': 'DFM 250DS7',
    '3': 'GN0M DDE S7',
    '4': 'GNOM DP S7'
  },
  '8': {
    '0': 'WBC300'
  },
  '10': {
    '0': 'Fuel Sensor',
    '1': 'Angle Sensor'
  },
  '11': {
    '0': 'MAG ELA (Door Sensor)'
  },
  '12': {
    '0': 'ATP100/ATP102'
  },
  '13': {
    '0': 'WRL300 (Bluetooth Relay)'
  }
}

/*
  BLE Temp & Hum sensors
*/
const bleTempHumSensors = {
  AC100: '0',
  WTH300: '2',
  'RHT ELA': '3',
  WMS301: '4',
  WTH301: '5'
}

/*
  Possible Beacon ID Models
*/
const beaconModels = {
  '0': 'WKF300',
  '1': 'iBeacon E6',
  '2': 'ID ELA',
  '4': 'WID310',
  '10': 'WID330'
}

/*
  Possible Beacon Types
*/
const beaconTypes = {
  '0': 'ID',
  '1': 'iBeacon',
  '2': 'Eddystone',
  '3': 'Queclink'
}

/*
  Possible Relay BLE config results
*/
const relayBLEResults = {
  0: 'Success',
  1: 'Error connecting',
  2: 'Incorrect BLE password',
  3: 'Error updating BLE password',
  4: 'Error'
}

/*
  Possible Driving Time Related States
*/
const dTimeStates = {
  0: 'normal',
  1: '04h_15min',
  2: '04h_30min',
  3: '08h_45min',
  4: '09h_00min',
  5: '15h_45min',
  6: '16h_00min',
  7: 'other'
}

/*
  Possible Driving Working States
*/
const dWorkingStates = {
  0: 'normal',
  1: 'rest',
  2: 'work',
  3: 'driving'
}

/*
  Possible port N Types for AU100
*/
const portNTypes = {
  '0': 'Deshabilitado',
  '1': 'RS232',
  '3': '1-wire'
}

/*
  GNSS Trigger Types
*/
const gnssTriggerTypes = {
  '0': 'Tiempo',
  '1': 'Esquina',
  '2': 'Distancia',
  '3': 'Kilometraje',
  '4': 'Óptimo (tiempo y distancia)'
}

/*
  MCC List
*/
const latamMcc = {
  716: 'Perú',
  722: 'Argentina',
  724: 'Brasil',
  730: 'Chile',
  732: 'Colombia',
  736: 'Bolivia',
  740: 'Ecuador',
  744: 'Paraguay',
  748: 'Uruguay',
  default: 'Desconocido'
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
  let deviceType
  let deviceVersion
  if (['802004', '802006'].includes(protocol.substring(0, 6))) {
    deviceType = devices.hasOwnProperty(protocol.substring(0, 6))
      ? devices[protocol.substring(0, 6)]
      : null
    deviceVersion = `${parseInt(protocol.substring(6, 8), 16)}.${parseInt(
      protocol.substring(8, 10),
      16
    )}`
  } else if (['C301'].includes(protocol.substring(0, 4))) {
    deviceType = devices.hasOwnProperty(protocol.substring(0, 4))
      ? devices[protocol.substring(0, 4)]
      : null
    deviceVersion = parseInt(protocol.substring(4, 8), 16)
  } else {
    deviceType = devices.hasOwnProperty(protocol.substring(0, 2))
      ? devices[protocol.substring(0, 2)]
      : null
    deviceVersion = `${parseInt(protocol.substring(2, 4), 16)}.${parseInt(
      protocol.substring(4, 6),
      16
    )}`
  }
  return {
    raw: protocol,
    deviceType: deviceType,
    version: deviceVersion
  }
}
/*
  Gets the software/hardware version
*/
const getVersion = hexVersion => {
  if (hexVersion === '') {
    return 'no disponible'
  }
  const X = parseInt(hexVersion.substring(0, 2), 16)
  const Y = parseInt(hexVersion.substring(2, 4), 16)
  return `${X}.${Y}`
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
  Returns if the number of satellites is
  included in the report
*/
const includeSatellites = positionAppendMask => {
  return nHexDigit(hex2bin(positionAppendMask), 4)[3] === '1'
}

/*
  Returns if the GNSS trigger is
  included in the report
*/
const includeGnssTrigger = positionAppendMask => {
  return nHexDigit(hex2bin(positionAppendMask), 4)[2] === '1'
}

/*
  Returns if the Status is
  included in the report
*/
const includeStatus = positionAppendMask => {
  return nHexDigit(hex2bin(positionAppendMask), 4)[1] === '1'
}

/*
  Returns if the GNNS Accuracy is
  included in the report
*/
const includeGnnsAccuracy = positionAppendMask => {
  return nHexDigit(hex2bin(positionAppendMask), 4)[0] === '1'
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
  Gets the temperature from BLE devices in celcious degrees
*/
const getBleTempInCelciousDegrees = (device, hexData) => {
  if (device === 'WTH300') {
    let intTemp = parseInt(hexData.substring(0, 2), 16)
    let decTemp = parseInt(hexData.substring(2, 4), 16)
    return intTemp + decTemp / 256
  } else if (['WTH301', 'WMS301'].includes(device)) {
    let intTemp = parseInt(hexData.substring(0, 2), 16)
    let decTemp = parseInt(hexData.substring(2, 4), 16)
    return intTemp + decTemp / 100
  } else if (device === 'ATP100/ATP102') {
    let temp = parseInt(hexData.substring(4, 6), 16)
    return temp - 40
  } else {
    return null
  }
}

/*
  Gets the humidity from BLE devices in rh
*/
const getBleHumidityInRH = (device, hexData) => {
  let intHum = parseInt(hexData.substring(4, 6), 16)
  let decHum = parseInt(hexData.substring(6, 8), 16)
  if (device === 'WTH300') {
    return intHum + decHum / 256
  } else if (['WTH301', 'WMS301'].includes(device)) {
    return intHum + decHum / 100
  } else {
    return null
  }
}

/*
  Gets the humidity from BLE devices in rh
*/
const getTirePressureInPSI = hexData => {
  let tirePress = parseInt(hexData.substring(2, 4), 16) * 2.5 // In kPa
  return tirePress / 6.895 // In PSI
}

/*
  Gets the Two's Complement for hex numbers
*/
const getAccelerationMagnitude = (hexNumber, n) => {
  let binNumber = nHexDigit(hex2bin(hexNumber), n * 4)
  if (binNumber.substring(0, 5) !== '11111') {
    return Number((parseInt(hexNumber, 16) / 82 * 9.80665).toFixed(2))
  }
  return Number(
    (
      (parseInt('F'.repeat(n), 16) - parseInt(hexNumber, 16) + 1) *
      -1 /
      82 *
      9.80665
    ).toFixed(2)
  )
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
  Returns the dBm signal strength
*/
const getSignalStrength = (networkType, value, hexValue = false) => {
  if (value === 99) {
    return null
  }

  let calc, dBm
  if (networkType === '2G' || networkType === '3G') {
    calc = 2 * value - 113
    dBm = calc < -113 ? 0 : calc > -51 ? 100 : calc
  } else if (networkType === '4G') {
    calc = 96 / 97 * value - 140
    dBm = calc < -140 ? 0 : calc > -44 ? 100 : calc
  } else if (networkType === 'GSM') {
    calc = value - 110
    dBm = calc < -110 ? 0 : calc > -47 ? 100 : calc
  } else if (networkType === 'GPS') {
    if (hexValue) {
      return gpsSignalStrength[value.toString()]
    } else {
      return null
    }
  } else {
    return null
  }
  return dBm
}

/*
  Returns the percentage of signal strength
*/
const getSignalPercentage = (networkType, value) => {
  if (value === 99) {
    return null
  }

  let perc
  if (networkType === '2G' || networkType === '3G') {
    perc = value / 31 * 100
  } else if (networkType === '4G') {
    perc = value / 97 * 100
  } else if (networkType === 'GSM') {
    perc = value / 63 * 100
  } else {
    perc = null
  }

  return Math.round((perc + Number.EPSILON) * 100) / 100
}

/*
  Returns the cellphone operator (MNC)
  source: https://es.wikipedia.org/wiki/MCC/MNC
*/
const getMNC = (countryData, opData) => {
  let mcc = parseInt(countryData, 10)
  let mnc = parseInt(opData, 10)
  let operator
  if (mcc === 716) {
    operator =
      mnc === 6
        ? 'Movistar'
        : mnc === 7
          ? 'Nextel'
          : mnc === 10
            ? 'Claro'
            : mnc === 15
              ? 'Viettel'
              : mnc === 17
                ? 'Entel'
                : mnc === 20 ? 'Cuy Mobile (Claro)' : 'Desconocido'
  } else if (mcc === 722) {
    operator =
      mnc === 1
        ? 'Tuenti'
        : mnc === 10
          ? 'Movicom'
          : mnc === 20
            ? 'Nextel'
            : mnc === 34
              ? 'Telecom Personal'
              : [310, 320, 330].includes(mnc) ? 'Claro' : 'Desconocido'
  } else if (mcc === 724) {
    // Incomplete
    operator = [2, 3, 4].includes(mnc)
      ? 'TIM'
      : [5, 6, 12].includes(mnc) ? 'Claro' : 'Otra'
  } else if (mcc === 730) {
    operator = [1, 10].includes(mnc)
      ? 'Entel'
      : [2, 7].includes(mnc)
        ? 'Movistar'
        : [3, 23].includes(mnc)
          ? 'Claro'
          : mnc === 8
            ? 'VTR (Claro)'
            : mnc === 9
              ? 'WOM'
              : [14, 20, 21, 28].includes(mnc) ? 'Otro' : 'Desconocido'
  } else if (mcc === 732) {
    operator =
      mnc === 1
        ? 'Telecom'
        : mnc === 2
          ? 'Edatel'
          : mnc === 101
            ? 'Claro'
            : mnc === 103
              ? 'Colombia Móvil'
              : [102, 123].includes(mnc)
                ? 'Movistar'
                : mnc === 360 ? 'WOM' : 'Desconocido'
  } else if (mcc === 736) {
    operator =
      mnc === 1
        ? 'Viva Bolivia'
        : mnc === 2
          ? 'Entel'
          : mnc === 3
            ? 'Telecel'
            : mnc === 4 ? 'Cotas' : mnc === 5 ? 'Comteco' : 'Desconocido'
  } else if (mcc === 740) {
    operator =
      mnc === 1
        ? 'Otecel (Movistar)'
        : mnc === 2
          ? 'Conecel (Claro)'
          : mnc === 0 ? 'Telecsa (CNT' : 'Desconocido'
  } else if (mcc === 744) {
    operator =
      mnc === 1
        ? 'Hola Paraguay'
        : mnc === 2
          ? 'AMX Paraguay'
          : mnc === 3
            ? 'Comunicaciones Privadas'
            : mnc === 4
              ? 'Telefónica Celular del Paraguay'
              : mnc === 5 ? 'Núcleo' : 'Desconocido'
  } else if (mcc === 748) {
    operator = [0, 1].includes(mnc)
      ? 'Ancel'
      : mnc === 7 ? 'Movistar' : mnc === 0 ? 'AMX Wireless' : 'Desconocido'
  } else {
    operator = 'Desconocido'
  }
  return {
    country: latamMcc[mcc] || latamMcc.default,
    mnc: mnc,
    operator: operator
  }
}

/*
  Hectometer to Kilometer
*/
const hToKm = data => {
  let h = parseFloat(data.slice(1))
  return parseFloat((h * 0.1).toFixed(2))
}

/*
  Parse CAN100 data
*/
const parseCanData = (data, key) => {
  switch (key) {
    case 'ignitionKey':
      return data === '0'
        ? 'ignition_off'
        : data === '1' ? 'ignition_on' : data === '2' ? 'engine_on' : null
    case 'totalDistance':
      if (data.slice(0, 1) === 'H') {
        return hToKm(data)
      } else {
        return data
      }
    case 'range':
      return hToKm(data)
    case 'fuelConsumption':
      if (data[0] === 'H') {
        return hToKm(data) * 1000
      } else if (data[0] === 'L') {
        return parseFloat(parseFloat(data.slice(1)).toFixed(2))
      } else {
        return data
      }
    case 'tachographDrivingDirection':
      return data === '0' ? 'forward' : 'backward'
    case 'adBlueLevel':
      if (['P', 'L'].includes(data.slice(0, 1))) {
        return parseFloat(parseFloat(data.slice(1)).toFixed(2))
      } else {
        return parseFloat(parseFloat(data).toFixed(2))
      }
    default:
      return data
  }
}

/*
  Get CANbus data
*/
const getCanData = (parsedData, ix, type) => {
  let canAppendMask =
    parsedData[ix + 1] !== ''
      ? nHexDigit(hex2bin(parsedData[ix + 1]), 32)
      : null
  if (canAppendMask === 0) {
    return {}
  }

  let vinIx = ix + 1 + parseInt(canAppendMask[31])
  let ignIx = vinIx + parseInt(canAppendMask[30])
  let disIx = ignIx + parseInt(canAppendMask[29])
  let fuelIx = disIx + parseInt(canAppendMask[28])
  // Inverted speed and rpm because of inconsistence in documentation
  let rpmIx = fuelIx + parseInt(canAppendMask[26])
  let spdIx = rpmIx + parseInt(canAppendMask[27])
  let engcIx = spdIx + parseInt(canAppendMask[25])
  let fuelcIx = engcIx + parseInt(canAppendMask[24])
  let fuellIx = fuelcIx + parseInt(canAppendMask[23])
  let rngIx = fuellIx + parseInt(canAppendMask[22])
  let accIx = rngIx + parseInt(canAppendMask[21])
  let enghIx = accIx + parseInt(canAppendMask[20])
  let drvIx = enghIx + parseInt(canAppendMask[19])
  let idltIx = drvIx + parseInt(canAppendMask[18])
  let idlfIx = idltIx + parseInt(canAppendMask[17])
  let axlwIx = idlfIx + parseInt(canAppendMask[16])
  let tacIx = axlwIx + parseInt(canAppendMask[15])
  let indIx = tacIx + parseInt(canAppendMask[14])
  let ligIx = indIx + parseInt(canAppendMask[13])
  let doorIx = ligIx + parseInt(canAppendMask[12])
  let osptIx = doorIx + parseInt(canAppendMask[11])
  let ospeIx = osptIx + parseInt(canAppendMask[10])
  // Values from 9 to 3 are reserved
  let canxIx = ospeIx + parseInt(canAppendMask[2])

  let canExpansionMask =
    canAppendMask[2] === '1' && parsedData[canxIx] !== ''
      ? nHexDigit(hex2bin(parsedData[canxIx]), 32)
        .split('')
        .reverse()
        .join('')
      : '00000000000000000000000000000000'

  let repExpMask =
    canAppendMask[2] === '1'
      ? {
        raw: parsedData[canxIx] ? parsedData[canxIx] : null,
        adBlueLevel: canExpansionMask[0] === '1',
        axleWeight1: canExpansionMask[1] === '1',
        axleWeight3: canExpansionMask[2] === '1',
        axleWeight4: canExpansionMask[3] === '1',
        tachographOverspeedSignal: canExpansionMask[4] === '1',
        tachographVehicleMotionSignal: canExpansionMask[5] === '1',
        tachographDrivingDirection: canExpansionMask[6] === '1',
        analogInputValue: canExpansionMask[7] === '1',
        engineBrakingFactor: canExpansionMask[8] === '1',
        pedalBrakingFactor: canExpansionMask[9] === '1',
        totalAcceleratorKickDown: canExpansionMask[10] === '1',
        totalEffectiveEngineSpeedTime: canExpansionMask[11] === '1',
        totalCruiseControlTime: canExpansionMask[12] === '1',
        totalAcceleratorKickDownTime: canExpansionMask[13] === '1',
        totalBrakeApplications: canExpansionMask[14] === '1',
        tachographDriver1Card: canExpansionMask[15] === '1',
        tachographDriver2Card: canExpansionMask[16] === '1',
        tachographDriver1Name: canExpansionMask[17] === '1',
        tachographDriver2Name: canExpansionMask[18] === '1',
        registrationNumber: canExpansionMask[19] === '1',
        expansionInformation: canExpansionMask[20] === '1',
        rapidBrakings: canExpansionMask[21] === '1',
        rapidAccelerations: canExpansionMask[22] === '1',
        engineTorque: canExpansionMask[23] === '1'
      }
      : null

  let adbIx = canxIx + parseInt(canExpansionMask[0])
  let ax1Ix = adbIx + parseInt(canExpansionMask[1])
  let ax3Ix = ax1Ix + parseInt(canExpansionMask[2])
  let ax4Ix = ax3Ix + parseInt(canExpansionMask[3])
  let tosIx = ax4Ix + parseInt(canExpansionMask[4])
  let tvmIx = tosIx + parseInt(canExpansionMask[5])
  let tddIx = tvmIx + parseInt(canExpansionMask[6])
  let aivIx = tddIx + parseInt(canExpansionMask[7])
  let ebrIx = aivIx + parseInt(canExpansionMask[8])
  let pbrIx = ebrIx + parseInt(canExpansionMask[9])
  let ackIx = pbrIx + parseInt(canExpansionMask[10])
  let eesIx = ackIx + parseInt(canExpansionMask[11])
  let crcIx = eesIx + parseInt(canExpansionMask[12])
  let acktIx = crcIx + parseInt(canExpansionMask[13])
  let braIx = acktIx + parseInt(canExpansionMask[14])
  let tdc1Ix = braIx + parseInt(canExpansionMask[15])
  let tdc2Ix = tdc1Ix + parseInt(canExpansionMask[16])
  let tdn1Ix = tdc2Ix + parseInt(canExpansionMask[17])
  let tdn2Ix = tdn1Ix + parseInt(canExpansionMask[18])
  let regIx = tdn2Ix + parseInt(canExpansionMask[19])
  let expbIx = regIx + parseInt(canExpansionMask[20])
  let rbrIx = expbIx + parseInt(canExpansionMask[21])
  let racIx = rbrIx + parseInt(canExpansionMask[22])
  let etqIx = racIx + parseInt(canExpansionMask[23])

  // Logic for CAN data
  let gnnsIx = etqIx + 2 + parseInt(canAppendMask[1])
  let gsmIx =
    canAppendMask[1] === '1'
      ? gnnsIx + parseInt(canAppendMask[0]) + 6
      : gnnsIx + parseInt(canAppendMask[0])

  let moreIx
  let gnnsData = null
  let gsmData = null
  if (type === 'GTCAN') {
    moreIx = canAppendMask[0] === '1' ? gsmIx + 4 : gsmIx
    gnnsData =
      canAppendMask[1] === '1'
        ? {
          hdop: parsedData[gnnsIx] ? parseFloat(parsedData[gnnsIx]) : null,
          speed: parsedData[gnnsIx + 1]
            ? parseFloat(parsedData[gnnsIx + 1])
            : null,
          azimuth: parsedData[gnnsIx + 2]
            ? parseFloat(parsedData[gnnsIx + 2])
            : null,
          altitude: parsedData[gnnsIx + 3]
            ? parseFloat(parsedData[gnnsIx + 3])
            : null,
          loc: {
            type: 'Point',
            coordinates: [
              parseFloat(parsedData[gnnsIx + 4]),
              parseFloat(parsedData[gnnsIx + 5])
            ]
          },
          gpsStatus: checkGps(
            parseFloat(parsedData[gnnsIx + 4]),
            parseFloat(parsedData[gnnsIx + 5])
          ),
          datetime: parsedData[gnnsIx + 6]
            ? parseDate(parsedData[gnnsIx + 6])
            : null
        }
        : null

    gsmData =
      canAppendMask[0] === '1'
        ? {
          mcc:
              parsedData[gsmIx] !== ''
                ? latamMcc[parseInt(parsedData[gsmIx], 10)]
                : null,
          mnc:
              parsedData[gsmIx + 1] !== ''
                ? getMNC(parsedData[gsmIx], parsedData[gsmIx + 1])
                : null,
          lac:
              parsedData[gsmIx + 2] !== ''
                ? parseInt(parsedData[gsmIx + 2], 16)
                : null,
          cid:
              parsedData[gsmIx + 3] !== ''
                ? parseInt(parsedData[gsmIx + 3], 16)
                : null
        }
        : null
  } else {
    moreIx = etqIx + 1
  }

  let inicatorsBin =
    canAppendMask[14] === '1' && parsedData[indIx] !== ''
      ? nHexDigit(hex2bin(parsedData[indIx]), 16)
      : null
  let lights =
    canAppendMask[13] === '1' && parsedData[ligIx] !== ''
      ? nHexDigit(hex2bin(parsedData[ligIx]), 8)
      : null
  let doors =
    canAppendMask[12] === '1' && parsedData[doorIx] !== ''
      ? nHexDigit(hex2bin(parsedData[doorIx]), 8)
      : null
  let expansionBin =
    parsedData[expbIx] !== ''
      ? nHexDigit(hex2bin(parsedData[expbIx]), 16)
        .split('')
        .reverse()
        .join('')
      : '0000000000000000'
  let tachographBin =
    canAppendMask[15] === '1' && parsedData[tacIx] !== ''
      ? nHexDigit(hex2bin(parsedData[tacIx]), 8)
        .split('')
        .reverse()
        .join('')
      : null

  return [
    moreIx,
    gnnsData,
    gsmData,
    {
      comunicationOk: parsedData[ix] ? parsedData[ix] === '1' : null,
      canAppendMask: {
        hex: parsedData[ix + 1] !== '' ? parsedData[ix + 1] : null,
        bin: canAppendMask,
        vin: canAppendMask[31] === '1',
        ignitionKey: canAppendMask[30] === '1',
        totalDistance: canAppendMask[29] === '1',
        totalFuelUsed: canAppendMask[28] === '1',
        speed: canAppendMask[27] === '1',
        rpm: canAppendMask[26] === '1',
        engineCoolantTemp: canAppendMask[25] === '1',
        fuelConsumption: canAppendMask[24] === '1',
        fuelLevel: canAppendMask[23] === '1',
        range: canAppendMask[22] === '1',
        acceleratorPressure: canAppendMask[21] === '1',
        engineHours: canAppendMask[20] === '1',
        drivingTime: canAppendMask[19] === '1',
        idleTime: canAppendMask[18] === '1',
        idleFuelUsed: canAppendMask[17] === '1',
        axleWeight2: canAppendMask[16] === '1',
        tachograph: canAppendMask[15] === '1',
        indicators: canAppendMask[14] === '1',
        lights: canAppendMask[13] === '1',
        doors: canAppendMask[12] === '1',
        overSpeedTime: canAppendMask[11] === '1',
        overSpeedEngineTime: canAppendMask[10] === '1',
        totalDistanceImpulses: canAppendMask[9] === '1',
        canExpanded: canAppendMask[2] === '1',
        gnssInformation: canAppendMask[1] === '1',
        gsmInformation: canAppendMask[0] === '1'
      },
      vin:
        canAppendMask[31] === '1' && parsedData[vinIx]
          ? parsedData[vinIx]
          : null,
      ignitionKey:
        canAppendMask[30] === '1' && parsedData[ignIx]
          ? parseCanData(parsedData[ignIx], 'ignitionKey')
          : null,
      totalDistance:
        canAppendMask[29] === '1' && parsedData[disIx]
          ? parseCanData(parsedData[disIx], 'totalDistance')
          : null,
      totalDistanceUnit:
        canAppendMask[29] === '1' && parsedData[disIx]
          ? parsedData[disIx].slice(0, 1) === 'H' ? 'km' : 'I'
          : null,
      fuelUsed:
        canAppendMask[28] === '1' && parsedData[fuelIx]
          ? parseFloat(parsedData[fuelIx])
          : null,
      speed:
        canAppendMask[27] === '1' && parsedData[spdIx]
          ? parseFloat(parsedData[spdIx])
          : null,
      rpm:
        canAppendMask[26] === '1' && parsedData[rpmIx]
          ? parseInt(parsedData[rpmIx], 10)
          : null,
      engineCoolantTemp:
        canAppendMask[25] === '1' && parsedData[engcIx]
          ? parseInt(parsedData[engcIx], 10)
          : null,
      fuelConsumption:
        canAppendMask[24] === '1' && parsedData[fuelcIx]
          ? parseCanData(parsedData[fuelcIx], 'fuelConsumption')
          : null,
      fuelLevel:
        canAppendMask[23] === '1' && parsedData[fuellIx]
          ? parseFloat(parsedData[fuellIx].slice(1))
          : null,
      fuelLevelUnit:
        canAppendMask[23] === '1' && parsedData[fuellIx]
          ? parsedData[fuellIx].slice(0, 1) === 'P' ? '%' : 'L'
          : null,
      range:
        canAppendMask[22] === '1' && parsedData[rngIx]
          ? parseCanData(parsedData[rngIx], 'range')
          : null,
      acceleratorPressure:
        canAppendMask[21] === '1' && parsedData[accIx]
          ? parseFloat(parsedData[accIx])
          : null,
      engineHours:
        canAppendMask[20] === '1' && parsedData[enghIx]
          ? parseFloat(parsedData[enghIx])
          : null,
      drivingTime:
        canAppendMask[19] === '1' && parsedData[drvIx]
          ? parseFloat(parsedData[drvIx])
          : null,
      idleTime:
        canAppendMask[18] === '1' && parsedData[idltIx]
          ? parseFloat(parsedData[idltIx])
          : null,
      idleFuelUsed:
        canAppendMask[17] === '1' && parsedData[idlfIx]
          ? parseFloat(parsedData[idlfIx])
          : null,
      axleWeight2:
        canAppendMask[16] === '1' && parsedData[axlwIx]
          ? parseFloat(parsedData[axlwIx])
          : null,
      tachograph:
        canAppendMask[15] === '1' && parsedData[tacIx]
          ? {
            raw: parsedData[tacIx] ? parsedData[tacIx] : null,
            validDriverData: tachographBin ? tachographBin[7] === '1' : null,
            insertedDriverCard: tachographBin
              ? tachographBin[5] === '1'
              : null,
            driverWorkingState: tachographBin
              ? dWorkingStates[parseInt(tachographBin.substring(3, 5), 2)]
              : null,
            drivingTimeState: tachographBin
              ? dTimeStates[parseInt(tachographBin.substring(5, 8), 2)]
              : null
          }
          : null,
      indicators:
        canAppendMask[14] === '1' && inicatorsBin
          ? {
            raw: inicatorsBin ? parsedData[indIx] : null,
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
          }
          : null,
      lights:
        canAppendMask[13] === '1' && lights
          ? {
            raw: lights ? parsedData[ligIx] : null,
            running: lights ? lights[0] === '1' : null,
            lowBeams: lights ? lights[1] === '1' : null,
            frontFog: lights ? lights[2] === '1' : null,
            rearFog: lights ? lights[3] === '1' : null,
            hazard: lights ? lights[4] === '1' : null
          }
          : null,
      doors:
        canAppendMask[12] === '1' && doors
          ? {
            raw: doors ? parsedData[doorIx] : null,
            driver: doors ? doors[0] === '1' : null,
            passenger: doors ? doors[1] === '1' : null,
            rearLeft: doors ? doors[2] === '1' : null,
            rearRight: doors ? doors[3] === '1' : null,
            trunk: doors ? doors[4] === '1' : null,
            hood: doors ? doors[5] === '1' : null
          }
          : null,
      overSpeedTime:
        canAppendMask[11] === '1' && parsedData[osptIx]
          ? parseFloat(parsedData[osptIx])
          : null,
      overSpeedEngineTime:
        canAppendMask[10] === '1' && parsedData[ospeIx]
          ? parseFloat(parsedData[ospeIx])
          : null,
      canExpanded: {
        canReportExpansionMask: repExpMask,
        adBlueLevel:
          repExpMask && repExpMask.adBlueLevel && parsedData[adbIx]
            ? parseCanData(parsedData[adbIx], 'adBlueLevel')
            : null,
        adBlueLevelUnit:
          repExpMask && repExpMask.adBlueLevelUnit && parsedData[adbIx]
            ? parsedData[adbIx].slice(0, 1) === 'P' ? '%' : 'L'
            : null,
        axleWeight1:
          repExpMask && repExpMask.axleWeight1 && parsedData[ax1Ix]
            ? parseInt(parsedData[ax1Ix])
            : null,
        axleWeight3:
          repExpMask && repExpMask.axleWeight3 && parsedData[ax3Ix]
            ? parseInt(parsedData[ax3Ix])
            : null,
        axleWeight4:
          repExpMask && repExpMask.axleWeight4 && parsedData[ax4Ix]
            ? parseInt(parsedData[ax4Ix])
            : null,
        tachographOverspeedSignal:
          repExpMask &&
          repExpMask.tachographOverspeedSignal &&
          parsedData[tosIx]
            ? parsedData[tosIx] === '1'
            : null,
        tachographVehicleMotionSignal:
          repExpMask &&
          repExpMask.tachographVehicleMotionSignal &&
          parsedData[tvmIx]
            ? parsedData[tvmIx] === '1'
            : null,
        tachographDrivingDirection:
          repExpMask &&
          repExpMask.tachographDrivingDirection &&
          parsedData[tddIx]
            ? parseCanData(parsedData[tddIx], 'tachographDrivingDirection')
            : null,
        analogInputValue:
          repExpMask && repExpMask.analogInputValue && parsedData[aivIx]
            ? parseFloat(parsedData[aivIx]) * 1000
            : null,
        engineBrakingFactor:
          repExpMask && repExpMask.engineBrakingFactor && parsedData[ebrIx]
            ? parseInt(parsedData[ebrIx])
            : null,
        pedalBrakingFactor:
          repExpMask && repExpMask.pedalBrakingFactor && parsedData[pbrIx]
            ? parseInt(parsedData[pbrIx])
            : null,
        totalAcceleratorKickDown:
          repExpMask && repExpMask.totalAcceleratorKickDown && parsedData[ackIx]
            ? parseInt(parsedData[ackIx])
            : null,
        totalEffectiveEngineSpeedTime:
          repExpMask &&
          repExpMask.totalEffectiveEngineSpeedTime &&
          parsedData[eesIx]
            ? parseFloat(parsedData[eesIx])
            : null,
        totalCruiseControlTime:
          repExpMask && repExpMask.totalCruiseControlTime && parsedData[crcIx]
            ? parseFloat(parsedData[crcIx])
            : null,
        totalAcceleratorKickDownTime:
          repExpMask &&
          repExpMask.totalAcceleratorKickDownTime &&
          parsedData[acktIx]
            ? parseFloat(parsedData[acktIx])
            : null,
        totalBrakeApplications:
          repExpMask && repExpMask.totalBrakeApplications && parsedData[braIx]
            ? parseInt(parsedData[braIx])
            : null,
        tachographDriver1Card:
          repExpMask && repExpMask.tachographDriver1Card && parsedData[tdc1Ix]
            ? parsedData[tdc1Ix]
            : null,
        tachographDriver2Card:
          repExpMask && repExpMask.tachographDriver2Card && parsedData[tdc2Ix]
            ? parsedData[tdc2Ix]
            : null,
        tachographDriver1Name:
          repExpMask && repExpMask.tachographDriver1Name && parsedData[tdn1Ix]
            ? parsedData[tdn1Ix]
            : null,
        tachographDriver2Name:
          repExpMask && repExpMask.tachographDriver2Name && parsedData[tdn2Ix]
            ? parsedData[tdn2Ix]
            : null,
        registrationNumber:
          repExpMask && repExpMask.registrationNumber && parsedData[regIx]
            ? parsedData[regIx]
            : null,
        expansionInformation:
          repExpMask &&
          repExpMask.expansionInformation &&
          expansionBin !== '0000000000000000'
            ? {
              raw: parsedData[expbIx] ? parsedData[expbIx] : null,
              webasto: expansionBin[0] === '1',
              brakeFluidLowIndicator: expansionBin[1] === '1',
              coolantLevelLowIndicator: expansionBin[2] === '1',
              batteryIndicator: expansionBin[3] === '1',
              brakeSystemFailureIndicator: expansionBin[4] === '1',
              oilPressureIndicator: expansionBin[5] === '1',
              engineHotIndicator: expansionBin[6] === '1',
              ABSFailureIndicator: expansionBin[7] === '1',
              checkEngineIndicator: expansionBin[9] === '1',
              airbagsIndicator: expansionBin[10] === '1',
              serviceCallIndicator: expansionBin[11] === '1',
              oilLevelLowIndicator: expansionBin[12] === '1'
            }
            : null,
        rapidBrakings:
          repExpMask && repExpMask.rapidBrakings && parsedData[rbrIx]
            ? parseInt(parsedData[rbrIx])
            : null,
        rapidAccelerations:
          repExpMask && repExpMask.rapidAccelerations && parsedData[racIx]
            ? parseInt(parsedData[racIx])
            : null,
        engineTorque:
          repExpMask && repExpMask.engineTorque && parsedData[etqIx]
            ? parseFloat(parsedData[etqIx])
            : null
      }
    }
  ]
}

/*
  Get Bluetooth data
*/
const getBleData = (parsedData, btIndex) => {
  let btDevices = []
  let cnt = btIndex + 1
  let btNum = parsedData[btIndex] !== '' ? parseInt(parsedData[btIndex]) : 1

  for (let c = 0; c < btNum; c++) {
    if (!['FE', 'FF'].includes(parsedData[cnt])) {
      let appendMask = nHexDigit(hex2bin(parsedData[cnt + 4]), 16)
      let aNameIx = cnt + 4 + parseInt(appendMask[15])
      let aMacIx = aNameIx + parseInt(appendMask[14])
      let aStatIx = aMacIx + parseInt(appendMask[13])
      let aBatIx = aStatIx + parseInt(appendMask[12])
      let aTmpIx = aBatIx + parseInt(appendMask[11])
      let aHumIx = aTmpIx + parseInt(appendMask[10])
      let ioIx = aHumIx + parseInt(appendMask[8])
      let aEvIx =
        appendMask[8] === '1' && appendMask[7] === '1'
          ? ioIx + 3
          : ioIx + parseInt(appendMask[7])
      let pressIx =
        appendMask[7] === '1' && appendMask[6] === '1'
          ? aEvIx + 2
          : aEvIx + parseInt(appendMask[6])
      let timeIx = pressIx + parseInt(appendMask[5])
      let eTmpIx = timeIx + parseInt(appendMask[4])
      let magIx = eTmpIx + parseInt(appendMask[3])
      let aBatpIx =
        appendMask[3] === '1' && appendMask[2] === '1'
          ? magIx + 3
          : magIx + parseInt(appendMask[2])
      let relIx = aBatpIx + parseInt(appendMask[1])

      let bleType = bluetoothAccessories[parsedData[cnt + 1]]
      let bleModel =
        parsedData[cnt + 2] !== ''
          ? bluetoothModels[parsedData[cnt + 1]][parsedData[cnt + 2]]
          : null
      let rawAppendMask = parsedData[cnt + 4]

      btDevices.push({
        index: parsedData[cnt],
        type: bleType,
        model: bleModel,
        appendMask: rawAppendMask,
        name:
          parsedData[aNameIx] !== '' && appendMask[15] === '1'
            ? parsedData[aNameIx]
            : null,
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
            : null,
        accessoryData: {
          data:
            parsedData[cnt + 3] !== ''
              ? {
                raw: parsedData[cnt + 3],
                temperature: getBleTempInCelciousDegrees(
                  bleModel,
                  parsedData[cnt + 3]
                ),
                humidity: getBleHumidityInRH(bleModel, parsedData[cnt + 3]),
                relayState:
                    bleModel === 'WRL300'
                      ? parseInt(parsedData[cnt + 3]) === 1
                        ? 'Connected'
                        : 'Disconnected'
                      : null,
                tirePresure: getTirePressureInPSI(parsedData[cnt + 3]),
                productModel:
                    bleModel === 'ATP100/ATP102'
                      ? parsedData[cnt + 3].substring(6, 7)
                      : null,
                fwVersion:
                    bleModel === 'ATP100/ATP102'
                      ? parsedData[cnt + 3].substring(7, 8)
                      : null
              }
              : null,
          temperature:
            parsedData[aTmpIx] !== '' && appendMask[11] === '1'
              ? parseInt(parsedData[aTmpIx])
              : null,
          humidity:
            parsedData[aHumIx] !== '' && appendMask[10] === '1'
              ? parseInt(parsedData[aHumIx])
              : null,
          outputStatus:
            parsedData[ioIx] !== '' && appendMask[8] === '1'
              ? parsedData[ioIx]
              : null,
          inputStatus:
            parsedData[ioIx + 1] !== '' && appendMask[8] === '1'
              ? parsedData[ioIx + 1]
              : null,
          analogInputStatus:
            parsedData[ioIx + 2] !== '' && appendMask[8] === '1'
              ? parsedData[ioIx + 2]
              : null,
          event:
            parsedData[aEvIx] !== '' && appendMask[7] === '1'
              ? parseInt(parsedData[aEvIx])
              : null,
          tirePresure:
            parsedData[pressIx] !== '' && appendMask[6] === '1'
              ? parseInt(parsedData[pressIx]) / 6.895
              : null,
          timestamp:
            parsedData[timeIx] !== '' && appendMask[5] === '1'
              ? parseDate(parsedData[timeIx])
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
            state:
              parsedData[relIx] !== '' && appendMask[1] === '1'
                ? parseInt(parsedData[relIx])
                : null
          }
        }
      })
      cnt = relIx + 1
    } else {
      let appendMask = nHexDigit(hex2bin(parsedData[cnt + 3]), 8)
      let aMacIx = cnt + 3 + parseInt(appendMask[6])
      let aBatIx = aMacIx + parseInt(appendMask[4])
      let aSigIx = aBatIx + parseInt(appendMask[1])
      let bTypeIx = aSigIx + parseInt(appendMask[0])

      btDevices.push({
        index: parsedData[cnt],
        type: beaconTypes[parsedData[cnt + 1]],
        model:
          parsedData[cnt + 2] !== '' ? beaconModels[parsedData[cnt + 2]] : null,
        appendMask: parsedData[cnt + 3],
        mac:
          parsedData[aMacIx] !== '' && appendMask[6] === '1'
            ? parsedData[aMacIx]
            : null,
        batteryLevel:
          parsedData[aBatIx] !== '' && appendMask[4] === '1'
            ? parseInt(parsedData[aBatIx])
            : null,
        SignalStrength:
          parsedData[aSigIx] !== '' && appendMask[1] === '1'
            ? parseInt(parsedData[aSigIx])
            : null,
        beaconType:
          parsedData[bTypeIx] !== '' && appendMask[0] === '1'
            ? parseInt(parsedData[bTypeIx])
            : null,
        beaconData:
          parsedData[bTypeIx + 1] !== '' && appendMask[0] === '1'
            ? parseInt(parsedData[bTypeIx + 1])
            : null
      })
      cnt = bTypeIx + 1 + parseInt(appendMask[1])
    }
  }
  return btDevices
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
  } else if (command === 'GTAUR') {
    return {
      id: report[0] !== '' ? parseInt(report[0]) : null,
      type: portNTypes[report[1]],
      status: report[2] === '0',
      message: messages[command]
    }
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
    let reportID = parseInt(report[0], 16)
    const reportType = parseInt(report[1], 16)
    if (extra === true && reportID === 1) {
      reportID = 2
    } else if (
      [
        'gv800w',
        'gv600w',
        'gv300w',
        'gv310lau',
        'gv58lau',
        'gv75w',
        'GMT100'
      ].includes(extra)
    ) {
      reportID += 1
    }
    return {
      type: 'DI',
      number: reportID,
      status: reportType === 1,
      message: messages[command][report[1]].replace('id', reportID)
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
      overSpeedType: 'device',
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
  } else if (command === 'GTVGL') {
    let reportID = parseInt(report[0], 16)
    const reportType = parseInt(report[1], 16)
    if (reportID === 1) {
      reportID = 'sensor de movimiento'
    } else if (reportID === 2) {
      reportID = 'voltaje de batería'
    } else if (reportID === 4) {
      reportID = 'acelerómetro'
    } else if (reportID === 7) {
      reportID = 'sensor de movimiento, voltaje o acelerómetro'
    } else {
      reportID = ''
    }
    return {
      type: 'DI',
      number: 1,
      status: reportType === 0,
      reason: reportID,
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
  } else if (command === 'GTVGN') {
    const duration = report[0] !== '' ? parseInt(report[0], 10) : null
    return {
      type: 'DI',
      number: 1,
      status: true,
      duration: duration,
      message: messages[command][report[1]]
    }
  } else if (command === 'GTVGF') {
    const duration = report[0] !== '' ? parseInt(report[0], 10) : null
    return {
      type: 'DI',
      number: 1,
      status: false,
      duration: duration,
      message: messages[command][report[1]]
    }
  } else if (command === 'GTPNA') {
    return { type: 'Power', status: true, message: messages[command] }
  } else if (command === 'GTPFA') {
    return { type: 'Power', status: false, message: messages[command] }
  } else if (command === 'GTPNR' || command === 'GTPFR') {
    return {
      type: 'Power_Reason',
      status: command === 'GTPNR',
      message: messages[command][report]
    }
  } else if (command === 'GTMPN' || command === 'GTEPN') {
    // Change for connected to power supply
    return { type: 'Charge', status: true, message: messages[command] }
  } else if (command === 'GTMPF' || command === 'GTEPF') {
    return { type: 'Charge', status: false, message: messages[command] }
  } else if (command === 'GTBTC') {
    return { type: 'Charging', status: true, message: messages[command] }
  } else if (command === 'GTDRM') {
    return { type: 'Device_Removal', message: messages[command] }
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
    const jammingNetwork = jammingNetworkTypes[report] || null
    return {
      type: 'Jamming',
      status: true,
      gps: false,
      jammingNetwork: jammingNetwork,
      message: jammingNetwork
        ? `${messages[command]}: ${jammingNetworkTypes[report]}`
        : messages[command]
    }
  } else if (command === 'GTJDS') {
    return {
      type: 'Jamming',
      status: report === '2',
      gps: false,
      jammingNetwork:
        typeof extra !== 'undefined' && extra !== ''
          ? jammingNetworkTypes[extra]
          : null,
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
  } else if (command === 'GTSVR') {
    return {
      type: 'Stolen_Vehicle_Alarm',
      status: report === '0',
      message: messages[command][report]
    }
  } else if (command === 'GTAIS' || command === 'GTMAI') {
    const reportID = parseInt(report[0], 10)
    const reportType = parseInt(report[1], 10)
    // if (reportID === 2) {
    //   return { type: 'SOS_Button', message: messages[command][reportID] }
    // }
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
  } else if (command === 'GTAVC') {
    return {
      type: 'Serial_Communication_Status',
      status: report === '1',
      message: messages[command][report]
    }
  } else if (command === 'GTCRG') {
    return {
      type: 'Crash_Information',
      before: report === '0',
      message: messages[command][report]
    }
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
    const status = report.split(',')[1]
      ? parseInt(report.split(',')[1], 10)
      : null
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
      message: messages[command][outputStatus]
    }
  } else if (command === 'GTDOM') {
    const waveShape = report[0] !== '' ? parseInt(report[0]) : null
    const outputId = report[1] !== '' ? parseInt(report[1]) : null
    return {
      type: 'DO',
      number: outputId,
      wave: waveShape,
      message: messages[command]
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
      dataType: dataTypes[extra],
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
    const reportType = report[1]
    return {
      type: 'Harsh_Behavior',
      status: parseInt(reportType, 10),
      message: messages[command][reportType]
    }
  } else if (command === 'GTHBE') {
    /*
      status:
        0: braking
        1: acceleration
        2: turning
        3: braking turning
        4: acceleration turning
        5: unknown harsh behavior
      */
    let x = getAccelerationMagnitude(extra[0].substring(0, 4), 4)
    let y = getAccelerationMagnitude(extra[0].substring(4, 8), 4)
    let z = getAccelerationMagnitude(extra[0].substring(8, 12), 4)
    return {
      type: 'Harsh_Behavior',
      status: parseInt(report[1], 10),
      calibration: report[0] === '2',
      duration: extra[1],
      magnitude: Number(
        Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2) + Math.pow(z, 2)).toFixed(2)
      ).toString(),
      xyz: { x: x, y: y, z: z },
      message: messages[command][report[1]]
    }
  } else if (command === 'GTCRA') {
    return {
      type: 'Crash',
      status: true,
      counter: parseInt(report, 16),
      message: messages[command]
    }
  } else if (command === 'GTCRD') {
    return {
      type: '3Axis_Information  ',
      message: messages[command]
    }
  } else if (command === 'GTACC') {
    return {
      type: 'Accelerometer_Info',
      message: messages[command]
    }
  } else if (command === 'GTDOG') {
    /*
      status:
        1: Reboot for time based working mode
        2: Reboot for ignition on workinkg mode
        3: Input triggered reboot
        4: GSM watchdog reboot
        5: GPRS watchdog reboot
        6: Reboot because of fail in sending message
      */
    // const reportID = parseInt(report[0], 10)
    const reportType = report[1]
    return {
      type: 'Watchdog_Protocol',
      status: parseInt(reportType, 10),
      message: messages[command][reportType]
    }
  } else if (command === 'GTGEO') {
    return {
      type: 'Device_Geofence'
    }
  } else if (
    command === 'GTALC' ||
    command === 'GTALM' ||
    command === 'GTALS'
  ) {
    return {
      type: command,
      status: 'CONFIG',
      message: report
    }
  } else if (command === 'GTCID') {
    return {
      type: command,
      status: 'CONFIG',
      message:
        report !== ''
          ? messages[command].replace('data', report)
          : messages[command].replace('data', '-')
    }
  } else if (command === 'GTSCS') {
    return {
      type: command,
      status: 'CONFIG',
      selfCalibration: report.split(',')[4] === '2'
    }
  } else if (command === 'GTLBA') {
    let type = report[0]
    let serial = report[1]
    return {
      type: command,
      status: 'BT_Low_Battery',
      serialNumber: serial !== '' ? parseInt(serial, 16) : null,
      message: messages[command][type]
    }
  } else if (command === 'GTCSQ' || command === 'GTATI') {
    return {
      type: command,
      status: 'CONFIG',
      message: report
    }
  } else if (command === 'GTVER') {
    return {
      type: command,
      status: 'CONFIG',
      firmware:
        report[0] !== ''
          ? { raw: report[0], value: parseFloat(getVersion(report[0])) }
          : null,
      hardware:
        report[1] !== ''
          ? { raw: report[1], value: parseFloat(getVersion(report[1])) }
          : null,
      message:
        report[0] !== '' && report[1] !== ''
          ? messages[command]
            .replace('data0', getVersion(report[0]))
            .replace('data1', getVersion(report[1]))
          : 'Datos de versión incompletos'
    }
  } else if (command === 'GTBCS') {
    return { type: 'Bluetooth_Connected', message: messages[command] }
  } else if (command === 'GTBDS') {
    return { type: 'Bluetooth_Disonnected', message: messages[command] }
  } else if (command === 'GTBAA') {
    if (['01', '02', '03'].includes(report)) {
      const number = parseInt(extra[0])
      const mac = extra[1]
      const temperature = extra[2].enhancedTemperature
        ? extra[2].enhancedTemperature
        : extra[2].temperature
      const status = report !== '03' // 01 & 02 means outside range, 03 means inside range
      return {
        type: 'Outside_Temperature',
        number: number,
        deviceID: mac,
        status: status,
        temperature: temperature,
        message: messages[command][report].replace('()', `(${temperature}°C)`)
      }
    } else if (report === '20') {
      // Button pressed
      const number = parseInt(extra[0])
      const mac = extra[1]
      return {
        type: 'SOS_Button',
        number: number,
        deviceID: mac,
        voltage: extra[2].voltage ? extra[2].voltage : null,
        message: messages[command][report]
      }
    } else if (['07', '08', '09'].includes(report)) {
      const number = parseInt(extra[0])
      const mac = extra[1]
      const humidity = extra[2].humidity ? extra[2].humidity : null
      const status = report !== '09' // 07 & 08 means outside range, 09 means inside range
      return {
        type: 'Outside_Humidity',
        number: number,
        deviceID: mac,
        status: status,
        humidity: humidity,
        message: messages[command][report].replace('()', `(${humidity}%)`)
      }
    } else if (['0E', '0F', '10'].includes(report)) {
      const number = parseInt(extra[0])
      const mac = extra[1]
      const pressure = extra[2].tirePresure ? extra[2].tirePresure : null
      const status = report !== '10' // 0E & 0F means outside range, 10 means inside range
      return {
        type: 'Outside_Tire_Pressure',
        number: number,
        deviceID: mac,
        status: status,
        pressure: pressure,
        message: messages[command][report].replace('()', `(${pressure}kPa)`)
      }
    } else if (report === '15') {
      const number = parseInt(extra[0])
      const mac = extra[1]
      const status = extra[2].relay.state === 1
      const humanStatus = status ? 'activado' : 'desactivado'
      const configResult = extra[2].relay.configResult
        ? extra[2].relay.configResult
        : null
      return {
        type: 'Relay_BLE',
        number: number,
        deviceID: mac,
        status: status,
        configResult: configResult,
        message: messages[command][report].replace('__', `${humanStatus}`)
      }
    } else {
      return {
        type: 'Bluetooth_Alarm',
        message: messages[command][report]
      }
    }
  } else if (command === 'GSENSOR') {
    return {
      type: 'Motion',
      message: messages[command][report]
    }
  } else if (command === 'LIGHT') {
    return {
      type: 'Light',
      message: messages[command]
    }
  } else {
    return {
      type: command,
      message: messages[command] ? messages[command] : report || ''
    }
  }
}

/*
  Creates default output
*/
const createDefaultOut = (size, defaultValue) => {
  return Object.fromEntries(
    Array.from({ length: size }, (_, i) => [i + 1, defaultValue])
  )
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
  Return the sum of ones in hexadecimal number
*/
const sumOnes = num => {
  let sum = 0
  let bin = hex2bin(num)
  for (let i = 0; i < bin.length; i++) {
    sum += parseInt(bin[i])
  }
  return sum
}

/*
  Parses date
*/
const parseDate = date => {
  if (!date) return null
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
  nackCauses: nackCauses,
  OBDIIProtocols: OBDIIProtocols,
  states: states,
  uartDeviceTypes: uartDeviceTypes,
  networkTypes: networkTypes,
  gpsSignalStrength: gpsSignalStrength,
  externalGPSAntennaOptions: externalGPSAntennaOptions,
  peerRoles: peerRoles,
  peerAddressesTypes: peerAddressesTypes,
  disconnectionReasons: disconnectionReasons,
  bluetoothAccessories: bluetoothAccessories,
  bluetoothModels: bluetoothModels,
  bleTempHumSensors: bleTempHumSensors,
  beaconModels: beaconModels,
  beaconTypes: beaconTypes,
  relayBLEResults: relayBLEResults,
  dTimeStates: dTimeStates,
  dWorkingStates: dWorkingStates,
  gnssTriggerTypes: gnssTriggerTypes,
  latamMcc: latamMcc,
  getDevice: getDevice,
  getProtocolVersion: getProtocolVersion,
  checkGps: checkGps,
  includeSatellites: includeSatellites,
  includeGnssTrigger: includeGnssTrigger,
  includeStatus: includeStatus,
  includeGnnsAccuracy: includeGnnsAccuracy,
  getAccelerationMagnitude: getAccelerationMagnitude,
  getTempInCelciousDegrees: getTempInCelciousDegrees,
  getFuelConsumption: getFuelConsumption,
  getHoursForHourmeter: getHoursForHourmeter,
  getSignalStrength: getSignalStrength,
  getSignalPercentage: getSignalPercentage,
  getCanData: getCanData,
  getBleData: getBleData,
  getAlarm: getAlarm,
  createDefaultOut: createDefaultOut,
  bin2dec: bin2dec,
  bin2hex: bin2hex,
  dec2bin: dec2bin,
  dec2hex: dec2hex,
  hex2bin: hex2bin,
  hex2dec: hex2dec,
  nHexDigit: nHexDigit,
  sumOnes: sumOnes,
  parseDate: parseDate,
  getMNC: getMNC
}
