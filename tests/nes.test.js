'use strict';
var expect = require('chai').expect;
var mod = require('lib/nes');

describe('NES', function() {

  var sixChar = {
    encoded: 'NNZYXS',
    decoded: {
      address: '7DA2',
      value: 'FF',
      key: false
    }
  };

  describe('#encodeNES', function() {

    it('should encode 6 char codes', function() {
      expect(mod.encodeNES(sixChar.decoded.address, sixChar.decoded.value, sixChar.decoded.key)).to.equal(sixChar.encoded);
    });

  });

  describe('#decodeNES', function() {

    it('should decode 6 char codes', function() {
      expect(mod.decodeNES(sixChar.encoded)).to.deep.equal(sixChar.decoded);
    });

  });

});
