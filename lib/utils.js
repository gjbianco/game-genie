'use strict';
module.exports = {
  pad: pad,
  stringXOR: stringXOR,
  stringNOT: stringNOT
};

function pad(str, pad) {
  while (str.length < pad) {
    str = '0' + str;
  }
  return str;
}

function stringXOR(a, b) {
  var xor = '';
  for (var i = 0; i < a.length; i++) {
    xor += (a[i] == b[i]) ? '0' : '1';
  }
  return xor;
}

function stringNOT(a) {
  var not = '';
  for (var i = 0; i < 4; i++) {
    not += (a[i] == '1') ? '0' : '1';
  }
  return not;
}
