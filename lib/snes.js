'use strict';
var utils = require('lib/utils');

module.exports = {
  decodeSNES: decodeSNES,
  encodeSNES: encodeSNES
};

var CHARS = 'DF4709156BC8A23E';

function decodeSNES(code) {
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
    var j = CHARS.indexOf(code[i]);
    bits += utils.pad(j.toString(2), 4);
  }

  //1-8 = value, A-X = addy -> 1234 5678 IJKL QRST OPAB CDUV WXEF GHMN
  nibs[0] = bits.substr(18, 4);
  nibs[1] = bits.substr(26, 4);
  nibs[2] = bits.substr(8, 4);
  nibs[3] = bits.substr(30, 2) + bits.substr(16, 2);
  nibs[4] = bits.substr(12, 4);
  nibs[5] = bits.substr(22, 4);
  nibs[6] = bits.substr(0, 4);
  nibs[7] = bits.substr(4, 4);

  for (var i = 0; i < 8; i++) {
    nibs[i] = parseInt(nibs[i], 2).toString(16).toUpperCase();
  }
  nibs = nibs.join('');

  return {
    address: nibs.substr(0, 6),
    value: nibs.substr(6, 2)
  };
}

function encodeSNES(address, value) {
  var bits = '';
  var nibs = [];
  var code = '';
  if (address.length !== 6 || value.length !== 2) {
    return false;
  }
  var raw = address + value;
  if (raw.replace(/[0-9A-F]/gi, '').length !== 0) {
    return false;
  }
  for (var i = 0; i < 8; i++) {
    var j = parseInt(raw[i], 16);
    nibs[i] = utils.pad(j.toString(2), 4);
  }

  //1-8 = value, A-X = addy -> KLMN STUV ABCD WXIJ EFGH OPQR 1234 5678
  var temp1 = nibs[3].substr(2, 2) + nibs[0].substr(0, 2) + nibs[0].substr(2, 2);
  bits = nibs[6] + nibs[7] + nibs[2] + nibs[4] + temp1 + nibs[5] + nibs[1] + nibs[3].substr(0, 2);
  for (var i = 0; i < 8; i++) {
    var j = bits.substr(i * 4, 4);
    j = parseInt(j, 2);
    code += CHARS.substr(j, 1);
    if (i === 3) code += '-';
  }
  return code;
}
