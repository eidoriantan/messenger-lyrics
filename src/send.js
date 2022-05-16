
const axios = require('axios').default
const hash = require('./utils/hash')
const split = require('./utils/split')

const ME_ENDPOINT = 'https://graph.facebook.com/v13.0/me'
const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const APP_SECRET = process.env.APP_SECRET

async function send (psid, message, type = 'message') {
  if (type === 'message' && message.length > 2000) {
    const splits = split(message, '\r\n', 2000)
    for (let i = 0; i < splits.length; i++) {
      const split = splits[i]
      await send(psid, split)
    }

    return
  }

  const params = new URLSearchParams()
  const proof = hash('sha256', ACCESS_TOKEN, APP_SECRET)
  params.set('access_token', ACCESS_TOKEN)
  params.set('appsecret_proof', proof)

  const url = `${ME_ENDPOINT}/messages?${params.toString()}`
  const data = {
    messaging_type: 'RESPONSE',
    notification_type: 'SILENT_PUSH',
    recipient: { id: psid }
  }

  if (type === 'message') {
    data.message = { text: message }
  } else if (type === 'attachment') {
    data.message = { attachment: message }
  } else {
    data.sender_action = type
  }

  await axios.post(url, data)
}

module.exports = send
