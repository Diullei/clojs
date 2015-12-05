var ___$closer = require("./lib/src/index");
var core = ___$closer.core;

var grunt_config = require('./test');

var to_js_obj = (function () {
	function getValue(item) {
		if (core.vector_$QMARK_.call(null, item)) {
			return to_array(item);
		} else if (core.map_$QMARK_.call(null, item)) {
			return hash_to_js_obj(item);
		} else {
			return item;
		}
	}
	
	function hash_to_js_obj(values) {
		var obj = {};
		var iter = values.keys();
		var next = null;
		while(!(next = iter.next()).done) {
			obj[next.value.toString().substr(1)] = getValue(values.get(next.value));
		}
		return obj;
	}
	
	function to_array(values) {
		var result = [];
		for (var i = 0; i < core.count(values); i++) {
			var val = core.nth(values, i);
			if (core.map_$QMARK_.call(null, val)) {
				result.push(hash_to_js_obj(val));
			} else {
				result.push(val);
			}
		}
		return result;
	}
	
	function to_js_obj(values) {
		var obj = {};
		for (var i = 0; i < core.count(values); i++) {
			if (i % 2 == 0) {
				if (!core.keyword_$QMARK_.call(null, core.nth(values, i))) {
					throw new Error('Invalid dic');
				} else {
					obj[core.nth(values, i).toString().substr(1)] = getValue(core.nth(values, ++i));
				}
			}
		}
		return obj;
	}
	
	return to_js_obj;
})(core);

//console.log(grunt_config);

var grunt = {
	file: {
		readJSON: function(a){console.log(a)}
	}
};

//console.log(grunt_config.cfg(grunt));
console.log(require('util').inspect(to_js_obj(grunt_config.cfg(grunt)), false,10,true));
