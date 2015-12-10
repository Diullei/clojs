(def fs (require "fs"))
(def path (require "path"))
(def util (require "util"))

(def closer (require "../lib/src/index"))
(def escodegen (require "escodegen"))
(def optionator (require "optionator"))
(def pkg (require "../package.json"))

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
                                         {:option "eval"
                                          :alias "e"
                                          :type "code::String"
                                          :description "pass as string from the command line as input"}]})))

(defn die!
  [message]
  (.error console message)
  (.exit process 1))

(defn compile-script-from-str
  [code]
  (do
    (def ast
      (.parse closer code (clj->js {:coreIdentifier "core"})))
    (.generate escodegen ast)))

(defn compile-script
  [file]
  (do
    (def code (.toString (.readFileSync fs file)))
    (def compiled (compile-script-from-str code))
    (.writeFile fs (apply str (.dirname path file) "/" (.basename path file ".cljs") ".js") compiled
                (fn [err]
                  (if (not (nil? err))
                    (.log console err))))))

(def proc (js->clj (.argv process)))

(if (= (count proc) 2)
  (def closer (require "../lib/src/start-repl"))
  (try
    (do
      (def command-options ((.parse opt) (.argv process)))
      (if (.compile command-options)
        (compile-script (first (._ command-options)))
        (if (.help command-options)
          (println ((.generateHelp opt) (clj->js {:interpolate {:version (.version pkg)}})))
          (if (.version command-options)
            (println (str "version " (.version pkg)))
            (if (.eval command-options)
              (compile-script-from-str (._ command-options)))))))
    (catch e
           (die! (.message e)))))
