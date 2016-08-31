'use strict';


const ConvertBase = num => {
  return {
    from : function (baseFrom) {
      return {
        to : function (baseTo) {
          return parseInt(num, baseFrom).toString(baseTo);
        }
      };
    }
  };
};


// binary to decimal
const bin2dec = num => {
  return ConvertBase(num).from(2).to(10);
};

// binary to hexadecimal
const bin2hex = num => {
  return ConvertBase(num).from(2).to(16);
};

// decimal to binary
const dec2bin = num => {
  return ConvertBase(num).from(10).to(2);
};

// decimal to hexadecimal
const dec2hex = num => {
  return ConvertBase(num).from(10).to(16);
};

// hexadecimal to binary
const hex2bin = num => {
  return ConvertBase(num).from(16).to(2);
};

// hexadecimal to decimal
const hex2dec = num => {
  return ConvertBase(num).from(16).to(10);
};

// hexadecimal num with n digits
const nHexDigit = (num, n) => {
  let hex = num;
  while(hex.length < n){
    hex = `0${hex}`;
  }
  return hex;
};

module.exports = {
  bin2dec: bin2dec,
  bin2hex: bin2hex,
  dec2bin: dec2bin,
  dec2hex: dec2hex,
  hex2bin: hex2bin,
  hex2dec: hex2dec,
  nHexDigit: nHexDigit
};
