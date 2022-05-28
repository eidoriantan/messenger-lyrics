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
