'use strict';

const moment = require('moment');
const extend = require('lodash/extend');
const utils = require('./utils.js');
const langEs = require('./messages/es.json');
const langEn = require('./messages/en.json');
const langs = {es: langEs, en: langEn};

const patterns = {
  message: /^\+RESP/,
  ack: /^\+ACK/,
  buffer: /^\+BUFF/,
  heartbeat: /^\+ACK:GTHBD/
};

const devices = {
  '02': 'GL200',
  '04': 'GV200',
  '06': 'GV300',
  '08': 'GMT100',
  '0F': 'GV55',
  '10': 'GV55 LITE',
  '11': 'GL500',
  '1A': 'GL300',
  '1F': 'GV500',
  '25': 'GV300', // New Version
  '35': 'GV200', // New Version
  '27': 'GV300W',
  '2F': 'GV55'// New Version
};

const states = {
  '16': 'Tow',
  '1A': 'Fake Tow',
  '11': 'Ignition Off Rest',
  '12': 'Ignition Off Moving',
  '21': 'Ingition On Rest',
  '22': 'Ignition On Moving',
  '41': 'Sensor Rest',
  '42': 'Sesnor Motion',
  '': 'Unknown'
};

const uartDeviceTypes = {
  '0': 'No device',
  '1': 'Digit Fuel Sensor',
  '2': 'AC100 1 Wire Bus'
};

/*
  Checks if raw comes from a Queclink device
*/
const isQueclink = raw => {
  if (patterns.message.test(raw.toString()) || patterns.ack.test(raw.toString()) || patterns.buffer.test(raw.toString())) {
    return true;
  }
  return false;
};

/*
  Checks if raw is a heartbeat message
*/
const isHeartBeat = raw => {
  if(patterns.heartbeat.test(raw.toString())){
    return true;
  }
  return false;
};

/*
  Gets the ACK command to Hearbeat message
*/
const getAckHeartBeat = (protocolVersion, count) => {
  return `+SACK:GTHBD,${protocolVersion},${count}$`;
};

/*
  Returns the reboot command
*/
const getRebootCommand = (password, serial) => {
  password = password || '000000';
  serial = serial || '0000';
  return `AT+GTRTO=${password},3,,,,,,${serial}$`;
};

/*
  Returns the imei
*/
const getImei = raw => {
  let imei = null;
  raw = raw.toString();
  const isValid = Object.keys(patterns).map(x => patterns[x].test(raw)).find(x => x === true) || false;
  if (isValid) {
    const parsedData = raw.split(',');
    imei = parsedData[2];
  }
  return imei ? imei.toString() : null;
};

/*
  Parses the raw data
*/
const parse = (raw, options) => {
  let result = {type: 'UNKNOWN', raw: raw.toString()};
  options = options || {};
  if (patterns.message.test(raw.toString()) || patterns.ack.test(raw.toString()) || patterns.buffer.test(raw.toString())) {
    const device = getDevice(raw.toString());
    if (patterns.ack.test(raw.toString()) && !patterns.heartbeat.test(raw.toString())) {
      result = getAckCommand(raw.toString(), options.lang);
    }
    else if (device === 'GV300W') {
      result = getGV300W(raw.toString());
    }
    else if (device === 'GV300') {
      result = getGV300(raw.toString());
    }
    else if (device === 'GV200'){
      result = getGV200(raw.toString());
    }
    else if (device === 'GV55'){
      result = getGV55(raw.toString());
    }
    else if (device === 'GMT100') {
      result = getGMT100(raw.toString());
    }
  }
  return result;
};

/*
  Gets the Queclink Device Type
*/
const getDevice = raw => {
  raw = raw.substr(0, raw.length - 1);
  const parsedData = raw.split(',');
  const protocol = getProtocolVersion(parsedData[1]);
  return protocol.deviceType;
};

/*
  Gets the protocol version
*/
const getProtocolVersion = protocol => {
  return {
    raw: protocol,
    deviceType: devices.hasOwnProperty(protocol.substring(0,2)) ? devices[protocol.substring(0,2)] : null,
    version: `${parseInt(protocol.substring(2,4),16)}.${parseInt(protocol.substring(4,6),16)}`
  };
};

/*
  Checks if the location has a valid gps position
*/
const checkGps = (lng, lat) => {
  //loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
  if(lng != 0 && lat != 0 && !isNaN(lng) && !isNaN(lat)){
    return true;
  }
  return false;
};
/*
  Gets the temperature from AC100 device in celcious degrees
*/

const getTempInCelciousDegrees = (hexTemp) =>{
  const binTemp = utils.nHexDigit(utils.hex2bin(hexTemp),16);
  if (binTemp.substring(0,5) == '11111'){
    //Negative value
    return (parseInt('FFFF',16) - parseInt(hexTemp,16) + 1)*-0.0625;
  }
  return parseFloat(utils.hex2dec(hexTemp))*0.0625;
};

/*
  Gets the alarm type
*/
const getAlarm = (command, report, extra=false) => {
  const messages = langs['es'];
  if(command === 'GTFRI' || command === 'GTERI'){
    return {type: 'Gps' };
  }
  else if(command === 'GTCAN'){
    const reportType = parseInt(report,10);
    return {
      type: 'Gps',
      status: 'CAN_Bus',
      report: reportType
      //message: messages[command].replace('data', reportType)
    };
  }
  else if(command === 'GTGSM'){
    return {type: 'GSM_Report'};
  }
  else if(command === 'GTINF'){
    return {type: 'General_Info_Report'};
  }
  else if(command === 'GTDIS'){
    let reportID = parseInt(report[0],10);
    const reportType = parseInt(report[1],10);
    if(extra == true && reportID == 1){
      reportID = 2;
    }
    return {
      type: 'DI',
      number: reportID,
      status: reportType === 1,
      message: messages[command][reportType].replace('port', reportID)
    };
  }
  else if(command === 'GTTOW'){
    return {type: 'Towing', message: messages[command]};
  }
  else if(command === 'GTSOS'){
    return {type: 'SOS_Button', message: messages[command]};
  }
  else if(command === 'GTSPD'){
    const reportType = parseInt(report[1],10);
    return {
      type: 'Over_Speed',
      status: reportType === 0,
      message: messages[command][reportType]
    };
  }
  else if (command === 'GTIGL'){
    const reportType = parseInt(report[1],16);
    return {
      type: 'DI',
      number: 1,
      status: reportType === 0,
      message: messages[command][reportType === 0 ? '1': '0']
    };
  }
  else if (command === 'GTIGN'){
    const duration = report != '' ? parseInt(report,10): null;
    return {
      type: 'DI',
      number: 1,
      status: true,
      duration: duration,
      message: messages[command]
    };
  }
  else if (command === 'GTIGF'){
    const duration = report != '' ? parseInt(report,10): null;
    return {
      type: 'DI',
      number: 1,
      status: false,
      duration: duration,
      message: messages[command]
    };
  }
  else if(command === 'GTPNA'){
    return {type: 'Power', status: true, message: messages[command]};
  }
  else if(command === 'GTPFA'){
    return {type: 'Power', status: false, message: messages[command]};
  }
  //Change for connected to power supply
  else if(command === 'GTMPN'){
    return {type: 'Charge', status: true, message: messages[command]};
  }
  else if(command === 'GTMPF'){
    return {type: 'Charge', status: false, message: messages[command]};
  }
  // else if(command === 'GTMPN'){
  //   return {type: 'Power_Supply', status: true};
  // }
  // else if(command === 'GTMPF'){
  //   return {type: 'Power_Supply', status: false};
  // }
  else if(command === 'GTBTC'){
    return {type: 'Charging', status: true, message: messages[command]};
  }
  else if(command === 'GTSTC'){
    return {type: 'Charging', status: false, message: messages[command]};
  }
  else if(command === 'GTBPL'){
    return {type: 'Low_Battery', message: messages[command]};
  }
  else if(command === 'GTIDN'){
    return {type: 'Idling', status: true, message: messages[command]};
  }
  else if(command === 'GTIDF'){
    const duration = report != '' ? parseInt(report,10): null;
    return {
      type: 'Idling',
      status: false,
      duration: duration,
      message: messages[command]
    };
  }
  else if(command === 'GTJDR'){
    return {type: 'Jamming', status: true, gps: false, message: messages[command]};
  }
  else if(command === 'GTJDS'){
    return {
      type: 'Jamming',
      status: report === '2',
      gps: false,
      message: messages[command][report]
    };
  }
  // GPS Jamming
  else if(command === 'GTGPJ'){
    return {
      type: 'Jamming',
      status: report === '3',
      gps: true,
      message: messages[command][report]
    };
  }
  else if(command === 'GTEPS'){
    return {type: 'External_Low_battery', message: messages[command]};
  }
  else if(command === 'GTAIS' || command === 'GTMAI'){
    const reportID = parseInt(report[0],10);
    const reportType = parseInt(report[1],10);
    if(reportID === 2){
      return {type: 'SOS_Button', message: messages[command][reportID]};
    }
    return {type: 'AI', number: reportID , status: reportType === '0'};
  }
  else if(command === 'GTANT'){
    return {
      type: 'GPS_Antena',
      status: report === '0',
      message: messages[command][report]
    };
  }
  else if(command === 'GTSTR'){
    return {
      type:'Vehicle_Start_Status',
      status: true,
      message: messages[command]
    };
  }
  else if(command === 'GTSTP' || command === 'GTLSP') {
    return {
      type:'Vehicle_Start_Status',
      status: false,
      message: messages[command]
    };
  }
  else if(command === 'GTRMD'){
    return {
      type: 'Roaming',
      status: report === '1',
      message: messages[command][report]
    };
  }
  else if(command === 'GTHBD'){
    return {type: 'Heartbeat', message: messages[command]};
  }
  else if(command === 'GTSTT'){
    return {type: 'Motion_State_Changed', message: messages[command]};
  }
  else if(command === 'GTPDP'){
    return {type: 'GPRS_Connection_Established', message: messages[command]};
  }
  else if(command === 'GTGSS'){
    return {
      type: 'Gps_Status',
      status: report === '1',
      message: messages[command][typeof report !== 'undefined' ? '1': '0']
    };
  }
  else if(command === 'GTTMP'){
    const number = parseInt(report[0],10);
    const temperature = extra[1] != '' ? parseFloat(extra[1]) : null;
    return {
      type: 'Outside_Temperature',
      number: number,
      deviceID: extra[0],
      status: report[1] === '0', //0 means outside the range, 1 means inside
      temperature: temperature,
      message: messages[command][report[1]]
    };
  }
  else if(command === 'GTFLA'){
    const before = report.split(',')[0] != null ? parseInt(report.split(',')[0],10) : 0;
    const now = report.split(',')[1] != null ? parseInt(report.split(',')[1],10) : 0;
    const consumption = before-now;
    return {
      type: 'Unusual_Fuel_Consumption',
      status: consumption,
      message: messages[command].replace('consumption', consumption)
    };
  }
  else if(command === 'GTIDA'){
    const status = report.split(',')[1] != null ? parseInt(report.split(',')[1],10) : null;
    const driverID = report.split(',')[0] != null ? report.split(',')[0] : null;
    return {
      type: 'Driver_Identification',
      status: status === 1,
      driverID: driverID,
      message: messages[command][status]
    };
  }
  else if(command === 'GTDOS'){
    const output_id = report.split(',')[0] != null ? parseInt(report.split(',')[0],10) : null;
    const output_status = report.split(',')[0] != null ? report.split(',')[1] : null;
    return {
      type: 'DO',
      number: output_id,
      status: output_status === '1',
      message: messages[command][output_status].replace('port', output_id)
    };
  }
  else{
    return {type: command};
  }
};

/*
  Parses messages data from GV300W devices
*/
const getGV300W = raw => {
  raw = raw.substr(0, raw.length - 1);

  const parsedData = raw.split(',');
  const command = parsedData[0].split(':');

  let history = false;
  if(patterns.buffer.test(command[0])){
    history = true;
  }

  const data = {
    raw: `${raw.toString()}$`,
    manufacturer: 'queclink',
    device: 'Queclink-GV300W',
    type: 'data',
    imei: parsedData[2],
    protocolVersion: getProtocolVersion(parsedData[1]),
    temperature: null,
    history: history,
    sentTime: moment(`${parsedData[parsedData.length - 2]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
    serialId: parseInt(parsedData[parsedData.length - 1],16)
  };

  // GPS
  if (command[1] === 'GTFRI') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]): null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: {
        raw: parsedData[24],
        sos: utils.hex2bin(parsedData[24].substring(2,4))[1] === '1',
        tow: utils.hex2bin(parsedData[24].substring(0,1)) === '16',
        input: {
          '1': utils.hex2bin(parsedData[24].substring(2,4))[0] === '1',
          '2': utils.hex2bin(parsedData[24].substring(2,4))[1] === '1',
          '3': utils.hex2bin(parsedData[24].substring(2,4))[2] === '1',
          '4': utils.hex2bin(parsedData[24].substring(2,4))[3] === '1'
        },
        output: {
          '1': utils.hex2bin(parsedData[24].substring(4,6))[0] === '1',
          '2': utils.hex2bin(parsedData[24].substring(4,6))[1] === '1',
          '3': utils.hex2bin(parsedData[24].substring(4,6))[2] === '1'
        },
        charge: parseFloat(parsedData[4]) > 5
      },
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4])/1000 : null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21])/1000 : null,
        adb: parsedData[22] != '' ? parseFloat(parsedData[22])/1000 : null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]) : null,
      hourmeter: parsedData[20]
    });
  }
  //Heartbeat. It must response an ACK command
  else if (command[1] === 'GTHBD'){
    extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  // Common Alarms
  else if (command[1] === 'GTTOW' || command[1] === 'GTDIS' || command[1] === 'GTIOB' ||
      command[1] === 'GTSPD' || command[1] === 'GTSOS' || command[1] === 'GTRTL' ||
      command[1] === 'GTDOG' || command[1] === 'GTIGL' || command[1] === 'GTHBM') {

    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [parseFloat(parsedData[11]), parseFloat(parsedData[12])] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]) : null,
      hourmeter: null
    });
  }
  //External low battery and Low voltage for analog input
  else if (command[1] === 'GTEPS' || command[1] === 'GTAIS') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4])/1000 : null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21])/1000 : null,
        adb: parsedData[22] != '' ? parseFloat(parsedData[22])/1000 : null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]) : null,
      hourmeter: parsedData[20]
    });
  }
  //Event report (It uses the last GPS data and MCC info)
  else if(command[1] === 'GTPNA' || command[1] === 'GTPFA' || command[1] === 'GTPDP') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: null,
      speed: null,
      gpsStatus: null,
      hdop: null,
      status: null,
      azimuth: null,
      altitude: null,
      datetime: parsedData[4] != '' ? moment(`${parsedData[4]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
      },
      mcc: null,
      mnc: null,
      lac: null,
      cid: null,
      odometer: null,
      hourmeter: null
    });
  }
  else if(command[1] === 'GTMPN' || command[1] === 'GTMPF' || command[1] === 'GTCRA' || command[1] === 'GTJDR') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[8]), parseFloat(parsedData[9])]},
      speed: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[8]), parseFloat(parsedData[9])),
      hdop: parsedData[4] != '' ? parseFloat(parsedData[4]) : null,
      status: null,
      azimuth: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      altitude: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      datetime: parsedData[10] != '' ? moment(`${parsedData[10]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[11] != '' ? parseInt(parsedData[11],10) : null,
      mnc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      lac: parsedData[13] != '' ? parseInt(parsedData[13],16) : null,
      cid: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTJDS' || command[1] === 'GTANT' || command[1] === 'GTRMD') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTBPL') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTIGN' || command[1] === 'GTIGF') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null,
      hourmeter: parsedData[17]
    });
  }
  else if (command[1] === 'GTIDN' || command[1] === 'GTIDF') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] != '' ? moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTSTR' || command[1] === 'GTSTP' || command[1] === 'GTLSP') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] != '' ? moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null,
      hourmeter: null
    });
  }
  // Motion State Changed
  else if(command[1] === 'GTSTT'){
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  //GPS Status
  else if(command[1] === 'GTGSS'){
    extend(data, {
      alarm: getAlarm(command[1], command[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[12]), parseFloat(parsedData[13])]},
      speed: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[12]), parseFloat(parsedData[13])),
      hdop: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      status: null,
      azimuth: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] != '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] != '' ? moment(`${parsedData[14]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      mnc: parsedData[16] != '' ? parseInt(parsedData[16],10) : null,
      lac: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      cid: parsedData[18] != '' ? parseInt(parsedData[18],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  //iButton
  else if(command[1] === 'GTIDA'){
    extend(data,{
      alarm: getAlarm(command[1], `${parsedData[5]},${parsedData[6]}`),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[12]), parseFloat(parsedData[13])]},
      speed: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[12]), parseFloat(parsedData[13])),
      hdop: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      status: null,
      azimuth: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] != '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] != '' ? moment(`${parsedData[14]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      mnc: parsedData[16] != '' ? parseInt(parsedData[16],10) : null,
      lac: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      cid: parsedData[18] != '' ? parseInt(parsedData[18],16) : null,
      odometer: parsedData[20] != '' ? parseFloat(parsedData[20]) : null,
      hourmeter: null
    });
  }
  else if(command[1] === 'GTCAN'){
    extend(data, {
      alarm: getAlarm(command[1], command[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[35]), parseFloat(parsedData[36])]},
      speed: parsedData[32] != '' ? parseFloat(parsedData[32]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[35]), parseFloat(parsedData[36])),
      hdop: parsedData[31] != '' ? parseFloat(parsedData[31]) : null,
      status: null,
      azimuth: parsedData[33] != '' ? parseFloat(parsedData[33]) : null,
      altitude: parsedData[34] != '' ? parseFloat(parsedData[34]) : null,
      datetime: parsedData[37] != '' ? moment(`${parsedData[37]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[38] != '' ? parseInt(parsedData[38],10) : null,
      mnc: parsedData[39] != '' ? parseInt(parsedData[39],10) : null,
      lac: parsedData[40] != '' ? parseInt(parsedData[40],16) : null,
      cid: parsedData[41] != '' ? parseInt(parsedData[41],16) : null,
      odometer: null,
      hourmeter: null,
      can: {
        comunicationOk: parsedData[5] === '1',
        vin: parsedData[7] != '' ? parsedData[7] : null,
        ignitionKey: parsedData[8] != '' ? parseInt(parsedData[8],10) : null,
        distance: parsedData[9],
        fuelUsed: parsedData[10], //float
        rpm: parsedData[11], //int
        speed: parsedData[12] != '' ? parseFloat(parsedData[12]) : null,
        coolantTemp: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
        fuelConsumption: parsedData[14],
        fuelLevel: parsedData[15],
        range: parsedData[16],
        acceleratorPressure: parsedData[17],
        engineHours: parsedData[18],
        drivingTime: parsedData[19],
        idleTime: parsedData[20],
        idleFuelUsed: parsedData[21],
        axleWight: parsedData[22],
        tachograph: parsedData[23],
        detailedInfo: parsedData[24],
        lights: parsedData[25],
        doors: parsedData[26],
        overSpeedTime: parsedData[27],
        overSpeedEngineTime: parsedData[28]
      }
    });
  }
  else{
    extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  //Check gps data
  if (data.loc !== null && typeof data.loc !== 'undefined') {
    if(data.loc.coordinates[0] === 0 ||  isNaN(data.loc.coordinates[0]) || data.loc.coordinates[1] === 0 || isNaN(data.loc.coordinates[1])){
      data.loc = null;
    }
  }
  return data;
};


/*
  Parses messages data from GV300 devices
*/
const getGV300 = raw => {
  raw = raw.substr(0, raw.length - 1);

  const parsedData = raw.split(',');
  const command = parsedData[0].split(':');

  let history = false;
  if(patterns.buffer.test(command[0])){
    history = true;
  }

  const data = {
    raw: `${raw.toString()}$`,
    manufacturer: 'queclink',
    device: 'Queclink-GV300',
    type: 'data',
    imei: parsedData[2],
    protocolVersion: getProtocolVersion(parsedData[1]),
    temperature: null,
    history: history,
    sentTime: moment(`${parsedData[parsedData.length - 2]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
    serialId: parseInt(parsedData[parsedData.length - 1],16)
  };

  // GPS
  if (command[1] === 'GTFRI') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]): null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: {
        raw: parsedData[24],
        sos: utils.hex2bin(parsedData[24].substring(2,4))[1] === '1',
        tow: utils.hex2bin(parsedData[24].substring(0,1)) === '16',
        input: {
          '1': utils.hex2bin(parsedData[24].substring(2,4))[0] === '1',
          '2': utils.hex2bin(parsedData[24].substring(2,4))[1] === '1',
          '3': utils.hex2bin(parsedData[24].substring(2,4))[2] === '1',
          '4': utils.hex2bin(parsedData[24].substring(2,4))[3] === '1'
        },
        output: {
          '1': utils.hex2bin(parsedData[24].substring(4,6))[0] === '1',
          '2': utils.hex2bin(parsedData[24].substring(4,6))[1] === '1',
          '3': utils.hex2bin(parsedData[24].substring(4,6))[2] === '1'
        },
        charge: parseFloat(parsedData[4]) > 5
      },
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21]): null,
        adb: parsedData[22] != '' ? parseFloat(parsedData[22]): null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]) : null,
      hourmeter: parsedData[20]
    });
  }
  //Heartbeat. It must response an ACK command
  else if (command[1] === 'GTHBD'){
    extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  // Common Alarms
  else if (command[1] === 'GTTOW' || command[1] === 'GTDIS' || command[1] === 'GTIOB' ||
      command[1] === 'GTSPD' || command[1] === 'GTSOS' || command[1] === 'GTRTL' ||
      command[1] === 'GTDOG' || command[1] === 'GTIGL' || command[1] === 'GTHBM') {

    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [parseFloat(parsedData[11]), parseFloat(parsedData[12])] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]) : null,
      hourmeter: null
    });
  }
  //External low battery and Low voltage for analog input
  else if (command[1] === 'GTEPS' || command[1] === 'GTAIS') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21]): null,
        adb: parsedData[22] != '' ? parseFloat(parsedData[22]): null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]) : null,
      hourmeter: parsedData[20]
    });
  }
  //Event report (It uses the last GPS data and MCC info)
  else if(command[1] === 'GTPNA' || command[1] === 'GTPFA' || command[1] === 'GTPDP') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: null,
      speed: null,
      gpsStatus: null,
      hdop: null,
      status: null,
      azimuth: null,
      altitude: null,
      datetime: parsedData[4] != '' ? moment(`${parsedData[4]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
      },
      mcc: null,
      mnc: null,
      lac: null,
      cid: null,
      odometer: null,
      hourmeter: null
    });
  }
  else if(command[1] === 'GTMPN' || command[1] === 'GTMPF' || command[1] === 'GTCRA' || command[1] === 'GTJDR') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[8]), parseFloat(parsedData[9])]},
      speed: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[8]), parseFloat(parsedData[9])),
      hdop: parsedData[4] != '' ? parseFloat(parsedData[4]) : null,
      status: null,
      azimuth: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      altitude: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      datetime: parsedData[10] != '' ? moment(`${parsedData[10]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[11] != '' ? parseInt(parsedData[11],10) : null,
      mnc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      lac: parsedData[13] != '' ? parseInt(parsedData[13],16) : null,
      cid: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTJDS' || command[1] === 'GTANT' || command[1] === 'GTRMD') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTBPL') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTIGN' || command[1] === 'GTIGF') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null,
      hourmeter: parsedData[17]
    });
  }
  else if (command[1] === 'GTIDN' || command[1] === 'GTIDF') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] != '' ? moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTSTR' || command[1] === 'GTSTP' || command[1] === 'GTLSP') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] != '' ? moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null,
      hourmeter: null
    });
  }
  // Motion State Changed
  else if(command[1] === 'GTSTT'){
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  //GPS Status
  else if(command[1] === 'GTGSS'){
    extend(data, {
      alarm: getAlarm(command[1], command[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[12]), parseFloat(parsedData[13])]},
      speed: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[12]), parseFloat(parsedData[13])),
      hdop: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      status: null,
      azimuth: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] != '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] != '' ? moment(`${parsedData[14]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      mnc: parsedData[16] != '' ? parseInt(parsedData[16],10) : null,
      lac: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      cid: parsedData[18] != '' ? parseInt(parsedData[18],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  //iButton
  else if(command[1] === 'GTIDA'){
    extend(data,{
      alarm: getAlarm(command[1], `${parsedData[5]},${parsedData[6]}`),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[12]), parseFloat(parsedData[13])]},
      speed: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[12]), parseFloat(parsedData[13])),
      hdop: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      status: null,
      azimuth: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] != '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] != '' ? moment(`${parsedData[14]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      mnc: parsedData[16] != '' ? parseInt(parsedData[16],10) : null,
      lac: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      cid: parsedData[18] != '' ? parseInt(parsedData[18],16) : null,
      odometer: parsedData[20] != '' ? parseFloat(parsedData[20]) : null,
      hourmeter: null
    });
  }
  else{
    extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  //Check gps data
  if (data.loc !== null && typeof data.loc !== 'undefined') {
    if(data.loc.coordinates[0] === 0 ||  isNaN(data.loc.coordinates[0]) || data.loc.coordinates[1] === 0 || isNaN(data.loc.coordinates[1])){
      data.loc = null;
    }
  }
  return data;
};

/*
  Parses messages data from GV200 devices
*/
const getGV200 = raw => {
  raw = raw.substr(0, raw.length - 1);

  const parsedData = raw.split(',');
  const command = parsedData[0].split(':');

  let history = false;
  if(patterns.buffer.test(command[0])){
    history = true;
  }

  const data = {
    raw: `${raw.toString()}$`,
    manufacturer: 'queclink',
    device: 'Queclink-GV200',
    type: 'data',
    imei: parsedData[2],
    protocolVersion: getProtocolVersion(parsedData[1]),
    temperature: null,
    history: history,
    sentTime: moment(`${parsedData[parsedData.length - 2]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
    serialId: parseInt(parsedData[parsedData.length - 1],16)
  };

  // GPS
  if (command[1] === 'GTFRI') {
    try {
      extend(data, {
        alarm: getAlarm(command[1], null),
        loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
        speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
        gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
        hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
        status: { //parsedData[24]
          raw: parsedData[24]+parsedData[25],
          sos: false,
          input: {
            '4': utils.nHexDigit(utils.hex2bin(parsedData[24][1]),4)[0] === '1',
            '3': utils.nHexDigit(utils.hex2bin(parsedData[24][1]),4)[1] === '1',
            '2': utils.nHexDigit(utils.hex2bin(parsedData[24][1]),4)[2] === '1',
            '1': utils.nHexDigit(utils.hex2bin(parsedData[24][1]),4)[3] === '1'
          },
          output: {
            '4': utils.nHexDigit(utils.hex2bin(parsedData[25][1]),4)[0] === '1',
            '3': utils.nHexDigit(utils.hex2bin(parsedData[25][1]),4)[1] === '1',
            '2': utils.nHexDigit(utils.hex2bin(parsedData[25][1]),4)[2] === '1',
            '1': utils.nHexDigit(utils.hex2bin(parsedData[25][1]),4)[3] === '1'
          },
          charge: parseFloat(parsedData[4]) > 5
        },
        azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
        altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
        datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
        voltage: {
          battery: null,//percentage
          inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4])/1000 : null,
          ada: parsedData[21] != '' ? parseFloat(parsedData[21])/1000 : null,
          adb: parsedData[22] != '' ? parseFloat(parsedData[22])/1000 : null,
          adc: parsedData[23] != '' ? parseFloat(parsedData[23])/1000 : null
        },
        mcc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
        mnc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
        lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
        cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
        odometer: parsedData[19] != '' ? parseFloat(parsedData[19]) : null,
        hourmeter: parsedData[20]
      });
    } catch(err) {
      return {type: 'UNKNOWN', raw: data.raw.toString()};
    }
  }
  // GPS with AC100 Devices Connected
  else if (command[1] === 'GTERI') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[12]), parseFloat(parsedData[13]) ] },
      speed: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[12]), parseFloat(parsedData[13])),
      hdop: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      status: { //parsedData[24]
        raw: parsedData[25]+parsedData[26],
        sos: false,
        input: {
          '4': utils.nHexDigit(utils.hex2bin(parsedData[25][1]),4)[0] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[25][1]),4)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[25][1]),4)[2] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[25][1]),4)[3] === '1'
        },
        output: {
          '4': utils.nHexDigit(utils.hex2bin(parsedData[26][1]),4)[0] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[26][1]),4)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[26][1]),4)[2] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[26][1]),4)[3] === '1'
        },
        charge: parseFloat(parsedData[5]) > 5
      },
      azimuth: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] != '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] != '' ? moment(`${parsedData[14]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,//percentage
        inputCharge: parsedData[5] != '' ? parseFloat(parsedData[4])/1000 : null,
        ada: parsedData[22] != '' ? parseFloat(parsedData[22])/1000 : null,
        adb: parsedData[23] != '' ? parseFloat(parsedData[23])/1000 : null,
        adc: parsedData[24] != '' ? parseFloat(parsedData[24])/1000 : null
      },
      mcc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      mnc: parsedData[16] != '' ? parseInt(parsedData[16],10) : null,
      lac: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      cid: parsedData[18] != '' ? parseInt(parsedData[18],16) : null,
      odometer: parsedData[20] != '' ? parseFloat(parsedData[20]) : null,
      hourmeter: parsedData[21]
    });

    //External Data
    const digitFuelSensor = utils.nHexDigit(utils.hex2bin(parsedData[4]),5)[4] === '1';
    const AC100 = utils.nHexDigit(utils.hex2bin(parsedData[4]),5)[3] === '1';
    const reserved = utils.nHexDigit(utils.hex2bin(parsedData[4]),5)[2] === '1';
    const fuelLevelPercentage = utils.nHexDigit(utils.hex2bin(parsedData[4]),5)[1] === '1';
    const fuelVolume = utils.nHexDigit(utils.hex2bin(parsedData[4]),5)[0] === '1';
    const fuelSensorData = digitFuelSensor ? parsedData[28] : null;
    const ac100DevicesConnected = (AC100 &&  digitFuelSensor) ? parseInt(parsedData[29],10) : ((AC100 &&  !digitFuelSensor) ? parseInt(parsedData[28],10) : 0);


    const externalData = {
      eriMask: {
        raw: parsedData[4],
        digitFuelSensor: digitFuelSensor,
        AC100: AC100,
        reserved: reserved,
        fuelLevelPercentage: fuelLevelPercentage,
        fuelVolume: fuelVolume
      },
      uartDeviceType: uartDeviceTypes[parsedData[27]]
    };

    // Fuel Sensor
    if(parsedData[27] === '1'){
      if(digitFuelSensor && !AC100){
        extend(externalData, {
          fuelSensorData: {
            data: fuelSensorData,
            sensorType: parsedData[29],
            percentage: (fuelLevelPercentage && parsedData[30] != '') ? parseInt(parsedData[30],10) : null,
            volume: ((fuelVolume && fuelLevelPercentage) && parsedData[31] != '') ? parseInt(parsedData[31],10) : ( ((fuelVolume && !fuelLevelPercentage) && parsedData[30] != '') ? parseInt(parsedData[30],10) : null)
          },
          AC100Devices: null
        });
      }
      else if(!digitFuelSensor && AC100){
        let ac100Devices = [];
        let count = 29;
        for(var i=0; i<ac100DevicesConnected; i++){
          ac100Devices.push({
            deviceNumber: parsedData[count],
            deviceID: parsedData[count + 1],
            // deviceType: parsedData[count + 2],
            deviceData: parsedData[count + 2] ? getTempInCelciousDegrees(parsedData[count + 2]) : null
          });
          count += 3;
        }
        extend(externalData, {
          fuelSensorData: null,
          AC100Devices: ac100Devices
        });
      }
      else if(digitFuelSensor && AC100){
        let ac100Devices = [];
        let count = (fuelVolume && fuelLevelPercentage) ? 33 : ((fuelVolume && !fuelLevelPercentage) ? 32 : 31);
        for(var j=0; j<ac100DevicesConnected; j++){
          ac100Devices.push({
            deviceNumber: parsedData[count],
            deviceID: parsedData[count + 1],
            // deviceType: parsedData[count + 2],
            deviceData: parsedData[count + 2] ? getTempInCelciousDegrees(parsedData[count + 2]) : null
          });
          count += 3;
        }
        extend(externalData, {
          fuelSensorData: {
            data: fuelSensorData,
            sensorType: parsedData[30],
            percentage: (fuelLevelPercentage && parsedData[31] != '') ? parseInt(parsedData[31],10) : null,
            volume: ((fuelVolume && fuelLevelPercentage) && parsedData[32] != '') ? parseInt(parsedData[32],10) : ( ((fuelVolume && !fuelLevelPercentage) && parsedData[31] != '') ? parseInt(parsedData[31],10) : null)
          },
          AC100Devices: ac100Devices
        });
      }
    }
    //AC100 1 Wire Bus
    else if(parsedData[27] === '2'){
      if(!digitFuelSensor && AC100){
        let ac100Devices = [];
        let count = 29;
        for(var k=0; k<ac100DevicesConnected; k++){
          ac100Devices.push({
            deviceNumber: parsedData[count],
            deviceID: parsedData[count + 1],
            // deviceType: parsedData[count + 2],
            deviceData: parsedData[count + 2] ? getTempInCelciousDegrees(parsedData[count + 2]) : null
          });
          count += 3;
        }
        extend(externalData, {
          fuelSensorData: null,
          AC100Devices: ac100Devices
        });
      }
      else if(digitFuelSensor && !AC100){
        extend(externalData, {
          fuelSensorData: {
            data: fuelSensorData,
            sensorType: null,
            percentage: null,
            volume: null
          },
          AC100Devices: null
        });
      }
      else if(digitFuelSensor && AC100){
        let ac100Devices = [];
        let count = 29;
        for(var l=0; l<ac100DevicesConnected; l++){
          ac100Devices.push({
            deviceNumber: parsedData[count],
            deviceID: parsedData[count + 1],
            // deviceType: parsedData[count + 2],
            deviceData: parsedData[count + 2] ? getTempInCelciousDegrees(parsedData[count + 2]) : null
          });
          count += 3;
        }
        extend(externalData, {
          fuelSensorData: {
            data: fuelSensorData,
            sensorType: null,
            percentage: null,
            volume: null
          },
          AC100Devices: ac100Devices
        });
      }
    }
    extend(data, {
      externalData: externalData
    });
  }
  //Heartbeat. It must response an ACK command
  else if (command[1] === 'GTHBD'){
    extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  // General Info Report
  else if(command[1] === 'GTINF'){
    extend(data, {
      alarm: getAlarm(command[1], null),
      state: states[parsedData[4]],
      gsmInfo: {
        SIM_ICC: parsedData[5],
        RSSI_dBm: parsedData[6],
        RSSI_quality: parsedData[7] != '' ? 100*(parseInt(parseFloat(parsedData[7])/7,10)) : null //Percentage
      },
      backupBattery: {
        using: parsedData[10] === '1',
        voltage: parsedData[11] != '' ? parseFloat(parsedData[11]) : null,
        charging: parsedData[12] === '1'
      },
      externalGPSAntenna: parsedData[15] === '0',
      status: { //parsedData[24]
        raw: parsedData[18]+parsedData[19],
        sos: false,
        input: {
          '4': utils.nHexDigit(utils.hex2bin(parsedData[18][1]),4)[0] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[18][1]),4)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[18][1]),4)[2] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[18][1]),4)[3] === '1'
        },
        output: {
          '4': utils.nHexDigit(utils.hex2bin(parsedData[19][1]),4)[0] === '1',
          '3': utils.nHexDigit(utils.hex2bin(parsedData[19][1]),4)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[19][1]),4)[2] === '1',
          '1': utils.nHexDigit(utils.hex2bin(parsedData[19][1]),4)[3] === '1'
        },
        charge: parsedData[8] === '1'
      },
      voltage: {
        battery: parsedData[11] != '' ? parseInt(100*(parseFloat(parsedData[11])/5),10) : null,//percentage
        inputCharge: parsedData[17] != '' ? parseFloat(parsedData[17])/1000 : null,
        ada: null,
        adb: null,
        adc: null
      },
      lastFixUTCTime: parsedData[16] != '' ? moment(`${parsedData[16]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      timezoneOffset: parsedData[20]
    });
  }
  // Common Alarms
  else if (command[1] === 'GTTOW' || command[1] === 'GTDIS' || command[1] === 'GTIOB' ||
      command[1] === 'GTSPD' || command[1] === 'GTSOS' || command[1] === 'GTRTL' ||
      command[1] === 'GTDOG' || command[1] === 'GTIGL' || command[1] === 'GTHBM') {

    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [parseFloat(parsedData[11]), parseFloat(parsedData[12])] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]) : null,
      hourmeter: null
    });
  }
  //Low voltage for analog input
  else if(command[1] === 'GTAIS' || command[1] === 'GTMAI'){
    const alarm = getAlarm(command[1], parsedData[5]);
    extend(data, {
      alarm: alarm,
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,//percentage
        inputCharge: (parsedData[4] != '' && command[1] === 'GTAIS') ? parseFloat(parsedData[4]): null,
        ada: (alarm.number === 1 && parsedData[4] != '') ? parseFloat(parsedData[4])/1000 : null,
        adb: (alarm.number === 2 && parsedData[4] != '') ? parseFloat(parsedData[4])/1000 : null,
        adc: (alarm.type === 'SOS_Button' && parsedData[4] != '') ? parseFloat(parsedData[4])/1000 : null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]) : null,
      hourmeter: null
    });
  }
  //Event report (It uses the last GPS data and MCC info)
  else if(command[1] === 'GTPNA' || command[1] === 'GTPFA' || command[1] === 'GTPDP') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: null,
      speed: null,
      gpsStatus: null,
      hdop: null,
      status: null,
      azimuth: null,
      altitude: null,
      datetime: parsedData[4] != '' ? moment(`${parsedData[4]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
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
    });
  }
  else if(command[1] === 'GTMPN' || command[1] === 'GTMPF' || command[1] === 'GTBTC' || command[1] === 'GTCRA' || command[1] === 'GTJDR') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[8]), parseFloat(parsedData[9])]},
      speed: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[8]), parseFloat(parsedData[9])),
      hdop: parsedData[4] != '' ? parseFloat(parsedData[4]) : null,
      status: null,
      azimuth: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      altitude: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      datetime: parsedData[10] != '' ? moment(`${parsedData[10]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[11] != '' ? parseInt(parsedData[11],10) : null,
      mnc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      lac: parsedData[13] != '' ? parseInt(parsedData[13],16) : null,
      cid: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTJDS' || command[1] === 'GTANT' || command[1] === 'GTRMD' || command[1] === 'GTSTC') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTBPL') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTIGN' || command[1] === 'GTIGF') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null,
      hourmeter: parsedData[17]
    });
  }
  else if (command[1] === 'GTIDN' || command[1] === 'GTIDF') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] != '' ? moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTSTR' || command[1] === 'GTSTP' || command[1] === 'GTLSP') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] != '' ? moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null,
      hourmeter: null
    });
  }
  // Motion State Changed
  else if(command[1] === 'GTSTT'){
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  //GPS Status
  else if(command[1] === 'GTGSS'){
    extend(data, {
      alarm: getAlarm(command[1], command[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[12]), parseFloat(parsedData[13])]},
      speed: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[12]), parseFloat(parsedData[13])),
      hdop: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      status: null,
      azimuth: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] != '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] != '' ? moment(`${parsedData[14]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      mnc: parsedData[16] != '' ? parseInt(parsedData[16],10) : null,
      lac: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      cid: parsedData[18] != '' ? parseInt(parsedData[18],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else if(command[1] === 'GTGPJ'){
    extend(data,{
      alarm: getAlarm(command[1], command[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] != '' ? moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  //Temperature Alarm
  else if(command[1] === 'GTTMP'){
    extend(data, {
      alarm: getAlarm(command[1], parsedData[6], [parsedData[30],parsedData[32]]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[12]), parseFloat(parsedData[13]) ] },
      speed: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[12]), parseFloat(parsedData[13])),
      hdop: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      status: { //parsedData[24]
        raw: parsedData[24]+parsedData[25],
        sos: utils.hex2bin(parsedData[24][1])[1] === '1',
        input: {
          '4': utils.hex2bin(parsedData[25][1])[3] === '1',
          '3': utils.hex2bin(parsedData[25][1])[2] === '1',
          '2': utils.hex2bin(parsedData[25][1])[1] === '1',
          '1': utils.hex2bin(parsedData[25][1])[0] === '1'
        },
        output: {
          '4': utils.hex2bin(parsedData[26][1])[3] === '1',
          '3': utils.hex2bin(parsedData[26][1])[2] === '1',
          '2': utils.hex2bin(parsedData[26][1])[1] === '1',
          '1': utils.hex2bin(parsedData[26][1])[0] === '1'
        },
        charge: parseFloat(parsedData[4]) > 5
      },
      azimuth: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] != '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] != '' ? moment(`${parsedData[14]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,//percentage
        inputCharge: parsedData[5] != '' ? parseFloat(parsedData[4])/1000 : null,
        ada: parsedData[22] != '' ? parseFloat(parsedData[22])/1000 : null,
        adb: parsedData[23] != '' ? parseFloat(parsedData[23])/1000 : null,
        adc: parsedData[24] != '' ? parseFloat(parsedData[24])/1000 : null
      },
      mcc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      mnc: parsedData[16] != '' ? parseInt(parsedData[16],10) : null,
      lac: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      cid: parsedData[18] != '' ? parseInt(parsedData[18],16) : null,
      odometer: parsedData[20] != '' ? parseFloat(parsedData[20]) : null,
      hourmeter: parsedData[21]
    });
  }
  // Unusual fuel consumption
  else if(command[1] === 'GTFLA'){
    extend(data,{
      alarm: getAlarm(command[1], `${parsedData[5]},${parsedData[6]}`),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12])]},
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  //iButton
  else if(command[1] === 'GTIDA'){
    extend(data,{
      alarm: getAlarm(command[1], `${parsedData[5]},${parsedData[6]}`),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[12]), parseFloat(parsedData[13])]},
      speed: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[12]), parseFloat(parsedData[13])),
      hdop: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      status: null,
      azimuth: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] != '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] != '' ? moment(`${parsedData[14]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      mnc: parsedData[16] != '' ? parseInt(parsedData[16],10) : null,
      lac: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      cid: parsedData[18] != '' ? parseInt(parsedData[18],16) : null,
      odometer: parsedData[20] != '' ? parseFloat(parsedData[20]) : null,
      hourmeter: null
    });
  }
  else if(command[1] === 'GTCAN'){
    extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[59]), parseFloat(parsedData[60])]},
      speed: parsedData[56] != '' ? parseFloat(parsedData[56]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[59]), parseFloat(parsedData[60])),
      hdop: parsedData[55] != '' ? parseFloat(parsedData[55]) : null,
      status: null,
      azimuth: parsedData[57] != '' ? parseFloat(parsedData[57]) : null,
      altitude: parsedData[58] != '' ? parseFloat(parsedData[58]) : null,
      datetime: parsedData[61] != '' ? moment(`${parsedData[61]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[62] != '' ? parseInt(parsedData[62],10) : null,
      mnc: parsedData[63] != '' ? parseInt(parsedData[63],10) : null,
      lac: parsedData[64] != '' ? parseInt(parsedData[64],16) : null,
      cid: parsedData[65] != '' ? parseInt(parsedData[65],16) : null,
      odometer: null,
      hourmeter: null,
      can: {
        comunicationOk: parsedData[5] === '1',
        vin: parsedData[7] != '' ? parsedData[7] : null,
        ignitionKey: parsedData[8] != '' ? parseInt(parsedData[8],10) === '2' : null, //0: Ignition off, 1: Ignition on, 2: Engine on
        odometer: parsedData[9] != '' ? (parseInt(parsedData[9],10)/100)/1000 : null, //hectometers: 100 metros. Lo paso a kilometros.
        fuelUsed: parsedData[10] != '' ? parseFloat(parsedData[10]) : null, //float. Litros
        rpm: parsedData[11] != '' ? parseInt(parsedData[11],10) : null, //int
        speed: parsedData[12] != '' ? parseFloat(parsedData[12]) : null,
        coolantTemp: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
        fuelConsumption: parsedData[14],
        fuelLevel: parsedData[15],
        range: parsedData[16] != '' ? (parseInt(parsedData[16],10)/100)/1000 : null,
        acceleratorPressure: parsedData[17] != '' ? parseInt(parsedData[17],10) : null,
        engineHours: parsedData[18] != '' ? parseFloat(parsedData[18]) : null,
        drivingTime: parsedData[19] != '' ? parseFloat(parsedData[19]) : null,
        idleTime: parsedData[20] != '' ? parseFloat(parsedData[20]) : null,
        idleFuelUsed: parsedData[21] != '' ? parseFloat(parsedData[21]) : null,
        axleWight: parsedData[22] != '' ? parsedData[22] : null,
        tachograph: parsedData[23] != '' ? parsedData[23] : null,
        detailedInfo: {
          raw: parsedData[24],//Contains detailed information of vehicle
          lowFuelOn: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[0] === '1',
          seatBeltOn: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[1] === '1',
          airConditioningOn: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[2] === '1',
          cruiseControlOn: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[3] === '1',
          brakePedalOn: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[4] === '1',
          clutchPedalOn: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[5] === '1',
          handBrakeON: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[6] === '1',
          centralLockOn: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[7] === '1',
          reverseGearOn: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[8] === '1',
          runningLightsOn: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[9] === '1',
          lowBeamsOn: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[10] === '1',
          highBeamsOn: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[11] === '1',
          rearFogLightsOn: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[12] === '1',
          frontFogLightsOn: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[13] === '1',
          doorsOpened: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[14] === '1', //any door
          trunkOpened: utils.nHexDigit(utils.hex2bin(parsedData[24]),16)[15] === '1'
        },
        lights: {
          raw: parsedData[25],
          runningLightsOn: utils.nHexDigit(utils.hex2bin(parsedData[25]),8)[0] === '1',
          lowBeamsOn: utils.nHexDigit(utils.hex2bin(parsedData[25]),8)[1] === '1',
          highBeamsOn: utils.nHexDigit(utils.hex2bin(parsedData[25]),8)[2] === '1',
          frontFogOn: utils.nHexDigit(utils.hex2bin(parsedData[25]),8)[3] === '1',
          rearFogOn: utils.nHexDigit(utils.hex2bin(parsedData[25]),8)[4] === '1',
          hazardLightsOn: utils.nHexDigit(utils.hex2bin(parsedData[25]),8)[5] === '1',
          reserved1: utils.nHexDigit(utils.hex2bin(parsedData[25]),8)[6] === '1',
          reserved2: utils.nHexDigit(utils.hex2bin(parsedData[25]),8)[7] === '1'
        },
        doors: {
          raw: parsedData[26],
          driverDoorOpened: utils.nHexDigit(utils.hex2bin(parsedData[26]),8)[0] === '1',
          passengerDoorOpened: utils.nHexDigit(utils.hex2bin(parsedData[26]),8)[1] === '1',
          rearLeftDoorOpened: utils.nHexDigit(utils.hex2bin(parsedData[26]),8)[2] === '1',
          rearRightDoorOpened: utils.nHexDigit(utils.hex2bin(parsedData[26]),8)[3] === '1',
          trunkDoorOpened: utils.nHexDigit(utils.hex2bin(parsedData[26]),8)[4] === '1',
          bootDoorOpened: utils.nHexDigit(utils.hex2bin(parsedData[26]),8)[5] === '1',
          reserved1: utils.nHexDigit(utils.hex2bin(parsedData[26]),8)[6] === '1',
          reserved2: utils.nHexDigit(utils.hex2bin(parsedData[26]),8)[7] === '1'
        },
        //26
        indicators: {
          raw: parsedData[51],
          webastoOn: utils.nHexDigit(utils.hex2bin(parsedData[51]),16)[0] === '1',
          brakeFluidLow: utils.nHexDigit(utils.hex2bin(parsedData[51]),16)[1] === '1',
          coolantLow: utils.nHexDigit(utils.hex2bin(parsedData[51]),16)[2] === '1',
          batteryIndicatorOn: utils.nHexDigit(utils.hex2bin(parsedData[51]),16)[3] === '1',
          brakeSystemFailure: utils.nHexDigit(utils.hex2bin(parsedData[51]),16)[4] === '1',
          oilPressureOn: utils.nHexDigit(utils.hex2bin(parsedData[51]),16)[5] === '1',
          engineHot: utils.nHexDigit(utils.hex2bin(parsedData[51]),16)[6] === '1',
          ABSFailure: utils.nHexDigit(utils.hex2bin(parsedData[51]),16)[7] === '1',
          checkEngineOn: utils.nHexDigit(utils.hex2bin(parsedData[51]),16)[9] === '1',
          airbagIndicatorOn: utils.nHexDigit(utils.hex2bin(parsedData[51]),16)[10] === '1',
          serviceCallIndicatorOn: utils.nHexDigit(utils.hex2bin(parsedData[51]),16)[11] === '1',
          oilLow: utils.nHexDigit(utils.hex2bin(parsedData[51]),16)[12] === '1'
        },
        overSpeedTime: parsedData[27],
        overSpeedEngineTime: parsedData[28]
      }
    });
  }
  else if(command[1] === 'GTDOS'){
    extend(data,{
      alarm: getAlarm(command[1], `${parsedData[4]},${parsedData[5]}`),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] != '' ? moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null,
        adc: null
      },
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else{
    extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  //Check gps data
  if (data.loc !== null && typeof data.loc !== 'undefined') {
    if(data.loc.coordinates[0] === 0 ||  isNaN(data.loc.coordinates[0]) || data.loc.coordinates[1] === 0 || isNaN(data.loc.coordinates[1])){
      data.loc = null;
    }
  }
  return data;
};

/*
  Parses messages data from GMT100 devices
*/
const getGMT100 = raw => {
  raw = raw.substr(0, raw.length - 1);

  const parsedData = raw.split(',');
  const command = parsedData[0].split(':');

  let history = false;
  if(patterns.buffer.test(command[0])){
    history = true;
  }

  const data = {
    raw: `${raw.toString()}$`,
    manufacturer: 'queclink',
    device: 'Queclink-GMT100',
    type: 'data',
    imei: parsedData[2],
    protocolVersion: getProtocolVersion(parsedData[1]),
    temperature: null,
    history: history,
    sentTime: moment(`${parsedData[parsedData.length - 2]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
    serialId: parseInt(parsedData[parsedData.length - 1],16),
    hourmeter: null
  };

  // GPS
  if (command[1] === 'GTFRI') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: { //parsedData[24]
        raw: parsedData[24]+parsedData[25],
        sos: false,
        input: {
          '1': utils.nHexDigit(utils.hex2bin(parsedData[24]),2)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[24]),2)[0] === '1'
        },
        output: {
          '1': utils.nHexDigit(utils.hex2bin(parsedData[25]),2)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[25]),2)[0] === '1'
        },
        charge: parseFloat(parsedData[4]) > 5
      },
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4])/1000: null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21])/1000: null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10): null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10): null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]): null
    });
  }
  //Heartbeat. It must response an ACK command
  else if (command[1] === 'GTHBD'){
    extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  // General Info Report
  else if(command[1] === 'GTINF'){
    extend(data, {
      alarm: getAlarm(command[1], null),
      state: states[parsedData[4]],
      gsmInfo: {
        SIM_ICC: parsedData[5],
        RSSI_dBm: parsedData[6],
        RSSI_quality: parsedData[7] != '' ? 100*(parseInt(parseFloat(parsedData[7])/7,10)) : null //Percentage
      },
      backupBattery: {
        using: parsedData[10] === '1',
        voltage: parsedData[11] != '' ? parseFloat(parsedData[11]) : null,
        charging: parsedData[12] === '1'
      },
      externalGPSAntenna: parsedData[15] === '0',
      status: { //parsedData[24]
        raw: parsedData[18]+parsedData[19],
        sos: false,
        input: {
          '1': utils.nHexDigit(utils.hex2bin(parsedData[20]),2)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[20]),2)[0] === '1'
        },
        output: {
          '1': utils.nHexDigit(utils.hex2bin(parsedData[21]),2)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[21]),2)[0] === '1'
        },
        charge: parsedData[8] === '1'
      },
      voltage: {
        battery: parsedData[11] != '' ? parseInt(100*(parseFloat(parsedData[11])/4.5),10) : null,//percentage
        inputCharge: parsedData[9] != '' ? parseFloat(parsedData[9])/1000 : null,
        ada: parsedData[18] != '' ? parseFloat(parsedData[18])/1000: null
      },
      lastFixUTCTime: parsedData[16] != '' ? moment(`${parsedData[16]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      timezoneOffset: parsedData[22]
    });
  }
  // Common Alarms
  else if (command[1] === 'GTTOW' || command[1] === 'GTDIS' || command[1] === 'GTIOB' ||
      command[1] === 'GTSPD' || command[1] === 'GTSOS' || command[1] === 'GTRTL' ||
      command[1] === 'GTDOG' || command[1] === 'GTIGL' || command[1] === 'GTHBM') {

    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [parseFloat(parsedData[11]), parseFloat(parsedData[12])] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10): null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10): null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]): null
    });
  }
  //External low battery
  else if (command[1] === 'GTEPS') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4])/1000: null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21])/1000: null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10): null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10): null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]): null
    });
  }
  //Low voltage from analog input
  else if (command[1] === 'GTAIS'){
    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4])/1000: null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21])/1000: null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10): null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10): null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]): null
    });
  }
  //Event report (It uses the last GPS data and MCC info)
  else if(command[1] === 'GTPNA' || command[1] === 'GTPFA' || command[1] === 'GTPDP') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: null,
      speed: null,
      gpsStatus: null,
      hdop: null,
      status: null,
      azimuth: null,
      altitude: null,
      datetime: parsedData[4] != '' ? moment(`${parsedData[4]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null
      },
      mcc: null,
      mnc: null,
      lac: null,
      cid: null,
      odometer: null
    });
  }
  else if(command[1] === 'GTMPN' || command[1] === 'GTMPF' || command[1] === 'GTCRA' || command[1] === 'GTJDR') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[8]), parseFloat(parsedData[9])]},
      speed: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[8]), parseFloat(parsedData[9])),
      hdop: parsedData[4] != '' ? parseFloat(parsedData[4]) : null,
      status: null,
      azimuth: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      altitude: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      datetime: parsedData[10] != '' ? moment(`${parsedData[10]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null
      },
      mcc: parsedData[11] != '' ? parseInt(parsedData[11],10): null,
      mnc: parsedData[12] != '' ? parseInt(parsedData[12],10): null,
      lac: parsedData[13] != '' ? parseInt(parsedData[13],16) : null,
      cid: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      odometer: null
    });
  }
  else if (command[1] === 'GTJDS' || command[1] === 'GTANT' || command[1] === 'GTRMD') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10): null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10): null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null
    });
  }
  else if (command[1] === 'GTBPL') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[4] != '' ? parseFloat(parsedData[4]) : null,
        inputCharge: null,
        ada: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10): null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10): null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null
    });
  }
  else if (command[1] === 'GTIGN' || command[1] === 'GTIGF') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10): null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10): null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null
    });
  }
  else if (command[1] === 'GTIDN' || command[1] === 'GTIDF') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] != '' ? moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null
      },
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10): null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10): null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null
    });
  }
  else if (command[1] === 'GTSTR' || command[1] === 'GTSTP' || command[1] === 'GTLSP') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] != '' ? moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null
      },
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10): null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10): null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null
    });
  }
  // Motion State Changed
  else if(command[1] === 'GTSTT'){
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else{
    extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  //Check gps data
  if (data.loc !== null && typeof data.loc !== 'undefined') {
    if(data.loc.coordinates[0] === 0 ||  isNaN(data.loc.coordinates[0]) || data.loc.coordinates[1] === 0 || isNaN(data.loc.coordinates[1])){
      data.loc = null;
    }
  }
  return data;
};

/*
  Parses messages data from GV55 devices
*/
const getGV55 = raw => {
  raw = raw.substr(0, raw.length - 1);

  const parsedData = raw.split(',');
  const command = parsedData[0].split(':');

  let history = false;
  if(patterns.buffer.test(command[0])){
    history = true;
  }

  const data = {
    raw: `${raw.toString()}$`,
    manufacturer: 'queclink',
    device: 'Queclink-GV55',
    type: 'data',
    imei: parsedData[2],
    protocolVersion: getProtocolVersion(parsedData[1]),
    temperature: null,
    history: history,
    sentTime: moment(`${parsedData[parsedData.length - 2]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
    serialId: parseInt(parsedData[parsedData.length - 1],16)
  };

  // GPS
  if (command[1] === 'GTFRI') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]): null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: {
        raw: parsedData[24],
        sos: utils.nHexDigit(utils.hex2bin(parsedData[24].substring(2,4)),2)[0] === '1',
        state: states[parsedData[24].substring(0,2)],
        input: {
          '1': utils.nHexDigit(utils.hex2bin(parsedData[24].substring(2,4)),2)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[24].substring(2,4)),2)[0] === '1'
        },
        output: {
          '1': utils.nHexDigit(utils.hex2bin(parsedData[24].substring(4,6)),2)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[24].substring(4,6)),2)[0] === '1'
        },
        charge: parseFloat(parsedData[4]) > 5
      },
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4])/1000 : null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]) : null,
      hourmeter: parsedData[20]
    });
  }
  //Heartbeat. It must response an ACK command
  else if (command[1] === 'GTHBD'){
    extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  // General Info Report
  else if(command[1] === 'GTINF'){
    extend(data, {
      alarm: getAlarm(command[1], null),
      state: states[parsedData[4]],
      gsmInfo: {
        SIM_ICC: parsedData[5],
        RSSI_dBm: parsedData[6],
        RSSI_quality: parsedData[7] != '' ? 100*(parseInt(parseFloat(parsedData[7])/7,10)) : null //Percentage
      },
      backupBattery: {
        using: parsedData[10] === '1',
        voltage: parsedData[11] != '' ? parseFloat(parsedData[11]) : null,
        charging: parsedData[12] === '1'
      },
      externalGPSAntenna: parsedData[15] === '0',
      status: { //parsedData[24]
        raw: parsedData[18]+parsedData[19],
        sos: false,
        input: {
          '1': utils.nHexDigit(utils.hex2bin(parsedData[20]),2)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[20]),2)[0] === '1'
        },
        output: {
          '1': utils.nHexDigit(utils.hex2bin(parsedData[21]),2)[1] === '1',
          '2': utils.nHexDigit(utils.hex2bin(parsedData[21]),2)[0] === '1'
        },
        charge: parsedData[8] === '1'
      },
      voltage: {
        battery: parsedData[11] != '' ? parseInt(100*(parseFloat(parsedData[11])/5),10) : null,//percentage
        inputCharge: parsedData[9] != '' ? parseFloat(parsedData[9])/1000 : null
      },
      lastFixUTCTime: parsedData[16] != '' ? moment(`${parsedData[16]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      timezoneOffset: parsedData[22]
    });
  }
  // Common Alarms
  else if (command[1] === 'GTTOW' || command[1] === 'GTDIS' || command[1] === 'GTIOB' ||
      command[1] === 'GTSPD' || command[1] === 'GTSOS' || command[1] === 'GTRTL' ||
      command[1] === 'GTDOG' || command[1] === 'GTIGL' || command[1] === 'GTHBM') {

    extend(data, {
      alarm: getAlarm(command[1], parsedData[5], true),
      loc: { type: 'Point', coordinates: [parseFloat(parsedData[11]), parseFloat(parsedData[12])] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]) : null,
      hourmeter: null
    });
  }
  //External low battery and Low voltage for analog input
  else if (command[1] === 'GTEPS' || command[1] === 'GTAIS') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: null,
      azimuth: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      altitude: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      datetime: parsedData[13] != '' ? moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4])/1000 : null
      },
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]) : null,
      hourmeter: parsedData[20]
    });
  }
  //Event report (It uses the last GPS data and MCC info)
  else if(command[1] === 'GTPNA' || command[1] === 'GTPFA' || command[1] === 'GTPDP') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: null,
      speed: null,
      gpsStatus: null,
      hdop: null,
      status: null,
      azimuth: null,
      altitude: null,
      datetime: parsedData[4] != '' ? moment(`${parsedData[4]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
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
    });
  }
  else if(command[1] === 'GTMPN' || command[1] === 'GTMPF' || command[1] === 'GTCRA' || command[1] === 'GTJDR') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[8]), parseFloat(parsedData[9])]},
      speed: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[8]), parseFloat(parsedData[9])),
      hdop: parsedData[4] != '' ? parseFloat(parsedData[4]) : null,
      status: null,
      azimuth: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      altitude: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      datetime: parsedData[10] != '' ? moment(`${parsedData[10]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null
      },
      mcc: parsedData[11] != '' ? parseInt(parsedData[11],10) : null,
      mnc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      lac: parsedData[13] != '' ? parseInt(parsedData[13],16) : null,
      cid: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTJDS' || command[1] === 'GTANT' || command[1] === 'GTRMD') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTBPL') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        inputCharge: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTIGN' || command[1] === 'GTIGF') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null,
      hourmeter: parsedData[17]
    });
  }
  else if (command[1] === 'GTIDN' || command[1] === 'GTIDF') {
    extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] != '' ? moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null
      },
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTSTR' || command[1] === 'GTSTP' || command[1] === 'GTLSP') {
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      status: null,
      azimuth: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      altitude: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      datetime: parsedData[12] != '' ? moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null
      },
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10) : null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null,
      hourmeter: null
    });
  }
  // Motion State Changed
  else if(command[1] === 'GTSTT'){
    extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parsedData[6] != '' ? parseFloat(parsedData[6]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parsedData[5] != '' ? parseFloat(parsedData[5]) : null,
      status: null,
      azimuth: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      altitude: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      datetime: parsedData[11] != '' ? moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10) : null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10) : null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  //GPS Status
  else if(command[1] === 'GTGSS'){
    extend(data, {
      alarm: getAlarm(command[1], command[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[12]), parseFloat(parsedData[13])]},
      speed: parsedData[9] != '' ? parseFloat(parsedData[9]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[12]), parseFloat(parsedData[13])),
      hdop: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      status: null,
      azimuth: parsedData[10] != '' ? parseFloat(parsedData[10]) : null,
      altitude: parsedData[11] != '' ? parseFloat(parsedData[11]) : null,
      datetime: parsedData[14] != '' ? moment(`${parsedData[14]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate() : null,
      voltage: {
        battery: null,
        inputCharge: null
      },
      mcc: parsedData[15] != '' ? parseInt(parsedData[15],10) : null,
      mnc: parsedData[16] != '' ? parseInt(parsedData[16],10) : null,
      lac: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      cid: parsedData[18] != '' ? parseInt(parsedData[18],16) : null,
      odometer: null,
      hourmeter: null
    });
  }
  else{
    extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  //Check gps data
  if (data.loc !== null && typeof data.loc !== 'undefined') {
    if(data.loc.coordinates[0] === 0 ||  isNaN(data.loc.coordinates[0]) || data.loc.coordinates[1] === 0 || isNaN(data.loc.coordinates[1])){
      data.loc = null;
    }
  }
  return data;
};

/*
  Returns the ack command
*/
const getAckCommand = (raw, lang) => {
  const messages = langs[lang] || langs['es'];
  const rawData = raw.substr(0, raw.length - 1);
  const parsedData = rawData.split(',');
  const command = parsedData[0].split(':');

  let data = {
    manufacturer: 'queclink',
    device: 'Queclink-COMMAND-OK',
    type: 'ok',
    serial: parsedData[parsedData.length -3] != '' ? parseInt(utils.hex2dec(parsedData[parsedData.length -3]), 10): null,
    counter: parseInt(utils.hex2dec(parsedData[parsedData.length -1]), 10)
  };
  if (command[1] === 'GTSPD'){
    data.command = 'SETOVERSPEEDALARM';
  }
  else if(command[1] === 'GTOUT'){
    data.command = 'SETIOSWITCH';
  }
  else if (command[1] === 'GTRTO'){
    if(parsedData[4] === 'RESET'){
      data.command = 'CLEARBUF';
    }
    else if(parsedData[4] === 'REBOOT'){
      data.command = 'REBOOT';
    }
  }
  else if(command[1] === 'GTJBS'){
    data.command = 'ANTIJAMMER';
  }
  data.message = messages[data.command] || messages.default;
  return data;
};

/*
  Parses the Websocket command into Queclink Command
*/
const parseCommand = data => {
  let command = '';
  const password = data.password || '000000';
  const serial = data.serial || 0;
  const serialId = utils.nHexDigit(utils.dec2hex(serial),4);

  let state, digit, port, max_speed, interval, validity, mode, prevOutputs, prevDurations, prevToggles;

  //Digital Outputs
  if (/^[1-4]{1}_(on|off)$/.test(data.instruction)) {
    let _data = data.instruction.split('_');
    port = parseInt(_data[0],10);
    state = _data[1];
    prevOutputs = data.previousOutput || {'1': false, '2': false, '3': false, '4': false};
    prevDurations = data.previousDuration || {'1': 0, '2': 0, '3': 0, '4': 0};
    prevToggles = data.previousToggle || {'1': 0, '2': 0, '3': 0, '4': 0};
    const outputs = Object.keys(prevOutputs).map(key => prevOutputs[key] === true ? 1 : 0);
    outputs[0] = !outputs[0] ? 0: outputs[0];
    outputs[1] = !outputs[1] ? 0: outputs[1];
    outputs[2] = !outputs[2] ? 0: outputs[2];
    outputs[3] = !outputs[3] ? 0: outputs[3];
    digit = state === 'on' ? 1 : 0;
    outputs[port-1] = digit;
    const do1 = `${outputs[0]},${prevDurations['1']},${prevToggles['1']}`;
    const do2 = `${outputs[1]},${prevDurations['2']},${prevToggles['2']}`;
    const do3 = `${outputs[2]},${prevDurations['3']},${prevToggles['3']}`;
    const do4 = `${outputs[3]},${prevDurations['4']},${prevToggles['4']}`;
    const longOperation = (data.longOperation || false) ? '1' : '0';
    const dosReport = (data.dosReport || false) ? '1' : '0';
    if (data.device_serie === 'GV'){
      command = `AT+GTOUT=${password},${do1},${do2},${do3},${do4},${longOperation},${dosReport},,,${serialId}$`;
    }
    else if(data.device_serie === 'GMT'){
      command = `AT+GTOUT=${password},${do1},0,0,0,,,,,,,,${serialId}$`;
    }
    else{
      command = `AT+GTOUT=${password},${do1},${do2},${do3},${do4},${longOperation},${dosReport},,,${serialId}$`;
    }
  }
  else if (data.instruction === 'clear_mem') {
    if (data.device_serie === 'GV'){
      command = `AT+GTRTO=${password},4,BUF,,,,,${serialId}$`;
    }
    else if(data.device_serie === 'GMT'){
      command = `AT+GTRTO=${password},D,,,,,,${serialId}$`;
    }
    else{
      command = `AT+GTRTO=${password},4,BUF,,,,,${serialId}$`;
    }
  }
  else if (/^set_speed_(on|off)(E)?$/.test(data.instruction)) {
    max_speed = data.speed || 100;
    state = data.instruction.split('_')[2];
    validity = data.times || 10;
    interval = data.interval || 300;
    mode = /on(E)?/.test(state) ? 4 : 0;
    if (data.device_serie === 'GMT'){
      mode = /on(E)?/.test(state) ? 3 : 0;
    }
    command = `AT+GTSPD=${password},${mode},0,${max_speed},${validity},${interval},0,0,0,0,,,,,,,,,,,,${serialId}$`;
  }
  else if(data.instruction === 'Custom'){
    command = data.command;
  }
  else if (/^reboot$/.test(data.instruction)) {
    command = `AT+GTRTO=${password},3,,,,,,${serialId}$`;
  }
  else if(data.instruction === 'set_driver'){
    command = `AT+GTIDA=${password},1,1,1,${data.driverID},30,3,,,,,1,0,0,0,,,,,${serialId}$`;
  }
  //Jammer configuration
  else if(data.instruction === 'jamming_detection_configuration'){
    mode = data.mode || '2'; //Modes: 1:JDS, 2:JDR, 0:Disabled
    command = `AT+GTJDC=${password},${mode},25,,5,10,10,,0,0,0,0,,${serialId}$`;
  }
  else if(data.instruction === 'jamming_behavior_settings'){
    mode = data.mode || '1';//Modes: 0:Disable, 1:Enable
    max_speed = data.speed || '30';
    command = `AT+GTJBS=${password},${mode},,10,10,60,30,3600,1,${max_speed},120,,,,${serialId}$`;
  }
  else if(data.instruction === 'jamming_gps_configuration'){
    mode = data.mode || '1';//Modes: 0:Disable, 1:Enable
    command = `AT+GTGPJ=${password},${mode},15,3,,,,,0,0,0,0,,${serialId}$`;
  }
  //Temperature Alarm
  else if (/^temp_alarm_(on|off)(E)?$/.test(data.instruction)) {
    let _data = data.instruction.split('_');
    state = _data[2];
    mode = /on(E)?/.test(state) ? 3 : 0;
    const alarmId = data.alarmId || 0;
    const sensorId = data.sensorId || '0000000000000000';
    const minTemp = data.minTemp || 0;
    const maxTemp = data.maxTemp || 0;
    command = `AT+GTTMP=${password},${alarmId},${mode},${sensorId},,,${minTemp},${maxTemp},,,2,10,,,0,0,0,0,,,,,${serialId}$`;
  }
  return command;
};


module.exports = {
  parse: parse,
  isQueclink: isQueclink,
  isHeartBeat: isHeartBeat,
  getAckHeartBeat: getAckHeartBeat,
  parseCommand: parseCommand,
  getRebootCommand: getRebootCommand,
  getImei: getImei
};
