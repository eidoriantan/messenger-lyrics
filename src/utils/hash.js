
const crypto = require('crypto')

function hash (algo, data, pkey) {
  const hmac = crypto.createHmac(algo, pkey)
  return hmac.update(data).digest('hex')
}

module.exports = hash
