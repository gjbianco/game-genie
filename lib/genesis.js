'use strict';
var utils = require('lib/utils');

module.exports = {
  decodeGEN: decodeGEN,
  encodeGEN: encodeGEN
};

var CHARS = 'ABCDEFGHJKLMNPRSTVWXYZ0123456789';

function decodeGEN(code) {
  var bits = '';
  var nibs = [];
  if (code.length !== 9) {
    return false;
  }
  code = code.substr(0, 4).toUpperCase() + code.substr(5, 4).toUpperCase();
  if (code.replace(RegExp('[' + CHARS + ']', 'gi'), '').length !== 0) {
    return false;
  }
  for (var i = 0; i < code.length; i++) {
    var n = CHARS.indexOf(code[i]);
    bits += utils.pad(n.toString(2), 5);
  }
  //a-p = value, A-X = addy -> ijkl mnop IJKL MNOP ABCD EFGH defg habc QRST UVWX
  nibs[0] = bits.substr(16, 4);
  nibs[1] = bits.substr(20, 4);
  nibs[2] = bits.substr(8, 4);
  nibs[3] = bits.substr(12, 4);
  nibs[4] = bits.substr(32, 4);
  nibs[5] = bits.substr(36, 4);
  nibs[6] = bits.substr(29, 3) + bits.substr(24, 1);
  nibs[7] = bits.substr(25, 4);
  nibs[8] = bits.substr(0, 4);
  nibs[9] = bits.substr(4, 4);
  for (var i = 0; i < 10; i++) {
    nibs[i] = parseInt(nibs[i], 2).toString(16).toUpperCase();
  }
  nibs = nibs.join('');
  return {
    address: nibs.substr(0, 6),
    value: nibs.substr(6, 4)
  };
}

function encodeGEN(address, value) {
  var bits = '';
  var nibs = [];
  var code = '';
  if (address.length !== 6 || value.length !== 4) {
    return false;
  }
  var raw = address + value;
  if (raw.replace(/[0-9A-F]/gi, '').length !== 0) {
    return false;
  }
  for (var i = 0; i < 10; i++) {
    var j = parseInt(raw[i], 16);
    nibs[i] = utils.pad(j.toString(2), 4);
  }

  //a-p = value, A-X = addy -> ijkl mnop IJKL MNOP ABCD EFGH defg habc QRST UVWX - (inversed)
  var temp1 = nibs[6].substr(3, 1) + nibs[7].substr(0, 3);
  var temp2 = nibs[7].substr(3, 1) + nibs[6].substr(0, 3);
  bits = nibs[8] + nibs[9] + nibs[2] + nibs[3] + nibs[0] + nibs[1] + temp1 + temp2 + nibs[4] + nibs[5];

  for (var i = 0; i < 8; i++) {
    var j = bits.substr(i * 5, 5);
    j = parseInt(j, 2);
    code += CHARS.substr(j, 1);
    if (i === 3) {
      code += '-';
    }
  }
  return code;
}
