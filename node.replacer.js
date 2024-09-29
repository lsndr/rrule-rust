module.exports.default = ({ orig, file }) => {
  if (!file.includes('dist/node') || orig !== 'require("@lib")') {
    return orig;
  }

  return 'require("./lib")';
};
