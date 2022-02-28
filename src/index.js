'use strict'

const utils = require('./utils.js')
const gv200 = require('./gv200.js')
const gv300 = require('./gv300.js')
const gv300w = require('./gv300w.js')
const gv75w = require('./gv75w.js')
const gmt100 = require('./gmt100.js')
const gv55 = require('./gv55.js')
const gl300 = require('./gl300.js')
const gv500 = require('./gv500.js')
const gv800w = require('./gv800w.js')
const gv600w = require('./gv600w.js')
const gl50 = require('./gl50.js')
const gv50p = require('./gv50p.js')

/*
  Checks if raw comes from a Queclink device
*/
const isQueclink = raw => {
  if (
    utils.patterns.message.test(raw.toString()) ||
    utils.patterns.ack.test(raw.toString()) ||
    utils.patterns.buffer.test(raw.toString())
  ) {
    return true
  }
  return false
}

/*
  Checks if raw is a heartbeat message
*/
const isHeartBeat = raw => {
  if (utils.patterns.heartbeat.test(raw.toString())) {
    return true
  }
  return false
}

/*
  Gets the ACK command to Hearbeat message
*/
const getAckHeartBeat = (protocolVersion, count) => {
  return `+SACK:GTHBD,${protocolVersion},${count}$`
}

/*
  Returns the ACK for the given data
*/
const getAck = serial => {
  let count = utils.nHexDigit(utils.dec2hex(serial), 4).toUpperCase()
  return `+SACK:${count}$`
}

/*
  Returns the reboot command
*/
const getRebootCommand = (password, serial) => {
  password = password || '000000'
  serial = serial || '0000'
  return `AT+GTRTO=${password},3,,,,,,${serial}$`
}

/*
  Returns the imei
*/
const getImei = raw => {
  let imei = null
  raw = raw.toString()
  const isValid =
    Object.keys(utils.patterns)
      .map(x => utils.patterns[x].test(raw))
      .find(x => x === true) || false
  if (isValid) {
    const parsedData = raw.split(',')
    imei = parsedData[2]
  }
  return imei ? imei.toString() : null
}

/*
  Parses the raw data
*/
const parse = (raw, options) => {
  let result = { type: 'UNKNOWN', raw: raw.toString() }
  options = options || {}
  if (
    utils.patterns.message.test(raw.toString()) ||
    utils.patterns.ack.test(raw.toString()) ||
    utils.patterns.buffer.test(raw.toString())
  ) {
    const device = utils.getDevice(raw.toString())
    if (
      utils.patterns.ack.test(raw.toString()) &&
      !utils.patterns.heartbeat.test(raw.toString())
    ) {
      result = getAckCommand(raw.toString(), options.lang)
    } else if (device === 'GV300W') {
      result = gv300w.parse(raw.toString())
    } else if (device === 'GV75W') {
      result = gv75w.parse(raw.toString())
    } else if (device === 'GV300') {
      result = gv300.parse(raw.toString())
    } else if (device === 'GV200') {
      result = gv200.parse(raw.toString())
    } else if (device === 'GV500' || device === 'GV500MAP') {
      result = gv500.parse(raw.toString())
    } else if (device === 'GV55' || device === 'GV55W') {
      result = gv55.parse(raw.toString(), device)
    } else if (device === 'GMT100') {
      result = gmt100.parse(raw.toString())
    } else if (device === 'GL300' || device === 'GL300W') {
      result = gl300.parse(raw.toString())
    } else if (device === 'GV800W') {
      result = gv800w.parse(raw.toString())
    } else if (device === 'GV600W') {
      result = gv600w.parse(raw.toString())
    } else if (device === 'GL50' || device === 'GL50B') {
      result = gl50.parse(raw.toString())
    } else if (device === 'GV50P') {
      result = gv50p.parse(raw.toString())
    }
  }
  return result
}

/*
  Returns the ack command
*/
const getAckCommand = (raw, lang) => {
  const messages = utils.langs[lang] || utils.langs['es']
  const rawData = raw.substr(0, raw.length - 1)
  const parsedData = rawData.split(',')
  const command = parsedData[0].split(':')

  let data = {
    manufacturer: 'queclink',
    device: 'Queclink-COMMAND-OK',
    type: 'ok',
    serial:
      parsedData[parsedData.length - 3] !== ''
        ? parseInt(utils.hex2dec(parsedData[parsedData.length - 3]), 10)
        : null,
    counter: parseInt(utils.hex2dec(parsedData[parsedData.length - 1]), 10)
  }
  if (command[1] === 'GTSPD') {
    data.command = 'SETOVERSPEEDALARM'
  } else if (command[1] === 'GTOUT') {
    data.command = 'SETIOSWITCH'
  } else if (command[1] === 'GTRTO') {
    if (parsedData[4] === 'RESET') {
      data.command = 'CLEARBUF'
    } else if (parsedData[4] === 'REBOOT') {
      data.command = 'REBOOT'
    } else if (parsedData[4] === 'RTL') {
      data.command = 'REQUESTCURRENTPOSITION'
    }
  } else if (command[1] === 'GTJBS') {
    data.command = 'ANTIJAMMER'
  }
  data.message = messages[data.command] || messages.default
  return data
}

/*
  Parses the Websocket command into Queclink Command
*/
const parseCommand = data => {
  let command = ''
  const password = data.password || '000000'
  const serial = data.serial || 0
  const serialId = utils.nHexDigit(utils.dec2hex(serial), 4)

  let state,
    digit,
    port,
    maxSpeed,
    interval,
    validity,
    mode,
    prevOutputs,
    prevDurations,
    prevToggles

  // Digital Outputs
  if (/^[1-4]{1}_(on|off)$/.test(data.instruction)) {
    /*
      AT+GTOUT=gv800w,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,F,0,0,0,0,0,FFFF$
      AT+GTOUT=gv800w,0,0,0,0,0,0,0,0,0,0,0,0,0,0,,,0426$
    */
    let _data = data.instruction.split('_')
    port = parseInt(_data[0], 10)
    state = _data[1]
    prevOutputs = data.previousOutput || {
      '1': false,
      '2': false,
      '3': false,
      '4': false,
      '5': false
    }
    prevDurations = data.previousDuration || {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0
    }
    prevToggles = data.previousToggle || {
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0
    }
    const outputs = Object.keys(prevOutputs).map(
      key => (prevOutputs[key] === true ? 1 : 0)
    )
    outputs[0] = !outputs[0] ? 0 : outputs[0]
    outputs[1] = !outputs[1] ? 0 : outputs[1]
    outputs[2] = !outputs[2] ? 0 : outputs[2]
    outputs[3] = !outputs[3] ? 0 : outputs[3]
    outputs[4] = !outputs[4] ? 0 : outputs[4]
    digit = state === 'on' ? 1 : 0
    outputs[port - 1] = digit
    const do1 = `${outputs[0]},${prevDurations['1']},${prevToggles['1']}`
    const do2 = `${outputs[1]},${prevDurations['2']},${prevToggles['2']}`
    const do3 = `${outputs[2]},${prevDurations['3']},${prevToggles['3']}`
    const do4 = `${outputs[3]},${prevDurations['4']},${prevToggles['4']}`
    const do5 = `${outputs[4]},${prevDurations['5']},${prevToggles['5']}`
    const longOperation = data.longOperation || false ? '1' : '0'
    const dosReport = data.dosReport || false ? '1' : '0'
    if (data.device_serie === 'GV') {
      command = `AT+GTOUT=${password},${do1},${do2},${do3},${do4},${longOperation},${dosReport},,,${serialId}$`
    } else if (data.device_serie === 'GMT') {
      command = `AT+GTOUT=${password},${do1},${do2},,,,,,,,${serialId}$`
    } else if (data.device_serie === 'GV800') {
      command = `AT+GTOUT=${password},${do1},${do2},${do3},${do4},${do5},${longOperation},${dosReport},0,0,0,0,${serialId}$`
    } else {
      command = `AT+GTOUT=${password},${do1},${do2},${do3},${do4},${longOperation},${dosReport},,,${serialId}$`
    }
  } else if (data.instruction === 'clear_mem') {
    if (data.device_serie === 'GV') {
      command = `AT+GTRTO=${password},4,BUF,,,,,${serialId}$`
    } else if (data.device_serie === 'GMT') {
      command = `AT+GTRTO=${password},D,,,,,,${serialId}$`
    } else {
      command = `AT+GTRTO=${password},4,BUF,,,,,${serialId}$`
    }
  } else if (/^set_speed_(on|off)(E)?$/.test(data.instruction)) {
    maxSpeed = data.speed || 100
    state = data.instruction.split('_')[2]
    validity = data.times || 10
    interval = data.interval || 300
    mode = /on(E)?/.test(state) ? 4 : 0
    if (data.device_serie === 'GMT' || password === 'gv55') {
      mode = /on(E)?/.test(state) ? 3 : 0
    }
    command = `AT+GTSPD=${password},${mode},0,${maxSpeed},${validity},${interval},0,0,0,0,,,,,,,,,,,,${serialId}$`
  } else if (data.instruction === 'Custom') {
    command = data.command
  } else if (/^reboot$/.test(data.instruction)) {
    command = `AT+GTRTO=${password},3,,,,,,${serialId}$`
  } else if (data.instruction === 'set_driver') {
    const mode = data.mode || 1
    const count = data.count || 1
    const ids = data.driverID
    const reportMode = data.reportMode || 1
    command = `AT+GTIDA=${password},${mode},1,${count},${ids},30,${reportMode},,,,,1,0,0,0,,,,,${serialId}$`
  } else if (data.instruction === 'jamming_detection_configuration') {
    // Jammer configuration
    mode = data.mode || '2' // Modes: 1:JDS, 2:JDR, 0:Disabled
    command = `AT+GTJDC=${password},${mode},25,,5,10,10,,0,0,0,0,,${serialId}$`
  } else if (data.instruction === 'jamming_behavior_settings') {
    mode = data.mode || '1' // Modes: 0:Disable, 1:Enable
    maxSpeed = data.speed || '30'
    command = `AT+GTJBS=${password},${mode},,10,10,60,30,3600,1,${maxSpeed},120,,,,${serialId}$`
  } else if (data.instruction === 'jamming_gps_configuration') {
    mode = data.mode || '1' // Modes: 0:Disable, 1:Enable
    command = `AT+GTGPJ=${password},${mode},15,3,,,,,0,0,0,0,,${serialId}$`
  } else if (/^temp_alarm_(on|off)(E)?$/.test(data.instruction)) {
    // Temperature Alarm
    let _data = data.instruction.split('_')
    state = _data[2]
    mode = /on(E)?/.test(state) ? 3 : 0
    const alarmId = data.alarmId || 0
    const sensorId = data.sensorId || '0000000000000000'
    const minTemp = data.minTemp || 0
    const maxTemp = data.maxTemp || 0
    command = `AT+GTTMP=${password},${alarmId},${mode},${sensorId},,,${minTemp},${maxTemp},,,2,10,,,0,0,0,0,,,,,${serialId}$`
  } else if (/^copiloto_temp_alarm_(on|off)(E)?$/.test(data.instruction)) {
    // AT+GTDAT=gv300w,2,,>CMD3005,60,18,0,5,-3<,0,,,,FFFF$
    // Temperature Alarm
    const interval = data.interval || 0
    const minTemp1 = data.minTemp1 || 0
    const maxTemp1 = data.maxTemp1 || 0
    const minTemp2 = data.minTemp2 || 0
    const maxTemp2 = data.maxTemp2 || 0
    command = `AT+GTDAT=${password},2,,>CMD3005,${interval},${maxTemp1},${minTemp1},${maxTemp2},${minTemp2}<,0,,,,${serialId}$`
  } else if (data.instruction === 'get_current_position') {
    // Request current position
    command = `AT+GTRTO=${password},1,,,,,,${serialId}$`
  }
  return command
}

module.exports = {
  parse: parse,
  isQueclink: isQueclink,
  isHeartBeat: isHeartBeat,
  getAckHeartBeat: getAckHeartBeat,
  getAck: getAck,
  parseCommand: parseCommand,
  getRebootCommand: getRebootCommand,
  getImei: getImei
}
