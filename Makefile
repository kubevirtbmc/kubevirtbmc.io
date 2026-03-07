HUGO         ?= hugo
HTMLTEST_BIN := ./bin/htmltest
HTMLTEST_VER := 0.17.0
PUBLIC_DIR   := public

.PHONY: build serve lint install-htmltest test ci clean

build:
	$(HUGO) --minify

serve:
	$(HUGO) server -D

lint:
	npx --yes markdownlint-cli2 "content/**/*.md" "README.md"

install-htmltest:
	@mkdir -p bin
	@if [ ! -f $(HTMLTEST_BIN) ]; then \
		curl -sSL https://htmltest.wjdp.uk | bash -s -- -b ./bin v$(HTMLTEST_VER); \
	fi

test: build install-htmltest
	$(HTMLTEST_BIN)

ci: lint test

clean:
	rm -rf $(PUBLIC_DIR) resources
