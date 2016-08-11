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
  '35': 'GV200' // New Version
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
    const duration = report != '' ? parseInt(report,10): null;
    return {type: 'DI', number: 1, status: true, duration: duration};
  }
  else if (command === 'GTIGF'){
    const duration = report != '' ? parseInt(report,10): null;
    return {type: 'DI', number: 1, status: false, duration: duration};
  }
  else if(command === 'GTPNA'){
    return {type: 'Power', status: true};
  }
  else if(command === 'GTPFA'){
    return {type: 'Power', status: false};
  }
  //Change for connected to power supply
  else if(command === 'GTMPN'){
    return {type: 'Charge', status: true};
  }
  else if(command === 'GTMPF'){
    return {type: 'Charge', status: false};
  }
  // else if(command === 'GTMPN'){
  //   return {type: 'Power_Supply', status: true};
  // }
  // else if(command === 'GTMPF'){
  //   return {type: 'Power_Supply', status: false};
  // }
  else if(command === 'GTBTC'){
    return {type: 'Charging', status: true};
  }
  else if(command === 'GTSTC'){
    return {type: 'Charging', status: false};
  }
  else if(command === 'GTBPL'){
    return {type: 'Low_Battery'};
  }
  else if(command === 'GTIDN'){
    return {type: 'Idling', status: true};
  }
  else if(command === 'GTIDF'){
    const duration = report != '' ? parseInt(report,10): null;
    return {type: 'Idling', status: false, duration: duration };
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
  else if(command === 'GTSTT'){
    return {type: 'Motion_State_Changed'};
  }
  else if(command === 'GTPDP'){
    return {type: 'GSP_Connection_Established'};
  }
  else if(command === 'GTGSS'){
    return {type: 'Gps_Status', status: report === '1'};
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
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]): null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
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
    _.extend(data, {
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
    _.extend(data, {
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
    _.extend(data, {
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
    _.extend(data, {
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
    _.extend(data, {
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
    _.extend(data, {
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
    _.extend(data, {
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
    _.extend(data, {
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
    _.extend(data, {
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
    _.extend(data, {
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
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: { //parsedData[24]
        raw: parsedData[24]+parsedData[25],
        sos: utils.hex2bin(parsedData[24][1])[1] === '1',
        input: {
          '4': utils.hex2bin(parsedData[24][1])[3] === '1',
          '3': utils.hex2bin(parsedData[24][1])[2] === '1',
          '2': utils.hex2bin(parsedData[24][1])[1] === '1',
          '1': utils.hex2bin(parsedData[24][1])[0] === '1'
        },
        output: {
          '4': utils.hex2bin(parsedData[25][1])[3] === '1',
          '3': utils.hex2bin(parsedData[25][1])[2] === '1',
          '2': utils.hex2bin(parsedData[25][1])[1] === '1',
          '1': utils.hex2bin(parsedData[25][1])[0] === '1'
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
  else if(command[1] === 'GTAIS'){
    _.extend(data, {
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
        battery: null,//percentage
        inputCharge: parsedData[4] != '' ? parseFloat(parsedData[4]): null,
        ada: parsedData[21] != '' ? parseFloat(parsedData[21])/1000 : null,
        adb: parsedData[22] != '' ? parseFloat(parsedData[22])/1000 : null,
        adc: parsedData[23] != '' ? parseFloat(parsedData[22])/1000 : null
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
    _.extend(data, {
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
  else if(command[1] === 'GTMPN' || command[1] === 'GTMPF' || command === 'GTBTC' || command[1] === 'GTCRA' || command[1] === 'GTJDR') {
    _.extend(data, {
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
  else if (command[1] === 'GTJDS' || command[1] === 'GTANT' || command[1] === 'GTRMD') {
    _.extend(data, {
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
    _.extend(data, {
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
    _.extend(data, {
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
    _.extend(data, {
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
    _.extend(data, {
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
    _.extend(data, {
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
    _.extend(data, {
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
      speed: parsedData[8] != '' ? parseFloat(parsedData[8]) : null,
      gpsStatus: checkGps(parseFloat(parsedData[11]), parseFloat(parsedData[12])),
      hdop: parsedData[7] != '' ? parseFloat(parsedData[7]) : null,
      status: { //parsedData[24]
        raw: parsedData[24]+parsedData[25],
        sos: false,
        input: {
          '2': utils.hex2bin(parsedData[24][1])[1] === '1',
          '1': utils.hex2bin(parsedData[24][1])[0] === '1'
        },
        output: {
          '2': utils.hex2bin(parsedData[25][1])[1] === '1',
          '1': utils.hex2bin(parsedData[25][1])[0] === '1'
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
        adb: null
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
      mcc: parsedData[14] != '' ? parseInt(parsedData[14],10): null,
      mnc: parsedData[15] != '' ? parseInt(parsedData[15],10): null,
      lac: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      cid: parsedData[17] != '' ? parseInt(parsedData[17],16) : null,
      odometer: parsedData[19] != '' ? parseFloat(parsedData[19]): null
    });
  }
  //External low battery
  else if (command[1] === 'GTEPS') {
    _.extend(data, {
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
        adb: null
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
    _.extend(data, {
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
        adb: null
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
    _.extend(data, {
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
      odometer: null
    });
  }
  else if(command[1] === 'GTMPN' || command[1] === 'GTMPF' || command[1] === 'GTCRA' || command[1] === 'GTJDR') {
    _.extend(data, {
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
      mcc: parsedData[11] != '' ? parseInt(parsedData[11],10): null,
      mnc: parsedData[12] != '' ? parseInt(parsedData[12],10): null,
      lac: parsedData[13] != '' ? parseInt(parsedData[13],16) : null,
      cid: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      odometer: null
    });
  }
  else if (command[1] === 'GTJDS' || command[1] === 'GTANT' || command[1] === 'GTRMD') {
    _.extend(data, {
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
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10): null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10): null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null
    });
  }
  else if (command[1] === 'GTBPL') {
    _.extend(data, {
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
        ada: null,
        adb: null
      },
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10): null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10): null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: null
    });
  }
  else if (command[1] === 'GTIGN' || command[1] === 'GTIGF') {
    _.extend(data, {
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
      mcc: parsedData[12] != '' ? parseInt(parsedData[12],10): null,
      mnc: parsedData[13] != '' ? parseInt(parsedData[13],10): null,
      lac: parsedData[14] != '' ? parseInt(parsedData[14],16) : null,
      cid: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null
    });
  }
  else if (command[1] === 'GTIDN' || command[1] === 'GTIDF') {
    _.extend(data, {
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
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10): null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10): null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null
    });
  }
  else if (command[1] === 'GTSTR' || command[1] === 'GTSTP' || command[1] === 'GTLSP') {
    _.extend(data, {
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
      mcc: parsedData[13] != '' ? parseInt(parsedData[13],10): null,
      mnc: parsedData[14] != '' ? parseInt(parsedData[14],10): null,
      lac: parsedData[15] != '' ? parseInt(parsedData[15],16) : null,
      cid: parsedData[16] != '' ? parseInt(parsedData[16],16) : null,
      odometer: parsedData[18] != '' ? parseFloat(parsedData[18]) : null
    });
  }
  // Motion State Changed
  else if(command[1] === 'GTSTT'){
    _.extend(data, {
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
  if (command[1] === 'GTSPD'){
    data.command = 'SETOVERSPEEDALARM';
  }
  else if(command[1] === 'GTOUT'){
    data.command = 'SETIOSWITCH';
  }
  // else if (command[1] === 'GTRTO') {
  //   data.command = 'RBOOT';
  // }
  else if (command[1] === 'GTRTO') {
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
    command = `AT+GTRTO=${password},4,BUF,,,,,${serial}$`;
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
    command = `AT+GTRTO=${password},3,,,,,,${serial}$`;
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
