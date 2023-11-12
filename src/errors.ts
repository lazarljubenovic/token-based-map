import { Token, TokenBasedMap } from './token-based-map.js'


export class NotFound<T> extends Error {

  public constructor (
    private readonly map: TokenBasedMap,
    private readonly key: Token<T>,
  ) {
    super()
  }

  public override get message (): string {
    return `Looking up “${this.key}” yielded no results.`
  }

}

export class ConflictOnSet<T> extends Error {

  public constructor (
    private readonly map: TokenBasedMap,
    private readonly key: Token<T>,
    private readonly value: T,
  ) {
    super()
  }

  public override get message (): string {
    return `Conflict while trying to set ${this.key} to “${this.value}”; already set to “${this.map.get(this.key)}”.`
  }

}
