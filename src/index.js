'use strict';

const moment = require('moment');
const _ = require('lodash');
const utils = require('./utils.js');


const patterns = {
  message: /^\+RESP/,
  ack: /^\+ACK/,
  buffer: /^\+BUFF/,
  heartbeat: /^\+ACK:GTHBD/
};

const devices = {
  '25': 'GV300',
  '06': 'GV300',
  '08': 'GMT100',
  '04': 'GV200',
  '35': 'GV200',
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
const getAckHeartBeat = count => {
  return `+SACK:GTHBD,,${count}$`;
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
  Parses the raw data
*/
const parse = raw => {
  let result = {type: 'UNKNOWN', raw: raw.toString()};
  const device = getDevice(raw.toString());
  if (patterns.ack.test(raw.toString()) && !patterns.heartbeat.test(raw.toString())) {
    result = getAckCommand(raw.toString());
  }
  else if (device === 'GV300') {
    result = getGV300(raw.toString());
  }
  else if (device === 'GV200'){
    result = getGV200(raw.toString());
  }
  else if (device === 'GMT100') {
    result = getGMT100(raw.toString());
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
  if(lng != 0 && lat != 0){
    return true;
  }
  return false;
};

/*
  Gets the alarm type
*/
const getAlarm = (command, report) => {
  if(command === 'GTFRI' || command === 'GTERI'){
    return {type: 'Gps'};
  }
  else if(command === 'GTDIS'){
    const reportID = parseInt(report[0],10);
    const reportType = parseInt(report[1],10);
    return {type: 'DI', number: reportID, status: reportType === 1};
  }
  else if(command === 'GTTOW'){
    return {type: 'Towing'};
  }
  else if(command === 'GTSOS'){
    return {type: 'SOS_Button'};
  }
  else if(command === 'GTSPD'){
    const reportType = parseInt(report[1],10);
    return {type: 'Over_Speed', status: reportType === 0};
  }
  else if (command === 'GTIGL'){
    const reportType = parseInt(report[1],16);
    return {type: 'DI', number: 1, status: reportType === 0};
  }
  else if (command === 'GTIGN'){
    return {type: 'DI', number: 1, status: true, duration: report};
  }
  else if (command === 'GTIGF'){
    return {type: 'DI', number: 1, status: false, duration: report};
  }
  else if(command === 'GTPNA'){
    return {type: 'Power', status: true};
  }
  else if(command === 'GTPFA'){
    return {type: 'Power', status: false};
  }
  else if(command === 'GTMPN'){
    return {type: 'Charge', status: true};
  }
  else if(command === 'GTMPF'){
    return {type: 'Charge', status: false};
  }
  else if(command === 'GTBPL'){
    return {type: 'Low_Battery'};
  }
  else if(command === 'GTIDN'){
    return {type: 'Idling', status: true};
  }
  else if(command === 'GTIDF'){
    return {type: 'Idling', status: false, duration: report };
  }
  else if(command === 'GTJDR'){
    return {type: 'Jamming', status: true};
  }
  else if(command === 'GTJDS'){
    return {type: 'Jamming', status: report === '2'};
  }
  else if(command === 'GTEPS'){
    return {type: 'External_Low_battery'};
  }
  else if(command === 'GTAIS'){
    const reportID = parseInt(report[0],10);
    const reportType = parseInt(report[1],10);
    return {type: 'AI', number: reportID , status: reportType === '0'};
  }
  else if(command === 'GTANT'){
    return {type: 'GPS_Antena', status: report === '0'};
  }
  else if(command === 'GTSTR'){
    return {type:'Vehicle_Start_Status', status: true };
  }
  else if(command === 'GTSTP' || command === 'GTLSP'){
    return {type:'Vehicle_Start_Status', status: false };
  }
  else if(command === 'GTRMD'){
    return {type: 'Roaming', status: !report === '1'};
  }
  else if(command === 'GTHBD'){
    return {type: 'Heartbeat'};
  }
  else{
    return {type: command};
  }
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
    device: 'Queclink-GV300',
    type: 'data',
    imei: parsedData[2],
    protocolVersion: getProtocolVersion(parsedData[1]),
    temperature: null,
    history: history,
    sentTime: moment(`${parsedData[parsedData.length - 2]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
    serialId: parseInt(parsedData[parsedData.length - 1],10)
  };

  // GPS
  if (command[1] === 'GTFRI') {
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parseFloat(parsedData[8]),
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parseFloat(parsedData[7]),
      status: { //parsedData[24]
        raw: parsedData[24],
        sos: false,
        input: {
          '1': parsedData[24][0] === '1',
          '2': parsedData[24][1] === '1',
          '3': parsedData[24][6] === '1',
          '4': parsedData[24][7] === '1'
        },
        output: {
          '1': parsedData[24][2] === '1',
          '2': parsedData[24][3] === '1',
          '3': parsedData[24][8] === '1',
          '4': parsedData[24][9] === '1'
        },
        charge: parseFloat(parsedData[4]) > 5
      },
      azimuth: parsedData[9],
      altitude: parseFloat(parsedData[10]),
      datetime: moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21]): null,
        adb: parsedData[22] != '' ? parseFloat(parsedData[22]): null
      },
      mcc: parsedData[14],
      mnc: parsedData[15],
      lac: parseInt(parsedData[16],10),
      cid: parseInt(parsedData[17],10),
      odometer: parseFloat(parsedData[19]),
      hourmeter: parsedData[20]
    });
  }
  //Heartbeat. It must response an ACK command
  else if (command[1] === 'GTHBD'){
    _.extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  // Common Alarms
  else if (command[1] === 'GTTOW' || command[1] === 'GTDIS' || command[1] === 'GTIOB' ||
      command[1] === 'GTSPD' || command[1] === 'GTSOS' || command[1] === 'GTRTL' ||
      command[1] === 'GTDOG' || command[1] === 'GTIGL' || command[1] === 'GTHBM') {

    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [parseFloat(parsedData[11]), parseFloat(parsedData[12])] },
      speed: parseFloat(parsedData[8]),
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parseFloat(parsedData[7]),
      status: null,
      azimuth: parsedData[9],
      altitude: parseFloat(parsedData[10]),
      datetime: moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[14],
      mnc: parsedData[15],
      lac: parseInt(parsedData[16],10),
      cid: parseInt(parsedData[17],10),
      odometer: parseFloat(parsedData[19]),
      hourmeter: null
    });
  }
  //External low battery and Low voltage for analog input
  else if (command[1] === 'GTEPS' || command[1] === 'GTAIS') {
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parseFloat(parsedData[8]),
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parseFloat(parsedData[7]),
      status: null,
      azimuth: parsedData[9],
      altitude: parseFloat(parsedData[10]),
      datetime: moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21]): null,
        adb: parsedData[22] != '' ? parseFloat(parsedData[22]): null
      },
      mcc: parsedData[14],
      mnc: parsedData[15],
      lac: parseInt(parsedData[16],10),
      cid: parseInt(parsedData[17],10),
      odometer: parseFloat(parsedData[19]),
      hourmeter: parsedData[20]
    });
  }
  //Event report (It uses the last GPS data and MCC info)
  else if(command[1] === 'GTPNA' || command[1] === 'GTPFA' || command[1] === 'GTPDP') {
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: null,
      speed: null,
      gpsStatus: null,
      hdop: null,
      status: null,
      azimuth: null,
      altitude: null,
      datetime: moment(`${parsedData[4]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
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
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[8]), parseFloat(parsedData[9])]},
      speed: parseFloat(parsedData[5]),
      gpsStatus: checkGps(parseFloat(parsedData[8]), parseFloat(parsedData[9])),
      hdop: parseFloat(parsedData[4]),
      status: null,
      azimuth: parsedData[6],
      altitude: parseFloat(parsedData[7]),
      datetime: moment(`${parsedData[10]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[11],
      mnc: parsedData[12],
      lac: parseInt(parsedData[13],10),
      cid: parseInt(parsedData[14],10),
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTJDS' || command[1] === 'GTANT' || command[1] === 'GTRMD') {
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parseFloat(parsedData[6]),
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parseFloat(parsedData[5]),
      status: null,
      azimuth: parsedData[7],
      altitude: parseFloat(parsedData[8]),
      datetime: moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12],
      mnc: parsedData[13],
      lac: parseInt(parsedData[14],10),
      cid: parseInt(parsedData[15],10),
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTBPL') {
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parseFloat(parsedData[6]),
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parseFloat(parsedData[5]),
      status: null,
      azimuth: parsedData[6],
      altitude: parseFloat(parsedData[7]),
      datetime: moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12],
      mnc: parsedData[13],
      lac: parseInt(parsedData[14],10),
      cid: parseInt(parsedData[15],10),
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTIGN' || command[1] === 'GTIGF') {
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parseFloat(parsedData[6]),
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parseFloat(parsedData[5]),
      status: null,
      azimuth: parsedData[7],
      altitude: parseFloat(parsedData[8]),
      datetime: moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12],
      mnc: parsedData[13],
      lac: parseInt(parsedData[14],10),
      cid: parseInt(parsedData[15],10),
      odometer: parseFloat(parsedData[18]),
      hourmeter: parsedData[17]
    });
  }
  else if (command[1] === 'GTIDN' || command[1] === 'GTIDF') {
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parseFloat(parsedData[7]),
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parseFloat(parsedData[5]),
      status: null,
      azimuth: parsedData[8],
      altitude: parseFloat(parsedData[9]),
      datetime: moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[13],
      mnc: parsedData[14],
      lac: parseInt(parsedData[15],10),
      cid: parseInt(parsedData[16],10),
      odometer: parseFloat(parsedData[18]),
      hourmeter: null
    });
  }
  else if (command[1] === 'GTSTR' || command[1] === 'GTSTP' || command[1] === 'GTLSP') {
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parseFloat(parsedData[7]),
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parseFloat(parsedData[6]),
      status: null,
      azimuth: parsedData[8],
      altitude: parseFloat(parsedData[9]),
      datetime: moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[13],
      mnc: parsedData[14],
      lac: parseInt(parsedData[15],10),
      cid: parseInt(parsedData[16],10),
      odometer: parseFloat(parsedData[18]),
      hourmeter: null
    });
  }
  else{
    _.extend(data, {
      alarm: getAlarm(command[1], null)
    });
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
    device: 'Queclink-GV200',
    type: 'data',
    imei: parsedData[2],
    protocolVersion: getProtocolVersion(parsedData[1]),
    temperature: null,
    history: history,
    sentTime: moment(`${parsedData[parsedData.length - 2]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
    serialId: parseInt(parsedData[parsedData.length - 1],10)
  };

  // GPS
  if (command[1] === 'GTFRI') {
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parseFloat(parsedData[8]),
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parseFloat(parsedData[7]),
      status: { //parsedData[24]
        raw: parsedData[24]+parsedData[25],
        sos: false,
        input: {
          '1': utils.hex2bin(parsedData[24][1])[3] === '1',
          '2': utils.hex2bin(parsedData[24][1])[2] === '1',
          '3': utils.hex2bin(parsedData[24][1])[1] === '1',
          '4': utils.hex2bin(parsedData[24][1])[0] === '1'
        },
        output: {
          '1': utils.hex2bin(parsedData[25][1])[3] === '1',
          '2': utils.hex2bin(parsedData[25][1])[2] === '1',
          '3': utils.hex2bin(parsedData[25][1])[1] === '1',
          '4': utils.hex2bin(parsedData[25][1])[0] === '1'
        },
        charge: parseFloat(parsedData[4]) > 5
      },
      azimuth: parsedData[9],
      altitude: parseFloat(parsedData[10]),
      datetime: moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21]): null,
        adb: parsedData[22] != '' ? parseFloat(parsedData[22]): null,
        adc: parsedData[23] != '' ? parseFloat(parsedData[23]): null
      },
      mcc: parsedData[14],
      mnc: parsedData[15],
      lac: parseInt(parsedData[16],10),
      cid: parseInt(parsedData[17],10),
      odometer: parseFloat(parsedData[19]),
      hourmeter: parsedData[20]
    });
  }
  //Heartbeat. It must response an ACK command
  else if (command[1] === 'GTHBD'){
    _.extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  // Common Alarms
  else if (command[1] === 'GTTOW' || command[1] === 'GTDIS' || command[1] === 'GTIOB' ||
      command[1] === 'GTSPD' || command[1] === 'GTSOS' || command[1] === 'GTRTL' ||
      command[1] === 'GTDOG' || command[1] === 'GTIGL' || command[1] === 'GTHBM') {

    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [parseFloat(parsedData[11]), parseFloat(parsedData[12])] },
      speed: parseFloat(parsedData[8]),
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parseFloat(parsedData[7]),
      status: null,
      azimuth: parsedData[9],
      altitude: parseFloat(parsedData[10]),
      datetime: moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[14],
      mnc: parsedData[15],
      lac: parseInt(parsedData[16],10),
      cid: parseInt(parsedData[17],10),
      odometer: parseFloat(parsedData[19]),
      hourmeter: null
    });
  }
  //External low battery
  else if (command[1] === 'GTEPS') {
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parseFloat(parsedData[8]),
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parseFloat(parsedData[7]),
      status: null,
      azimuth: parsedData[9],
      altitude: parseFloat(parsedData[10]),
      datetime: moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21]): null,
        adb: parsedData[22] != '' ? parseFloat(parsedData[22]): null
      },
      mcc: parsedData[14],
      mnc: parsedData[15],
      lac: parseInt(parsedData[16],10),
      cid: parseInt(parsedData[17],10),
      odometer: parseFloat(parsedData[19]),
      hourmeter: parsedData[20]
    });
  }
  //Low voltage for analog input
  else if(command[1] === 'GTAIS'){
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parseFloat(parsedData[8]),
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parseFloat(parsedData[7]),
      status: null,
      azimuth: parsedData[9],
      altitude: parseFloat(parsedData[10]),
      datetime: moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21]): null,
        adb: parsedData[22] != '' ? parseFloat(parsedData[22]): null
      },
      mcc: parsedData[14],
      mnc: parsedData[15],
      lac: parseInt(parsedData[16],10),
      cid: parseInt(parsedData[17],10),
      odometer: parseFloat(parsedData[19]),
      hourmeter: parsedData[20]
    });
  }
  //Event report (It uses the last GPS data and MCC info)
  else if(command[1] === 'GTPNA' || command[1] === 'GTPFA' || command[1] === 'GTPDP') {
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: null,
      speed: null,
      gpsStatus: null,
      hdop: null,
      status: null,
      azimuth: null,
      altitude: null,
      datetime: moment(`${parsedData[4]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
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
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[8]), parseFloat(parsedData[9])]},
      speed: parseFloat(parsedData[5]),
      gpsStatus: checkGps(parseFloat(parsedData[8]), parseFloat(parsedData[9])),
      hdop: parseFloat(parsedData[4]),
      status: null,
      azimuth: parsedData[6],
      altitude: parseFloat(parsedData[7]),
      datetime: moment(`${parsedData[10]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[11],
      mnc: parsedData[12],
      lac: parseInt(parsedData[13],10),
      cid: parseInt(parsedData[14],10),
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTJDS' || command[1] === 'GTANT' || command[1] === 'GTRMD') {
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parseFloat(parsedData[6]),
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parseFloat(parsedData[5]),
      status: null,
      azimuth: parsedData[7],
      altitude: parseFloat(parsedData[8]),
      datetime: moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12],
      mnc: parsedData[13],
      lac: parseInt(parsedData[14],10),
      cid: parseInt(parsedData[15],10),
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTBPL') {
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parseFloat(parsedData[6]),
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parseFloat(parsedData[5]),
      status: null,
      azimuth: parsedData[6],
      altitude: parseFloat(parsedData[7]),
      datetime: moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12],
      mnc: parsedData[13],
      lac: parseInt(parsedData[14],10),
      cid: parseInt(parsedData[15],10),
      odometer: null,
      hourmeter: null
    });
  }
  else if (command[1] === 'GTIGN' || command[1] === 'GTIGF') {
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parseFloat(parsedData[6]),
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parseFloat(parsedData[5]),
      status: null,
      azimuth: parsedData[7],
      altitude: parseFloat(parsedData[8]),
      datetime: moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12],
      mnc: parsedData[13],
      lac: parseInt(parsedData[14],10),
      cid: parseInt(parsedData[15],10),
      odometer: parseFloat(parsedData[18]),
      hourmeter: parsedData[17]
    });
  }
  else if (command[1] === 'GTIDN' || command[1] === 'GTIDF') {
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parseFloat(parsedData[7]),
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parseFloat(parsedData[5]),
      status: null,
      azimuth: parsedData[8],
      altitude: parseFloat(parsedData[9]),
      datetime: moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[13],
      mnc: parsedData[14],
      lac: parseInt(parsedData[15],10),
      cid: parseInt(parsedData[16],10),
      odometer: parseFloat(parsedData[18]),
      hourmeter: null
    });
  }
  else if (command[1] === 'GTSTR' || command[1] === 'GTSTP' || command[1] === 'GTLSP') {
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parseFloat(parsedData[7]),
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parseFloat(parsedData[6]),
      status: null,
      azimuth: parsedData[8],
      altitude: parseFloat(parsedData[9]),
      datetime: moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[13],
      mnc: parsedData[14],
      lac: parseInt(parsedData[15],10),
      cid: parseInt(parsedData[16],10),
      odometer: parseFloat(parsedData[18]),
      hourmeter: null
    });
  }
  else{
    _.extend(data, {
      alarm: getAlarm(command[1], null)
    });
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
    device: 'Queclink-GMT100',
    type: 'data',
    imei: parsedData[2],
    protocolVersion: getProtocolVersion(parsedData[1]),
    temperature: null,
    history: history,
    sentTime: moment(`${parsedData[parsedData.length - 2]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
    serialId: parseInt(parsedData[parsedData.length - 1],10),
    hourmeter: null
  };

  // GPS
  if (command[1] === 'GTFRI') {
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parseFloat(parsedData[8]),
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parseFloat(parsedData[7]),
      status: { //parsedData[24]
        raw: parsedData[24]+parsedData[25],
        sos: false,
        input: {
          '1': utils.hex2bin(parsedData[24][1])[1] === '1',
          '2': utils.hex2bin(parsedData[24][1])[0] === '1'
        },
        output: {
          '1': utils.hex2bin(parsedData[25][1])[1] === '1',
          '2': utils.hex2bin(parsedData[25][1])[0] === '1'
        },
        charge: parseFloat(parsedData[4]) > 5
      },
      azimuth: parsedData[9],
      altitude: parseFloat(parsedData[10]),
      datetime: moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21]): null,
        adb: null
      },
      mcc: parsedData[14],
      mnc: parsedData[15],
      lac: parseInt(parsedData[16],10),
      cid: parseInt(parsedData[17],10),
      odometer: parseFloat(parsedData[19])
    });
  }
  //Heartbeat. It must response an ACK command
  else if (command[1] === 'GTHBD'){
    _.extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  // Common Alarms
  else if (command[1] === 'GTTOW' || command[1] === 'GTDIS' || command[1] === 'GTIOB' ||
      command[1] === 'GTSPD' || command[1] === 'GTSOS' || command[1] === 'GTRTL' ||
      command[1] === 'GTDOG' || command[1] === 'GTIGL' || command[1] === 'GTHBM') {

    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [parseFloat(parsedData[11]), parseFloat(parsedData[12])] },
      speed: parseFloat(parsedData[8]),
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parseFloat(parsedData[7]),
      status: null,
      azimuth: parsedData[9],
      altitude: parseFloat(parsedData[10]),
      datetime: moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[14],
      mnc: parsedData[15],
      lac: parseInt(parsedData[16],10),
      cid: parseInt(parsedData[17],10),
      odometer: parseFloat(parsedData[19])
    });
  }
  //External low battery
  else if (command[1] === 'GTEPS') {
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parseFloat(parsedData[8]),
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parseFloat(parsedData[7]),
      status: null,
      azimuth: parsedData[9],
      altitude: parseFloat(parsedData[10]),
      datetime: moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21]): null,
        adb: null
      },
      mcc: parsedData[14],
      mnc: parsedData[15],
      lac: parseInt(parsedData[16],10),
      cid: parseInt(parsedData[17],10),
      odometer: parseFloat(parsedData[19])
    });
  }
  //Low voltage from analog input
  else if (command[1] === 'GTAIS'){
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[11]), parseFloat(parsedData[12]) ] },
      speed: parseFloat(parsedData[8]),
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parseFloat(parsedData[7]),
      status: null,
      azimuth: parsedData[9],
      altitude: parseFloat(parsedData[10]),
      datetime: moment(`${parsedData[13]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: parsedData[23] != '' ? parseFloat(parsedData[23]): null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21]): null,
        adb: null
      },
      mcc: parsedData[14],
      mnc: parsedData[15],
      lac: parseInt(parsedData[16],10),
      cid: parseInt(parsedData[17],10),
      odometer: parseFloat(parsedData[19])
    });
  }
  //Event report (It uses the last GPS data and MCC info)
  else if(command[1] === 'GTPNA' || command[1] === 'GTPFA' || command[1] === 'GTPDP') {
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: null,
      speed: null,
      gpsStatus: null,
      hdop: null,
      status: null,
      azimuth: null,
      altitude: null,
      datetime: moment(`${parsedData[4]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
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
      odometer: null
    });
  }
  else if(command[1] === 'GTMPN' || command[1] === 'GTMPF' || command[1] === 'GTCRA' || command[1] === 'GTJDR') {
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[8]), parseFloat(parsedData[9])]},
      speed: parseFloat(parsedData[5]),
      gpsStatus: checkGps(parseFloat(parsedData[8]), parseFloat(parsedData[9])),
      hdop: parseFloat(parsedData[4]),
      status: null,
      azimuth: parsedData[6],
      altitude: parseFloat(parsedData[7]),
      datetime: moment(`${parsedData[10]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[11],
      mnc: parsedData[12],
      lac: parseInt(parsedData[13],10),
      cid: parseInt(parsedData[14],10),
      odometer: null
    });
  }
  else if (command[1] === 'GTJDS' || command[1] === 'GTANT' || command[1] === 'GTRMD') {
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parseFloat(parsedData[6]),
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parseFloat(parsedData[5]),
      status: null,
      azimuth: parsedData[7],
      altitude: parseFloat(parsedData[8]),
      datetime: moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12],
      mnc: parsedData[13],
      lac: parseInt(parsedData[14],10),
      cid: parseInt(parsedData[15],10),
      odometer: null
    });
  }
  else if (command[1] === 'GTBPL') {
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parseFloat(parsedData[6]),
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parseFloat(parsedData[5]),
      status: null,
      azimuth: parsedData[6],
      altitude: parseFloat(parsedData[7]),
      datetime: moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: parseFloat(parsedData[4]),
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12],
      mnc: parsedData[13],
      lac: parseInt(parsedData[14],10),
      cid: parseInt(parsedData[15],10),
      odometer: null
    });
  }
  else if (command[1] === 'GTIGN' || command[1] === 'GTIGF') {
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[4]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[9]), parseFloat(parsedData[10])]},
      speed: parseFloat(parsedData[6]),
      gpsStatus: checkGps(parseFloat(parsedData[9]), parseFloat(parsedData[10])),
      hdop: parseFloat(parsedData[5]),
      status: null,
      azimuth: parsedData[7],
      altitude: parseFloat(parsedData[8]),
      datetime: moment(`${parsedData[11]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[12],
      mnc: parsedData[13],
      lac: parseInt(parsedData[14],10),
      cid: parseInt(parsedData[15],10),
      odometer: parseFloat(parsedData[18])
    });
  }
  else if (command[1] === 'GTIDN' || command[1] === 'GTIDF') {
    _.extend(data, {
      alarm: getAlarm(command[1], parsedData[5]),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parseFloat(parsedData[7]),
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parseFloat(parsedData[5]),
      status: null,
      azimuth: parsedData[8],
      altitude: parseFloat(parsedData[9]),
      datetime: moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[13],
      mnc: parsedData[14],
      lac: parseInt(parsedData[15],10),
      cid: parseInt(parsedData[16],10),
      odometer: parseFloat(parsedData[18])
    });
  }
  else if (command[1] === 'GTSTR' || command[1] === 'GTSTP' || command[1] === 'GTLSP') {
    _.extend(data, {
      alarm: getAlarm(command[1], null),
      loc: { type: 'Point', coordinates: [ parseFloat(parsedData[10]), parseFloat(parsedData[11])]},
      speed: parseFloat(parsedData[7]),
      gpsStatus: checkGps(parseFloat(parsedData[10]), parseFloat(parsedData[11])),
      hdop: parseFloat(parsedData[6]),
      status: null,
      azimuth: parsedData[8],
      altitude: parseFloat(parsedData[9]),
      datetime: moment(`${parsedData[12]}+00:00`, 'YYYYMMDDHHmmssZZ').toDate(),
      voltage: {
        battery: null,
        inputCharge: null,
        ada: null,
        adb: null
      },
      mcc: parsedData[13],
      mnc: parsedData[14],
      lac: parseInt(parsedData[15],10),
      cid: parseInt(parsedData[16],10),
      odometer: parseFloat(parsedData[18])
    });
  }
  else{
    _.extend(data, {
      alarm: getAlarm(command[1], null)
    });
  }
  return data;
};

/*
  Returns the ack command
*/
const getAckCommand = raw => {

  const rawData = raw.substr(0, raw.length - 1);
  const parsedData = rawData.split(',');
  const command = parsedData[0].split(':');

  let data = {device: 'Queclink-COMMAND-OK', type: 'ok'};
  if (command === 'GTSPD'){
    data.command = 'SETOVERSPEEDALARM';
  }
  else if(command === 'GTOUT'){
    data.command = 'SETIOSWITCH';
  }
  // else if (command === 'GTRTO') {
  //   data.command = 'RBOOT';
  // }
  else if (command === 'GTRTO') {
    data.command = 'CLEARBUF';
  }
  return data;
};

/*
  Parses the Websocket command into Queclink Command
*/
const parseCommand = data => {
  let command = '';
  const password = data.password || '000000';
  const serial = data.serial || '0000';
  let state, digit, port, max_speed, interval, validity, mode, prevOutputs;

  //Digital Outputs
  if (/^[1-4]{1}_(on|off)$/.test(data.instruction)) {
    let _data = data.instruction.split('_');
    port = parseInt(_data[0],10);
    state = _data[1];
    prevOutputs = data.previousOutput || {'1': false, '2': false, '3': false, '4': false};
    const outputs = Object.keys(prevOutputs).map(key => prevOutputs[key] === true ? 1 : 0);
    outputs[0] = !outputs[0] ? 0: outputs[0];
    outputs[1] = !outputs[1] ? 0: outputs[1];
    outputs[2] = !outputs[2] ? 0: outputs[2];
    outputs[3] = !outputs[3] ? 0: outputs[3];
    digit = state === 'on' ? 1 : 0;
    outputs[port-1] = digit;
    command = `AT+GTOUT=${password},${outputs[0]},0,0,${outputs[1]},0,0,${outputs[2]},0,0,${outputs[3]},0,0,0,1111,${serial}$`;
  }

  else if (data.instruction === 'clear_mem') {
    command = `AT+GTRTO=${password},4,FRI,,,,,${serial}$`;
  }

  else if (/^set_speed_(on|off)(E)?$/.test(data.instruction)) {
    max_speed = data.speed || 100;
    state = data.instruction.split('_')[2];
    validity = data.times || 10;
    interval = data.interval || 300;
    mode = /on(E)?/.test(state) ? 4 : 0;
    command = `AT+GTSPD=${password},${mode},0,${max_speed},${validity},${interval},1,1,0,0,,,,,,,,,,,,${serial}$`;
  }

  else if(data.instruction === 'Custom'){
    command = data.command;
  }

  else if (/^reboot$/.test(data.instruction)) {
    return `AT+GTRTO=${password},3,,,,,,${serial}$`;
  }
  return command;
};


module.exports = {
  parse: parse,
  getAckCommand: getAckCommand,
  isQueclink: isQueclink,
  isHeartBeat: isHeartBeat,
  getAckHeartBeat: getAckHeartBeat,
  parseCommand: parseCommand,
  getRebootCommand: getRebootCommand
};