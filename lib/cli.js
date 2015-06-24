var inquirer = require('inquirer');
var yeomanEnv = require('yeoman-environment');

module.exports = {debugFunction: debug}
process.stdin.setEncoding('utf8');
var prompts = require('./prompts');

var debugSupport = true;
var args = process.argv.slice(2);

if (!args[0]) {
  process.exit(1);
}

var isPlainText = args[0] == '--plain';
var generatorName = args[isPlainText ? 1 : 0];

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
  //process.chdir("/Users/anstarovoyt/git/yeoman-simple-cli/app");
  env.run(generatorName, null, function () {
    process.stdin.pause();
  });
});


/**
 * @constructor
 */
function Adapter() {
  debug('adapter create');
  this.prompt = inquirer.createPromptModule();

  Object.keys(this.prompt.prompts).forEach(function (name) {
    this.prompt.registerPrompt(name, Prompt.bind(null, prompts.handlers[name] || prompts.defaultHandler));
  }, this);


  this.log = yeomanEnv.util.log();

}


/**
 * @constructor
 */
function Prompt(getResultFunction, question, rl, answers) {
  this.question = question;
  this.rl = rl;
  this.answers = answers;


  this.run = function (callback) {
    printMessage(question);

    outHandler.passCallback(function (v) {
      debug('run callback');
      ;
      callback(getResultFunction(question, v));
    });
  }

  return this;
}


function printMessage(questionWithAnswers) {
  if (isPlainText) {
    //print plain text
    process.stdout.write(questionWithAnswers.message + '\n');
  } else {
    var stringAnswers = JSON.stringify(questionWithAnswers);
    debug(stringAnswers);
    process.stdout.write(stringAnswers + '\n');
  }
}


function debug(v) {
  if (debugSupport) console.log('--debug ' + v);
}
