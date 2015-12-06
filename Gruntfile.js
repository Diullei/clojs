var ___$closer = require("./lib/src/index");
var core = ___$closer.core;

var grunt_config = require('./gruntfile-config');

// var to_js_obj = (function () {
// 	function getValue(item) {
// 		if (core.vector_$QMARK_(item)) {
// 			return to_array(item);
// 		} else if (core.map_$QMARK_(item)) {
// 			return hash_to_js_obj(item);
// 		} else {
// 			return item;
// 		}
// 	}
// 	
// 	function hash_to_js_obj(values) {
// 		var obj = {};
// 		var iter = values.keys();
// 		var next = null;
// 		while(!(next = iter.next()).done) {
// 			obj[next.value.toString().substr(1)] = getValue(values.get(next.value));
// 		}
// 		return obj;
// 	}
// 	
// 	function to_array(values) {
// 		var result = [];
// 		for (var i = 0; i < core.count(values); i++) {
// 			var val = core.nth(values, i);
// 			if (core.map_$QMARK_(val)) {
// 				result.push(hash_to_js_obj(val));
// 			} else if (core.vector_$QMARK_(val)) {
// 				result.push(to_array(val));
// 			} else {
// 				result.push(val);
// 			}
// 		}
// 		return result;
// 	}
// 	
// 	function to_js_obj(values) {
// 		var obj = {};
// 		for (var i = 0; i < core.count(values); i++) {
// 			if (i % 2 == 0) {
// 				if (!core.keyword_$QMARK_(core.nth(values, i))) {
// 					throw new Error('Invalid dic');
// 				} else {
// 					obj[core.nth(values, i).toString().substr(1)] = getValue(core.nth(values, ++i));
// 				}
// 			}
// 		}
// 		return obj;
// 	}
// 	
// 	return to_js_obj;
// })(core);

module.exports = function(grunt) {
	//console.log(require('util').inspect(to_js_obj(grunt_config.cfg(grunt)), false,10,true))
	var cfg = core.to_js_obj(grunt_config.cfg(grunt));
	grunt.initConfig(cfg.init_config);
	cfg.grunt.load_npm_tasks.forEach(function (task) {
		grunt.loadNpmTasks(task);
	});
	cfg.grunt.rename_task.forEach(function (rename) {
		grunt.renameTask(rename[0], rename[1]);
	});
	for (var attr in cfg.grunt.register_task) {
		grunt.registerTask(attr, cfg.grunt.register_task[attr]);
	}	
}