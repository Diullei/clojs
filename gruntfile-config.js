var ___$closer = require("./lib/src/index");
var core = ___$closer.core;
var ___$assert = ___$closer.assertions;

exports.init = function (grunt) {
    ___$assert.arity(1, arguments.length);
    return function () {
        (typeof grunt['initConfig'] === 'function' && grunt['initConfig'].length === 0 ? grunt['initConfig']() : grunt['initConfig']).call(this, core.to_js_obj.call(this, core.vector(core.keyword('pkg'), (typeof (typeof grunt['file'] === 'function' && grunt['file'].length === 0 ? grunt['file']() : grunt['file'])['readJSON'] === 'function' && (typeof grunt['file'] === 'function' && grunt['file'].length === 0 ? grunt['file']() : grunt['file'])['readJSON'].length === 0 ? (typeof grunt['file'] === 'function' && grunt['file'].length === 0 ? grunt['file']() : grunt['file'])['readJSON']() : (typeof grunt['file'] === 'function' && grunt['file'].length === 0 ? grunt['file']() : grunt['file'])['readJSON']).call(this, 'package.json'), core.keyword('shell'), core.hash_$_map(core.keyword('options'), core.hash_$_map(core.keyword('failOnError'), false), core.keyword('jison'), core.hash_$_map(core.keyword('command'), core.apply.call(this, core.str, core.interpose.call(this, (typeof process['platform'] === 'function' && process['platform'].length === 0 ? process['platform']() : process['platform'])['match']('^win') ? ' & ' : ' && ', core.vector('jison src/grammar.y src/lexer.l -o src/parser.js', 'mkdir -p built/src/', 'cp src/parser.js built/src/')))), core.keyword('lkg'), core.hash_$_map(core.keyword('command'), core.apply.call(this, core.str, core.interpose.call(this, (typeof process['platform'] === 'function' && process['platform'].length === 0 ? process['platform']() : process['platform'])['match']('^win') ? ' & ' : ' && ', core.vector('rm -rf ./lib', 'mkdir -p lib/src/', 'cp built/src/*.js lib/src/'))))), core.keyword('jasmine_test'), core.hash_$_map(core.keyword('all'), core.vector('built/spec/'), core.keyword('options'), core.hash_$_map(core.keyword('specFolders'), core.vector('built/spec/'), core.keyword('showColors'), true, core.keyword('includeStackTrace'), false, core.keyword('forceExit'), true)), core.keyword('jasmine_node'), core.hash_$_map(core.keyword('coverage'), core.hash_$_map(core.keyword('savePath'), 'demo/coverage/', core.keyword('report'), core.vector('html'), core.keyword('excludes'), core.vector('built/spec/*.js'), core.keyword('thresholds'), core.hash_$_map(core.keyword('lines'), 75)), core.keyword('all'), core.vector('built/spec/'), core.keyword('options'), core.hash_$_map(core.keyword('specFolders'), core.vector('built/spec/'), core.keyword('showColors'), true, core.keyword('includeStackTrace'), false, core.keyword('forceExit'), true)), core.keyword('watch'), core.hash_$_map(core.keyword('files'), core.vector('src/lexer.l', 'src/grammar.y', 'src/**/*.coffee', 'spec/**/*.coffee'), core.keyword('tasks'), core.vector('default'), core.keyword('options'), core.hash_$_map(core.keyword('spawn'), true, core.keyword('interrupt'), true, core.keyword('atBegin'), true, core.keyword('livereload'), true)), core.keyword('coffeelint'), core.hash_$_map(core.keyword('app'), core.vector('src/**/*.coffee', 'spec/**/*.coffee'), core.keyword('options'), core.hash_$_map(core.keyword('max_line_length'), core.hash_$_map(core.keyword('level'), 'ignore'), core.keyword('line_endings'), core.hash_$_map(core.keyword('value'), 'unix', core.keyword('level'), 'error'))), core.keyword('coffee'), core.hash_$_map(core.keyword('built'), core.hash_$_map(core.keyword('files'), core.vector(core.hash_$_map(core.keyword('expand'), true, core.keyword('cwd'), 'src/', core.keyword('src'), core.vector('**/*.coffee'), core.keyword('dest'), 'built/src/', core.keyword('ext'), '.js'))), core.keyword('specs'), core.hash_$_map(core.keyword('files'), core.vector(core.hash_$_map(core.keyword('expand'), true, core.keyword('cwd'), 'spec/', core.keyword('src'), core.vector('**/*.coffee'), core.keyword('dest'), 'built/spec/', core.keyword('ext'), '.js')))), core.keyword('browserify'), core.hash_$_map(core.keyword('demo'), core.hash_$_map(core.keyword('files'), core.vector(core.hash_$_map(core.keyword('expand'), true, core.keyword('cwd'), 'built/', core.keyword('src'), core.vector('src/repl.js', 'spec/<%= pkg.name %>-spec.js', 'spec/functional-spec.js', 'spec/<%= pkg.name %>-core-spec.js'), core.keyword('dest'), 'demo/js/')), core.keyword('options'), core.hash_$_map(core.keyword('exclude'), core.vector('lodash-node')))), core.keyword('gh-pages'), core.hash_$_map(core.keyword('src'), core.vector('**'), core.keyword('options'), core.hash_$_map(core.keyword('base'), 'demo/', core.keyword('push'), true)))));
        (typeof grunt['loadNpmTasks'] === 'function' && grunt['loadNpmTasks'].length === 0 ? grunt['loadNpmTasks']() : grunt['loadNpmTasks']).call(this, 'grunt-shell');
        (typeof grunt['loadNpmTasks'] === 'function' && grunt['loadNpmTasks'].length === 0 ? grunt['loadNpmTasks']() : grunt['loadNpmTasks']).call(this, 'grunt-contrib-watch');
        (typeof grunt['loadNpmTasks'] === 'function' && grunt['loadNpmTasks'].length === 0 ? grunt['loadNpmTasks']() : grunt['loadNpmTasks']).call(this, 'grunt-coffeelint');
        (typeof grunt['loadNpmTasks'] === 'function' && grunt['loadNpmTasks'].length === 0 ? grunt['loadNpmTasks']() : grunt['loadNpmTasks']).call(this, 'grunt-contrib-coffee');
        (typeof grunt['loadNpmTasks'] === 'function' && grunt['loadNpmTasks'].length === 0 ? grunt['loadNpmTasks']() : grunt['loadNpmTasks']).call(this, 'grunt-browserify');
        (typeof grunt['loadNpmTasks'] === 'function' && grunt['loadNpmTasks'].length === 0 ? grunt['loadNpmTasks']() : grunt['loadNpmTasks']).call(this, 'grunt-gh-pages');
        (typeof grunt['loadNpmTasks'] === 'function' && grunt['loadNpmTasks'].length === 0 ? grunt['loadNpmTasks']() : grunt['loadNpmTasks']).call(this, 'grunt-jasmine-node');
        (typeof grunt['loadNpmTasks'] === 'function' && grunt['loadNpmTasks'].length === 0 ? grunt['loadNpmTasks']() : grunt['loadNpmTasks']).call(this, 'grunt-jasmine-node-coverage');
        (typeof grunt['renameTask'] === 'function' && grunt['renameTask'].length === 0 ? grunt['renameTask']() : grunt['renameTask']).call(this, 'jasmine_node', 'jasmine_test');
        (typeof grunt['registerTask'] === 'function' && grunt['registerTask'].length === 0 ? grunt['registerTask']() : grunt['registerTask']).call(this, 'build', core.to_array.call(this, core.vector('coffeelint', 'shell:jison', 'coffee')));
        (typeof grunt['registerTask'] === 'function' && grunt['registerTask'].length === 0 ? grunt['registerTask']() : grunt['registerTask']).call(this, 'test', core.to_array.call(this, core.vector('build', 'jasmine_test')));
        (typeof grunt['registerTask'] === 'function' && grunt['registerTask'].length === 0 ? grunt['registerTask']() : grunt['registerTask']).call(this, 'default', core.to_array.call(this, core.vector('build', 'browserify', 'jasmine_node')));
        return (typeof grunt['registerTask'] === 'function' && grunt['registerTask'].length === 0 ? grunt['registerTask']() : grunt['registerTask']).call(this, 'LKG', core.to_array.call(this, core.vector('build', 'jasmine_test', 'shell:lkg')));
    }.call(this);
};