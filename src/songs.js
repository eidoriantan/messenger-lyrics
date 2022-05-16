
const querystring = require('querystring')
const axios = require('axios').default
const JSDOM = require('jsdom').JSDOM

const GENIUS_URL = 'https://genius.com'
const GENIUS_ENDPOINT = 'https://api.genius.com'
const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN

async function searchSong (text) {
  const query = querystring.stringify({
    access_token: GENIUS_ACCESS_TOKEN,
    q: text
  })

  const url = `${GENIUS_ENDPOINT}/search?${query}`
  const response = await axios.get(url)
  const results = []

  if (response.status === 200) {
    const hits = response.data.response.hits
    for (let i = 0; i < hits.length && i < 5; i++) {
      const song = hits[i].result

      results.push({
        title: song.full_title,
        image_url: song.header_image_thumbnail_url,
        subtitle: song.title,
        buttons: [{
          type: 'postback',
          title: 'Get Lyrics',
          payload: `LYRICS_${song.path.slice(1)}`
        }, {
          type: 'web_url',
          url: song.url,
          title: 'Open on Genius'
        }]
      })
    }
  }

  return results
}

async function getLyrics (path) {
  const url = `${GENIUS_URL}/${path}`
  const response = await axios.get(url, {
    responseType: 'document'
  })

  let lyrics = ''
  const dom = new JSDOM(response.data)
  const document = dom.window.document
  const container = document.getElementById('lyrics-root')
  const lyricsContainers = container.querySelectorAll('[data-lyrics-container]')

  for (let i = 0; i < lyricsContainers.length; i++) {
    const lyric = lyricsContainers[i]
    const excludes = lyric.querySelectorAll('[data-exclude-from-selection]')

    for (let j = 0; j < excludes.length; j++) {
      const exclude = excludes[j]
      lyric.removeChild(exclude)
    }

    lyrics += lyric.innerHTML.replace(/<br ?\/?>/g, '\r\n')
      .replace(/<\/?[a-z]+[^>]*>/g, '')
  }

  return lyrics
}

module.exports = { searchSong, getLyrics }
