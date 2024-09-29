import {
  instantiateNapiModuleSync as __emnapiInstantiateNapiModuleSync,
  getDefaultContext as __emnapiGetDefaultContext,
  WASI as __WASI,
  createOnMessage as __wasmCreateOnMessageForFsProxy,
} from '@napi-rs/wasm-runtime'

import __wasmUrl from './rrule-rust.wasm32-wasi.wasm?url'

const __wasi = new __WASI({
  version: 'preview1',
})

const __emnapiContext = __emnapiGetDefaultContext()

const __sharedMemory = new WebAssembly.Memory({
  initial: 4000,
  maximum: 65536,
  shared: true,
})

const __wasmFile = await fetch(__wasmUrl).then((res) => res.arrayBuffer())

const {
  instance: __napiInstance,
  module: __wasiModule,
  napiModule: __napiModule,
} = __emnapiInstantiateNapiModuleSync(__wasmFile, {
  context: __emnapiContext,
  asyncWorkPoolSize: 4,
  wasi: __wasi,
  onCreateWorker() {
    const worker = new Worker(new URL('./wasi-worker-browser.mjs', import.meta.url), {
      type: 'module',
    })

    return worker
  },
  overwriteImports(importObject) {
    importObject.env = {
      ...importObject.env,
      ...importObject.napi,
      ...importObject.emnapi,
      memory: __sharedMemory,
    }
    return importObject
  },
  beforeInit({ instance }) {
    __napi_rs_initialize_modules(instance)
  },
})

function __napi_rs_initialize_modules(__napiInstance) {
  __napiInstance.exports['__napi_register__Frequency_0']?.()
  __napiInstance.exports['__napi_register__Month_1']?.()
  __napiInstance.exports['__napi_register__NWeekday_struct_2']?.()
  __napiInstance.exports['__napi_register__RRule_struct_3']?.()
  __napiInstance.exports['__napi_register__RRule_impl_21']?.()
  __napiInstance.exports['__napi_register__RRuleSet_struct_22']?.()
  __napiInstance.exports['__napi_register__RRuleSet_impl_36']?.()
  __napiInstance.exports['__napi_register__RRuleSetIterator_struct_37']?.()
  __napiInstance.exports['__napi_register__RRuleSetIterator_impl_39']?.()
  __napiInstance.exports['__napi_register__Weekday_40']?.()
}
export const RRule = __napiModule.exports.RRule
export const RRuleSet = __napiModule.exports.RRuleSet
export const RRuleSetIterator = __napiModule.exports.RRuleSetIterator
export const Frequency = __napiModule.exports.Frequency
export const Month = __napiModule.exports.Month
export const Weekday = __napiModule.exports.Weekday
