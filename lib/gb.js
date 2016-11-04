'use strict';
var utils = require('lib/utils');

module.exports = {
  decodeGB: decodeGB,
  encodeGB: encodeGB
};

var CHARS = '0123456789ABCDEF';

function decodeGB(code) {
  var bits = '';
  var nibs = [];
  if (code.length !== 7 && code.length !== 11) {
    return false;
  }
  code = code.toUpperCase();
  code = code.substr(0, 3) + code.substr(4, 3) + code.substr(8, 1) + code.substr(10, 1);
  if (code.replace(RegExp('[' + CHARS + ']', 'gi'), '').length !== 0) {
    return false;
  }

  for (var i = 0; i < code.length; i++) {
    var j = CHARS.indexOf(code[i]);
    bits += utils.pad(j.toString(2), 4);
  }

  //VVAAAACSC, 1234 5678 ABCD EFGH IJKL MNOP abcd ---- efgh,
  //value: 1234 5678, address: ([not] MNOP) ABCD EFGH IJKL, compare: (ghab cdef [xor] 10111010)
  nibs[0] = utils.stringNOT(bits.substr(20, 4));
  nibs[1] = bits.substr(8, 4);
  nibs[2] = bits.substr(12, 4);
  nibs[3] = bits.substr(16, 4);
  nibs[4] = bits.substr(0, 4);
  nibs[5] = bits.substr(4, 4);
  if (code.length === 8) {
    var cbits = utils.stringXOR(bits.substr(30, 2) + bits.substr(24, 4) + bits.substr(28, 2), '10111010');
    nibs[6] = cbits.substr(0, 4);
    nibs[7] = cbits.substr(4, 4);
  }

  for (var i = 0; i < code.length; i++) {
    nibs[i] = parseInt(nibs[i], 2).toString(16).toUpperCase();
  }
  nibs = nibs.join('');

  if (code.length === 8) {
    return {
      address: nibs.substr(0, 4),
      value: nibs.substr(4, 2),
      key: nibs.substr(6, 2)
    };
  } else {
    return {
      address: nibs.substr(0, 4),
      value: nibs.substr(4, 2),
      key: false
    };
  }
}

function encodeGB(address, value, key) {
  var nibs = [];
  var code = '';
  var len = (key) ? 9 : 6;
  if (address.length !== 4 || value.length !== 2 || (key && key.length !== 2)) {
    return false;
  }
  var raw = address + value;
  if (key) {
    raw += key;
  }
  if (raw.replace(/[0-9A-F]/gi, '').length !== 0) {
    return false;
  }

  for (var i = 0; i < raw.length; i++) {
    var j = parseInt(raw[i], 16);
    nibs[i] = utils.pad(j.toString(2), 4);
  }

  //Arr annoyingly complex >_<... fuck you "Codemasters"!
  var bits = nibs[4] + nibs[5] + nibs[1] + nibs[2] + nibs[3] + utils.stringNOT(nibs[0]);
  if (len === 9) {
    var cbits = utils.stringXOR(nibs[6] + nibs[7], '10111010');
    cbits = cbits.substr(2, 6) + cbits.substr(0, 2);
    var shadow = utils.stringXOR(cbits.substr(0, 4), '1000');
    bits += cbits.substr(0, 4) + shadow + cbits.substr(4, 4);
  }

  for (var i = 0; i < len; i++) {
    var j = bits.substr(i * 4, 4);
    j = parseInt(j, 2);
    code += CHARS.substr(j, 1);
    if (i === 2 || (i === 5 && len === 9)) {
      code += '-';
    }
  }
  return code;
}
