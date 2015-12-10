var fs = require.call(this, 'fs');
var path = require.call(this, 'path');
var util = require.call(this, 'util');
var closer = require.call(this, '../lib/src/index');
var escodegen = require.call(this, 'escodegen');
var optionator = require.call(this, 'optionator');
var pkg = require.call(this, '../package.json');
var core = typeof closer['core'] === 'function' && closer['core'].length === 0 ? closer['core']() : closer['core'];
var closerAssertions = typeof closer['assertions'] === 'function' && closer['assertions'].length === 0 ? closer['assertions']() : closer['assertions'];
var opt = optionator.call(this, core.clj_$__$GT_js.call(this, core.hash_$_map(core.keyword('prepend'), 'Usage: cljsc [option]... [file]...\n\nUse \'cljsc\' with no options to start REPL.', core.keyword('append'), 'Version {{version}}\n<http://clojs.org/>', core.keyword('helpStyle'), core.hash_$_map(core.keyword('maxPadFactor'), 1.9), core.keyword('positionalAnywhere'), false, core.keyword('options'), core.vector(core.hash_$_map(core.keyword('option'), 'version', core.keyword('alias'), 'v', core.keyword('type'), 'Boolean', core.keyword('description'), 'display version'), core.hash_$_map(core.keyword('option'), 'help', core.keyword('alias'), 'h', core.keyword('type'), 'Boolean', core.keyword('description'), 'display this help message'), core.hash_$_map(core.keyword('option'), 'compile', core.keyword('alias'), 'c', core.keyword('type'), 'Boolean', core.keyword('description'), 'compile to JavaScript and save as .js files'), core.hash_$_map(core.keyword('option'), 'output', core.keyword('alias'), 'o', core.keyword('type'), 'path::String', core.keyword('description'), 'compile into the specified directory'), core.hash_$_map(core.keyword('option'), 'eval', core.keyword('alias'), 'e', core.keyword('type'), 'code::String', core.keyword('description'), 'pass as string from the command line as input')))));
var die_$BANG_ = function (message) {
    closerAssertions.arity(1, arguments.length);
    console['error'](message);
    return process['exit'](1);
};
var compile_$_script_$_from_$_str = function (code) {
    closerAssertions.arity(1, arguments.length);
    return function () {
        var ast = closer['parse'](code, core.clj_$__$GT_js.call(this, core.hash_$_map(core.keyword('coreIdentifier'), 'core')));
        return escodegen['generate'](ast);
    }.call(this);
};
var compile_$_script = function (file, out) {
    closerAssertions.arity(2, arguments.length);
    return function () {
        var code = typeof fs['readFileSync'](file)['toString'] === 'function' && fs['readFileSync'](file)['toString'].length === 0 ? fs['readFileSync'](file)['toString']() : fs['readFileSync'](file)['toString'];
        var compiled = compile_$_script_$_from_$_str.call(this, code);
        return fs['writeFile'](core.apply.call(this, core.str, out ? out : path['dirname'](file), '/', path['basename'](file, '.cljs'), '.js'), compiled, function (err) {
            closerAssertions.arity(1, arguments.length);
            return core.not.call(this, core.nil_$QMARK_.call(this, err)) ? console['log'](err) : null;
        });
    }.call(this);
};
var proc = core.js_$__$GT_clj.call(this, typeof process['argv'] === 'function' && process['argv'].length === 0 ? process['argv']() : process['argv']);
if (core._$EQ_.call(this, core.count.call(this, proc), 2))
    var closer = require.call(this, '../lib/src/start-repl');
else
    try {
        (function () {
            var command_$_options = (typeof opt['parse'] === 'function' && opt['parse'].length === 0 ? opt['parse']() : opt['parse']).call(this, typeof process['argv'] === 'function' && process['argv'].length === 0 ? process['argv']() : process['argv']);
            return (typeof command_$_options['compile'] === 'function' && command_$_options['compile'].length === 0 ? command_$_options['compile']() : command_$_options['compile']) ? compile_$_script.call(this, core.first.call(this, typeof command_$_options['_'] === 'function' && command_$_options['_'].length === 0 ? command_$_options['_']() : command_$_options['_']), typeof command_$_options['output'] === 'function' && command_$_options['output'].length === 0 ? command_$_options['output']() : command_$_options['output']) : (typeof command_$_options['help'] === 'function' && command_$_options['help'].length === 0 ? command_$_options['help']() : command_$_options['help']) ? core.println.call(this, (typeof opt['generateHelp'] === 'function' && opt['generateHelp'].length === 0 ? opt['generateHelp']() : opt['generateHelp']).call(this, core.clj_$__$GT_js.call(this, core.hash_$_map(core.keyword('interpolate'), core.hash_$_map(core.keyword('version'), typeof pkg['version'] === 'function' && pkg['version'].length === 0 ? pkg['version']() : pkg['version']))))) : (typeof command_$_options['version'] === 'function' && command_$_options['version'].length === 0 ? command_$_options['version']() : command_$_options['version']) ? core.println.call(this, core.str.call(this, 'version ', typeof pkg['version'] === 'function' && pkg['version'].length === 0 ? pkg['version']() : pkg['version'])) : (typeof command_$_options['eval'] === 'function' && command_$_options['eval'].length === 0 ? command_$_options['eval']() : command_$_options['eval']) ? compile_$_script_$_from_$_str.call(this, typeof command_$_options['_'] === 'function' && command_$_options['_'].length === 0 ? command_$_options['_']() : command_$_options['_']) : null;
        }.call(this));
    } catch (e) {
        die_$BANG_.call(this, typeof e['message'] === 'function' && e['message'].length === 0 ? e['message']() : e['message']);
    }