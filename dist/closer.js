!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.closer=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
(function() {
  var Closer, Parser, builder, closer, con, nodes, oldParse, parser;

  parser = _dereq_('./parser').parser;

  nodes = _dereq_('./nodes');

  builder = {};

  nodes.defineNodes(builder);

  for (con in builder) {
    parser.yy[con] = function(a, b, c, d, e, f, g, h) {
      return builder[con](a, b, c, d, e, f, g, h);
    };
  }

  parser.yy.Node = function(type, a, b, c, d, e, f, g, h) {
    var buildName;
    buildName = type[0].toLowerCase() + type.slice(1);
    if (builder && buildName in builder) {
      return builder[buildName](a, b, c, d, e, f, g, h);
    } else {
      throw new ReferenceError("no such node type: " + type);
    }
  };

  parser.yy.locComb = function(start, end) {
    start.last_line = end.last_line;
    start.last_column = end.last_column;
    return start;
  };

  parser.yy.loc = function(loc) {
    var newLoc;
    if (!this.locations) {
      return null;
    }
    if ("length" in loc) {
      loc = this.locComb(loc[0], loc[1]);
    }
    newLoc = {
      start: {
        line: this.startLine + loc.first_line - 1,
        column: loc.first_column
      },
      end: {
        line: this.startLine + loc.last_line - 1,
        column: loc.last_column
      }
    };
    return newLoc;
  };

  parser.yy.escapeString = function(s) {
    return s.replace(/\\\n/, '').replace(/\\([^xubfnvrt0\\])/g, '$1');
  };

  oldParse = parser.parse;

  parser.parse = function(source, options) {
    this.yy.inRegex = false;
    this.yy.raw = [];
    this.yy.comments = [];
    this.yy.options = options || {};
    return oldParse.call(this, source);
  };

  Parser = (function() {
    function Parser(options) {
      this.yy.source = options.source || null;
      this.yy.startLine = options.line || 1;
      this.yy.locations = options.locations;
    }

    return Parser;

  })();

  Parser.prototype = parser;

  Closer = (function() {
    function Closer(options) {
      this.parser = new Parser(options || {});
    }

    Closer.prototype.parse = function(source, options) {
      return this.parser.parse(source, options);
    };

    return Closer;

  })();

  closer = {
    parse: function(src, options) {
      return new Closer(options).parse(src, options);
    },
    node: parser.yy.Node
  };

  module.exports = closer;

}).call(this);

},{"./nodes":2,"./parser":3}],2:[function(_dereq_,module,exports){
(function() {
  exports.defineNodes = function(builder) {
    var convertExprToPattern, def, defaultIni, funIni;
    defaultIni = function(loc) {
      this.loc = loc;
      return this;
    };
    def = function(name, ini) {
      return builder[name[0].toLowerCase() + name.slice(1)] = function(a, b, c, d, e, f, g, h) {
        var obj;
        obj = {};
        obj.type = name;
        ini.call(obj, a, b, c, d, e, f, g, h);
        delete obj.loc;
        return obj;
      };
    };
    convertExprToPattern = function(expr) {
      if (expr.type === 'ObjectExpression') {
        expr.type = 'ObjectPattern';
      }
      if (expr.type === 'ArrayExpression') {
        return expr.type = 'ArrayPattern';
      }
    };
    def('Program', function(elements, loc) {
      this.body = elements;
      return this.loc = loc;
    });
    def('ExpressionStatement', function(expression, loc) {
      this.expression = expression;
      return this.loc = loc;
    });
    def('BlockStatement', function(body, loc) {
      this.body = body;
      return this.loc = loc;
    });
    def('EmptyStatement', defaultIni);
    def('Identifier', function(name, loc) {
      this.name = name;
      return this.loc = loc;
    });
    def('Literal', function(value, loc, raw) {
      this.value = value;
      return this.loc = loc;
    });
    def('ThisExpression', defaultIni);
    def('VariableDeclaration', function(kind, declarations, loc) {
      this.declarations = declarations;
      this.kind = kind;
      return this.loc = loc;
    });
    def('VariableDeclarator', function(id, init, loc) {
      this.id = id;
      this.init = init;
      return this.loc = loc;
    });
    def('ArrayExpression', function(elements, loc) {
      this.elements = elements;
      return this.loc = loc;
    });
    def('ObjectExpression', function(properties, loc) {
      this.properties = properties;
      return this.loc = loc;
    });
    def('Property', function(key, value, kind, loc) {
      this.key = key;
      this.value = value;
      this.kind = kind;
      return this.loc = loc;
    });
    funIni = function(ident, params, rest, body, isGen, isExp, loc) {
      this.id = ident;
      this.params = params;
      this.defaults = [];
      this.rest = rest;
      this.body = body;
      this.loc = loc;
      this.generator = isGen;
      return this.expression = isExp;
    };
    def('FunctionDeclaration', funIni);
    def('FunctionExpression', funIni);
    def('ReturnStatement', function(argument, loc) {
      this.argument = argument;
      return this.loc = loc;
    });
    def('TryStatement', function(block, handlers, finalizer, loc) {
      this.block = block;
      this.handlers = handlers || [];
      this.finalizer = finalizer;
      return this.loc = loc;
    });
    def('CatchClause', function(param, guard, body, loc) {
      this.param = param;
      this.guard = guard;
      this.body = body;
      return this.loc = loc;
    });
    def('ThrowStatement', function(argument, loc) {
      this.argument = argument;
      return this.loc = loc;
    });
    def('LabeledStatement', function(label, body, loc) {
      this.label = label;
      this.body = body;
      return this.loc = loc;
    });
    def('BreakStatement', function(label, loc) {
      this.label = label;
      return this.loc = loc;
    });
    def('ContinueStatement', function(label, loc) {
      this.label = label;
      return this.loc = loc;
    });
    def('SwitchStatement', function(discriminant, cases, lexical, loc) {
      this.discriminant = discriminant;
      if (cases.length) {
        this.cases = cases;
      }
      return this.loc = loc;
    });
    def('SwitchCase', function(test, consequent, loc) {
      this.test = test;
      this.consequent = consequent;
      return this.loc = loc;
    });
    def('WithStatement', function(object, body, loc) {
      this.object = object;
      this.body = body;
      return this.loc = loc;
    });
    def('ConditionalExpression', function(test, consequent, alternate, loc) {
      this.test = test;
      this.consequent = consequent;
      this.alternate = alternate;
      return this.loc = loc;
    });
    def('SequenceExpression', function(expressions, loc) {
      this.expressions = expressions;
      return this.loc = loc;
    });
    def('BinaryExpression', function(op, left, right, loc) {
      this.operator = op;
      this.left = left;
      this.right = right;
      return this.loc = loc;
    });
    def('AssignmentExpression', function(op, left, right, loc) {
      this.operator = op;
      this.left = left;
      this.right = right;
      this.loc = loc;
      return convertExprToPattern(left);
    });
    def('LogicalExpression', function(op, left, right, loc) {
      this.operator = op;
      this.left = left;
      this.right = right;
      return this.loc = loc;
    });
    def('UnaryExpression', function(operator, argument, prefix, loc) {
      this.operator = operator;
      this.argument = argument;
      this.prefix = prefix;
      return this.loc = loc;
    });
    def('UpdateExpression', function(operator, argument, prefix, loc) {
      this.operator = operator;
      this.argument = argument;
      this.prefix = prefix;
      return this.loc = loc;
    });
    def('CallExpression', function(callee, args, loc) {
      this.callee = callee;
      this["arguments"] = args;
      return this.loc = loc;
    });
    def('NewExpression', function(callee, args, loc) {
      this.callee = callee;
      this["arguments"] = args;
      return this.loc = loc;
    });
    def('MemberExpression', function(object, property, computed, loc) {
      this.object = object;
      this.property = property;
      this.computed = computed;
      return this.loc = loc;
    });
    def('DebuggerStatement', defaultIni);
    def('Empty', defaultIni);
    def('WhileStatement', function(test, body, loc) {
      this.test = test;
      this.body = body;
      return this.loc = loc;
    });
    def('DoWhileStatement', function(body, test, loc) {
      this.body = body;
      this.test = test;
      return this.loc = loc;
    });
    def('ForStatement', function(init, test, update, body, loc) {
      this.init = init;
      this.test = test;
      this.update = update;
      this.body = body;
      this.loc = loc;
      if (init) {
        return convertExprToPattern(init);
      }
    });
    def('ForInStatement', function(left, right, body, each, loc) {
      this.left = left;
      this.right = right;
      this.body = body;
      this.each = !!each;
      this.loc = loc;
      return convertExprToPattern(left);
    });
    def('IfStatement', function(test, consequent, alternate, loc) {
      this.test = test;
      this.consequent = consequent;
      this.alternate = alternate;
      return this.loc = loc;
    });
    def('ObjectPattern', function(properties, loc) {
      this.properties = properties;
      return this.loc = loc;
    });
    def('ArrayPattern', function(elements, loc) {
      this.elements = elements;
      return this.loc = loc;
    });
    return def;
  };

}).call(this);

},{}],3:[function(_dereq_,module,exports){
(function (process){
/* parser generated by jison 0.4.13 */
/*
  Returns a Parser object of the following structure:

  Parser: {
    yy: {}
  }

  Parser.prototype: {
    yy: {},
    trace: function(),
    symbols_: {associative list: name ==> number},
    terminals_: {associative list: number ==> name},
    productions_: [...],
    performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate, $$, _$),
    table: [...],
    defaultActions: {...},
    parseError: function(str, hash),
    parse: function(input),

    lexer: {
        EOF: 1,
        parseError: function(str, hash),
        setInput: function(input),
        input: function(),
        unput: function(str),
        more: function(),
        less: function(n),
        pastInput: function(),
        upcomingInput: function(),
        showPosition: function(),
        test_match: function(regex_match_array, rule_index),
        next: function(),
        lex: function(),
        begin: function(condition),
        popState: function(),
        _currentRules: function(),
        topState: function(),
        pushState: function(condition),

        options: {
            ranges: boolean           (optional: true ==> token location info will include a .range[] member)
            flex: boolean             (optional: true ==> flex-like lexing behaviour where the rules are tested exhaustively to find the longest match)
            backtrack_lexer: boolean  (optional: true ==> lexer regexes are tested in order and for each matching regex the action code is invoked; the lexer terminates the scan when a token is returned by the action code)
        },

        performAction: function(yy, yy_, $avoiding_name_collisions, YY_START),
        rules: [...],
        conditions: {associative list: name ==> set},
    }
  }


  token location info (@$, _$, etc.): {
    first_line: n,
    last_line: n,
    first_column: n,
    last_column: n,
    range: [start_number, end_number]       (where the numbers are indexes into the input string, regular zero-based)
  }


  the parseError function receives a 'hash' object with these members for lexer and parser errors: {
    text:        (matched text)
    token:       (the produced terminal token, if any)
    line:        (yylineno)
  }
  while parser (grammar) errors will also provide these members, i.e. parser errors deliver a superset of attributes: {
    loc:         (yylloc)
    expected:    (string describing the set of expected tokens)
    recoverable: (boolean: TRUE when the parser has a error recovery rule available for this particular error)
  }
*/
var parser = (function(){
var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"Identifier":3,"IDENTIFIER":4,"IdentifierList":5,"Atom":6,"INTEGER":7,"FLOAT":8,"STRING":9,"true":10,"false":11,"nil":12,"COLON":13,"CollectionLiteral":14,"[":15,"items":16,"]":17,"QUOTE":18,"(":19,")":20,"{":21,"SExprPairs[items]":22,"}":23,"SHARP":24,"RestArgs":25,"&":26,"Fn":27,"List":28,"FnParamsAndBody":29,"BlockStatementWithReturn":30,"FnDefinition":31,"FN":32,"DEFN":33,"ConditionalExpr":34,"IF":35,"SExpr[test]":36,"SExprStmt[consequent]":37,"alternate":38,"WHEN":39,"BlockStatement[consequent]":40,"VarDeclaration":41,"DEF":42,"init":43,"LetBinding":44,"SExpr":45,"LetBindings":46,"LetForm":47,"LET":48,"DoForm":49,"args":50,"DO":51,"SExprStmt":52,"SExprPairs":53,"SExprs":54,"NonEmptyDoForm":55,"BlockStatement":56,"Program":57,"$accept":0,"$end":1},
terminals_: {2:"error",4:"IDENTIFIER",7:"INTEGER",8:"FLOAT",9:"STRING",10:"true",11:"false",12:"nil",13:"COLON",15:"[",17:"]",18:"QUOTE",19:"(",20:")",21:"{",22:"SExprPairs[items]",23:"}",24:"SHARP",26:"&",32:"FN",33:"DEFN",35:"IF",36:"SExpr[test]",37:"SExprStmt[consequent]",39:"WHEN",40:"BlockStatement[consequent]",42:"DEF",48:"LET",51:"DO"},
productions_: [0,[3,1],[5,0],[5,2],[6,1],[6,1],[6,1],[6,1],[6,1],[6,1],[6,2],[6,1],[14,3],[14,4],[14,3],[14,4],[25,2],[25,0],[27,1],[27,3],[29,5],[31,2],[31,3],[34,4],[34,3],[41,3],[44,2],[46,2],[46,0],[47,5],[28,0],[28,1],[28,1],[28,1],[28,1],[28,2],[28,2],[45,1],[45,1],[45,3],[52,1],[53,0],[53,3],[54,1],[54,2],[55,1],[49,1],[49,0],[56,1],[30,1],[57,1],[57,0],[16,0],[16,1],[38,0],[38,1],[43,0],[43,1],[50,0],[50,1]],
performAction: function anonymous(yytext, yyleng, yylineno, yy, yystate /* action[1] */, $$ /* vstack */, _$ /* lstack */) {
/* this == yyval */

var $0 = $$.length - 1;
switch (yystate) {
case 1: this.$ = yy.Node('Identifier', String($$[$0]), yy.loc(_$[$0])); 
break;
case 2: this.$ = []; 
break;
case 3:
        yy.locComb(this._$, _$[$0]);
        this.$ = $$[$0-1];
        $$[$0-1].push($$[$0]);
  
break;
case 4: this.$ = parseNumLiteral('Integer', $$[$0], _$[$0], yy, yytext); 
break;
case 5: this.$ = parseNumLiteral('Float', $$[$0], _$[$0], yy, yytext); 
break;
case 6: this.$ = parseLiteral('String', parseString($$[$0]), _$[$0], yy.raw[yy.raw.length-1], yy); 
break;
case 7: this.$ = parseLiteral('Boolean', true, _$[$0], yytext, yy); 
break;
case 8: this.$ = parseLiteral('Boolean', false, _$[$0], yytext, yy); 
break;
case 9: this.$ = parseLiteral('Nil', null, _$[$0], yytext, yy); 
break;
case 10: this.$ = parseLiteral('Keyword', String($$[$0]), yy.loc(_$[$0]), yytext, yy); 
break;
case 12: this.$ = parseCollectionLiteral('Vector', getValueIfUndefined($$[$0-1], []), _$[$0-1], yy); 
break;
case 13: this.$ = parseCollectionLiteral('List', getValueIfUndefined($$[$0-1], []), _$[$0-1], yy); 
break;
case 14: this.$ = parseCollectionLiteral('HashMap', getValueIfUndefined($$[$0-1], []), _$[$0-1], yy); 
break;
case 15: this.$ = parseCollectionLiteral('HashSet', getValueIfUndefined($$[$0-1], []), _$[$0-1], yy); 
break;
case 16: this.$ = $$[$0]; 
break;
case 17: this.$ = null; 
break;
case 18: this.$ = yy.Node('Identifier', String($$[$0]), yy.loc(_$[$0])); 
break;
case 19: this.$ = $$[$0-1]; 
break;
case 20:
        this.$ = yy.Node('FunctionExpression', null, $$[$0-3], $$[$0-2],
            $$[$0], false, false, yy.loc(_$[$0]));
    
break;
case 21: this.$ = $$[$0]; 
break;
case 22:
        $$[$0].type = 'FunctionDeclaration';
        $$[$0].id = $$[$0-1];
        this.$ = $$[$0];
    
break;
case 23:
        this.$ = yy.Node('IfStatement', $$[$0-2], $$[$0-1], getValueIfUndefined($$[$0], null));
    
break;
case 24:
        this.$ = yy.Node('IfStatement', $$[$0-1], $$[$0], null);
    
break;
case 25:
        var decl = yy.Node('VariableDeclarator', $$[$0-1], getValueIfUndefined($$[$0], null), yy.loc(_$[$0-2]));
        this.$ = yy.Node('VariableDeclaration', 'var', [decl], yy.loc(_$[$0-2]));
    
break;
case 26:
        this.$ = yy.Node('VariableDeclarator', $$[$0-1], getValueIfUndefined($$[$0], null), yy.loc(_$[$0-1]));
    
break;
case 27:
        this.$ = $$[$0-1];
        // TODO let bindings are supposed to be local!
        var binding = yy.Node('VariableDeclaration', 'var', [$$[$0]], yy.loc(_$[$0]));
        $$[$0-1].push(binding);
    
break;
case 28: this.$ = []; 
break;
case 29:
        var body = [].concat($$[$0-2]).concat($$[$0]);
        this.$ = yy.Node('BlockStatement', body, yy.loc(_$[$0-4]));
    
break;
case 30: this.$ = yy.Node('EmptyStatement', yy.loc(_$[$0])); 
break;
case 35: this.$ = yy.Node('CallExpression', $$[$0-1], getValueIfUndefined($$[$0], []), yy.loc(_$[$0-1])); 
break;
case 36: this.$ = yy.Node('BlockStatement', $$[$0], yy.loc(_$[$0-1])); 
break;
case 37: this.$ = $$[$0]; 
break;
case 38: this.$ = $$[$0]; 
break;
case 39: this.$ = $$[$0-1]; 
break;
case 40:
        if (expressionTypes.indexOf($$[$0].type) !== -1) {
            this.$ = yy.Node('ExpressionStatement', $$[$0], $$[$0].loc);
        } else {
            this.$ = $$[$0];
        }
    
break;
case 41: this.$ = []; 
break;
case 42: this.$ = $$[$0-2]; $$[$0-2].push($$[$0-1], $$[$0]); 
break;
case 43: this.$ = [$$[$0]]; 
break;
case 44:
        yy.locComb(this._$, _$[$0]);
        this.$ = $$[$0-1];
        $$[$0-1].push($$[$0]);
    
break;
case 45:
        for (var i = 0; i < $$[$0].length; ++i) {
            var SExpr = $$[$0][i];
            if (expressionTypes.indexOf(SExpr.type) !== -1) {
                $$[$0][i] = yy.Node('ExpressionStatement', SExpr, SExpr.loc);
            }
        }
    
break;
case 47:
        // do forms evaluate to nil if the body is empty
        nilNode = parseLiteral('Nil', null, _$[$0], yytext, yy);
        this.$ = [yy.Node('ExpressionStatement', nilNode, nilNode.loc)];
    
break;
case 48:
        this.$ = yy.Node('BlockStatement', $$[$0], yy.loc(_$[$0]));
    
break;
case 49:
        var lastSExpr = $$[$0].body[$$[$0].body.length-1];
        lastSExpr.type = 'ReturnStatement';
        lastSExpr.argument = lastSExpr.expression;
        delete lastSExpr.expression;
        this.$ = $$[$0];
    
break;
case 50:
        var prog = yy.Node('Program', $$[$0], yy.loc(_$[$0]));
//        if (yy.tokens.length) prog.tokens = yy.tokens;
        if (yy.comments.length) prog.comments = yy.comments;
//        if (prog.loc) prog.range = rangeBlock($$[$0]);
        return prog;
    
break;
case 51:
        var prog = yy.Node('Program', [], {
            end: { column: 0, line: 0 },
            start: { column: 0, line: 0 },
        });
    //        prog.tokens = yy.tokens;
    //        prog.range = [0, 0];
        return prog;
    
break;
}
},
table: [{1:[2,51],3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],21:[1,18],24:[1,19],45:4,54:3,55:2,57:1},{1:[3]},{1:[2,50]},{1:[2,45],3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],20:[2,45],21:[1,18],24:[1,19],45:21},{1:[2,43],4:[2,43],7:[2,43],8:[2,43],9:[2,43],10:[2,43],11:[2,43],12:[2,43],13:[2,43],15:[2,43],17:[2,43],18:[2,43],19:[2,43],20:[2,43],21:[2,43],23:[2,43],24:[2,43]},{1:[2,37],4:[2,37],7:[2,37],8:[2,37],9:[2,37],10:[2,37],11:[2,37],12:[2,37],13:[2,37],15:[2,37],17:[2,37],18:[2,37],19:[2,37],20:[2,37],21:[2,37],23:[2,37],24:[2,37]},{1:[2,38],4:[2,38],7:[2,38],8:[2,38],9:[2,38],10:[2,38],11:[2,38],12:[2,38],13:[2,38],15:[2,38],17:[2,38],18:[2,38],19:[2,38],20:[2,38],21:[2,38],23:[2,38],24:[2,38]},{4:[1,35],19:[1,36],20:[2,30],27:27,28:22,31:23,32:[1,29],33:[1,30],34:24,35:[1,31],39:[1,32],41:25,42:[1,33],47:26,48:[1,34],51:[1,28]},{1:[2,4],4:[2,4],7:[2,4],8:[2,4],9:[2,4],10:[2,4],11:[2,4],12:[2,4],13:[2,4],15:[2,4],17:[2,4],18:[2,4],19:[2,4],20:[2,4],21:[2,4],23:[2,4],24:[2,4]},{1:[2,5],4:[2,5],7:[2,5],8:[2,5],9:[2,5],10:[2,5],11:[2,5],12:[2,5],13:[2,5],15:[2,5],17:[2,5],18:[2,5],19:[2,5],20:[2,5],21:[2,5],23:[2,5],24:[2,5]},{1:[2,6],4:[2,6],7:[2,6],8:[2,6],9:[2,6],10:[2,6],11:[2,6],12:[2,6],13:[2,6],15:[2,6],17:[2,6],18:[2,6],19:[2,6],20:[2,6],21:[2,6],23:[2,6],24:[2,6]},{1:[2,7],4:[2,7],7:[2,7],8:[2,7],9:[2,7],10:[2,7],11:[2,7],12:[2,7],13:[2,7],15:[2,7],17:[2,7],18:[2,7],19:[2,7],20:[2,7],21:[2,7],23:[2,7],24:[2,7]},{1:[2,8],4:[2,8],7:[2,8],8:[2,8],9:[2,8],10:[2,8],11:[2,8],12:[2,8],13:[2,8],15:[2,8],17:[2,8],18:[2,8],19:[2,8],20:[2,8],21:[2,8],23:[2,8],24:[2,8]},{1:[2,9],4:[2,9],7:[2,9],8:[2,9],9:[2,9],10:[2,9],11:[2,9],12:[2,9],13:[2,9],15:[2,9],17:[2,9],18:[2,9],19:[2,9],20:[2,9],21:[2,9],23:[2,9],24:[2,9]},{4:[1,37]},{1:[2,11],4:[2,11],7:[2,11],8:[2,11],9:[2,11],10:[2,11],11:[2,11],12:[2,11],13:[2,11],15:[2,11],17:[2,11],18:[2,11],19:[2,11],20:[2,11],21:[2,11],23:[2,11],24:[2,11]},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],16:38,17:[2,52],18:[1,17],19:[1,7],21:[1,18],24:[1,19],45:4,54:39},{19:[1,40]},{4:[2,41],7:[2,41],8:[2,41],9:[2,41],10:[2,41],11:[2,41],12:[2,41],13:[2,41],15:[2,41],18:[2,41],19:[2,41],21:[2,41],23:[2,41],24:[2,41],53:41},{21:[1,42]},{1:[2,1],4:[2,1],7:[2,1],8:[2,1],9:[2,1],10:[2,1],11:[2,1],12:[2,1],13:[2,1],15:[2,1],17:[2,1],18:[2,1],19:[2,1],20:[2,1],21:[2,1],23:[2,1],24:[2,1],26:[2,1]},{1:[2,44],4:[2,44],7:[2,44],8:[2,44],9:[2,44],10:[2,44],11:[2,44],12:[2,44],13:[2,44],15:[2,44],17:[2,44],18:[2,44],19:[2,44],20:[2,44],21:[2,44],23:[2,44],24:[2,44]},{20:[1,43]},{20:[2,31]},{20:[2,32]},{20:[2,33]},{20:[2,34]},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],20:[2,58],21:[1,18],24:[1,19],45:4,50:44,54:45},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],20:[2,47],21:[1,18],24:[1,19],45:4,49:46,54:3,55:47},{15:[1,49],29:48},{3:50,4:[1,20]},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],21:[1,18],24:[1,19],45:51},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],21:[1,18],24:[1,19],45:52},{3:53,4:[1,20]},{15:[1,54]},{4:[2,18],7:[2,18],8:[2,18],9:[2,18],10:[2,18],11:[2,18],12:[2,18],13:[2,18],15:[2,18],18:[2,18],19:[2,18],20:[2,18],21:[2,18],24:[2,18]},{4:[1,35],19:[1,36],20:[2,30],27:27,28:55,31:23,32:[1,29],33:[1,30],34:24,35:[1,31],39:[1,32],41:25,42:[1,33],47:26,48:[1,34],51:[1,28]},{1:[2,10],4:[2,10],7:[2,10],8:[2,10],9:[2,10],10:[2,10],11:[2,10],12:[2,10],13:[2,10],15:[2,10],17:[2,10],18:[2,10],19:[2,10],20:[2,10],21:[2,10],23:[2,10],24:[2,10]},{17:[1,56]},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],17:[2,53],18:[1,17],19:[1,7],20:[2,53],21:[1,18],23:[2,53],24:[1,19],45:21},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],16:57,18:[1,17],19:[1,7],20:[2,52],21:[1,18],24:[1,19],45:4,54:39},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],21:[1,18],23:[1,58],24:[1,19],45:59},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],16:60,18:[1,17],19:[1,7],21:[1,18],23:[2,52],24:[1,19],45:4,54:39},{1:[2,39],4:[2,39],7:[2,39],8:[2,39],9:[2,39],10:[2,39],11:[2,39],12:[2,39],13:[2,39],15:[2,39],17:[2,39],18:[2,39],19:[2,39],20:[2,39],21:[2,39],23:[2,39],24:[2,39]},{20:[2,35]},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],20:[2,59],21:[1,18],24:[1,19],45:21},{20:[2,36]},{20:[2,46]},{20:[2,21]},{4:[2,2],5:61,17:[2,2],26:[2,2]},{15:[1,49],29:62},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],21:[1,18],24:[1,19],45:64,52:63},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],20:[2,47],21:[1,18],24:[1,19],45:4,49:66,54:3,55:47,56:65},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],20:[2,56],21:[1,18],24:[1,19],43:67,45:68},{4:[2,28],17:[2,28],46:69},{20:[1,70]},{1:[2,12],4:[2,12],7:[2,12],8:[2,12],9:[2,12],10:[2,12],11:[2,12],12:[2,12],13:[2,12],15:[2,12],17:[2,12],18:[2,12],19:[2,12],20:[2,12],21:[2,12],23:[2,12],24:[2,12]},{20:[1,71]},{1:[2,14],4:[2,14],7:[2,14],8:[2,14],9:[2,14],10:[2,14],11:[2,14],12:[2,14],13:[2,14],15:[2,14],17:[2,14],18:[2,14],19:[2,14],20:[2,14],21:[2,14],23:[2,14],24:[2,14]},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],21:[1,18],24:[1,19],45:72},{23:[1,73]},{3:75,4:[1,20],17:[2,17],25:74,26:[1,76]},{20:[2,22]},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],20:[2,54],21:[1,18],24:[1,19],38:77,45:64,52:78},{4:[2,40],7:[2,40],8:[2,40],9:[2,40],10:[2,40],11:[2,40],12:[2,40],13:[2,40],15:[2,40],18:[2,40],19:[2,40],20:[2,40],21:[2,40],24:[2,40]},{20:[2,24]},{20:[2,48]},{20:[2,25]},{20:[2,57]},{3:81,4:[1,20],17:[1,79],44:80},{4:[2,19],7:[2,19],8:[2,19],9:[2,19],10:[2,19],11:[2,19],12:[2,19],13:[2,19],15:[2,19],18:[2,19],19:[2,19],20:[2,19],21:[2,19],24:[2,19]},{1:[2,13],4:[2,13],7:[2,13],8:[2,13],9:[2,13],10:[2,13],11:[2,13],12:[2,13],13:[2,13],15:[2,13],17:[2,13],18:[2,13],19:[2,13],20:[2,13],21:[2,13],23:[2,13],24:[2,13]},{4:[2,42],7:[2,42],8:[2,42],9:[2,42],10:[2,42],11:[2,42],12:[2,42],13:[2,42],15:[2,42],18:[2,42],19:[2,42],21:[2,42],23:[2,42],24:[2,42]},{1:[2,15],4:[2,15],7:[2,15],8:[2,15],9:[2,15],10:[2,15],11:[2,15],12:[2,15],13:[2,15],15:[2,15],17:[2,15],18:[2,15],19:[2,15],20:[2,15],21:[2,15],23:[2,15],24:[2,15]},{17:[1,82]},{4:[2,3],17:[2,3],26:[2,3]},{3:83,4:[1,20]},{20:[2,23]},{20:[2,55]},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],20:[2,47],21:[1,18],24:[1,19],45:4,49:84,54:3,55:47},{4:[2,27],17:[2,27]},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],21:[1,18],24:[1,19],45:85},{3:15,4:[1,20],6:5,7:[1,8],8:[1,9],9:[1,10],10:[1,11],11:[1,12],12:[1,13],13:[1,14],14:6,15:[1,16],18:[1,17],19:[1,7],20:[2,47],21:[1,18],24:[1,19],30:86,45:4,49:66,54:3,55:47,56:87},{17:[2,16]},{20:[2,29]},{4:[2,26],17:[2,26]},{20:[2,20]},{20:[2,49]}],
defaultActions: {2:[2,50],23:[2,31],24:[2,32],25:[2,33],26:[2,34],44:[2,35],46:[2,36],47:[2,46],48:[2,21],62:[2,22],65:[2,24],66:[2,48],67:[2,25],68:[2,57],77:[2,23],78:[2,55],83:[2,16],84:[2,29],86:[2,20],87:[2,49]},
parseError: function parseError(str, hash) {
    if (hash.recoverable) {
        this.trace(str);
    } else {
        throw new Error(str);
    }
},
parse: function parse(input) {
    var self = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = '', yylineno = 0, yyleng = 0, recovering = 0, TERROR = 2, EOF = 1;
    var args = lstack.slice.call(arguments, 1);
    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    this.yy.parser = this;
    if (typeof this.lexer.yylloc == 'undefined') {
        this.lexer.yylloc = {};
    }
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);
    var ranges = this.lexer.options && this.lexer.options.ranges;
    if (typeof this.yy.parseError === 'function') {
        this.parseError = this.yy.parseError;
    } else {
        this.parseError = Object.getPrototypeOf(this).parseError;
    }
    function popStack(n) {
        stack.length = stack.length - 2 * n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }
    function lex() {
        var token;
        token = self.lexer.lex() || EOF;
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }
    var symbol, preErrorSymbol, state, action, a, r, yyval = {}, p, len, newState, expected;
    while (true) {
        state = stack[stack.length - 1];
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol === null || typeof symbol == 'undefined') {
                symbol = lex();
            }
            action = table[state] && table[state][symbol];
        }
                    if (typeof action === 'undefined' || !action.length || !action[0]) {
                var errStr = '';
                expected = [];
                for (p in table[state]) {
                    if (this.terminals_[p] && p > TERROR) {
                        expected.push('\'' + this.terminals_[p] + '\'');
                    }
                }
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ':\n' + this.lexer.showPosition() + '\nExpecting ' + expected.join(', ') + ', got \'' + (this.terminals_[symbol] || symbol) + '\'';
                } else {
                    errStr = 'Parse error on line ' + (yylineno + 1) + ': Unexpected ' + (symbol == EOF ? 'end of input' : '\'' + (this.terminals_[symbol] || symbol) + '\'');
                }
                this.parseError(errStr, {
                    text: this.lexer.match,
                    token: this.terminals_[symbol] || symbol,
                    line: this.lexer.yylineno,
                    loc: yyloc,
                    expected: expected
                });
            }
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: ' + state + ', token: ' + symbol);
        }
        switch (action[0]) {
        case 1:
            stack.push(symbol);
            vstack.push(this.lexer.yytext);
            lstack.push(this.lexer.yylloc);
            stack.push(action[1]);
            symbol = null;
            if (!preErrorSymbol) {
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                if (recovering > 0) {
                    recovering--;
                }
            } else {
                symbol = preErrorSymbol;
                preErrorSymbol = null;
            }
            break;
        case 2:
            len = this.productions_[action[1]][1];
            yyval.$ = vstack[vstack.length - len];
            yyval._$ = {
                first_line: lstack[lstack.length - (len || 1)].first_line,
                last_line: lstack[lstack.length - 1].last_line,
                first_column: lstack[lstack.length - (len || 1)].first_column,
                last_column: lstack[lstack.length - 1].last_column
            };
            if (ranges) {
                yyval._$.range = [
                    lstack[lstack.length - (len || 1)].range[0],
                    lstack[lstack.length - 1].range[1]
                ];
            }
            r = this.performAction.apply(yyval, [
                yytext,
                yyleng,
                yylineno,
                this.yy,
                action[1],
                vstack,
                lstack
            ].concat(args));
            if (typeof r !== 'undefined') {
                return r;
            }
            if (len) {
                stack = stack.slice(0, -1 * len * 2);
                vstack = vstack.slice(0, -1 * len);
                lstack = lstack.slice(0, -1 * len);
            }
            stack.push(this.productions_[action[1]][0]);
            vstack.push(yyval.$);
            lstack.push(yyval._$);
            newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
            stack.push(newState);
            break;
        case 3:
            return true;
        }
    }
    return true;
}};


var expressionTypes = ['Literal', 'Identifier', 'UnaryExpression', 'CallExpression', 'FunctionExpression',
    'ObjectExpression', 'NewExpression'];

function parseNumLiteral(type, token, loc, yy, yytext) {
    var node;
    if (token[0] === '-') {
        node = parseLiteral(type, -parseNum(token), loc, yytext, yy);
        node.arguments[0] = yy.Node('UnaryExpression', '-', node.arguments[0], true, yy.loc(loc));
    } else {
        node = parseLiteral(type, parseNum(token), loc, yytext, yy);
    }
    return node;
}

function parseLiteral(type, value, loc, raw, yy) {
    return parseLiteralCommon(type, yy.Node('Literal', value, loc, raw), loc, yy);
}

function parseCollectionLiteral(type, items, loc, yy) {
    return parseLiteralCommon(type, yy.Node('ArrayExpression', items, loc), loc, yy);
}

function parseLiteralCommon(type, value, loc, yy) {
    loc = yy.loc(loc);
    return yy.Node('NewExpression', yy.Node('Identifier', type, loc), [value], loc);
}

function parseNum(num) {
    if (num[0] === '0') {
        if (num[1] === 'x' || num[1] === 'X') {
            return parseInt(num, 16);
        }
        return parseInt(num, 8);
    } else {
        return Number(num);
    }
}

function parseString(str) {
    return str
        .replace(/\\(u[a-fA-F0-9]{4}|x[a-fA-F0-9]{2})/g, function (match, hex) {
            return String.fromCharCode(parseInt(hex.slice(1), 16));
        })
        .replace(/\\([0-3]?[0-7]{1,2})/g, function (match, oct) {
            return String.fromCharCode(parseInt(oct, 8));
        })
        .replace(/\\0[^0-9]?/g,'\u0000')
        .replace(/\\(?:\r\n?|\n)/g,'')
        .replace(/\\n/g,'\n')
        .replace(/\\r/g,'\r')
        .replace(/\\t/g,'\t')
        .replace(/\\v/g,'\v')
        .replace(/\\f/g,'\f')
        .replace(/\\b/g,'\b')
        .replace(/\\(.)/g, '$1');
}

function getValueIfUndefined(variable, valueIfUndefined) {
    return (typeof variable === 'undefined') ? valueIfUndefined : variable;
}
/* generated by jison-lex 0.2.1 */
var lexer = (function(){
var lexer = {

EOF:1,

parseError:function parseError(str, hash) {
        if (this.yy.parser) {
            this.yy.parser.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },

// resets the lexer, sets new input
setInput:function (input) {
        this._input = input;
        this._more = this._backtrack = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {
            first_line: 1,
            first_column: 0,
            last_line: 1,
            last_column: 0
        };
        if (this.options.ranges) {
            this.yylloc.range = [0,0];
        }
        this.offset = 0;
        return this;
    },

// consumes and returns one char from the input
input:function () {
        var ch = this._input[0];
        this.yytext += ch;
        this.yyleng++;
        this.offset++;
        this.match += ch;
        this.matched += ch;
        var lines = ch.match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno++;
            this.yylloc.last_line++;
        } else {
            this.yylloc.last_column++;
        }
        if (this.options.ranges) {
            this.yylloc.range[1]++;
        }

        this._input = this._input.slice(1);
        return ch;
    },

// unshifts one char (or a string) into the input
unput:function (ch) {
        var len = ch.length;
        var lines = ch.split(/(?:\r\n?|\n)/g);

        this._input = ch + this._input;
        this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
        //this.yyleng -= len;
        this.offset -= len;
        var oldLines = this.match.split(/(?:\r\n?|\n)/g);
        this.match = this.match.substr(0, this.match.length - 1);
        this.matched = this.matched.substr(0, this.matched.length - 1);

        if (lines.length - 1) {
            this.yylineno -= lines.length - 1;
        }
        var r = this.yylloc.range;

        this.yylloc = {
            first_line: this.yylloc.first_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.first_column,
            last_column: lines ?
                (lines.length === oldLines.length ? this.yylloc.first_column : 0)
                 + oldLines[oldLines.length - lines.length].length - lines[0].length :
              this.yylloc.first_column - len
        };

        if (this.options.ranges) {
            this.yylloc.range = [r[0], r[0] + this.yyleng - len];
        }
        this.yyleng = this.yytext.length;
        return this;
    },

// When called from action, caches matched text and appends it on next action
more:function () {
        this._more = true;
        return this;
    },

// When called from action, signals the lexer that this rule fails to match the input, so the next matching rule (regex) should be tested instead.
reject:function () {
        if (this.options.backtrack_lexer) {
            this._backtrack = true;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. You can only invoke reject() in the lexer when the lexer is of the backtracking persuasion (options.backtrack_lexer = true).\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });

        }
        return this;
    },

// retain first n characters of the match
less:function (n) {
        this.unput(this.match.slice(n));
    },

// displays already matched input, i.e. for error messages
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },

// displays upcoming input, i.e. for error messages
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20) + (next.length > 20 ? '...' : '')).replace(/\n/g, "");
    },

// displays the character position where the lexing error occurred, i.e. for error messages
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c + "^";
    },

// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function (match, indexed_rule) {
        var token,
            lines,
            backup;

        if (this.options.backtrack_lexer) {
            // save context
            backup = {
                yylineno: this.yylineno,
                yylloc: {
                    first_line: this.yylloc.first_line,
                    last_line: this.last_line,
                    first_column: this.yylloc.first_column,
                    last_column: this.yylloc.last_column
                },
                yytext: this.yytext,
                match: this.match,
                matches: this.matches,
                matched: this.matched,
                yyleng: this.yyleng,
                offset: this.offset,
                _more: this._more,
                _input: this._input,
                yy: this.yy,
                conditionStack: this.conditionStack.slice(0),
                done: this.done
            };
            if (this.options.ranges) {
                backup.yylloc.range = this.yylloc.range.slice(0);
            }
        }

        lines = match[0].match(/(?:\r\n?|\n).*/g);
        if (lines) {
            this.yylineno += lines.length;
        }
        this.yylloc = {
            first_line: this.yylloc.last_line,
            last_line: this.yylineno + 1,
            first_column: this.yylloc.last_column,
            last_column: lines ?
                         lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length :
                         this.yylloc.last_column + match[0].length
        };
        this.yytext += match[0];
        this.match += match[0];
        this.matches = match;
        this.yyleng = this.yytext.length;
        if (this.options.ranges) {
            this.yylloc.range = [this.offset, this.offset += this.yyleng];
        }
        this._more = false;
        this._backtrack = false;
        this._input = this._input.slice(match[0].length);
        this.matched += match[0];
        token = this.performAction.call(this, this.yy, this, indexed_rule, this.conditionStack[this.conditionStack.length - 1]);
        if (this.done && this._input) {
            this.done = false;
        }
        if (token) {
            return token;
        } else if (this._backtrack) {
            // recover context
            for (var k in backup) {
                this[k] = backup[k];
            }
            return false; // rule action called reject() implying the next rule should be tested instead.
        }
        return false;
    },

// return next match in input
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) {
            this.done = true;
        }

        var token,
            match,
            tempMatch,
            index;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i = 0; i < rules.length; i++) {
            tempMatch = this._input.match(this.rules[rules[i]]);
            if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i;
                if (this.options.backtrack_lexer) {
                    token = this.test_match(tempMatch, rules[i]);
                    if (token !== false) {
                        return token;
                    } else if (this._backtrack) {
                        match = false;
                        continue; // rule action called reject() implying a rule MISmatch.
                    } else {
                        // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
                        return false;
                    }
                } else if (!this.options.flex) {
                    break;
                }
            }
        }
        if (match) {
            token = this.test_match(match, rules[index]);
            if (token !== false) {
                return token;
            }
            // else: this is a lexer rule which consumes input without producing a token (e.g. whitespace)
            return false;
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            return this.parseError('Lexical error on line ' + (this.yylineno + 1) + '. Unrecognized text.\n' + this.showPosition(), {
                text: "",
                token: null,
                line: this.yylineno
            });
        }
    },

// return next match that has a token
lex:function lex() {
        var r = this.next();
        if (r) {
            return r;
        } else {
            return this.lex();
        }
    },

// activates a new lexer condition state (pushes the new lexer condition state onto the condition stack)
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },

// pop the previously active lexer condition state off the condition stack
popState:function popState() {
        var n = this.conditionStack.length - 1;
        if (n > 0) {
            return this.conditionStack.pop();
        } else {
            return this.conditionStack[0];
        }
    },

// produce the lexer rule set which is active for the currently active lexer condition state
_currentRules:function _currentRules() {
        if (this.conditionStack.length && this.conditionStack[this.conditionStack.length - 1]) {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
        } else {
            return this.conditions["INITIAL"].rules;
        }
    },

// return the currently active lexer condition state; when an index argument is provided it produces the N-th previous condition state, if available
topState:function topState(n) {
        n = this.conditionStack.length - 1 - Math.abs(n || 0);
        if (n >= 0) {
            return this.conditionStack[n];
        } else {
            return "INITIAL";
        }
    },

// alias for begin(condition)
pushState:function pushState(condition) {
        this.begin(condition);
    },

// return the number of states currently on the stack
stateStackSize:function stateStackSize() {
        return this.conditionStack.length;
    },
options: {"flex":true},
performAction: function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START;
switch($avoiding_name_collisions) {
case 0:/* whitespace */;
break;
case 1:
    return 7;

break;
case 2:
    return 8;

break;
case 3:
    yy_.yytext = yy_.yytext.substr(1, yy_.yyleng-2);
    return 9;

break;
case 4: /* ignore */ 
break;
case 5:return 26;
break;
case 6:return 19;
break;
case 7:return 20;
break;
case 8:return 15;
break;
case 9:return 17;
break;
case 10:return 21;
break;
case 11:return 23;
break;
case 12:return 24;
break;
case 13:return 18;
break;
case 14:return 13;
break;
case 15:return 42;
break;
case 16:return 32;
break;
case 17:return 33;
break;
case 18:return 35;
break;
case 19:return 39;
break;
case 20:return 51;
break;
case 21:return 48;
break;
case 22:return 10;
break;
case 23:return 11;
break;
case 24:return 12;
break;
case 25:
    return 4;

break;
case 26:console.log(yy_.yytext);
break;
}
},
rules: [/^(?:([\s,]+))/,/^(?:([-+]?([1-9][0-9]+|[0-9])))/,/^(?:([-+]?[0-9]+((\.[0-9]*[eE][-+]?[0-9]+)|(\.[0-9]*)|([eE][-+]?[0-9]+))))/,/^(?:("([^\"\\]|\\[\'\"\\bfnrt])*"))/,/^(?:(;[^\r\n]*))/,/^(?:&)/,/^(?:\()/,/^(?:\))/,/^(?:\[)/,/^(?:\])/,/^(?:\{)/,/^(?:\})/,/^(?:#)/,/^(?:')/,/^(?::)/,/^(?:def)/,/^(?:fn)/,/^(?:defn)/,/^(?:if)/,/^(?:when)/,/^(?:do)/,/^(?:let)/,/^(?:true)/,/^(?:false)/,/^(?:nil)/,/^(?:([a-zA-Z*+!\-_=<>?/.][0-9a-zA-Z*+!\-_=<>?/.]*))/,/^(?:.)/],
conditions: {"regex":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],"inclusive":true},"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26],"inclusive":true}}
};
return lexer;
})();
parser.lexer = lexer;
function Parser () {
  this.yy = {};
}
Parser.prototype = parser;parser.Parser = Parser;
return new Parser;
})();


if (typeof _dereq_ !== 'undefined' && typeof exports !== 'undefined') {
exports.parser = parser;
exports.Parser = parser.Parser;
exports.parse = function () { return parser.parse.apply(parser, arguments); };
exports.main = function commonjsMain(args) {
    if (!args[1]) {
        console.log('Usage: '+args[0]+' FILE');
        process.exit(1);
    }
    var source = _dereq_('fs').readFileSync(_dereq_('path').normalize(args[1]), "utf8");
    return exports.parser.parse(source);
};
if (typeof module !== 'undefined' && _dereq_.main === module) {
  exports.main(process.argv.slice(1));
}
}
}).call(this,_dereq_("/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":5,"fs":4,"path":6}],4:[function(_dereq_,module,exports){

},{}],5:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.once = noop;
process.off = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],6:[function(_dereq_,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,_dereq_("/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/usr/local/lib/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":5}]},{},[1])
(1)
});