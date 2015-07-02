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
  var start = false;
  var handlerCallback = null;
  var chunkTotal = '';
  var listener = function (chunk) {
    if (chunk != null) {
      debug('current chunk ' + chunk);
      chunkTotal += chunk;
      if (chunk.indexOf('\n') != -1) {
        debug('handle total chunks ' + chunkTotal);
        handlerCallback(chunkTotal);
        chunkTotal = '';
      }
    }
  };

  process.stdin.on('data', listener);


  return {
    waitInput: function (getResultFunction, question, callback) {


      if (!start) {
        //process.stdin.removeAllListeners('readable');

        start = true;
      }

      handlerCallback = function (chunk) {
        handlerCallback = null;
        process.stdin.pause();
        callback(getResultFunction(question, chunk));
      }
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
  env.register(options.generatorPath, 'angular');
  env.run('angular', callbackDone);
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

    var listener = function (line) {
      callback(getResultFunction(question, line));
      rl.removeListener('line', listener);
    };

    rl.on('line', listener);


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
