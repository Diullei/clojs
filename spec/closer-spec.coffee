closer = window?.closer ? self?.closer ? global?.closer ? require '../src/closer'
json_diff = require 'json-diff'

helpers = require './closer-helpers'
Integer = helpers.Literal
Float = helpers.Literal
String = helpers.Literal
Boolean = helpers.Literal
Nil = helpers.Literal
Keyword = helpers['keyword']
Vector = helpers['vector']
List = helpers['list']
HashSet = helpers['hash_$_set']
HashMap = helpers['hash_$_map']
AssertArity = helpers.AssertArity
DestructuringVector = helpers.DestructuringVector
DestructuringVectorRest = helpers.DestructuringVectorRest
DestructuringMap = helpers.DestructuringMap
Identifier = helpers.Identifier
ThisExpression = helpers.ThisExpression
UnaryExpression = helpers.UnaryExpression
UpdateExpression = helpers.UpdateExpression
BinaryExpression = helpers.BinaryExpression
LogicalExpression = helpers.LogicalExpression
SequenceExpression = helpers.SequenceExpression
ArrayExpression = helpers.ArrayExpression
AssignmentExpression = helpers.AssignmentExpression
CallExpression = helpers.CallExpression
MemberExpression = helpers.MemberExpression
NewExpression = helpers.NewExpression
ConditionalExpression = helpers.ConditionalExpression
FunctionExpression = helpers.FunctionExpression
EmptyStatement = helpers.EmptyStatement
ExpressionStatement = helpers.ExpressionStatement
ForStatement = helpers.ForStatement
WhileStatement = helpers.WhileStatement
IfStatement = helpers.IfStatement
BreakStatement = helpers.BreakStatement
ContinueStatement = helpers.ContinueStatement
ReturnStatement = helpers.ReturnStatement
TryStatement = helpers.TryStatement
CatchClause = helpers.CatchClause
ThrowStatement = helpers.ThrowStatement
VariableDeclaration = helpers.VariableDeclaration
VariableDeclarator = helpers.VariableDeclarator
BlockStatement = helpers.BlockStatement
Program = helpers.Program

beforeEach ->
  @addMatchers toDeepEqual: helpers.toDeepEqual

parseOpts = { loc: false, forceNoLoc: true }
looseParseOpts = { loc: false, forceNoLoc: true, loose: true }
eq = (src, ast) ->
  expect(closer.parse src, parseOpts).toDeepEqual ast
looseEq = (src, ast) ->
  actual = closer.parse src, looseParseOpts
  delete actual.errors
  expect(actual).toDeepEqual ast
throws = (src) ->
  expect(-> closer.parse src, parseOpts).toThrow()

describe 'Closer parser', ->


  ##########
  describe 'Building blocks', ->

    it 'parses empty programs', ->
      eq '\n', Program()

    it 'parses commas as whitespace', ->
      eq ',,, ,,,  ,,\n', Program()

    it 'parses empty s-expressions', ->
      eq '()\n', Program(
        EmptyStatement())

    it 'parses comments', ->
      eq '; Heading\n() ; trailing ()\r\n;\r;;;\n\r\r', Program(
        EmptyStatement())

    it 'parses identifiers', ->
      eq 'x\n', Program(
        ExpressionStatement(Identifier('x')))

    it 'parses JavaScript reserved words as identifiers after sanitization', ->
      eq 'new\nclass\nif\nfunction\n', Program(
        ExpressionStatement(Identifier('__$new')),
        ExpressionStatement(Identifier('__$class')),
        ExpressionStatement(Identifier('__$if')),
        ExpressionStatement(Identifier('__$function')))

    it 'allows Clojure special form names to be used as identifiers', ->
      eq 'fn\ndef\nif\nlet\nand\nnew', Program(
        ExpressionStatement(Identifier('fn')),
        ExpressionStatement(Identifier('def')),
        ExpressionStatement(Identifier('__$if')),  # if is also a JS reserved word
        ExpressionStatement(Identifier('__$let')), # let is also a JS reserved word
        ExpressionStatement(Identifier('and')),
        ExpressionStatement(Identifier('__$new'))) # new is also a JS reserved word

    it 'parses integer, float, string, boolean, and nil literals', ->
      eq '-24\n-23.67\n-22.45E-5\n""\n"string"\ntrue\nfalse\nnil\n', Program(
        ExpressionStatement(UnaryExpression('-', Integer(24))),
        ExpressionStatement(UnaryExpression('-', Float(23.67))),
        ExpressionStatement(UnaryExpression('-', Float(22.45e-5))),
        ExpressionStatement(String('')),
        ExpressionStatement(String('string')),
        ExpressionStatement(Boolean(true)),
        ExpressionStatement(Boolean(false)),
        ExpressionStatement(Nil()))

    it 'parses keywords', ->
      eq ':keyword', Program(
        ExpressionStatement(Keyword('keyword')))

    it 'parses vector and list literals', ->
      eq '[] ["string" true] \'() \'("string" true)', Program(
        ExpressionStatement(Vector()),
        ExpressionStatement(Vector(
          String('string'),
          Boolean(true))),
        ExpressionStatement(List()),
        ExpressionStatement(List(
          String('string'),
          Boolean(true))))

    it 'parses set and map literals', ->
      eq '#{} #{"string" true}', Program(
        ExpressionStatement(HashSet()),
        ExpressionStatement(HashSet(
          String('string'),
          Boolean(true))))
      eq '{} {"string" true}', Program(
        ExpressionStatement(HashMap()),
        ExpressionStatement(HashMap(
          String('string'),
          Boolean(true))))
      throws '{1 2 3}'



  ##########
  describe 'Functions', ->

    it 'parses function calls with 0 arguments', ->
      eq '(fn-name)\n', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(Identifier('fn_$_name'), Identifier('call')),
          [ThisExpression()])))

    it 'parses function calls with > 0 arguments', ->
      eq '(fn-name arg1 arg2)\n', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(Identifier('fn_$_name'), Identifier('call')),
          [ThisExpression(), Identifier('arg1'), Identifier('arg2')])))

    it 'parses anonymous function definitions', ->
      eq '(fn [x] x)\n', Program(
        ExpressionStatement(
          FunctionExpression(
            null,
            [Identifier('x')],
            null,
            BlockStatement(
              AssertArity(1),
              ReturnStatement(Identifier('x'))))))

    it 'parses calls to anonymous functions', ->
      eq '((fn [x] x) 2)\n', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            FunctionExpression(
              null,
              [Identifier('x')],
              null,
              BlockStatement(
                AssertArity(1),
                ReturnStatement(Identifier('x')))),
            Identifier('call')),
          [ThisExpression(), Integer(2)])))

    it 'parses anonymous function literals', ->
      eq '(#(apply + % %2 %&) 1 2 3 4)', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            FunctionExpression(
              null, [Identifier('__$1'), Identifier('__$2')], null,
              BlockStatement(
                AssertArity(2, Infinity),
                VariableDeclaration(VariableDeclarator(
                  Identifier('__$rest'),
                  CallExpression(
                    Identifier('seq'),
                    [CallExpression(
                      MemberExpression(
                        MemberExpression(
                          MemberExpression(Identifier('Array'), Identifier('prototype')),
                          Identifier('slice')),
                        Identifier('call')),
                      [Identifier('arguments'), Integer(2)])]))),
                ReturnStatement(CallExpression(
                  MemberExpression(Identifier('apply'), Identifier('call')),
                  [ThisExpression(), Identifier('_$PLUS_'), Identifier('__$1'),
                   Identifier('__$2'), Identifier('__$rest')])))),
            Identifier('call')),
          [ThisExpression(), Integer(1), Integer(2), Integer(3), Integer(4)])))

    it 'parses named function definitions', ->
      eq '(defn fn-name [x] x)\n', Program(
        VariableDeclaration(
          VariableDeclarator(
            Identifier('fn_$_name'),
            FunctionExpression(
              null, [Identifier('x')], null,
              BlockStatement(
                AssertArity(1),
                ReturnStatement(Identifier('x')))))))

    it 'parses rest arguments', ->
      eq '(defn avg [& rest] (/ (apply + rest) (count rest)))\n', Program(
        VariableDeclaration(
          VariableDeclarator(
            Identifier('avg'),
            FunctionExpression(
              null, [], null,
              BlockStatement(
                AssertArity(0, Infinity),
                VariableDeclaration(VariableDeclarator(
                  Identifier('rest'),
                  CallExpression(
                    Identifier('seq'),
                    [CallExpression(
                      MemberExpression(
                        MemberExpression(
                          MemberExpression(Identifier('Array'), Identifier('prototype')),
                          Identifier('slice')),
                        Identifier('call')),
                      [Identifier('arguments'), Integer(0)])]))),
                ReturnStatement(CallExpression(
                  MemberExpression(Identifier('_$SLASH_'), Identifier('call')),
                  [ThisExpression(),
                  CallExpression(
                    MemberExpression(Identifier('apply'), Identifier('call')),
                    [ThisExpression(), Identifier('_$PLUS_'), Identifier('rest')]),
                  CallExpression(
                    MemberExpression(Identifier('count'), Identifier('call')),
                    [ThisExpression(), Identifier('rest')])])))))))

    it 'parses collections and keywords in function position', ->
      eq '([1 2 3 4] 1)', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            Vector(Integer(1), Integer(2), Integer(3), Integer(4)),
            Identifier('call')),
          [ThisExpression(), Integer(1)])))
      eq '({1 2 3 4} 1)', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            HashMap(Integer(1), Integer(2), Integer(3), Integer(4)),
            Identifier('call')),
          [ThisExpression(), Integer(1)])))
      eq '(#{1 2 3 4} 1)', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            HashSet(Integer(1), Integer(2), Integer(3), Integer(4)),
            Identifier('call')),
          [ThisExpression(), Integer(1)])))
      eq '(:key {:key :val})', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(Keyword('key'), Identifier('call')),
          [ThisExpression(), HashMap(Keyword('key'), Keyword('val'))])))


  ##########
  describe 'TryCatch forms', ->

    it 'throws when given empty try forms', ->
      throws '(try)'

  ##########
  describe 'Conditional forms', ->

    it 'throws when given empty if forms', ->
      throws '(if)'

    it 'parses if forms without else', ->
      eq '(if (>= x 0) x)\n', Program(
        ExpressionStatement(ConditionalExpression(
          CallExpression(
            MemberExpression(Identifier('_$GT__$EQ_'), Identifier('call')),
            [ThisExpression(), Identifier('x'), Integer(0)]),
          Identifier('x'), Nil())))

    it 'parses if-else forms', ->
      eq '(if (>= x 0) x (- x))\n', Program(
        ExpressionStatement(ConditionalExpression(
          CallExpression(
            MemberExpression(Identifier('_$GT__$EQ_'), Identifier('call')),
            [ThisExpression(), Identifier('x'), Integer(0)]),
          Identifier('x'),
          CallExpression(
            MemberExpression(Identifier('_$_'), Identifier('call')),
            [ThisExpression(), Identifier('x')]))))

    it 'parses if forms in function position', ->
      eq '(map #(if (even? %1) (- %) %) [1 2 3])', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(Identifier('map'), Identifier('call')),
          [ThisExpression(),
           FunctionExpression(
             null, [Identifier('__$1')], null,
             BlockStatement(
               AssertArity(1),
               ReturnStatement(ConditionalExpression(
                 CallExpression(
                   MemberExpression(Identifier('even_$QMARK_'), Identifier('call')),
                   [ThisExpression(), Identifier('__$1')]),
                 CallExpression(
                   MemberExpression(Identifier('_$_'), Identifier('call')),
                   [ThisExpression(), Identifier('__$1')]),
                 Identifier('__$1'))))),
           Vector(Integer(1), Integer(2), Integer(3))])))

    it 'throws when given if forms with > 3 forms in their body', ->
      throws '(if true 1 2 3)'

    it 'throws when given empty if-not forms', ->
      throws '(if-not)'

    it 'parses if-not forms without else', ->
      eq '(if-not (>= x 0) x)\n', Program(
        ExpressionStatement(ConditionalExpression(
          CallExpression(Identifier('not'),
            [CallExpression(
              MemberExpression(Identifier('_$GT__$EQ_'), Identifier('call')),
              [ThisExpression(), Identifier('x'), Integer(0)])]),
          Identifier('x'), Nil())))

    it 'parses if-not forms with else', ->
      eq '(if-not (>= x 0) x (- x))\n', Program(
        ExpressionStatement(ConditionalExpression(
          CallExpression(Identifier('not'),
            [CallExpression(
              MemberExpression(Identifier('_$GT__$EQ_'), Identifier('call')),
              [ThisExpression(), Identifier('x'), Integer(0)])]),
          Identifier('x'),
          CallExpression(
            MemberExpression(Identifier('_$_'), Identifier('call')),
            [ThisExpression(), Identifier('x')]))))

    it 'parses if-not forms in function position', ->
      eq '(map #(if-not (even? %1) (- %) %) [1 2 3])', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(Identifier('map'), Identifier('call')),
          [ThisExpression(),
           FunctionExpression(
             null, [Identifier('__$1')], null,
             BlockStatement(
               AssertArity(1),
               ReturnStatement(ConditionalExpression(
                 CallExpression(Identifier('not'),
                   [CallExpression(
                     MemberExpression(Identifier('even_$QMARK_'), Identifier('call')),
                     [ThisExpression(), Identifier('__$1')])]),
                 CallExpression(
                   MemberExpression(Identifier('_$_'), Identifier('call')),
                   [ThisExpression(), Identifier('__$1')]),
                 Identifier('__$1'))))),
           Vector(Integer(1), Integer(2), Integer(3))])))

    it 'throws when given if-not forms with > 3 forms in their body', ->
      throws '(if-not true 1 2 3)'

    it 'parses when forms', ->
      eq '(when (condition?) (println \"hello\") true)\n', Program(
        IfStatement(
          CallExpression(
            MemberExpression(Identifier('condition_$QMARK_'), Identifier('call')),
            [ThisExpression()]),
          BlockStatement(
            ExpressionStatement(CallExpression(
              MemberExpression(Identifier('println'), Identifier('call')),
              [ThisExpression(), String('hello')])),
            ExpressionStatement(Boolean(true)))))

    it 'parses when-not forms', ->
      eq '(when-not (condition?) (println \"hello\") true)\n', Program(
        IfStatement(
          CallExpression(Identifier('not'),
            [CallExpression(
              MemberExpression(Identifier('condition_$QMARK_'), Identifier('call')),
              [ThisExpression()])]),
          BlockStatement(
            ExpressionStatement(CallExpression(
              MemberExpression(Identifier('println'), Identifier('call')),
              [ThisExpression(), String('hello')])),
            ExpressionStatement(Boolean(true)))))



  ##########
  describe 'Looping forms', ->

    it 'parses loop + recur forms', ->
      eq '(loop [] (recur))', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            FunctionExpression(
              null, [], null,
              BlockStatement(
                WhileStatement(
                  Boolean(true),
                  BlockStatement(
                    BlockStatement(ContinueStatement()),
                    BreakStatement())))),
            Identifier('call')),
          [ThisExpression()])))
      eq '(loop [x 10] (when (> x 1) (.log console x) (recur (- x 2))))', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            FunctionExpression(
              null, [], null,
              BlockStatement(
                VariableDeclaration(VariableDeclarator(Identifier('x'), Integer(10))),
                WhileStatement(
                  Boolean(true),
                  BlockStatement(
                    IfStatement(
                      CallExpression(
                        MemberExpression(Identifier('_$GT_'), Identifier('call')),
                        [ThisExpression(), Identifier('x'), Integer(1)]),
                      BlockStatement(
                        ExpressionStatement(CallExpression(
                          MemberExpression(Identifier('console'), String('log'), true),
                          [Identifier('x')])),
                        BlockStatement(
                          ExpressionStatement(AssignmentExpression(
                            Identifier('__$recur0'),
                            CallExpression(
                              MemberExpression(Identifier('_$_'), Identifier('call')),
                              [ThisExpression(), Identifier('x'), Integer(2)]))),
                          ExpressionStatement(AssignmentExpression(
                            Identifier('x'), Identifier('__$recur0')))
                          ContinueStatement())),
                      ReturnStatement(Nil())),
                    BreakStatement())))),
            Identifier('call')),
          [ThisExpression()])))

    it 'throws when given loop forms with an odd number of args in their bindings', ->
      throws '(loop [x] (recur 0))'

    it 'parses fn + recur forms', ->
      eq '(fn [n acc] (if (zero? n) acc (recur (dec n) (* acc n))))', Program(
        ExpressionStatement(
          FunctionExpression(
            null, [Identifier('n'), Identifier('acc')], null,
            BlockStatement(
              AssertArity(2),
              WhileStatement(
                Boolean(true),
                BlockStatement(
                  IfStatement(
                    CallExpression(
                      MemberExpression(Identifier('zero_$QMARK_'), Identifier('call')),
                      [ThisExpression(), Identifier('n')]),
                    ReturnStatement(Identifier('acc')),
                    BlockStatement(
                      ExpressionStatement(AssignmentExpression(
                        Identifier('__$recur0'),
                        CallExpression(
                          MemberExpression(Identifier('dec'), Identifier('call')),
                          [ThisExpression(), Identifier('n')]))),
                      ExpressionStatement(AssignmentExpression(
                        Identifier('__$recur1'),
                        CallExpression(
                          MemberExpression(Identifier('_$STAR_'), Identifier('call')),
                          [ThisExpression(), Identifier('acc'), Identifier('n')]))),
                      ExpressionStatement(AssignmentExpression(
                        Identifier('n'), Identifier('__$recur0'))),
                      ExpressionStatement(AssignmentExpression(
                        Identifier('acc'), Identifier('__$recur1'))),
                      ContinueStatement()))))))))

    it 'parses dotimes forms', ->
      eq '(dotimes [i expr] (println i))', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            FunctionExpression(
              null, [], null,
              BlockStatement(
                ForStatement(
                  VariableDeclaration(
                    VariableDeclarator(Identifier('i'), Integer(0)),
                    VariableDeclarator(Identifier('__$max0'), Identifier('expr'))),
                  BinaryExpression('<', Identifier('i'), Identifier('__$max0')),
                  UpdateExpression('++', Identifier('i')),
                  BlockStatement(
                    ExpressionStatement(CallExpression(
                      MemberExpression(Identifier('println'), Identifier('call')),
                      [ThisExpression(), Identifier('i')])))))),
            Identifier('call')),
          [ThisExpression()])))

    it 'throws when given dotimes forms with anything more or less than 1 binding', ->
      throws '(dotimes [] (println 2))'
      throws '(dotimes [i 5 j 10] (println i j))'

    it 'parses doseq forms', ->
      eq '(doseq [x (range 5)] (println x))', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            FunctionExpression(
              null, [], null,
              BlockStatement(
                ForStatement(
                  VariableDeclaration(
                    VariableDeclarator(Identifier('__$doseqSeq0'),
                      CallExpression(
                        MemberExpression(Identifier('range'), Identifier('call')),
                        [ThisExpression(), Integer(5)])),
                    VariableDeclarator(Identifier('x'),
                      CallExpression(Identifier('first'), [Identifier('__$doseqSeq0')]))),
                  BinaryExpression('!==', Identifier('x'), Nil()),
                  SequenceExpression(
                    AssignmentExpression(Identifier('__$doseqSeq0'),
                      CallExpression(Identifier('rest'), [Identifier('__$doseqSeq0')])),
                    AssignmentExpression(Identifier('x'),
                      CallExpression(Identifier('first'), [Identifier('__$doseqSeq0')]))),
                  BlockStatement(
                    ExpressionStatement(CallExpression(
                      MemberExpression(Identifier('println'), Identifier('call')),
                      [ThisExpression(), Identifier('x')])))))),
            Identifier('call')),
          [ThisExpression()])))

    it 'throws when given doseq forms with anything more or less than 1 binding', ->
      throws '(doseq [] (println 2))'
      throws '(doseq [x (range 5) y (range 10)] (println x y))'

    it 'parses while forms', ->
      eq '(while (< i 5) (set! i (inc i)))', Program(
        WhileStatement(
          CallExpression(
            MemberExpression(Identifier('_$LT_'), Identifier('call')),
            [ThisExpression(), Identifier('i'), Integer(5)]),
          BlockStatement(
            ExpressionStatement(AssignmentExpression(
              Identifier('i'),
              CallExpression(
                MemberExpression(Identifier('inc'), Identifier('call')),
                [ThisExpression(), Identifier('i')]))))))



  ##########
  describe 'Destructuring forms', ->

    it 'parses vector destructuring forms', ->
      eq '(defn fn-name [[a & b] c & [d & e :as coll]])', Program(
        VariableDeclaration(VariableDeclarator(
          Identifier('fn_$_name'),
          FunctionExpression(
            null, [Identifier('__$destruc0'), Identifier('c')], null,
            BlockStatement(
              AssertArity(2, Infinity),
              DestructuringVector('a', '__$destruc0', 0)
              DestructuringVectorRest('b', '__$destruc0', 1)
              VariableDeclaration(VariableDeclarator(
                Identifier('coll'),
                CallExpression(
                  Identifier('seq'),
                  [CallExpression(
                    MemberExpression(
                      MemberExpression(
                        MemberExpression(Identifier('Array'), Identifier('prototype')),
                        Identifier('slice')),
                      Identifier('call')),
                    [Identifier('arguments'), Integer(2)])]))),
              DestructuringVector('d', 'coll', 0)
              DestructuringVectorRest('e', 'coll', 1)
              ReturnStatement(Nil()))))))

    it 'parses map destructuring forms', ->
      eq '(defn fn-name [{:as m :keys [b] :strs [c] a :a}])', Program(
        VariableDeclaration(VariableDeclarator(
          Identifier('fn_$_name'),
          FunctionExpression(
            null, [Identifier('m')], null,
            BlockStatement(
              AssertArity(1),
              DestructuringMap('b', 'm', Keyword('b'))
              DestructuringMap('c', 'm', String('c'))
              DestructuringMap('a', 'm', Keyword('a'))
              ReturnStatement(Nil()))))))

    it 'throws if a map is used to destructure rest args', ->
      throws '((fn [& {a :a}] a) {:a 2})'



  ##########
  describe 'Vars', ->
    it 'parses unbound var definitions', ->
      eq '(def var-name)', Program(
        ExpressionStatement(
          AssignmentExpression(
            Identifier('var_$_name'),
            undefined)))

    it 'parses vars bound to literals', ->
      eq '(def greeting \"Hello\")', Program(
        ExpressionStatement(
          AssignmentExpression(
            Identifier('greeting'),
            String('Hello'))))



    it 'throws when given def forms with > 2 arguments', ->
      throws '(def a 2 3)'
      throws '(def a 2 b 3)'

    it 'parses vars bound to expressions', ->
      eq '(def sum (+ 3 5))', Program(
        ExpressionStatement(
          AssignmentExpression(
            Identifier('sum'),
            CallExpression(
              MemberExpression(Identifier('_$PLUS_'), Identifier('call')),
              [ThisExpression(), Integer(3), Integer(5)]))))

    it 'parses vars bound to fn forms', ->
      eq '(def add (fn [& numbers] (apply + numbers)))', Program(
        ExpressionStatement(
          AssignmentExpression(
            Identifier('add'),
            FunctionExpression(
              null, [], null,
              BlockStatement(
                AssertArity(0, Infinity),
                VariableDeclaration(VariableDeclarator(
                  Identifier('numbers'),
                  CallExpression(
                    Identifier('seq'),
                    [CallExpression(
                      MemberExpression(
                        MemberExpression(
                          MemberExpression(Identifier('Array'), Identifier('prototype')),
                          Identifier('slice')),
                        Identifier('call')),
                      [Identifier('arguments'), Integer(0)])]))),
                ReturnStatement(CallExpression(
                  MemberExpression(Identifier('apply'), Identifier('call')),
                  [ThisExpression(), Identifier('_$PLUS_'), Identifier('numbers')])))))))

    it 'parses var assignment forms like (set! var value)', ->
      eq '(set! x 4)', Program(
        ExpressionStatement(AssignmentExpression(Identifier('x'), Integer(4))))

    it 'parses object property assignment forms like (set! (.prop obj) value)', ->
      eq '(set! (.length (to-array (range 5))) 3)', Program(
        ExpressionStatement(AssignmentExpression(
          MemberExpression(
            CallExpression(
              MemberExpression(Identifier('to_$_array'), Identifier('call')),
              [ThisExpression(),
              CallExpression(
                MemberExpression(Identifier('range'), Identifier('call')),
                [ThisExpression(), Integer(5)])]),
            Identifier('length')),
          Integer(3))))

    it 'parses let forms with no bindings and no body', ->
      eq '(let [])', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            FunctionExpression(
              null, [], null,
              BlockStatement(
                ReturnStatement(Nil()))),
            Identifier('call')),
          [ThisExpression()])))

    it 'parses let forms with non-empty bindings and non-empty body', ->
      eq '(let [x 3 y (- x)] (+ x y))', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            FunctionExpression(
              null, [], null,
              BlockStatement(
                VariableDeclaration(VariableDeclarator(
                  Identifier('x'),
                  Integer(3))),
                VariableDeclaration(VariableDeclarator(
                  Identifier('y'),
                  CallExpression(
                    MemberExpression(Identifier('_$_'), Identifier('call')),
                    [ThisExpression(), Identifier('x')]))),
                ReturnStatement(CallExpression(
                  MemberExpression(Identifier('_$PLUS_'), Identifier('call')),
                  [ThisExpression(), Identifier('x'), Identifier('y')])))),
            Identifier('call')),
          [ThisExpression()])))

    it 'throws when given let forms with an odd number of args in their bindings', ->
      throws '(let [x 1 y])'



  ##########
  describe 'JavaScript interop', ->

    it 'parses function-calling dot special forms', ->
      eq '(.move-x-y this 10 20)', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(ThisExpression(), String('move-x-y'), true),
          [Integer(10), Integer(20)])))

    it 'parses dot special forms representing property access or a 0-argument function-call', ->
      eq '(.pos this)', Program(
        ExpressionStatement(
          ConditionalExpression(
            LogicalExpression('&&',
              BinaryExpression('===',
                UnaryExpression('typeof',
                  MemberExpression(ThisExpression(), String('pos'), true)),
                String('function')),
              BinaryExpression('===',
                MemberExpression(
                  MemberExpression(ThisExpression(), String('pos'), true),
                  Identifier('length')),
                Integer(0))),
            CallExpression(MemberExpression(ThisExpression(), String('pos'), true), []),
            MemberExpression(ThisExpression(), String('pos'), true))))

    it 'throws when given dot special forms with no object in the callee position', ->
      throws '(.prop)'

    it 'parses new forms like (new Array 1 2 3)', ->
      eq '(new Array 1 2 3)', Program(
        ExpressionStatement(NewExpression(
          Identifier('Array'),
          [Integer(1), Integer(2), Integer(3)])))

    it 'parses the macro-variant of new forms like (Array. 1 2 3)', ->
      eq '(Array. 1 2 3)', Program(
        ExpressionStatement(NewExpression(
          Identifier('Array'),
          [Integer(1), Integer(2), Integer(3)])))



  ##########
  describe 'Miscellaneous', ->

    it 'parses empty do forms', ->
      eq '(do)', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            FunctionExpression(
              null, [], null,
              BlockStatement(ReturnStatement(Nil()))),
            Identifier('call')),
          [ThisExpression()])))

    it 'parses non-empty do forms', ->
      eq '(do (+ 1 2) (+ 3 4))', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            FunctionExpression(
              null, [], null,
              BlockStatement(
                ExpressionStatement(CallExpression(
                  MemberExpression(Identifier('_$PLUS_'), Identifier('call')),
                  [ThisExpression(), Integer(1), Integer(2)])),
                ReturnStatement(CallExpression(
                  MemberExpression(Identifier('_$PLUS_'), Identifier('call')),
                  [ThisExpression(), Integer(3), Integer(4)])))),
            Identifier('call')),
          [ThisExpression()])))

    it 'parses logical expressions (and / or)', ->
      eq '(and) (or)', Program(
        ExpressionStatement(Boolean(true)),
        ExpressionStatement(Nil()))
      eq '(and expr1 expr2 expr3)', Program(
        ExpressionStatement(LogicalExpression('&&',
          LogicalExpression('&&', Identifier('expr1'), Identifier('expr2')),
          Identifier('expr3'))))
      eq '(or expr1 expr2 expr3)', Program(
        ExpressionStatement(LogicalExpression('||',
          LogicalExpression('||', Identifier('expr1'), Identifier('expr2')),
          Identifier('expr3'))))

    it 'throws when given illegal tokens', ->
      throws '(def $a 2)'
      throws '(a || b)'



  ##########
  describe 'Loose mode', ->

    it 'parses incomplete forms in loose mode', ->
      looseEq '(let [x 1\n', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            FunctionExpression(
              null, [], null,
              BlockStatement(
                VariableDeclaration(VariableDeclarator(
                  Identifier('x'), Integer(1)))
                ReturnStatement(Nil()))),
            Identifier('call')),
          [ThisExpression()])))

    it 'parses forms with excess closing delimiters at the end', ->
      looseEq '(let [x 1])) )\n)', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            FunctionExpression(
              null, [], null,
              BlockStatement(
                VariableDeclaration(VariableDeclarator(
                  Identifier('x'), Integer(1)))
                ReturnStatement(Nil()))),
            Identifier('call')),
          [ThisExpression()])))

    it 'parses forms with unmatched closing delimiters at the end', ->
      looseEq '(let [x 1) \n  ]', Program(
        ExpressionStatement(CallExpression(
          MemberExpression(
            FunctionExpression(
              null, [], null,
              BlockStatement(
                VariableDeclaration(VariableDeclarator(
                  Identifier('x'), Integer(1)))
                ReturnStatement(Nil()))),
            Identifier('call')),
          [ThisExpression()])))

    it 'returns an empty AST for forms with excess closing delimiters in between', ->
      looseEq '(let [x 1)]\nx\n', Program()

    it 'returns an empty AST for forms with unmatched closing delimiters in between', ->
      looseEq '(let [x 1)]\nx\n', Program()

    it 'never throws in loose mode, and always returns a valid AST, even when given illegal tokens', ->
      looseEq '$$$$$&^%&^#$%@:[|', Program()

  # pending
  xit 'parses source locations'
