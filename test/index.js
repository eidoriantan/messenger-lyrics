
/* eslint-env mocha */

const should = require('should')
const { searchSong, getLyrics } = require('../src/songs')

describe('GENIUS API', () => {
  it('Search song', async () => {
    const results = await searchSong('payphone maroon 5')
    results.length.should.be.above(0)
  })

  it('Get lyrics', async () => {
    const results = await getLyrics('Maroon-5-payphone-lyrics')
    const line = 'I\'m at a payphone, trying to call home'
    should.strictEqual(results.split('\r\n')[1], line)
  })
})
