export interface OperationOptions {
  disabled: boolean;
}

export class OperationCache {
  private _disabled: boolean;
  private readonly store: Map<string, any>;

  public constructor({ disabled }: OperationOptions) {
    this._disabled = disabled;
    this.store = new Map<string, any>();
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  public getOrSet<T>(key: string, defaultValue: T): T {
    if (this.disabled) {
      return defaultValue;
    }

    if (this.store.has(key)) {
      return this.store.get(key);
    }

    this.store.set(key, defaultValue);
    return defaultValue;
  }

  public getOrCompute<T>(key: string, compute: () => T): T {
    if (this.disabled) {
      return compute();
    }

    if (this.store.has(key)) {
      return this.store.get(key);
    }

    const value = compute();
    this.store.set(key, value);

    return value;
  }

  public disable(): void {
    this._disabled = true;
  }

  public enable(): void {
    this._disabled = false;
  }

  public clear(): void {
    this.store.clear();
  }

  public clone(): OperationCache {
    return new OperationCache({
      disabled: this.disabled,
    });
  }
}
