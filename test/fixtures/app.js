var broadway = require('broadway');

module.exports = function() {
  return {
    plugins: new broadway.App()
  };
};
