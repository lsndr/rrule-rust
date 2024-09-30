module.exports.default = ({ orig, file }) => {
  if (!file.includes('dist/browser') || orig !== "from '@lib'") {
    return orig;
  }

  return "from '@rrule-rust/lib-wasm32-wasi'";
};
