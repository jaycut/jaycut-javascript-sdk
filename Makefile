MINIFIER=./closure_compile.sh

# Files to compile
JS_FILES=$(shell find . -type f \( -name '*.js' -not -name '*.min.js' \) -printf '%p ')

JS_MINIFIED= $(JS_FILES:.js=.min.js)

all: minify

minify: $(JS_FILES) $(JS_MINIFIED)

%.min.js: %.js
	$(MINIFIER) -o $@ $<

clean:
	rm -f $(JS_MINIFIED)
