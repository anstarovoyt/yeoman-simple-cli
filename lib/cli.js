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
var inputHandler = (function () {
  return {
    waitInput: function (getResultFunction, question, callback) {
      process.stdin.removeAllListeners('readable');
      var listener;

      function drop() {
        if (listener) {
          process.stdin.removeListener('readable', listener);
        }
      }

      listener = function (v) {
        var chunk = process.stdin.read();
        debug('event ' + chunk);
        if (chunk || chunk == '\n') {
          debug('read chunk ' + chunk);
          drop();
          callback(getResultFunction(question, chunk));
        }
      };

      process.stdin.on('readable', listener);
    }
  }
})();

//will works without hacks in the next versions
env.lookup(function () {
  env.run(generatorName, null, function () {
    debug('done run generator');
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

    inputHandler.waitInput(getResultFunction, question, callback);
  }

  return this;
}


function printMessage(questionWithAnswers) {
  if (isPlainText) {
    //print plain text
    process.stdout.write(questionWithAnswers.message + '\n');
    if (questionWithAnswers.choices) {
      var index = 0;
      questionWithAnswers.choices.forEach(function (v) {
        if (v instanceof String) {
          process.stdout.write('' + (index++) + ' ' + v + '\n')
        } else {
          process.stdout.write('' + (index++) + ' ' + (v.name || v.value) + (v.checked ? ' x' : '') + '\n');
        }
      });
    }
  } else {
    var stringAnswers = JSON.stringify(questionWithAnswers);
    debug(stringAnswers);
    process.stdout.write(stringAnswers + '\n');
  }
}


function debug(v) {
  if (debugSupport) console.log('--debug ' + v);
}
