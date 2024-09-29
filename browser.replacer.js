module.exports.default = ({ orig, file }) => {
  if (!file.includes('dist/browser') || orig !== 'require("@lib")') {
    return orig;
  }

  return 'require("@rrule-rust/lib-wasm32-wasi")';
};
