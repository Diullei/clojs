var closer = require("../src/closer");
var json_diff = require("json-diff");

beforeEach(function () {
    this.addMatchers({
        toDeepEqual: function (expected) {
            this.message = function () {
                return "actual != expected, diff is:\n"
                    + json_diff.diffString(this.actual, expected);
            };

            return json_diff.diff(this.actual, expected) === undefined;
        }
    });
});

describe("Closer.js", function () {

    // atoms
    it("correctly parses an empty program", function () {
        expect(closer.parse("\n")).toDeepEqual({
            type: 'Program',
            body: []
        });
    });

    it("correctly parses an empty s-expression", function () {
        expect(closer.parse("()\n")).toDeepEqual({
            type: "Program",
            body: [{
                type: "EmptyStatement"
            }]
        });
    });

    it("correctly parses an identifier", function () {
        expect(closer.parse("x\n")).toDeepEqual({
            type: 'Program',
            body: [{
                type: "ExpressionStatement",
                expression: {
                    type: "Identifier",
                    name: "x"
                }
            }]
        });
    });

    it("correctly parses integer, string, boolean, and nil literals", function () {
        expect(closer.parse("24\n\"string\"\ntrue\nfalse\nnil\n")).toDeepEqual({
            type: 'Program',
            body: [{
                type: "ExpressionStatement",
                expression: {
                    type: "Literal",
                    value: 24
                }
            }, {
                type: "ExpressionStatement",
                expression: {
                    type: "Literal",
                    value: "string"
                }
            }, {
                type: "ExpressionStatement",
                expression: {
                    type: "Literal",
                    value: true
                }
            }, {
                type: "ExpressionStatement",
                expression: {
                    type: "Literal",
                    value: false
                }
            }, {
                type: "ExpressionStatement",
                expression: {
                    type: "Literal",
                    value: null
                }
            }]
        });
    });

    // functions
    it("correctly parses a function call with 0 arguments", function () {
        expect(closer.parse("(fn-name)\n")).toDeepEqual({
            type: "Program",
            body: [{
                type: "ExpressionStatement",
                expression: {
                    type: "CallExpression",
                    arguments: [],
                    callee: {
                        type: "Identifier",
                        name: "fn-name"
                    }
                }
            }]
        });
    });

    it("correctly parses a function call with > 0 arguments", function () {
        expect(closer.parse("(fn-name arg1 arg2)\n")).toDeepEqual({
            type: "Program",
            body: [{
                type: "ExpressionStatement",
                expression: {
                    type: "CallExpression",
                    arguments: [{
                        type: "Identifier",
                        name: "arg1"
                    },
                        {
                            type: "Identifier",
                            name: "arg2"
                        }],
                    callee: {
                        type: "Identifier",
                        name: "fn-name"
                    }
                }
            }]
        });
    });

    it("correctly parses an anonymous function definition", function () {
        expect(closer.parse("(fn [x] x)\n")).toDeepEqual({
            type: "Program",
            body: [{
                type: "ExpressionStatement",
                expression: {
                    type: "FunctionExpression",
                    id: null,
                    params: [{
                        type: "Identifier",
                        name: "x"
                    }],
                    defaults: [],
                    rest: null,
                    body: {
                        type: "BlockStatement",
                        body: [{
                            type: "ReturnStatement",
                            argument: {
                                type: "Identifier",
                                name: "x"
                            }
                        }]
                    },
                    generator: false,
                    expression: false
                }
            }]
        });
    });

    it("correctly parses an anonymous function call", function () {
        expect(closer.parse("((fn [x] x) 2)\n")).toDeepEqual({
            type: "Program",
            body: [{
                type: "ExpressionStatement",
                expression: {
                    type: "CallExpression",
                    arguments: [{
                        type: "Literal",
                        value: 2
                    }],
                    callee: {
                        type: "FunctionExpression",
                        id: null,
                        params: [{
                            type: "Identifier",
                            name: "x"
                        }],
                        defaults: [],
                        rest: null,
                        body: {
                            type: "BlockStatement",
                            body: [{
                                type: "ReturnStatement",
                                argument: {
                                    type: "Identifier",
                                    name: "x"
                                }
                            }]
                        },
                        generator: false,
                        expression: false
                    }
                }
            }]
        });
    });

    it("correctly parses a named function definition", function () {
        expect(closer.parse("(defn fn-name [x] x)\n")).toDeepEqual({
            type: "Program",
            body: [{
                type: "FunctionDeclaration",
                id: {
                    type: "Identifier",
                    name: "fn-name"
                },
                params: [{
                    type: "Identifier",
                    name: "x"
                }],
                defaults: [],
                rest: null,
                body: {
                    type: "BlockStatement",
                    body: [{
                        type: "ReturnStatement",
                        argument: {
                            type: "Identifier",
                            name: "x"
                        }
                    }]
                },
                generator: false,
                expression: false
            }]
        });
    });

    it("correctly parses rest arguments", function () {
        expect(closer.parse("(defn avg [& rest] (/ (apply + rest) (count rest)))\n")).toDeepEqual({
            type: "Program",
            body: [{
                type: "FunctionDeclaration",
                id: {
                    type: "Identifier",
                    name: "avg"
                },
                params: [],
                defaults: [],
                rest: {
                    type: "Identifier",
                    name: "rest"
                },
                body: {
                    type: "BlockStatement",
                    body: [{
                        type: "ReturnStatement",
                        argument: {
                            type: "CallExpression",
                            arguments: [{
                                type: "CallExpression",
                                arguments: [{
                                    type: "Identifier",
                                    name: "+"
                                }, {
                                    type: "Identifier",
                                    name: "rest"
                                }],
                                callee: {
                                    type: "Identifier",
                                    name: "apply"
                                }
                            }, {
                                type: "CallExpression",
                                arguments: [{
                                    type: "Identifier",
                                    name: "rest"
                                }],
                                callee: {
                                    type: "Identifier",
                                    name: "count"
                                }
                            }],
                            callee: {
                                type: "Identifier",
                                name: "/"
                            }
                        }
                    }]
                },
                generator: false,
                expression: false
            }]
        });
    });

    // conditional statements
    it("correctly parses an if-else statement", function () {
        expect(closer.parse("(if (>= x 0) x (- x))\n")).toDeepEqual({
            type: "Program",
            body: [{
                type: "IfStatement",
                test: {
                    type: "CallExpression",
                    arguments: [{
                        type: "Identifier",
                        name: "x"
                    }, {
                        type: "Literal",
                        value: 0
                    }],
                    callee: {
                        type: "Identifier",
                        name: ">="
                    }
                },
                consequent: {
                    type: "ExpressionStatement",
                    expression: {
                        type: "Identifier",
                        name: "x"
                    }
                },
                alternate: {
                    type: "ExpressionStatement",
                    expression: {
                        type: "CallExpression",
                        arguments: [{
                            type: "Identifier",
                            name: "x"
                        }],
                        callee: {
                            type: "Identifier",
                            name: "-"
                        }
                    }
                }
            }]
        });
    });

    it("correctly parses a when form", function () {
        expect(closer.parse("(when (condition) (println \"hello\") true)\n")).toDeepEqual({
            type: "Program",
            body: [{
                type: "IfStatement",
                test: {
                    type: "CallExpression",
                    arguments: [],
                    callee: {
                        type: "Identifier",
                        name: "condition"
                    }
                },
                consequent: {
                    type: "BlockStatement",
                    body: [{
                        type: "ExpressionStatement",
                        expression: {
                            type: "CallExpression",
                            arguments: [{
                                type: "Literal",
                                value: "hello"
                            }],
                            callee: {
                                type: "Identifier",
                                name: "println"
                            }
                        }
                    }, {
                        type: "ExpressionStatement",
                        expression: {
                            type: "Literal",
                            value: true
                        }
                    }]
                },
                alternate: null
            }]
        });
    });

    // pending
    xit("correctly parses source locations");

});
