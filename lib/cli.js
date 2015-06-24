var debugSupport = true;

var args = process.argv.slice(2);


if (!args[0]) {
  process.exit(1);
}

var isPlainText = args[0] == '--plain';


var generatorName = args[isPlainText ? 1 : 0];


process.stdin.setEncoding('utf8');

debug('start yeoman cli');
var yeomanEnv = require('yeoman-environment');
debug('end yeoman cli');

var env = yeomanEnv.createEnv(['nameValue'], null, new Adapter);

var outHandler = (function () {
  var answerCallback = null;

  process.stdin.on('readable', function () {
    var chunk = process.stdin.read();
    if (answerCallback != null && chunk) {
      debug('read chunk ' + chunk);
      answerCallback(chunk);
    }
  });

  return {
    passCallback: function (callback) {
      answerCallback = callback;
    },
  }
})();

env.lookup(function () {
  env.run(generatorName);
})

/**
 * @constructor
 */
function Adapter() {
  debug('adapter create');
  this.prompt = Prompt;
  this.log = function (v) {
    debug(v);
  }
}

function Prompt(questionsAndAnswers, callback) {
  debug('run prompt');
  if (!Array.isArray(questionsAndAnswers)) {
    questionsAndAnswers = [questionsAndAnswers];
  }
  processOneQuestion(questionsAndAnswers, callback, {});
}

function processOneQuestion(questionsAndAnswers, callback, result) {
  var curr = questionsAndAnswers.shift();

  debug('current result ' + JSON.stringify(result));
  if (curr.when && !curr.when(result)) {
    //skip
    if (questionsAndAnswers.length == 0) {
      callback(result);
    } else {
      processOneQuestion(questionsAndAnswers, callback, result);
    }

    return;
  }
  printMessage(curr);

  outHandler.passCallback(function (v) {
    debug('run callback');
    setAnswer(curr, v, result);
    if (questionsAndAnswers.length > 0) {
      processOneQuestion(questionsAndAnswers, callback, result);
    } else {
      callback(result);
    }
  });
}

function setAnswer(questionWithAnswers, userReplayString, result) {
  if (userReplayString === '\n') {
    //set default
    debug('set default answer');
    switch (questionWithAnswers.type) {
      case 'confirm':
      default :
        result[questionWithAnswers.name] = questionWithAnswers.default;
    }
  } else {
    //set answer
  }

  debug('current answer ' + JSON.stringify(result));
}

function printMessage(questionWithAnswers) {
  if (isPlainText) {
    //print plain text
    process.stdout.write(questionWithAnswers.message + '\n');
  } else {
    var stringAnswers = JSON.stringify(questionWithAnswers);
    process.stdout.write(stringAnswers + '\n');
  }
}


function debug(v) {
  if (debugSupport) console.log('--debug ' + v);
}


