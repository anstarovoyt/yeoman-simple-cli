var path = require('path');

module.exports = {debugFunction: debug}
process.stdin.setEncoding('utf8');
var prompts = require('./prompts');

var debugSupport = true;

function parseArgs(args) {
  var options = {}

  for (var i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--generatorPath":
      {
        options.generatorPath = (++i < args.length) ? args[i] : null;
        break;
      }
      case "--generatorName":
      {
        options.generatorName = (++i < args.length) ? args[i] : null;
        break;
      }
      case "--yeoman":
      {
        options.yeoman = (++i < args.length) ? args[i] : null;
        break;
      }
      case "--arguments":
      {
        options.arguments = (++i < args.length) ? args[i].split(' ') : null;
        break;
      }
      case "--plain":
      {
        options.plain = true;
        break;
      }
      default: //do nothing
    }
  }

  return options;
}

var options = parseArgs(process.argv.slice(2));

var prefix = (options.yeoman ? options.yeoman + path.sep + 'node_modules' + path.sep : '');
var inquirer = require(prefix + 'inquirer');
var yeomanEnv = require(prefix + 'yeoman-environment');


var env = yeomanEnv.createEnv(options.arguments, null, new Adapter);
var inputHandler = (function () {
  return {
    waitInput: function (getResultFunction, question, callback) {
      debug("start waiting");
      //process.stdin.removeAllListeners('readable');

      debug( require('events').EventEmitter.listenerCount(process, 'readable'));

      var listener;

      function drop() {
        if (listener) {
          debug("remove listener");
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

      debug("add listener");
      process.stdin.on('readable', listener);
    }
  }
})();

//will works without hacks in the next versions
var callbackDone = function () {
  debug('done run generator');
}
if (options.generatorName) {
  env.lookup(function () {
    env.run(generatorName, null, callbackDone);
  });
} else if (options.generatorPath) {
  env.register(options.generatorPath, 'generator');
  env.run('generator', callbackDone);
} else {
  throw new Error("You should specify generatorName or generatorPath");
}
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
  if (options.plain) {
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
