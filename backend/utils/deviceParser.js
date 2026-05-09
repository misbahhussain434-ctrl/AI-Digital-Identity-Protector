const UAParser = require('ua-parser-js');

function parseDevice(userAgentString) {
  const parser = new UAParser(userAgentString || '');
  const result = parser.getResult();

  return {
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device: result.device.type || 'desktop',
  };
}

module.exports = { parseDevice };
