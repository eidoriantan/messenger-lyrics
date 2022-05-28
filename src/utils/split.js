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
