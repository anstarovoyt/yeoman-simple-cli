var path = require('path');

module.exports = {debugFunction: debug}
process.stdin.setEncoding('utf8');
var prompts = require('./prompts');
var debugSupport = true;
function parseArgs(args) {
  if (!args || args.length == 0) {
    console.log('Possible options:');
    console.log('--generatorName NAME - name with namespace of the generator (Required)');
    console.log('--generatorPath PATH - path to generator folder');
    console.log('--yeoman PATH - path to yeoman nodejs package');
    console.log('--plain - by default output uses json format. If you want to use plain string specify the parameter');
    process.exit(0);
  }

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

var callbackDone = function () {
  debug('done run generator');
}


var cwd = process.cwd();
if (options.generatorPath) {
  process.chdir(options.generatorPath);
  debug('invoke run');
  env.lookup(function () {
    debug('invoke run');
    process.chdir(cwd);
    env.run(options.generatorName, null, callbackDone);
  });
} else if (options.generatorName) {
  env.lookup(function () {
    debug('invoke run');
    env.run(options.generatorName, null, callbackDone);
  });
} else {
  throw new Error("You should specify generatorName");
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
