;; NOTE! temporary code!
(def closer (require "../lib/src/index"))
(def escodegen (require "escodegen"))
(def optionator (require "optionator"))

(def core (.core closer))
(def closerAssertions (.assertions closer))

(def fs (require "fs"))
(def path (require "path"))

(def proc (js->clj (.argv process)))

;(def opt (optionator (clj->js {:prepend "Usage: cljsc [option]... [file]...\n\nUse \'cljsc\' with no options to start REPL."
;  										:append "Version {{version}}\n<http://clojs.org/>"
;											:helpStyle {:maxPadFactor 1.9}
;											:positionalAnywhere false
;											:options [{:option "version"
;											      		 :alias "v"
;      										 			 :type "Boolean"
;      										 			 :description "display version"}]})))
;
;(defn die [message]
; (.error console message)
; (.exit process 1))

;(try
;	(def parseOptions (.parse opt))
;  (catch e
;    (die e)))

;(def generateHelp (.generateHelp opt))

;; (def o (parseOptions (.argv process)))

;(println (generateHelp (clj->js {:interpolate {:version "0.0.0"}})))

(def file (nth proc 2))

(def code (.toString (.readFileSync fs file)))

(def
  ast
  (.parse closer code (clj->js {:coreIdentifier "core"})))

(def compiled (.generate escodegen ast))

(.writeFile fs (apply str (.dirname path file) "/" (.basename path file ".cljs") ".js") compiled
            (fn [err]
              (if (not (nil? err))
                (.log console err))))
