var closer = require("../src/closer");
var json_diff = require("json-diff");

var helpers = require("./closer_helpers");
var Literal = helpers.Literal;
var Identifier = helpers.Identifier;
var CallExpression = helpers.CallExpression;
var FunctionExpression = helpers.FunctionExpression;
var EmptyStatement = helpers.EmptyStatement;
var ExpressionStatement = helpers.ExpressionStatement;
var IfStatement = helpers.IfStatement;
var ReturnStatement = helpers.ReturnStatement;
var VariableDeclaration = helpers.VariableDeclaration;
var VariableDeclarator = helpers.VariableDeclarator;
var FunctionDeclaration = helpers.FunctionDeclaration;
var BlockStatement = helpers.BlockStatement;
var Program = helpers.Program;

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
        expect(closer.parse("\n")).toDeepEqual(Program());
    });

    it("correctly parses an empty s-expression", function () {
        expect(closer.parse("()\n")).toDeepEqual(Program(
            EmptyStatement()
        ));
    });

    it("correctly parses comments", function () {
        expect(closer.parse("; Heading\n() ; trailing ()\r\n;\r;;;\n\r\r")).toDeepEqual(Program(
            EmptyStatement()
        ));
    });

    it("correctly parses an identifier", function () {
        expect(closer.parse("x\n")).toDeepEqual(Program(
            ExpressionStatement(Identifier("x"))
        ));
    });

    it("correctly parses integer, string, boolean, and nil literals", function () {
        expect(closer.parse("24\n\"string\"\ntrue\nfalse\nnil\n")).toDeepEqual(Program(
            ExpressionStatement(Literal(24)),
            ExpressionStatement(Literal("string")),
            ExpressionStatement(Literal(true)),
            ExpressionStatement(Literal(false)),
            ExpressionStatement(Literal(null))
        ));
    });

    // functions
    it("correctly parses a function call with 0 arguments", function () {
        expect(closer.parse("(fn-name)\n")).toDeepEqual(Program(
            ExpressionStatement(
                CallExpression(Identifier("fn-name"))
            )
        ));
    });

    it("correctly parses a function call with > 0 arguments", function () {
        expect(closer.parse("(fn-name arg1 arg2)\n")).toDeepEqual(Program(
            ExpressionStatement(
                CallExpression(
                    Identifier("fn-name"),
                    [Identifier("arg1"), Identifier("arg2")]
                )
            )
        ));
    });

    it("correctly parses an anonymous function definition", function () {
        expect(closer.parse("(fn [x] x)\n")).toDeepEqual(Program(
            ExpressionStatement(
                FunctionExpression(
                    null,
                    [Identifier("x")],
                    null,
                    BlockStatement(
                        ReturnStatement(Identifier("x"))
                    )
                )
            )
        ));
    });

    it("correctly parses an anonymous function call", function () {
        expect(closer.parse("((fn [x] x) 2)\n")).toDeepEqual(Program(
            ExpressionStatement(
                CallExpression(
                    FunctionExpression(
                        null,
                        [Identifier("x")],
                        null,
                        BlockStatement(
                            ReturnStatement(Identifier("x"))
                        )
                    ),
                    [Literal(2)]
                )
            )
        ));
    });

    it("correctly parses a named function definition", function () {
        expect(closer.parse("(defn fn-name [x] x)\n")).toDeepEqual(Program(
            FunctionDeclaration(
                Identifier("fn-name"),
                [Identifier("x")],
                null,
                BlockStatement(
                    ReturnStatement(Identifier("x"))
                )
            )
        ));
    });

    it("correctly parses rest arguments", function () {
        expect(closer.parse("(defn avg [& rest] (/ (apply + rest) (count rest)))\n")).toDeepEqual(Program(
            FunctionDeclaration(
                Identifier("avg"),
                [],
                Identifier("rest"),
                BlockStatement(ReturnStatement(
                    CallExpression(
                        Identifier("/"),
                        [
                            CallExpression(
                                Identifier("apply"),
                                [Identifier("+"), Identifier("rest")]
                            ),
                            CallExpression(
                                Identifier("count"),
                                [Identifier("rest")]
                            )
                        ]
                    ))
                )
            )
        ));
    });

    // conditional statements
    it("correctly parses an if statement without else", function () {
        expect(closer.parse("(if (>= x 0) x)\n")).toDeepEqual(Program(
            IfStatement(
                CallExpression(
                    Identifier(">="),
                    [Identifier("x"), Literal(0)]
                ),
                ExpressionStatement(Identifier("x")),
                null
            )
        ));
    });

    it("correctly parses an if-else statement", function () {
        expect(closer.parse("(if (>= x 0) x (- x))\n")).toDeepEqual(Program(
            IfStatement(
                CallExpression(
                    Identifier(">="),
                    [Identifier("x"), Literal(0)]
                ),
                ExpressionStatement(Identifier("x")),
                ExpressionStatement(CallExpression(
                    Identifier("-"),
                    [Identifier("x")]
                ))
            )
        ));
    });

    it("correctly parses a when form", function () {
        expect(closer.parse("(when (condition?) (println \"hello\") true)\n")).toDeepEqual(Program(
            IfStatement(
                CallExpression(Identifier("condition?")),
                BlockStatement(
                    ExpressionStatement(CallExpression(
                        Identifier("println"),
                        [Literal("hello")]
                    )),
                    ExpressionStatement(Literal(true))
                )
            )
        ));
    });

    // variables
    it("correctly parses an unbound var definition", function () {
        expect(closer.parse("(def var-name)")).toDeepEqual(Program(
            VariableDeclaration(
                'var',
                VariableDeclarator(
                    Identifier('var-name'),
                    null
                )
            )
        ));
    });

    it("correctly parses a var bound to a literal", function () {
        expect(closer.parse("(def greeting \"Hello\")")).toDeepEqual(Program(
            VariableDeclaration(
                'var',
                VariableDeclarator(
                    Identifier('greeting'),
                    Literal('Hello')
                )
            )
        ));
    });

    it("correctly parses a var bound to the result of an expression", function () {
        expect(closer.parse("(def sum (+ 3 5))")).toDeepEqual(Program(
            VariableDeclaration(
                'var',
                VariableDeclarator(
                    Identifier('sum'),
                    CallExpression(
                        Identifier('+'),
                        [Literal(3), Literal(5)]
                    )
                )
            )
        ));
    });

    it("correctly parses a var bound to an fn form", function () {
        expect(closer.parse("(def add (fn [& numbers] (apply + numbers)))")).toDeepEqual(Program(
            VariableDeclaration(
                'var',
                VariableDeclarator(
                    Identifier('add'),
                    FunctionExpression(
                        null,
                        [],
                        Identifier('numbers'),
                        BlockStatement(
                            ReturnStatement(CallExpression(
                                Identifier('apply'),
                                [Identifier('+'), Identifier('numbers')]
                            ))
                        )
                    )
                )
            )
        ));
    });

    it("correctly parses a let form with no bindings and no body", function () {
        expect(closer.parse("(let [])")).toDeepEqual(Program(
            BlockStatement(ExpressionStatement(Literal(null)))
        ));
    });

    it("correctly parses a let form with non-empty bindings and a non-empty body", function () {
        expect(closer.parse("(let [x 3 y (- x)] (+ x y))")).toDeepEqual(Program(
            BlockStatement(
                VariableDeclaration('let',
                    VariableDeclarator(
                        Identifier('x'),
                        Literal(3)
                    )
                ),
                VariableDeclaration('let',
                    VariableDeclarator(
                        Identifier('y'),
                        CallExpression(
                            Identifier('-'),
                            [Identifier('x')]
                        )
                    )
                ),
                ExpressionStatement(CallExpression(
                    Identifier('+'),
                    [Identifier('x'), Identifier('y')]
                ))
            )
        ));
    });

    // other special forms
    it("correctly parses an empty do form", function () {
        expect(closer.parse("(do)")).toDeepEqual(Program(
            BlockStatement(ExpressionStatement(Literal(null)))
        ));
    });

    it("correctly parses a non-empty do form", function () {
        expect(closer.parse("(do (+ 1 2) (+ 3 4))")).toDeepEqual(Program(
            BlockStatement(
                ExpressionStatement(CallExpression(
                    Identifier('+'),
                    [Literal(1), Literal(2)]
                )),
                ExpressionStatement(CallExpression(
                    Identifier('+'),
                    [Literal(3), Literal(4)]
                ))
            )
        ));
    });

    // pending
    xit("correctly parses source locations");

});