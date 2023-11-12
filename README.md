# token-based-map

A simple way to store and retrieve arbitrary data in a type-safe way without using generics. Useful when a system requires occasionally sharing data between loosely coupled components (the middleware pattern, interceptors, complex pipelines).

## Usage

```
$ npm install token-based-map
```

```ts
import { Token, TokenBasedMap } from 'token-based-map'

// Create a map. Note how there is not type information at
// this level. The map itself doesn't retain type information
// about its contents.
const map = new TokenBasedMap()

// Tokens are the only things you can use as keys in the map.
// Type information is stored in them. The string given
// through the constructor is for debugging purposes only.
const A_TOKEN = new Token<number>('a token')

// Type checking happens when setting and getting values.
// Only numbers will be accepted for this token, due to the
// way the token is defined.
map.set(A_TOKEN, 3)

// When retreiving data from the map, type is inferred from
// the type of token. Even without an explicit type annotation,
// `retriesCount` will be of type `number | null`.
const retriesCount = map.get(A_TOKEN)

// If the map doesn't contain a particular token set, `null`
// will be returned by default. You can change this behavior
// by supplying the second argument. This returns a `number`.
const retriesCount2 = map.get(A_TOKEN, { onMiss: 'throw' })

// To check if a key is set, use `has`.
const isPresent = map.has(A_TOKEN)

// When setting a value for a key that's already been set, the 
// default behavior is to overwrite the previous value. You can
// choose to throw an error instead or ignore the attempt.
map.set(A_TOKEN, 4, { onConflict: 'throw' })
map.set(A_TOKEN, 5, { onConflict: 'ignore' })

// Deleting a key is straight-forward as well. If you're trying
// to delete a key that hasn't been set, nothing happens by
// default. You can choose to raise an error instead.
map.delete(A_TOKEN)
map.delete(A_TOKEN, { onMiss: 'throw' })
```

## Differences from a `Map`

### No initializer

You can initialize a map by feeding it with an iterable of key-value pairs through the constructor.

```ts
const map = new Map([['a', 1], ['b', 2]])
```

Due to difficulties in type-checking such an iterable, this is not allowed in `TokenBasedMap`. All maps are created empty.

```ts
const map = new TokenBasedMap()
```

### `null` instead of `undefined`

When getting a value for a key which isn't in the map, `Map` returns `undefined`.

```ts
const map = new Map()
console.assert(map.get('a') === undefined)
```

A `TokenBasedMap` will return a `null` instead.

```ts
const map = new TokenBasedMap()
const token = new Token<number>('demo')
console.assert(map.get(token) === null)
```

### No iteration

You can iterate over key-value pairs in a `Map`.

```ts
for (const [key, value] of map) {
  console.log(key, value)
}
map.forEach(([key, value]) => {
  console.log(key, value)
})
```

This is not possible with a `TokenBasedMap` by design. If it were, you'd be able to access (and change) arbitrary data. Tokens are “keys” in the literal sense too; you need the dedicated key to unlock the value.

### No clearing everything

Similarly to above, you cannot clear everything from a `TokenBasedMap` like you can with a `Map`.

```ts
const map = new Map()
map.clear()
```

The rationale is the same as previously: it would allow deleting tokens that a particular piece of logic should not have access to.
