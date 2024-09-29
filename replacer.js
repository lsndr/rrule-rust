module.exports.default = ({ orig, file }) => {
  if (file.includes('dist/browser') && orig == 'require("@lib")') {
    return 'require("@rrule-rust/lib-wasm32-wasi")';
  } else if (file.includes('dist/node') && orig == 'require("@lib")') {
    return 'require("./lib")';
  }

  return orig;
};
