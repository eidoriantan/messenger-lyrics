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

const querystring = require('querystring')
const axios = require('axios').default
const JSDOM = require('jsdom').JSDOM

const GENIUS_URL = 'https://genius.com'
const GENIUS_ENDPOINT = 'https://api.genius.com'
const GENIUS_ACCESS_TOKEN = process.env.GENIUS_ACCESS_TOKEN

if (!GENIUS_ACCESS_TOKEN) {
  throw new Error('GENIUS access token is not defined')
}

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
    if (hits.length === 0) return 'No results'

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
          type: 'postback',
          title: 'Get Stats',
          payload: `STATS_${song.id}`
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

async function getStats (id) {
  const query = querystring.stringify({
    access_token: GENIUS_ACCESS_TOKEN
  })

  const url = `${GENIUS_ENDPOINT}/songs/${id}?${query}`
  const response = await axios.get(url)
  const song = response.data.response.song
  const stats = song.stats
  stats.language = song.language

  return stats
}

module.exports = { searchSong, getLyrics, getStats }
