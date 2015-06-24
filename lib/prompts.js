var cli = require('./cli');
var debug = cli.debugFunction;

function confirmHandler(questionWithAnswers, userReplayString) {
  function convertStringReplayToBoolean() {
    if (userReplayString == "1") return true;
    if (userReplayString == "0") return false;
    var s = userReplayString.trim().toLocaleLowerCase();
    return (s == "y" || s == "yes" || s == "true");
  }

  if (isUseDefault(userReplayString)) {
    debug('set default answer');
    return questionWithAnswers.default || false;
  }

  return convertStringReplayToBoolean();
}


function inputHandler(questionWithAnswers, userReplayString) {
  if (isUseDefault(userReplayString)) {
    debug('set default answer');
    return questionWithAnswers.default || "noname";
  }

  return userReplayString.trim();
}

function isUseDefault(userReplayString) {
  return userReplayString === '\n';
}

function checkboxHandler(questionWithAnswers, userReplayString) {
  var choices = questionWithAnswers.choices;

  var arrResult = [];
  if (isUseDefault(userReplayString)) {
    choices.forEach(function (v) {
      if (v.checked) {
        arrResult.push(v.value);
      }
    });
  } else {
    userReplayString.trim().split(",").forEach(function (v) {
      arrResult.push(choices[parseInt(v.trim())].value);
    })
  }

  return arrResult;
}


module.exports = {
  defaultHandler: confirmHandler,
  handlers: {
    confirm: confirmHandler,
    input: inputHandler,
    checkbox: checkboxHandler
  }
}
