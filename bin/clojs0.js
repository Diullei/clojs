// NOTE! temporary code!

var closer = require('../lib/src/index');
var escodegen = require('escodegen');

var fs = require('fs');
var path = require('path');

var file = process.argv[2];
var lib = process.argv[3];

if (!lib) {
	lib = 'closer';
}

var code = fs.readFileSync(file).toString();

var ast = closer.parse(code, { 
	coreIdentifier: 'core',
	assertionsIdentifier: '___$assert' 
});

var compiled = 'var ___$closer = require("' + lib + '");\nvar core = ___$closer.core;\nvar ___$assert = ___$closer.assertions;\n\n' + escodegen.generate(ast);

fs.writeFile(path.dirname(file) + '/' + path.basename(file, '.cljs') + '.js', compiled, function (err,data) {
  if (err) {
    return console.log(err);
  }
});