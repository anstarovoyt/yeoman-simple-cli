var cli = require('./cli');
var debug = cli.debugFunction;

function conformHandler(questionWithAnswers, userReplayString) {

  function convertConformToBoolean() {
    if (userReplayString == "1") return true;
    if (userReplayString == "0") return false;
    var s = userReplayString.trim().toLocaleLowerCase();
    return (s == "y" || s == "yes" || s == "true");
  }

  if (isUseDefault(userReplayString)) {
    debug('set default answer');
    return questionWithAnswers.default;
  }
  //set answer
  return convertConformToBoolean();
}

function isUseDefault(userReplayString) {
  return userReplayString === '\n';
}


module.exports = {
  defaultHandler: conformHandler
}
