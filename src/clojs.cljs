(def fs (require "fs"))
(def path (require "path"))
(def util (require "util"))

(def escodegen (require "escodegen"))
(def optionator (require "optionator"))

(def closer (require "./index"))
(def pkg (require "../../package.json"))

(def core (.core closer))
(def closerAssertions (.assertions closer))

(def opt (optionator (clj->js {:prepend "Usage: cljsc [option]... [file]...\n\nUse \'cljsc\' with no options to start REPL."
                               :append "Version {{version}}\n<http://clojs.org/>"
                               :helpStyle {:maxPadFactor 1.9}
                               :positionalAnywhere false
                               :options [{:option "version"
                                          :alias "v"
                                          :type "Boolean"
                                          :description "display version"}
                                         {:option "help"
                                          :alias "h"
                                          :type "Boolean"
                                          :description "display this help message"}
                                         {:option "compile"
                                          :alias "c"
                                          :type "Boolean"
                                          :description "compile to JavaScript and save as .js files"}
                                         {:option "output",
                                          :alias "o",
                                          :type "path::String",
                                          :description "compile into the specified directory"}
                                          {:option "ast",
                                           :alias "a",
                                           :type "Boolean",
                                           :description "Sow AST"}
                                         {:option "eval"
                                          :alias "e"
                                          :type "code::String"
                                          :description "pass as string from the command line as input"}]})))

(defn die!
  [message]
  (do
    (.error console message)
    (.exit process 1)))

(defn parse
  [code]
  (.parse closer code (clj->js {:coreIdentifier "core"})))

(defn compile-script-from-str
  [code]
  (let [ast (parse code)]
    (.generate escodegen ast)))

(defn compile-script
  [file out]
  (let [code (.toString (.readFileSync fs file))
        compiled (compile-script-from-str code)]
    (.writeFile fs (apply str (if out out (.dirname path file)) "/" (.basename path file ".cljs") ".js") compiled
                (fn [err]
                  (if (not (nil? err))
                    (.log console err))))))

(def proc (js->clj (.argv process)))

(if (= (count proc) 2)
  (require "./start-repl")
  (try
    (let [command-options ((.parse opt) (.argv process))]
      (if (.compile command-options)
        (compile-script (first (._ command-options)) (.output command-options))
        (if (.help command-options)
          (println ((.generateHelp opt) (clj->js {:interpolate {:version (.version pkg)}})))
          (if (.version command-options)
            (println (str "version " (.version pkg)))
            (if (.eval command-options)
              (println (eval (compile-script-from-str (.eval command-options))))
              (if (.ast command-options)
                (println (eval (parse (.eval command-options))))))))))
    (catch e
           (die! (.message e)))))
