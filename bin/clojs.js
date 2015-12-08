var closer = require.call(this, '../lib/src/index');
var escodegen = require.call(this, 'escodegen');
var core = typeof closer['core'] === 'function' && closer['core'].length === 0 ? closer['core']() : closer['core'];
var closerAssertions = typeof closer['assertions'] === 'function' && closer['assertions'].length === 0 ? closer['assertions']() : closer['assertions'];
var fs = require.call(this, 'fs');
var path = require.call(this, 'path');
var proc = core.js_$__$GT_clj.call(this, typeof process['argv'] === 'function' && process['argv'].length === 0 ? process['argv']() : process['argv']);
var file = core.nth.call(this, proc, 2);
var lib = core.nil_$QMARK_.call(this, core.nth.call(this, proc, 3)) ? 'closer' : core.nth.call(this, proc, 3);
var code = typeof fs['readFileSync'](file)['toString'] === 'function' && fs['readFileSync'](file)['toString'].length === 0 ? fs['readFileSync'](file)['toString']() : fs['readFileSync'](file)['toString'];
var ast = closer['parse'](code, core.clj_$__$GT_js.call(this, core.hash_$_map(core.keyword('coreIdentifier'), 'core')));
var compiled = escodegen['generate'](ast);
fs['writeFile'](core.apply.call(this, core.str, path['dirname'](file), '/', path['basename'](file, '.cljs'), '.js'), compiled, function (err) {
    closerAssertions.arity(1, arguments.length);
    return core.not.call(this, core.nil_$QMARK_.call(this, err)) ? console['log'](err) : null;
});