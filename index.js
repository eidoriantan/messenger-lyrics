/**
 *  LyricsFinder
 *  Copyright (C) 2022, Adriane Justine Tan
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const express = require('express')

const send = require('./src/send')
const { searchSong, getLyrics } = require('./src/songs')
const hash = require('./src/utils/hash')

const ACCESS_TOKEN = process.env.ACCESS_TOKEN
const APP_SECRET = process.env.APP_SECRET
const VALIDATION_TOKEN = process.env.VALIDATION_TOKEN
const PORT = process.env.PORT || 8080

if (!ACCESS_TOKEN || !VALIDATION_TOKEN || !APP_SECRET) {
  throw new Error('Access, App Secret and/or validation token is not defined')
}

const app = express()

app.use('/webhook', express.json({
  verify: (req, res, buf) => {
    const signature = req.get('x-hub-signature')
    if (!signature) throw new Error('No signature')

    const elements = signature.split('=')
    const algo = elements[0]
    const defined = elements[1]
    const expected = hash(algo, buf, APP_SECRET)

    if (defined !== expected) {
      res.status(403).send('Invalid signature')
    }
  }
}))

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode']
  const verifyToken = req.query['hub.verify_token']
  const challenge = req.query['hub.challenge']

  if (mode === 'subscribe' && verifyToken === VALIDATION_TOKEN) {
    res.status(200).send(challenge)
  } else {
    res.status(403).send('Mode/verification token doesn\'t match')
  }
})

app.post('/webhook', (req, res) => {
  const data = req.body
  if (data.object !== 'page') {
    res.status(403).send('An error has occurred')
    return
  }

  data.entry.forEach(entry => {
    entry.messaging.forEach(event => {
      if (event.message) {
        receivedMessage(event)
        res.status(200).send('Success')
      } else if (event.postback) {
        receivedPostback(event)
        res.status(200).send('Success')
      } else {
        res.status(400).send('Unknown/unsupported event')
      }
    })
  })
})

async function getHelp (senderID) {
  const help = 'Simply enter the song\'s title then click "GET LYRICS" on ' +
    'your selected song to display the lyrics'

  await send(senderID, help)
}

async function receivedMessage (event) {
  const senderID = event.sender.id
  const message = event.message
  const text = message.text

  if (message.text) {
    if (text === '/help') {
      await getHelp(senderID)
      return
    }

    const elements = await searchSong(text)
    if (typeof elements === 'string') {
      await send(senderID, elements)
    } else {
      const attachment = {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: elements
        }
      }

      await send(senderID, attachment, 'attachment')
    }
  }
}

async function receivedPostback (event) {
  const senderID = event.sender.id
  const postback = event.postback
  const payload = postback.payload

  if (payload === 'GET_HELP') {
    await getHelp(senderID)
  } else if (payload.startsWith('LYRICS_')) {
    const path = payload.split('_')[1]
    const lyrics = await getLyrics(path)
    await send(senderID, lyrics)
  }
}

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Exiting process...')
    process.exit(0)
  })
})

server.on('close', async () => {
  console.log('Server is closing...')
})

module.exports = { app, server }
