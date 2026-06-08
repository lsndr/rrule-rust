import { RRule } from './rrule';
import {
  type RRuleSetIterator,
  RRuleSet as Rust,
  ExDate as RustExDate,
  RDate as RustRDate,
} from './lib';
import {
  type RRuleValue,
  fromInt32,
  fromFlatInt32,
  toInt32,
  toFlatInt32,
} from './temporal';
import { OperationCache } from './cache';

export interface RRuleSetCache {
  disabled: boolean;
  clear(): void;
  disable(): void;
  enable(): void;
}

export interface RRuleSetOptions<DT extends RRuleValue> {
  readonly dtstart: DT;
  readonly rrules?: readonly RRule<DT | undefined>[];
  readonly exrules?: readonly RRule<DT | undefined>[];
  readonly exdates?: readonly DT[];
  readonly rdates?: readonly DT[];
}

export class RRuleSet<DT extends RRuleValue> implements Iterable<DT> {
  public readonly dtstart: DT;
  public readonly rrules: readonly RRule<DT | undefined>[];
  public readonly exrules: readonly RRule<DT | undefined>[];
  public readonly exdates: readonly DT[];
  public readonly rdates: readonly DT[];

  private _cache: OperationCache = new OperationCache({ disabled: false });
  private rust?: Rust;

  public constructor(dtstart: DT);
  public constructor(options: RRuleSetOptions<DT>);
  public constructor(dtOrOptions: DT | RRuleSetOptions<DT>) {
    if (isOptions(dtOrOptions)) {
      this.dtstart = dtOrOptions.dtstart;
      this.rrules = dtOrOptions.rrules ?? [];
      this.exrules = dtOrOptions.exrules ?? [];
      this.exdates = dtOrOptions.exdates ?? [];
      this.rdates = dtOrOptions.rdates ?? [];
    } else {
      this.dtstart = dtOrOptions;
      this.rrules = [];
      this.exrules = [];
      this.exdates = [];
      this.rdates = [];
    }
  }

  public get cache(): RRuleSetCache {
    return this._cache;
  }

  public static fromString<DT extends RRuleValue>(str: string): RRuleSet<DT> {
    return this.fromRust(Rust.parse(str));
  }

  /** @internal */
  public static fromRust<DT extends RRuleValue>(rust: Rust): RRuleSet<DT> {
    const set = new RRuleSet<DT>({
      dtstart: fromInt32<DT>(
        rust.dtstart[0]!,
        rust.dtstart[1]!,
        rust.dtstart[2]!,
        rust.dtstart[3]!,
        rust.dtstart[4]!,
        rust.dtstart[5]!,
        rust.dtstart[6]!,
      ),
      rrules: rust.rrules.map((rrule) => RRule.fromRust<DT | undefined>(rrule)),
      exrules: rust.exrules.map((rrule) =>
        RRule.fromRust<DT | undefined>(rrule),
      ),
      exdates: rust.exdates.flatMap((exdate) =>
        fromFlatInt32<DT>(exdate.values),
      ),
      rdates: rust.rdates.flatMap((rdate) => fromFlatInt32<DT>(rdate.values)),
    });

    set.rust = rust;

    return set;
  }

  public setDtStart<NDT extends RRuleValue>(dtstart: NDT): RRuleSet<NDT> {
    return new RRuleSet({
      dtstart,
      rrules: this.rrules as readonly RRule<NDT | undefined>[],
      exrules: this.exrules as readonly RRule<NDT | undefined>[],
      exdates: this.exdates as unknown as readonly NDT[],
      rdates: this.rdates as unknown as readonly NDT[],
    });
  }

  public addRRule(rrule: RRule<DT | undefined>): RRuleSet<DT> {
    return new RRuleSet({
      ...toOptions(this),
      rrules: [...this.rrules, rrule],
    });
  }

  public setRRules(rrules: readonly RRule<DT | undefined>[]): RRuleSet<DT> {
    return new RRuleSet({ ...toOptions(this), rrules });
  }

  public addExRule(rrule: RRule<DT | undefined>): RRuleSet<DT> {
    return new RRuleSet({
      ...toOptions(this),
      exrules: [...this.exrules, rrule],
    });
  }

  public setExRules(rrules: readonly RRule<DT | undefined>[]): RRuleSet<DT> {
    return new RRuleSet({ ...toOptions(this), exrules: rrules });
  }

  public addExDate(exdate: DT): RRuleSet<DT> {
    return new RRuleSet({
      ...toOptions(this),
      exdates: [...this.exdates, exdate],
    });
  }

  public addExDates(exdates: readonly DT[]): RRuleSet<DT> {
    return new RRuleSet({
      ...toOptions(this),
      exdates: [...this.exdates, ...exdates],
    });
  }

  public setExDates(exdates: readonly DT[]): RRuleSet<DT> {
    return new RRuleSet({ ...toOptions(this), exdates });
  }

  public addRDate(rdate: DT): RRuleSet<DT> {
    return new RRuleSet({
      ...toOptions(this),
      rdates: [...this.rdates, rdate],
    });
  }

  public addRDates(rdates: readonly DT[]): RRuleSet<DT> {
    return new RRuleSet({
      ...toOptions(this),
      rdates: [...this.rdates, ...rdates],
    });
  }

  public setRDates(rdates: readonly DT[]): RRuleSet<DT> {
    return new RRuleSet({ ...toOptions(this), rdates });
  }

  // TODO: add skip (?)
  public all(limit?: number): readonly DT[] {
    return this._cache.getOrCompute<DT[]>(`all:${limit}`, () =>
      fromFlatInt32<DT>(this.toRust().all(limit)),
    );
  }

  public between(after: DT, before: DT, inclusive?: boolean): readonly DT[] {
    return this._cache.getOrCompute(
      `between:${after.toString()},${before.toString()},${inclusive}`,
      () =>
        fromFlatInt32<DT>(
          this.toRust().between(toInt32(after), toInt32(before), inclusive),
        ),
    );
  }

  public setFromString(str: string): RRuleSet<DT> {
    return RRuleSet.fromRust<DT>(this.toRust().setFromString(str));
  }

  public toString(): string {
    return this.toRust().toString();
  }

  public [Symbol.iterator](): Iterator<DT, undefined, undefined> {
    const cache = this._cache.getOrSet('iterator:data', {
      values: [] as DT[],
      done: false,
    });
    let cacheIndex = 0;

    let iterAndStore: [RRuleSetIterator, Int32Array] | undefined;

    const getIterAndStore = () => {
      return (iterAndStore ??= [
        this.toRust().iterator(cache.values.length),
        new Int32Array(7),
      ]);
    };

    return {
      next: () => {
        const cachedValue = cache.values[cacheIndex++];

        if (cachedValue) {
          return { done: false, value: cachedValue };
        } else if (cache.done) {
          return { done: true as const, value: undefined };
        }

        const [iter, store] = getIterAndStore();
        const next = iter.next(store);

        if (!next) {
          cache.done = true;
          return { done: true as const, value: undefined };
        }

        const value =
          next === true
            ? fromInt32<DT>(
                store[0]!,
                store[1]!,
                store[2]!,
                store[3]!,
                store[4]!,
                store[5]!,
                store[6]!,
              )
            : fromInt32<DT>(
                next[0]!,
                next[1]!,
                next[2]!,
                next[3]!,
                next[4]!,
                next[5]!,
                next[6]!,
              );

        cache.values.push(value);

        return { done: false, value };
      },
    };
  }

  /** @internal */
  public toRust(): Rust {
    this.rust ??= new Rust(
      toInt32(this.dtstart),
      undefined,
      this.rrules.map((rrule) => rrule.toRust()),
      this.exrules.map((rrule) => rrule.toRust()),
      this.exdates.length > 0
        ? [new RustExDate(toFlatInt32(this.exdates))]
        : undefined,
      this.rdates.length > 0
        ? [new RustRDate(toFlatInt32(this.rdates))]
        : undefined,
    );

    return this.rust;
  }
}

function isOptions<DT extends RRuleValue>(
  x: DT | RRuleSetOptions<DT>,
): x is RRuleSetOptions<DT> {
  return (
    x !== null &&
    typeof x === 'object' &&
    'dtstart' in x &&
    !(x instanceof Temporal.ZonedDateTime) &&
    !(x instanceof Temporal.PlainDate)
  );
}

function toOptions<DT extends RRuleValue>(
  set: RRuleSet<DT>,
): RRuleSetOptions<DT> {
  return {
    dtstart: set.dtstart,
    rrules: set.rrules,
    exrules: set.exrules,
    exdates: set.exdates,
    rdates: set.rdates,
  };
}
