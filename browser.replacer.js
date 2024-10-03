module.exports.default = ({ orig, file }) => {
  if (!file.includes('dist/browser')) {
    return orig;
  }

  switch (orig) {
    case "from '@lib'":
      return "from '@rrule-rust/lib-wasm32-wasi'";
    case "require('@napi-rs/wasm-runtime')":
      return "frequire('./runtime.js')";
    case "from '@napi-rs/wasm-runtime'":
      return "from './runtime.js'";
    default:
      return orig;
  }
};
