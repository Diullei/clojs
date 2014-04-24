closer = require './closer'
core = require './closer-core'
escodegen = require 'escodegen'
estraverse = require 'estraverse'
mori = require 'mori'

wireCallsToCore = (ast) ->
  estraverse.replace ast,
    enter: (node) ->
      if node.type is 'CallExpression' and node.callee.type is 'Identifier' and node.callee.name of core
        # FIXME embedding a variable name here to be eval'ed later is practically
        # FIXME a crime, but I couldn't think of a better solution
        calleeObj = closer.node 'Identifier', 'core', node.loc
        calleeProp = closer.node 'Literal', node.callee.name, node.loc
        node.callee = closer.node 'MemberExpression',
          calleeObj, calleeProp, true, node.loc
      else if node.type is 'CallExpression' and node.callee.type is 'Identifier' and node.callee.name in ['list', 'vector', 'set', 'hash_map', 'keyword']
        # FIXME same evil here with mori
        calleeObj = closer.node 'Identifier', 'mori', node.loc
        calleeProp = closer.node 'Identifier', node.callee.name, node.loc
        node.callee = closer.node 'MemberExpression',
          calleeObj, calleeProp, false, node.loc
      else if node.type is 'Identifier' and node.name of core
        # FIXME same evil here with mori
        obj = closer.node 'Identifier', 'core', node.loc
        prop = closer.node 'Literal', node.name, node.loc
        node = closer.node 'MemberExpression', obj, prop, true, node.loc
      node
  ast

exports.parse = (src, options) ->
  wireCallsToCore closer.parse src, options

exports.generateJS = (src, options) ->
  escodegen.generate exports.parse src, options