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

function checkboxHandler(questionWithAnswers, userReplayString) {
  var choices = questionWithAnswers.choices;

  var arrResult = [];
  if (isUseDefault(userReplayString)) {
    choices.forEach(function (v) {
      if (v.checked) {
        arrResult.push(choiceToResult(v));
      }
    });
  } else {
    userReplayString.trim().split(",").forEach(function (v) {
      var choice = choices[getNumber(v)];
        arrResult.push(choiceToResult(choice));
    })
  }

  return arrResult;
}

function listHandler(questionWithAnswers, userReplayString) {
  var choices = questionWithAnswers.choices;
  if (isUseDefault(userReplayString)) {
    return choices[questionWithAnswers.default];
  } else {
    return choices[getNumber(userReplayString) || 0];
  }
}

function isUseDefault(userReplayString) {
  return userReplayString === '\n';
}

function choiceToResult(choice) {
  return choice.value || choice.name;
}

function getNumber(rawNumber) {
  try {
    return parseInt(rawNumber.trim());
  } catch (e) {
    debug(e);
  }
}


module.exports = {
  defaultHandler: confirmHandler,
  handlers: {
    confirm: confirmHandler,
    input: inputHandler,
    checkbox: checkboxHandler,
    list: listHandler,
    rawlist: listHandler
  }
}
