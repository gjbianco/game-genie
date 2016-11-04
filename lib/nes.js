'use strict';
var utils = require('lib/utils');
var _ = require('lodash');

module.exports = {
  decodeNES: decodeNES,
  encodeNES: encodeNES
};

var CHARS = 'AEPOZXLUGKISTVYN';

function decodeNES(code) {
  var bits = '';
  var nibs = [];
  code = code.toUpperCase();
  if (code.replace(RegExp('[' + CHARS + ']', 'gi'), '').length !== 0) {
    return false;
  }

  if (CHARS.indexOf(code.substr(2, 1)) % 2 === 1) {
    if (code.length !== 8) {
      return false;
    }
  } else {
    if (code.length !== 6) {
      return false;
    }
  }
  for (var i = 0; i < code.length; i++) {
    var j = CHARS.indexOf(code[i]);
    bits += utils.pad(j.toString(2), 4);
  }

  //See http://www.monmouth.com/~colonel/videogames/nes/genie.html
  bits = bits.substr(bits.length - 1, 1) + bits.substr(0, bits.length - 1);
  nibs[5] = bits.substr(0, 4);
  nibs[4] = bits.substr(4, 4);
  nibs[2] = bits.substr(8, 4);
  nibs[0] = '0' + bits.substr(13, 3);
  nibs[3] = bits.substr(16, 4);
  nibs[1] = bits.substr(20, 4);
  if (code.length === 8) {
    nibs[7] = bits.substr(24, 4);
    nibs[6] = bits.substr(28, 4);
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

function encodeNES(address, value, key) {
  var bits = '';
  var nibs = [];
  var code = '';
  var len = key ? 8 : 6;
  if (address.length !== 4 || value.length !== 2 || (key && key.length !== 2)) {
    return false;
  }
  if (parseInt(address, 16) > 32767) {
    address = (parseInt(address, 16) - 32768).toString(16);
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

  //See http://www.monmouth.com/~colonel/videogames/nes/genie.html
  if (len === 8) {
    bits = nibs[5] + nibs[4] + nibs[2] + '1' + nibs[0].substr(1, 3) + nibs[3] + nibs[1] + nibs[7] + nibs[6];
  } else {
    bits = nibs[5] + nibs[4] + nibs[2] + '0' + nibs[0].substr(1, 3) + nibs[3] + nibs[1];
  }
  bits = bits.substr(1, bits.length) + bits.substr(0, 1);

  for (var i = 0; i < len; i++) {
    var j = bits.substr(i * 4, 4);
    j = parseInt(j, 2);
    code += CHARS.substr(j, 1);
  }
  return code;
}
