// XRandom is an XOR-keccak256 RNG implementation in Javascript
const eutil = require('ethereumjs-util')
const bignum = require('bignum')

module.exports = class XRandom {
  constructor (nums) {
    this._nums = nums.map((v) => {
      if (bignum.isBigNum(v)) {
        return v
      } else if (eutil.BN.isBN(v)) {
        // convert bignumber to bignum
        return bignum(v.toString(16), 16)
      } else if (typeof v === 'number') {
        return bignum(v)
      } else if (typeof v === 'string') {
        if (eutil.isHexPrefixed(v)) {
          return bignum(eutil.stripHexPrefix(v), 16)
        } else {
          return bignum(v, 10)
        }
      } else {
        throw new Error('Value must be a string, number, bignum, or bignumber')
      }
    })
    // compute initial seed
    this._seed = this._nums.reduce((seed, v) => {
      return seed.xor(v)
    }, bignum(0))
    this._current = this._seed
    this._index = bignum(0)
  }

  next () {
    const hash = eutil.keccak256(eutil.setLengthLeft(this._current.toBuffer(), 32))
    this._current = bignum.fromBuffer(hash)
    this._index = this._index.add(1)
    return this.current
  }

  get seed () {
    return this._seed
  }

  get current () {
    return this._current
  }

  get index () {
    return this._index
  }
}
