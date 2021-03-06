_ = window?._ ? self?._ ? global?._ ? require 'lodash-node'
mori = window?.mori ? self?.mori ? global?.mori ? require 'mori'

class ArityError extends Error
  constructor: (args...) ->
    @name = 'ArityError'
    @message = if args.length is 3
      "Expected #{args[0]}..#{args[1]} args, got #{args[2]}"
    else args[0]
    @stack = (new Error()).stack

class ArgTypeError extends Error
  constructor: (message) ->
    @name = 'ArgTypeError'
    @message = message
    @stack = (new Error()).stack

firstFailure = (args, testFn) ->
  _.find args, (arg) -> not testFn(arg)

assertions =

  numbers: (args...) ->
    unexpectedArg = firstFailure(_.flatten(args), (arg) -> typeof arg is 'number')
    if unexpectedArg isnt undefined
      throw new ArgTypeError "#{unexpectedArg} is not a number"

  integers: (args...) ->
    unexpectedArg = firstFailure(_.flatten(args), (arg) -> typeof arg is 'number' and arg % 1 is 0)
    if unexpectedArg isnt undefined
      throw new ArgTypeError "#{unexpectedArg} is not a integer"

  associativeOrSet: (args...) ->
    if unexpectedArg = firstFailure(args, (arg) -> mori.is_associative(arg) or mori.is_set(arg))
      throw new ArgTypeError "#{unexpectedArg} is not a set or an associative collection"

  associative: (args...) ->
    if unexpectedArg = firstFailure(args, (arg) -> mori.is_associative(arg))
      throw new ArgTypeError "#{unexpectedArg} is not an associative collection"

  map: (args...) ->
    if unexpectedArg = firstFailure(args, (arg) -> mori.is_map(arg))
      throw new ArgTypeError "#{unexpectedArg} is not a map"

  collection: (args...) ->
    unexpectedArg = firstFailure args, (arg) -> mori.is_seqable(arg) or _.isString(arg) or _.isArray(arg)
    if unexpectedArg
      throw new ArgTypeError "#{unexpectedArg} is not a collection"

  sequential: (args...) ->
    unexpectedArg = firstFailure args, (arg) -> mori.is_sequential(arg) or _.isString(arg) or _.isArray(arg)
    if unexpectedArg
      throw new ArgTypeError "#{unexpectedArg} is not a sequential collection"

  stack: (args...) ->
    unexpectedArg = firstFailure args, (arg) -> mori.is_vector(arg) or mori.is_list(arg)
    if unexpectedArg
      throw new ArgTypeError "#{unexpectedArg} does not support stack operations"

  type_custom: (checkFn) ->
    throw new ArgTypeError msg if msg = checkFn()

  function: (args...) ->
    unexpectedArg = firstFailure args, (arg) ->
      typeof arg is 'function' or mori.is_vector(arg) or mori.is_map(arg) or
      mori.is_set(arg) or mori.is_keyword(arg)
    if unexpectedArg
      throw new ArgTypeError "#{unexpectedArg} is not a function"

  arity: (expected_min, expected_max, actual) ->
    if arguments.length is 2
      actual = expected_max
      expected_max = expected_min
    unless expected_min <= actual <= expected_max
      throw new ArityError expected_min, expected_max, actual

  arity_custom: (args, checkFn) ->
    throw new ArityError msg if msg = checkFn args


module.exports = assertions

self.closerAssertions = assertions if self?
window.closerAssertions = assertions if window?
