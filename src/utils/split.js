
function split (message, splitter, limit) {
  if (message.length <= limit) return message

  const sLength = splitter.length
  for (let i = limit - sLength - 1; i >= 0; i--) {
    const characters = message.substr(i, sLength)
    if (characters === splitter) {
      const first = message.substr(0, i)
      const second = message.substr(i + 2)
      return [first, second]
    }
  }

  return [message.substr(0, limit), message.substr(limit)]
}

module.exports = split
