import { describe, expect, it } from '@jest/globals'
import * as TypeCheck from 'conditional-type-checks'
import { Token, TokenBasedMap } from './token-based-map.js'
import { ConflictOnSet, NotFound } from './errors.js'

describe(`Token`, () => {

  it(`assumes no type`, () => {
    const token = new Token('rock')
    TypeCheck.assert<TypeCheck.IsExact<typeof token, Token<unknown>>>(true)
  })

  it(`respects the chosen type`, () => {
    const token = new Token<string>('stone')
    TypeCheck.assert<TypeCheck.IsExact<typeof token, Token<string>>>(true)
    TypeCheck.assert<TypeCheck.IsExact<typeof token, Token<number>>>(false)
  })

  it(`serializes to a recognizable string`, () => {
    const token = new Token('rock and stone')
    expect(token.toString()).toBe(`Token(rock and stone)`)
  })

})

describe(`TokenBasedMap`, () => {

  const A_STRING = new Token<string>('A_STRING')
  const A_NUMBER = new Token<number>('A_NUMBER')

  describe(`set`, () => {

    it(`sets the token with the correct type`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'some string')
      expect(map.get(A_STRING)).toBe('some string')
    })

    it(`reports a type error when attempting to use a wrong type`, () => {
      const map = new TokenBasedMap()
      // @ts-expect-error
      map.set(A_NUMBER, 'not a number')
    })

    it(`overwrites the value by default when using the same key twice`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'first')
      map.set(A_STRING, 'second')
      expect(map.get(A_STRING)).toBe('second')
    })

    it(`overwrites the value explicitly when using the same key twice`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'first', { onConflict: 'overwrite' })
      map.set(A_STRING, 'second', { onConflict: 'overwrite' })
      expect(map.get(A_STRING)).toBe('second')
    })

    it(`ignores an attempt to overwrite a value when it already exists`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'first', { onConflict: 'ignore' })
      map.set(A_STRING, 'second', { onConflict: 'ignore' })
      expect(map.get(A_STRING)).toBe('first')
    })

    it(`throws on attempt to use the same key twice when explicit`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'first', { onConflict: 'throw' })
      expect(() => {
        map.set(A_STRING, 'second', { onConflict: 'throw' })
      }).toThrowError(ConflictOnSet)
    })

  })

  describe(`get`, () => {

    it(`returns null when map is empty`, () => {
      const map = new TokenBasedMap()
      expect(map.get(A_STRING)).toBeNull()
    })

    it(`returns the value when found`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'stringy')
      map.set(A_NUMBER, 2103)
      expect(map.get(A_STRING)).toBe('stringy')
      expect(map.get(A_NUMBER)).toBe(2103)
    })

    it(`returns null by default when key is not found`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'stringy')
      expect(map.get(A_NUMBER)).toBeNull()
    })

    it(`returns null explicitly when key is not found`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'stringy')
      expect(map.get(A_NUMBER, { onMiss: 'null' })).toBeNull()
    })

    it(`throws explicitly when key is not found`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'stringy')
      expect(() => {
        map.get(A_NUMBER, { onMiss: 'throw' })
      }).toThrowError(NotFound)
    })

    it(`returns type T | null by default when queried`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'some string')
      const queried = map.get(A_STRING)
      TypeCheck.assert<TypeCheck.IsExact<typeof queried, string | null>>(true)
    })

    it(`returns type T | null when misses are explicitly allowed`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'some string')
      const queried = map.get(A_STRING, { onMiss: 'null' })
      TypeCheck.assert<TypeCheck.IsExact<typeof queried, string | null>>(true)
    })

    it(`returns type T when misses are explicitly disallowed`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'some string')
      const queried = map.get(A_STRING, { onMiss: 'throw' })
      TypeCheck.assert<TypeCheck.IsExact<typeof queried, string>>(true)
    })

  })

  describe(`has`, () => {

    it(`returns false when map is empty`, () => {
      const map = new TokenBasedMap()
      expect(map.has(A_STRING)).toBe(false)
    })

    it(`returns false when key is not present`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'string')
      expect(map.has(A_NUMBER)).toBe(false)
    })

    it(`returns true when key is present`, () => {
      const map = new TokenBasedMap()
      map.set(A_STRING, 'string')
      expect(map.has(A_STRING)).toBe(true)
    })

  })

  describe(`delete`, () => {

    it(`deletes a token`, () => {
      const map = new TokenBasedMap()
      map.set(A_NUMBER, 2103)
      expect(map.has(A_NUMBER)).toBe(true)
      map.delete(A_NUMBER)
      expect(map.has(A_NUMBER)).toBe(false)
    })

    it(`does nothing by default when token doesn't exist`, () => {
      const map = new TokenBasedMap()
      map.delete(A_NUMBER)
    })

    it(`does nothing explicitly when token doesn't exist`, () => {
      const map = new TokenBasedMap()
      map.delete(A_NUMBER, { onMiss: 'ignore' })
    })

    it(`throws explicitly when token doesn't exist`, () => {
      const map = new TokenBasedMap()
      expect(() => {
        map.delete(A_NUMBER, { onMiss: 'throw' })
      }).toThrowError(NotFound)
    })

  })

})
