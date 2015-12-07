(set! 
  (.exports module) 
  (fn 
    [grunt]
    (do
      ((.initConfig grunt) 
        (clj->js {
          :pkg ((.readJSON (.file grunt)) "package.json")
          :shell {:options {:failOnError false}
                  :jison {:command (apply 
                                      str 
                                      (interpose 
                                        (if (.match (.platform process) "^win") " & " " && ")
                                        ["jison src/grammar.y src/lexer.l -o src/parser.js"
                                        "mkdir -p built/src/"
                                        "cp src/parser.js built/src/"]
                                      ))}
                  :lkg {:command (apply 
                                    str 
                                    (interpose 
                                      (if (.match (.platform process) "^win") " & " " && ")
                                      ["rm -rf ./lib"
                                        "mkdir -p lib/src/"
                                        "cp built/src/*.js lib/src/"]
                                    ))}}
          :jasmine_test {:all ["built/spec/"]
                        :options {:specFolders ["built/spec/"]
                                  :showColors true
                                  :includeStackTrace false
                                  :forceExit true}}
          ;; this is actually the code coverage task, but renaming it causes problems
          :jasmine_node {:coverage {:savePath "demo/coverage/"
                                    :report ["html"]
                                    :excludes ["built/spec/*.js"]
                                    :thresholds {:lines 75}}
                        :all ["built/spec/"]
                        :options {:specFolders ["built/spec/"]
                                  :showColors true
                                  :includeStackTrace false
                                  :forceExit true}}
          :watch {:files ["src/lexer.l"
                          "src/grammar.y"
                          "src/**/*.coffee"
                          "spec/**/*.coffee"]
                  :tasks ["default"]
                  :options {:spawn true
                            :interrupt true
                            :atBegin true
                            :livereload true}}
          :coffeelint {:app ["src/**/*.coffee" 
                            "spec/**/*.coffee"]
                      :options {:max_line_length {:level "ignore"}
                                :line_endings {:value "unix"
                                                :level "error"}}}
          :coffee {:built {:files [{:expand true
                                    :cwd "src/"
                                    :src ["**/*.coffee"]
                                    :dest "built/src/"
                                    :ext ".js"}]}
                  :specs {:files [{:expand true
                                    :cwd "spec/"
                                    :src ["**/*.coffee"]
                                    :dest "built/spec/"
                                    :ext ".js"}]}}
          :browserify {:demo {:files [{:expand true
                                      :cwd "built/"
                                      :src ["src/repl.js"
                                            "spec/<%= pkg.name %>-spec.js"
                                            "spec/functional-spec.js"
                                            "spec/<%= pkg.name %>-core-spec.js"]
                                      :dest "demo/js/"}]
                              :options {:exclude ["lodash-node"]}}}
          :gh-pages {:src ["**"]
                    :options {:base "demo/"
                              :push true}}}))
      ((.loadNpmTasks grunt) "grunt-shell")
      ((.loadNpmTasks grunt) "grunt-contrib-watch")
      ((.loadNpmTasks grunt) "grunt-coffeelint")
      ((.loadNpmTasks grunt) "grunt-contrib-coffee")
      ((.loadNpmTasks grunt) "grunt-browserify")
      ((.loadNpmTasks grunt) "grunt-gh-pages")
      ;; grunt-jasmine-node is for tests, grunt-jasmine-node-coverage is for code coverage
      ((.loadNpmTasks grunt) "grunt-jasmine-node")
      ((.loadNpmTasks grunt) "grunt-jasmine-node-coverage")
      ((.renameTask grunt) "jasmine_node" "jasmine_test")
      ((.registerTask grunt) "build" (clj->js ["coffeelint" "shell:jison" "coffee"]))
      ((.registerTask grunt) "test" (clj->js ["build" "jasmine_test"]))
      ((.registerTask grunt) "default" (clj->js ["build" "browserify" "jasmine_node"]))
      ((.registerTask grunt) "LKG" (clj->js ["build" "shell:lkg"])))))
