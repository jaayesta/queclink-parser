'use strict'
const utils = require('./utils.js')

/*
  Parses messages data from GL533CG devices
*/
const parse = raw => {
  let buf
  if (typeof raw === 'string') {
    buf = Buffer.from(raw, 'binary')
  } else {
    buf = raw
  }

  // Header 1 byte
  // 00H 1 byte
  // Frame Length 2 bytes
  // Multi-packet Flag 1 byte
  const multiPacketFlag = buf.readUInt8(4)
  const isMultiPacket = multiPacketFlag >> 7 === 1
  let offset = 5

  if (isMultiPacket) {
    offset += 2 // Frame Count & Frame Number
  }

  // IMEI 8 bytes (16 hex digits)
  const imeiBuffer = buf.slice(offset, offset + 8)
  const imei = imeiBuffer.toString('hex').replace(/^0+/, '') // e.g. 0123456789012345
  offset += 8

  // Device Type 2 bytes
  const deviceTypeInt = buf.readUInt16BE(offset)
  const deviceTypeStr = deviceTypeInt
    .toString(16)
    .padStart(4, '0')
    .toUpperCase() // C301
  offset += 2

  // Protocol Version 2 bytes
  const protocolVersionInt = buf.readUInt16BE(offset)
  const protocolVersionStr = protocolVersionInt
    .toString(16)
    .padStart(4, '0')
    .toUpperCase() // 0005
  offset += 2

  // Custom Version 1 byte
  buf.readUInt8(offset)
  offset += 1

  // Reserved Field Length 1 byte
  const reservedLen = buf.readUInt8(offset)
  offset += 1 + reservedLen

  let data = {
    raw: typeof raw === 'string' ? raw : raw.toString('hex').toUpperCase(),
    manufacturer: 'queclink',
    device: 'Queclink-GL533CG',
    type: 'data',
    imei: imei,
    protocolVersion: utils.getProtocolVersion(
      `${deviceTypeStr}${protocolVersionStr}`
    ),
    temperature: null,
    history: buf[0] === 0x2d, // 2DH means Buffer Report
    sentTime: null,
    serialId: null
  }

  // Records Part
  // Read records
  while (offset < buf.length - 4) {
    // keep 4 bytes for Count, CRC, Tail
    const recordLengthByte = buf.readUInt8(offset)
    let recordLength
    let recordLenSize
    if (recordLengthByte >> 7 === 0) {
      recordLength = recordLengthByte
      recordLenSize = 1
    } else {
      recordLength = buf.readUInt16BE(offset) & 0x7fff
      recordLenSize = 2
    }
    const recordEnd = offset + recordLenSize + recordLength
    offset += recordLenSize

    // Generated Time 4 bytes
    const genTimeTimestamp = buf.readUInt32BE(offset)
    data.sentTime = new Date(genTimeTimestamp * 1000)
    offset += 4

    // Record Count Number (Serial ID) 2 bytes
    const serialId = buf.readUInt16BE(offset)
    if (data.serialId === null) data.serialId = serialId
    offset += 2

    // Record ID 1 or 2 bytes
    const recordIdByte = buf.readUInt8(offset)
    let recordId
    if (recordIdByte >> 3 === 0x1f) {
      recordId = buf.readUInt16BE(offset) & 0x7fff
      offset += 2
    } else {
      recordId = recordIdByte
      offset += 1
    }

    // Event Code (1 byte)
    const eventCode = buf.toString('hex', offset, offset + 1)
    offset += 1

    if (recordId === 0x50 || recordId === 0x04) {
      // 50H / 04H Fixed Report Information
      data.alarm = utils.getAlarm('GTFRI', null)
    } else if (recordId === 0x01) {
      // 01H Device Startup
      data.alarm = utils.getAlarm('GTPNR', eventCode)
    } else if (recordId === 0x05) {
      // 05H Device Shutdown
      data.alarm = utils.getAlarm('GTPFA', null)
    } else if (recordId === 0x10) {
      // 10H SOS Notification
      data.alarm = utils.getAlarm('GTSOS', null)
    } else if (recordId === 0x11) {
      // 11H Device Basic Information
      data.alarm = utils.getAlarm('GTATI', null)
    } else if (recordId === 0x12) {
      // 12H Real Time Location
      data.alarm = utils.getAlarm('GTRTL', null)
      // } else if (recordId === 0x17) { // 17H Geo-fence events
      //   data.alarm = utils.getAlarm('GTGEO', null)
    } else if (recordId === 0x20) {
      // 20H Internal Battery Information
      data.alarm = utils.getAlarm('GTBPL', null)
      // } else if (recordId === 0x21) { // 21H Motion Information
      //   data.alarm = utils.getAlarm('GSENSOR', null)
    } else if (recordId === 0x87) {
      // 87H Light Intensity Alarm
      data.alarm = utils.getAlarm('LIGHT', null)
    } else if (recordId === 0x94) {
      // 94H SVR Connection Notification
      data.alarm = utils.getAlarm('GTSVR', eventCode)
    } else if (recordId === 0xf3) {
      // F3H GTC Status
      data.alarm = utils.getAlarm('GTALM', null)
    }

    // Inside record, process Data IDs until recordEnd
    while (offset < recordEnd && offset < buf.length - 4) {
      const dataIdByte = buf.readUInt8(offset)
      let dataId
      if (dataIdByte >> 7 === 0) {
        dataId = dataIdByte
        offset += 1
      } else {
        dataId = buf.readUInt16BE(offset) & 0x7fff
        offset += 2
      }

      const dataLenByte = buf.readUInt8(offset)
      let dataLen
      if (dataLenByte >> 7 === 0) {
        dataLen = dataLenByte
        offset += 1
      } else {
        dataLen = buf.readUInt16BE(offset) & 0x7fff
        offset += 2
      }

      const dataContent = buf.slice(offset, offset + dataLen)
      offset += dataLen

      if (dataId === 0x01) {
        // Profile ID
        data.profileId = dataContent.readUInt8(0)
      } else if (dataId === 0x02) {
        // Device Name
        // data.deviceName = dataContent.toString()
        continue
      } else if (dataId === 0x04) {
        // Device Serial Number
        data.serialNumber = dataContent.toString()
      } else if (dataId === 0x07) {
        // Current Working Mode
        data.status = data.status || {}
        const mode = dataContent.readUInt8(0)
        data.connectionMode =
          mode === 0x00
            ? 'Power saving'
            : mode === 0x01 ? 'Continuous' : 'Unknown'
      } else if (dataId === 0x0a) {
        // Internal Battery Percentage
        data.voltage = data.voltage || {}
        data.voltage.battery = dataContent.readUInt8(0)
        data.voltage.inputCharge = null
      } else if (dataId === 0x11) {
        // RF433 Working Status
        const rfState = dataContent.readUInt8(0)
        data.rf433 =
          rfState === 0
            ? 'Normal'
            : rfState === 1
              ? 'Module abnormal'
              : rfState === 2 ? 'Antenna abnormal' : 'Unknown'
      } else if (dataId === 0x13) {
        // Triggered Time
        const triggeredTime = dataContent.readUInt32BE(0)
        data.datetime = new Date(triggeredTime * 1000)
      } else if (dataId === 0x16) {
        // Record Count (History count)
        data.recordCount = dataContent.readUInt16BE(0)
      } else if (dataId === 0x17) {
        // Motion Status
        const motion = dataContent.readUInt8(0)
        data.status = data.status || {}
        data.status.motion =
          motion === 0x00
            ? 'Motionless'
            : motion === 0x01 ? 'Moving' : 'Unknown'
        data.alarm = utils.getAlarm('GSENSOR', parseInt(motion).toString(2))
        // } else if (dataId === 0x22) { // Real-time Customization
        //   data.alarm = utils.getAlarm('GTINFO', null)
      } else if (dataId === 0x2b) {
        // Light Sensor
        data.lightSensor =
          dataContent.readUInt8(0) === 0x01 ? 'Triggered' : 'Normal'
      } else if (dataId === 0x50) {
        // Fixed Report Information
        data.alarm = utils.getAlarm('GTFRI', null)
      } else if (dataId === 0x51) {
        // 81 Mini Location
        let locOffset = 0
        const fixStateMode = dataContent.readUInt8(locOffset)
        const signalStrength = (fixStateMode >> 4) & 0x0f
        const fixState = (fixStateMode >> 2) & 0x03
        const fixMode = fixStateMode & 0x03
        locOffset += 1

        const lon = dataContent.readInt32BE(locOffset) / 1000000
        locOffset += 4
        const lat = dataContent.readInt32BE(locOffset) / 1000000
        locOffset += 4

        const utcTime = dataContent.readUInt32BE(locOffset)
        data.datetime = new Date(utcTime * 1000)
        locOffset += 4

        const speed = dataContent.readUInt16BE(locOffset) * 0.1

        data.loc = { type: 'Point', coordinates: [lon, lat] }
        data.speed = parseFloat(speed.toFixed(1))
        data.gpsStatus = utils.checkGps(lon, lat)
        data.gpsSignalStrength = utils.getSignalStrength(
          'GPS',
          signalStrength,
          true
        )
        data.fixState =
          fixState === 0
            ? 'Off'
            : fixState === 1 ? 'No fix' : fixState === 2 ? 'Fix' : 'Unknown'
        data.fixMode = fixMode === 0 ? '2D' : fixMode === 1 ? '3D' : 'Unknown'
      } else if (dataId === 0x52) {
        // 82 Full Location
        let locOffset = 0
        const fixStateMode = dataContent.readUInt8(locOffset)
        const signalStrength = (fixStateMode >> 4) & 0x0f
        const fixState = (fixStateMode >> 2) & 0x03
        const fixMode = fixStateMode & 0x03
        locOffset += 1

        const lon = dataContent.readInt32BE(locOffset) / 1000000
        locOffset += 4
        const lat = dataContent.readInt32BE(locOffset) / 1000000
        locOffset += 4

        const utcTime = dataContent.readUInt32BE(locOffset)
        data.datetime = new Date(utcTime * 1000)
        locOffset += 4

        const speed = dataContent.readUInt16BE(locOffset) * 0.1
        locOffset += 2

        const hdopByte = dataContent.readUInt8(locOffset)
        const hdop = hdopByte === 0xff ? 25.5 : hdopByte * 0.1
        locOffset += 1

        const azimuth = dataContent.readUInt16BE(locOffset)
        locOffset += 2

        const altHigh = dataContent.readInt8(locOffset)
        const altMid = dataContent.readUInt8(locOffset + 1)
        const altLow = dataContent.readUInt8(locOffset + 2)
        const altitude = ((altHigh << 16) | (altMid << 8) | altLow) * 0.1
        locOffset += 3

        const satellites = dataContent.readUInt8(locOffset)

        data.loc = { type: 'Point', coordinates: [lon, lat] }
        data.speed = parseFloat(speed.toFixed(1))
        data.hdop = parseFloat(hdop.toFixed(1))
        data.azimuth = azimuth
        data.altitude = parseFloat(altitude.toFixed(1))
        data.gpsStatus = utils.checkGps(lon, lat)
        data.gpsSignalStrength = utils.getSignalStrength(
          'GPS',
          signalStrength,
          true
        )
        data.fixState =
          fixState === 0
            ? 'Off'
            : fixState === 1 ? 'No fix' : fixState === 2 ? 'Fix' : 'Unknown'
        data.fixMode = fixMode === 0 ? '2D' : fixMode === 1 ? '3D' : 'Unknown'
        data.satellites = satellites
      } else if (dataId === 0x55) {
        // 85 Registered Cell
        const plmnLen = dataContent.readUInt8(0)
        const plmnVal =
          (dataContent.readUInt8(1) << 16) |
          (dataContent.readUInt8(2) << 8) |
          dataContent.readUInt8(3)
        const plmnStr = plmnVal.toString().padStart(plmnLen, '0')
        const mccStr = plmnStr.substring(0, 3)
        const mncStr = plmnStr.substring(3)
        data.mcc = utils.latamMcc[parseInt(mccStr, 10)] || null
        data.mnc = utils.getMNC(mccStr, mncStr)
        data.lac = dataContent.readUInt16BE(4)
        data.cid = dataContent.readUInt32BE(6)
        // Access Tech: Bit 7 Roaming & Bit 6 - 0 Technology
        const techRoaming = dataContent.readUInt8(10)
        const tech = techRoaming & 0x7f
        data.accessTechnology =
          tech === 0 ? 'GSM' : tech === 5 ? 'LTE Cat-1' : 'Unknown'
        data.roaming = techRoaming >> 7 === 1

        const rssi = dataContent.readUInt8(12)
        if (rssi !== 0xff && rssi !== 99) {
          data.rssi = rssi <= 31 ? rssi * 2 - 113 : null
        }
      } else if (dataId === 0x58) {
        // 88 SIM Card
        data.imsi = dataContent
          .slice(0, 8)
          .toString('hex')
          .replace(/^0/, '')
          .replace(/f$/i, '')
        if (dataContent.length > 8) {
          const iccidContent = dataContent.slice(8)
          if (iccidContent[0] === 0xff) {
            data.iccid = iccidContent.slice(2, 2 + iccidContent[1]).toString()
          } else {
            data.iccid = iccidContent.toString('hex').replace(/f$/i, '')
          }
        }
      } else if (dataId === 0x59) {
        // 89 GSV
        const svCount = dataContent.readUInt8(0)
        data.satellites_details = []
        for (let i = 0; i < svCount; i++) {
          const svOffset = 1 + i * 6
          if (svOffset + 6 <= dataContent.length) {
            data.satellites_details.push({
              gnssId: dataContent.readUInt8(svOffset),
              svId: dataContent.readUInt8(svOffset + 1),
              snr: dataContent.readUInt8(svOffset + 2),
              elevation: dataContent.readUInt8(svOffset + 3),
              azimuth: dataContent.readUInt16BE(svOffset + 4)
            })
          }
        }
      } else if (dataId === 0x5a) {
        // 90 Versions
        const mask = dataContent.readUInt8(0)
        if (mask === 0x80) {
          let vOffset = 1
          while (vOffset < dataContent.length) {
            const type = dataContent.readUInt8(vOffset++)
            const len = dataContent.readUInt8(vOffset++)
            const val = dataContent.slice(vOffset, vOffset + len).toString()
            vOffset += len
            if (type === 0x01) data.hardwareVersion = val
            else if (type === 0x02) data.appVersion = val
            else if (type === 0x05) data.bootloaderVersion = val
            else if (type === 0x06) data.firmwareVersion = val
            else if (type === 0x09) data.bleBootloaderVersion = val
            else if (type === 0x0a) data.bleFirmwareVersion = val
          }
        }
      } else if (dataId === 0x5c) {
        // 92 GEO Status
        data.geofence = data.geofence || {}
        data.geofence.id = dataContent.readUInt8(0)
        const gStat = dataContent.readUInt8(1)
        data.geofence.status =
          gStat === 0x00 ? 'Inside' : gStat === 0x01 ? 'Outside' : 'Unknown'
      } else if (dataId === 0x5d) {
        // 93 All GEO Status
        const geofenceCount = dataLen / 2
        data.geofences = []
        for (let i = 0; i < geofenceCount; i++) {
          data.geofences.push({
            id: dataContent.readUInt8(i * 2),
            status:
              dataContent.readUInt8(i * 2 + 1) === 0x00 ? 'Inside' : 'Outside'
          })
        }
      } else if (dataId === 0x65 || dataId === 0x66 || dataId === 0x67) {
        // 101/102/103 Upgrade/Update/Get Config
        const getUpgradeStatus = (c, sc) => {
          const codes = {
            1: 'Start download',
            2: 'Start update',
            3: 'Download successful',
            4: 'Download failed',
            5: 'Update successful',
            6: 'Update failed'
          }
          const subcodes = {
            0: 'Normal',
            16: 'Low battery',
            32: 'No network',
            33: 'Connection failed',
            48: 'File not found',
            49: 'CRC error',
            50: 'Type error',
            51: 'Size error',
            52: 'Incompatible version',
            240: 'In progress',
            255: 'Unknown'
          }
          return {
            code: codes[c] || `Unknown (${c})`,
            subcode: subcodes[sc] || `Unknown (${sc})`
          }
        }
        const status = getUpgradeStatus(
          dataContent.readUInt8(0),
          dataContent.readUInt8(1)
        )
        const fieldName =
          dataId === 0x65
            ? 'upgradeInfo'
            : dataId === 0x66 ? 'updateConfig' : 'getConfig'
        data[fieldName] = {
          status: status.code,
          reason: status.subcode,
          sequence: dataContent.readUInt16BE(5)
        }
      } else if (dataId === 0x61) {
        // 97 Internal Battery Status
        data.voltage = data.voltage || {}
        data.voltage.connected = (dataContent.readUInt8(0) & 0x01) === 1
        data.voltage.value = dataContent.readUInt16BE(1)
        data.voltage.battery = dataContent.readUInt8(3)
        const charging = dataContent.readUInt8(4)
        data.voltage.inputCharge =
          charging !== 0x02 && charging !== 0x007 ? true : null
      } else if (dataId === 0x78) {
        // 120 Self Test
        data.selfTestTime = new Date(dataContent.readUInt32BE(0) * 1000)
        const conn = dataContent.readUInt32BE(4)
        data.selfTest = {
          imeiAbnormal: (conn & 0x04) !== 0,
          simAbnormal: (conn & 0x08) !== 0,
          gnssAbnormal: (conn & 0x10) !== 0,
          gSensorAbnormal: (conn & 0x20) !== 0,
          bluetoothAbnormal: (conn & 0x80) !== 0,
          bluetoothMacAbnormal: (conn & 0x100) !== 0
        }
      } else if (dataId === 173) {
        // 80ADH SVR Status (ID 173 dec)
        const appendInfo = dataContent.slice(8).toString('hex') !== '00'
        data.bluetooth = data.bluetooth || {}
        data.bluetooth.connection =
          dataContent.readUInt8(0) === 0x01 ? 'Normal' : 'Abnormal'
        data.bluetooth.role =
          dataContent.readUInt8(1) === 0x00 ? 'Master' : 'Slave'
        data.bluetooth.targetMac = dataContent
          .slice(2, 8)
          .toString('hex')
          .toUpperCase()
        if (appendInfo) {
          const lostReasonHex = dataContent
            .slice(8, dataContent.length - 1)
            .toString('hex')
          data.bluetooth.lostReason =
            lostReasonHex === '03'
              ? 'Bluetooth connection failed'
              : lostReasonHex === '07'
                ? 'Bluetooth connection successfull'
                : lostReasonHex === '08'
                  ? 'Failed to decrypt interactive data'
                  : lostReasonHex === '09'
                    ? 'Data check is incorrect (after decryption)'
                    : lostReasonHex === '0B'
                      ? 'No data interaction (after connection)'
                      : 'Unknown'
        }
      } else if (dataId === 159) {
        // 809FH Bluetooth Info (ID 159 dec)
        data.bluetooth = data.bluetooth || {}
        const nameLength = dataContent.readUInt8(0)
        data.bluetooth.name = dataContent.slice(1, nameLength + 1).toString()
        data.bluetooth.mac = dataContent
          .slice(nameLength + 1, nameLength + 7)
          .toString('hex')
          .toUpperCase()
      }
    }
  }

  data.status = data.status || null
  data.odometer = data.odometer || null
  data.hourmeter = data.hourmeter || null
  data.gpsStatus = data.gpsStatus || false

  return data
}

module.exports = {
  parse: parse
}
