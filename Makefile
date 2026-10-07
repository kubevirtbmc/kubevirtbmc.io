HUGO          ?= hugo
HTMLTEST_BIN  := ./bin/htmltest
HTMLTEST_VER  := 0.17.0
PUBLIC_DIR    := public
HAIRLINE_REF  ?= bc782244216620434b14736df1d74daed2d05046

.PHONY: build serve lint install-htmltest test ci clean update-hairline

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

# Refreshes the vendored Hairline kernel, which the figures in
# static/js/figures draw with, from the hairline-create skill at a commit.
update-hairline:
	curl -sSfL -o static/vendor/hairline/kernel.js \
		https://raw.githubusercontent.com/lucasmarkes/hairline/$(HAIRLINE_REF)/skills/hairline-create/kernel.js
	curl -sSfL -o static/vendor/hairline/LICENSE \
		https://raw.githubusercontent.com/lucasmarkes/hairline/$(HAIRLINE_REF)/LICENSE
