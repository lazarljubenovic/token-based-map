import { ConflictOnSet, NotFound } from './errors.js'


declare const TYPE: unique symbol

export class Token<T = unknown> {

  declare public readonly [TYPE]: T

  readonly #name: string

  public constructor (name: string) {
    this.#name = name
  }

  public toString (): string {
    return `Token(${this.#name})`
  }

}

export interface ReadonlyTokenBasedMap {

  has (key: Token): boolean

  get<T> (key: Token<T>, options?: { readonly onMiss: 'null' }): T | null

  get<T> (key: Token<T>, options: { readonly onMiss: 'throw' }): T

}

export class TokenBasedMap implements ReadonlyTokenBasedMap {

  private readonly _map = new Map()

  public has (key: Token): boolean {
    return this._map.has(key)
  }

  public get<T> (key: Token<T>, options?: { readonly onMiss: 'null' }): T | null
  public get<T> (key: Token<T>, options: { readonly onMiss: 'throw' }): T
  public get<T> (
    key: Token<T>,
    { onMiss = 'null' }: { readonly onMiss?: 'null' | 'throw' } = {},
  ): T | null {
    const exists = this.has(key)
    if (!exists) {
      switch (onMiss) {
        case 'null':
          return null
        case 'throw':
          throw new NotFound(this, key)
      }
    }
    return this._map.get(key)
  }

  public set<T> (
    key: Token<T>,
    value: T,
    { onConflict = 'overwrite' }: { readonly onConflict?: 'overwrite' | 'ignore' | 'throw' } = {},
  ): this {
    const isConflict = this.has(key)
    if (isConflict) {
      switch (onConflict) {
        case 'overwrite':
          break
        case 'ignore':
          return this
        case 'throw':
          throw new ConflictOnSet(this, key, value)
      }
    }
    this._map.set(key, value)
    return this
  }

  public delete (key: Token, { onMiss = 'ignore' }: { readonly onMiss?: 'ignore' | 'throw' } = {}): void {
    if (!this.has(key)) {
      switch (onMiss) {
        case 'ignore':
          return
        case 'throw':
          throw new NotFound(this, key)
      }
    }
    this._map.delete(key)
  }

}
