export interface IDictionary {
  add(key: string, value: any): void;
  remove(key: string): void;
  containsKey(key: string): any;
  keys(): string[];
  values(): any[];
  getIndex(index: number): any;
}

export class Dictionary {
  protected _keys: string[] = [];
  protected _values: any[] = [];
  constructor(init: {
    key: string;
    value: any;
  }[]) {
    for (var x = 0; x < init.length; x++) {
      this[init[x].key] = init[x].value;
      this._keys.push(init[x].key);
      this._values.push(init[x].value);
    }
  }

  add(key: string, value: any) {
    // this[key] = value;
    this._keys.push(key);
    this._values.push(value);
  }
  remove(key: string) {
    var index = this._keys.indexOf(key, 0);
    this._keys.splice(index, 1);
    this._values.splice(index, 1);
    // delete this[key];
  }
  get(key: string) {
    const index = this._keys.indexOf(key, 0);
    return this._values[index];
  }
  getIndex(index: number): any {
    return this._values[index];
  }
  set(key: string, value: any) {
    const index = this._keys.indexOf(key, 0);
    this._values[index] = value;
  }
  keys(): string[] {
    return this._keys;
  }

  get values(): Array<any> {
    return this._values;
  }

  length(): number {
    return this._keys.length;
  }
  containsKey(key: string) {
    if (!key) {
      return false;
    }
    return this._keys.indexOf(key) !== -1;
  }
  // toLookup(): IDictionary {
  //   return this;
  //}
  addSorted(key: string, value: any) {
    if (this._keys.length <= 0 || key > this._keys[this._keys.length - 1]) {
      this._keys.push(key);
      this._values.push(value);
      return;
    }
    if (key < this._keys[0]) {
      this._keys.splice(0, 0, key);
      this._values.splice(0, 0, value);
      return;
    }
    for (let i = 0; i < this._keys.length-1; i++) {
      if (key > this._keys[i] && key < this._keys[i + 1]) {
        this._keys.splice(i + 1, 0, key);
        this._values.splice(i + 1, 0, value);
        return;
      }
    }
  }
}
