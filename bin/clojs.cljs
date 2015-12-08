;; NOTE! temporary code!
(def closer (require "../lib/src/index"))
(def escodegen (require "escodegen"))

(def core (.core closer))
(def closerAssertions (.assertions closer))

(def fs (require "fs"))
(def path (require "path"))

(def proc (js->clj (.argv process)))

(def file (nth proc 2))
(def lib (if (nil? (nth proc 3))
           "closer"
           (nth proc 3)))

(def code (.toString (.readFileSync fs file)))

(def
  ast
  (.parse closer code (clj->js {:coreIdentifier "core"})))

(def compiled (.generate escodegen ast))

(.writeFile fs (apply str (.dirname path file) "/" (.basename path file ".cljs") ".js") compiled
            (fn [err]
              (if (not (nil? err))
                (.log console err))))
