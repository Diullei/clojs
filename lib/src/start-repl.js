(function() {
  var closer, defaults, nodeRepl, repl, vm;

  nodeRepl = require('repl');

  vm = require('vm');

  closer = require('./closer');

  repl = require('./repl');

  global.closerAssertions = require('./assertions');

  global.closerCore = require('./closer-core');

  global.__$this = {};

  defaults = {
    prompt: 'closer> ',
    stream: process.stdin,
    "eval": function(input, context, filename, callback) {
      var e, js, opts, result;
      input = input.replace(/^\(([\s\S]*)\n\)$/m, '$1');
      try {
        opts = {
          loc: false
        };
        js = repl.generateJS(input, opts);
        result = vm.runInThisContext(js);
      } catch (_error) {
        e = _error;
      }
      return callback((e ? e.name + ': ' + e.message : e), result);
    },
    useGlobal: true
  };

  nodeRepl.start(defaults);

}).call(this);
