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
  '802006': 'GV57CG'
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
    '0': 'MLD BLE TPMS (ATP100/ATP102)'
  },
  '13': {
    '0': 'WRL300 (Bluetooth Relay)'
  }
}

/*
  Possible Beacon ID Models
*/
const beaconModels = {
  '0': 'WKF300',
  '1': 'iBeacon E6',
  '2': 'ID ELA',
  '4': 'WID310'
}

/*
  Possible Beacon Types
*/
const beaconTypes = {
  '0': 'ID',
  '1': 'iBeacon',
  '2': 'Eddystone'
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
  748: 'Uruguay'
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
  return ['01', '03', '05', '07'].includes(positionAppendMask)
}

/*
  Returns if the GNSS trigger is
  included in the report
*/
const includeGnssTrigger = positionAppendMask => {
  return ['02', '03', '06', '07'].includes(positionAppendMask)
}

/*
  Returns if Possition Append Mask includes
  more information in the report
*/
const appendMaskData = positionAppendMask => {
  let satelliteInfo = ['01', '03', '05', '07'].includes(positionAppendMask)
  let gnssTrigger = ['02', '03', '06', '07'].includes(positionAppendMask)
  let statusInfo = parseInt(positionAppendMask) > 3

  return satelliteInfo + gnssTrigger + statusInfo
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
  Gets the temperature and humidity from bluetooth device
*/
const getBtTempHumData = hexTemp => {
  var int = parseInt(hexTemp.substring(0, 2), 16)
  var dec = parseInt(hexTemp.substring(2, 4), 16)
  return int + dec / 256
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
const getSignalStrength = (networkType, value) => {
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
  } else {
    dBm = null
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
    operator = (mnc === 6) ? 'Movistar' :
      (mnc === 7) ? 'Nextel' :
        (mnc === 10) ? 'Claro' :
          (mnc === 15) ? 'Viettel' :
            (mnc === 17) ? 'Entel' :
              (mnc === 20) ? 'Cuy Mobile (Claro)' :
                'Desconocido'
  } else if (mcc === 722) {
    operator = (mnc === 1) ? 'Tuenti' :
      (mnc === 10) ? 'Movicom' :
        (mnc === 20) ? 'Nextel' :
          (mnc === 34) ? 'Telecom Personal' :
            ([310, 320, 330].includes(mnc)) ? 'Claro' :
              'Desconocido'
  } else if (mcc === 724) {
    // Incomplete
    operator = ([2, 3, 4].includes(mnc)) ? 'TIM' :
      ([5, 6, 12].includes(mnc)) ? 'Claro' :
        'Otra'
  } else if (mcc === 730) {
    operator = ([1, 10].includes(mnc)) ? 'Entel' :
      ([2, 7].includes(mnc)) ? 'Movistar' :
        ([3, 23].includes(mnc)) ? 'Claro' :
          (mnc === 8) ? 'VTR (Claro)' :
            (mnc === 9) ? 'WOM' :
              ([14, 20, 21, 28].includes(mnc)) ? 'Otro' :
                'Desconocido'
  } else if (mcc === 732) {
    operator = (mnc === 1) ? 'Telecom' :
      (mnc === 2) ? 'Edatel' :
        (mnc === 101) ? 'Claro' :
          (mnc === 103) ? 'Colombia Móvil' :
            ([102, 123].includes(mnc)) ? 'Movistar' :
              (mnc === 360) ? 'WOM' :
                'Desconocido'
  } else if (mcc === 736) {
    operator = (mnc === 1) ? 'Viva Bolivia' :
      (mnc === 2) ? 'Entel' :
        (mnc === 3) ? 'Telecel' :
          (mnc === 4) ? 'Cotas' :
            (mnc === 5) ? 'Comteco' :
              'Desconocido'
  } else if (mcc === 740) {
    operator = (mnc === 1) ? 'Otecel (Movistar)' :
      (mnc === 2) ? 'Conecel (Claro)' :
        (mnc === 0) ? 'Telecsa (CNT' :
          'Desconocido'
  } else if (mcc === 744) {
    operator = (mnc === 1) ? 'Hola Paraguay' :
      (mnc === 2) ? 'AMX Paraguay' :
        (mnc === 3) ? 'Comunicaciones Privadas' :
          (mnc === 4) ? 'Telefónica Celular del Paraguay' :
            (mnc === 5) ? 'Núcleo' :
              'Desconocido'
  } else if (mcc === 748) {
    operator = ([0, 1].includes(mnc)) ? 'Ancel' :
      (mnc === 7) ? 'Movistar' :
        (mnc === 0) ? 'AMX Wireless' :
          'Desconocido'
  } else {
    operator = 'Desconocido'
  }
  return {
    country: latamMcc[mcc], mnc: mnc, operator: operator
  }
}

/*
  Hectometer to Kilometer
*/
const hToKm = (data) => {
  let h = parseFloat(data.slice(1))
  return parseFloat((h * 0.1).toFixed(2))
}

/*
  Parse CAN100 data
*/
const parseCanData = (data, key) => {
  switch (key) {
    case 'ignitionKey':
      return (data === '0' ? 'ignition_off' : data === '1' ? 'ignition_on' : data === '2' ? 'engine_on' : null)
    case 'totalDistance':
      if (data[0] === 'H') {
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
    default:
      return data
  }
}

/*
  Get CANbus data
*/
const getCanData = (parsedData, ix) => {
  let inicatorsBin =
    parsedData[ix + 19] !== ''
      ? nHexDigit(hex2bin(parsedData[ix + 19]), 16)
      : null
  let lights =
    parsedData[ix + 20] !== ''
      ? nHexDigit(hex2bin(parsedData[ix + 20]), 8)
      : null
  let doors =
    parsedData[ix + 21] !== ''
      ? nHexDigit(hex2bin(parsedData[ix + 21]), 8)
      : null
  let canExpansionMask =
    parsedData[ix + 24] !== ''
      ? nHexDigit(hex2bin(parsedData[ix + 24]), 32)
        .split('')
        .reverse()
        .join('')
      : null
  let expansionBin =
    parsedData[ix + 45] !== ''
      ? nHexDigit(hex2bin(parsedData[ix + 45]), 16)
        .split('')
        .reverse()
        .join('')
      : null
  let tachographBin =
    parsedData[ix + 18] !== ''
      ? nHexDigit(hex2bin(parsedData[ix + 18]), 8)
        .split('')
        .reverse()
        .join('')
      : null

  return {
    comunicationOk: parsedData[ix] ? parsedData[ix] === '1' : null,
    vin: parsedData[ix + 2] !== '' ? parsedData[ix + 2] : null,
    ignitionKey: parsedData[ix + 3] !== '' ? parseCanData(parsedData[ix + 3], 'ignitionKey') : null,
    totalDistance: parsedData[ix + 4] !== '' ? parseCanData(parsedData[ix + 4], 'totalDistance') : null,
    fuelUsed: parsedData[ix + 5] !== '' ? parseFloat(parsedData[ix + 5]) : null, // float
    rpm: parsedData[ix + 6] !== '' ? parseInt(parsedData[ix + 6], 10) : null, // int
    speed: parsedData[ix + 7] !== '' ? parseFloat(parsedData[ix + 7]) : null,
    engineCoolantTemp:
      parsedData[ix + 8] !== '' ? parseInt(parsedData[ix + 8], 10) : null,
    fuelConsumption: parsedData[ix + 9] !== '' ? parseCanData(parsedData[ix + 9], 'fuelConsumption') : null,
    fuelLevel: parsedData[ix + 10] !== '' ? parsedData[ix + 10] : null,
    range: parsedData[ix + 11] !== '' ? parseCanData(parsedData[ix + 11], 'range') : null,
    acceleratorPressure:
      parsedData[ix + 12] !== '' ? parseFloat(parsedData[ix + 12]) : null,
    engineHours: parsedData[ix + 13] !== '' ? parseFloat(parsedData[ix + 13]) : null,
    drivingTime: parsedData[ix + 14] !== '' ? parseFloat(parsedData[ix + 14]) : null,
    idleTime: parsedData[ix + 15] !== '' ? parseFloat(parsedData[ix + 15]) : null,
    idleFuelUsed: parsedData[ix + 16] !== '' ? parseFloat(parsedData[ix + 16]) : null,
    axleWight: parsedData[ix + 17] !== '' ? parseFloat(parsedData[ix + 17]) : null,
    tachograph: {
      raw: parsedData[ix + 18] !== '' ? parsedData[ix + 18] : null,
      validDriverData: tachographBin ? tachographBin[7] === '1' : null,
      insertedDriverCard: tachographBin ? tachographBin[5] === '1' : null,
      driverWorkingState: tachographBin
        ? dWorkingStates[parseInt(tachographBin.substring(3, 5), 2)]
        : null,
      drivingTimeState: tachographBin
        ? dTimeStates[parseInt(tachographBin.substring(5, 8), 2)]
        : null
    },
    indicators: inicatorsBin ? {
      raw: inicatorsBin !== '' ? parsedData[ix + 19] : null,
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
    } : null,
    lights: lights ? {
      raw: lights !== '' ? parsedData[ix + 20] : null,
      running: lights ? lights[0] === '1' : null,
      lowBeams: lights ? lights[1] === '1' : null,
      frontFog: lights ? lights[2] === '1' : null,
      rearFog: lights ? lights[3] === '1' : null,
      hazard: lights ? lights[4] === '1' : null
    } : null,
    doors: doors ? {
      raw: doors !== '' ? parsedData[ix + 21] : null,
      driver: doors ? doors[0] === '1' : null,
      passenger: doors ? doors[1] === '1' : null,
      rearLeft: doors ? doors[2] === '1' : null,
      rearRight: doors ? doors[3] === '1' : null,
      trunk: doors ? doors[4] === '1' : null,
      hood: doors ? doors[5] === '1' : null
    } : null,
    overSpeedTime: parsedData[ix + 22] !== '' ? parseFloat(parsedData[ix + 22]) : null,
    overSpeedEngineTime: parsedData[ix + 23] !== '' ? parseFloat(parsedData[ix + 23]) : null,
    canExpanded: {
      canReportExpansionMask: {
        raw: parsedData[ix + 24] !== '' ? parsedData[ix + 24] : null,
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
      adBlueLevel:
        parsedData[ix + 25] !== '' ? parseFloat(parsedData[ix + 25]) : null,
      axleWeight1: parsedData[ix + 26] !== '' ? parseInt(parsedData[ix + 26]) : null,
      axleWeight3: parsedData[ix + 27] !== '' ? parseInt(parsedData[ix + 27]) : null,
      axleWeight4: parsedData[ix + 28] !== '' ? parseInt(parsedData[ix + 28]) : null,
      tachographOverspeedSignal:
        parsedData[ix + 29] !== '' ? (parsedData[ix + 29] === '1') : null,
      tachographVehicleMotionSignal:
        parsedData[ix + 30] !== '' ? (parsedData[ix + 30] === '1') : null,
      tachographDrivingDirection:
        parsedData[ix + 31] !== '' ? parseCanData(parsedData[ix + 31], 'tachographDrivingDirection') : null,
      analogInputValue:
        parsedData[ix + 32] !== '' ? parseFloat(parsedData[ix + 32]) * 1000 : null,
      engineBrakingFactor:
        parsedData[ix + 33] !== '' ? parseInt(parsedData[ix + 33]) : null,
      pedalBrakingFactor:
        parsedData[ix + 34] !== '' ? parseInt(parsedData[ix + 34]) : null,
      totalAcceleratorKickDown:
        parsedData[ix + 35] !== '' ? parseInt(parsedData[ix + 35]) : null,
      totalEffectiveEngineSpeedTime:
        parsedData[ix + 36] !== '' ? parseFloat(parsedData[ix + 36]) : null,
      totalCruiseControlTime:
        parsedData[ix + 37] !== '' ? parseFloat(parsedData[ix + 37]) : null,
      totalAcceleratorKickDownTime:
        parsedData[ix + 38] !== '' ? parseFloat(parsedData[ix + 38]) : null,
      totalBrakeApplications:
        parsedData[ix + 39] !== '' ? parseInt(parsedData[ix + 39]) : null,
      tachographDriver1Card: parsedData[ix + 40] !== '' ? parsedData[ix + 40] : null,
      tachographDriver2Card: parsedData[ix + 41] !== '' ? parsedData[ix + 41] : null,
      tachographDriver1Name: parsedData[ix + 42] !== '' ? parsedData[ix + 42] : null,
      tachographDriver2Name: parsedData[ix + 43] !== '' ? parsedData[ix + 43] : null,
      registrationNumber: parsedData[ix + 44] !== '' ? parsedData[ix + 44] : null,
      expansionInformation: {
        raw: parsedData[ix + 45] !== '' ? parsedData[ix + 45] : null,
        webasto: expansionBin ? expansionBin[0] === '1' : null,
        brakeFluidLowIndicator: expansionBin
          ? expansionBin[1] === '1'
          : null,
        coolantLevelLowIndicator: expansionBin
          ? expansionBin[2] === '1'
          : null,
        batteryIndicator: expansionBin ? expansionBin[3] === '1' : null,
        brakeSystemaFailureIndicator: expansionBin
          ? expansionBin[4] === '1'
          : null,
        oilPressureIndicator: expansionBin ? expansionBin[5] === '1' : null,
        engineHotIndicator: expansionBin ? expansionBin[6] === '1' : null,
        ABSFailureIndicator: expansionBin ? expansionBin[7] === '1' : null,
        checkEngineIndicator: expansionBin ? expansionBin[9] === '1' : null,
        aribagsIndicator: expansionBin ? expansionBin[10] === '1' : null,
        serviceCallIndicator: expansionBin
          ? expansionBin[11] === '1'
          : null,
        oilLevelLowIndicator: expansionBin ? expansionBin[12] === '1' : null
      },
      rapidBrakings: parsedData[ix + 46] !== '' ? parseInt(parsedData[ix + 46]) : null,
      rapidAccelerations: parsedData[ix + 47] !== '' ? parseInt(parsedData[ix + 47]) : null,
      engineTorque: parsedData[ix + 48] !== '' ? parseFloat(parsedData[ix + 48]) : null,
    }
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
      ['gv800w', 'gv600w', 'gv300w', 'gv310lau', 'gv75w', 'GMT100'].includes(
        extra
      )
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
      xyz: {x: x, y: y, z: z},
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
    return {
      type: 'Bluetooth_Alarm',
      message: messages[command][report]
    }
  } else {
    return {
      type: command,
      message: messages[command] ? messages[command] : report || ''
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
  OBDIIProtocols: OBDIIProtocols,
  states: states,
  uartDeviceTypes: uartDeviceTypes,
  networkTypes: networkTypes,
  externalGPSAntennaOptions: externalGPSAntennaOptions,
  peerRoles: peerRoles,
  peerAddressesTypes: peerAddressesTypes,
  disconnectionReasons: disconnectionReasons,
  bluetoothAccessories: bluetoothAccessories,
  bluetoothModels: bluetoothModels,
  beaconModels: beaconModels,
  beaconTypes: beaconTypes,
  dTimeStates: dTimeStates,
  dWorkingStates: dWorkingStates,
  gnssTriggerTypes: gnssTriggerTypes,
  latamMcc: latamMcc,
  getDevice: getDevice,
  getProtocolVersion: getProtocolVersion,
  checkGps: checkGps,
  includeSatellites: includeSatellites,
  includeGnssTrigger: includeGnssTrigger,
  appendMaskData: appendMaskData,
  getAccelerationMagnitude: getAccelerationMagnitude,
  getTempInCelciousDegrees: getTempInCelciousDegrees,
  getBtTempHumData: getBtTempHumData,
  getFuelConsumption: getFuelConsumption,
  getHoursForHourmeter: getHoursForHourmeter,
  getSignalStrength: getSignalStrength,
  getSignalPercentage: getSignalPercentage,
  getCanData: getCanData,
  getAlarm: getAlarm,
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
