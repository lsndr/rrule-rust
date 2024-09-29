module.exports.default = ({ orig, file }) => {
  if (!file.includes('dist/node') || orig !== 'require("@lib")') {
    return 'require("./lib")';
  }

  return 'require("./lib")';
};
