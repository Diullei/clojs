(set! 
  (.cfg exports) 
  (fn 
    [grunt]
    [:init_config {
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
                           :push true}}}
     :grunt {:load_npm_tasks ["grunt-shell"
                              "grunt-contrib-watch"
                              "grunt-coffeelint"
                              "grunt-contrib-coffee"
                              "grunt-browserify"
                              "grunt-gh-pages"
                              ;; grunt-jasmine-node is for tests, grunt-jasmine-node-coverage is for code coverage
                              "grunt-jasmine-node"
                              "grunt-jasmine-node-coverage"]
             :rename_task [["jasmine_node" "jasmine_test"]]
             :register_task {:build ["coffeelint" "shell:jison" "coffee"]
                             :test ["build" "jasmine_test"]
                             :default ["build" "browserify" "jasmine_node"]
                             :LKG ["build" "jasmine_test" "shell:lkg"]}}]))
