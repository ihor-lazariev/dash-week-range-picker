.PHONY: help install build build-js build-backends dist check release publish \
        demo serve watch kill-port bump-patch bump-minor bump-major version commit-release \
        install-dev clean distclean

# override on the command line if needed, e.g. `make install-dev CONSUMER_VENV=../other-app/venv`
VENV        ?= venv
PYTHON      := $(VENV)/bin/python
# venv of an app that consumes this component, for `make install-dev` (override on the command line)
CONSUMER_VENV ?= ../app/venv
# demo server port; `make kill-port` frees it (override e.g. `make kill-port PORT=8051`)
PORT        ?= 8050

help:
	@echo "dash-week-range-picker"
	@echo ""
	@echo "  install          npm install + pip install build/twine into $(VENV)"
	@echo "  build            webpack production build + regenerate the Python wrapper"
	@echo "  build-js         webpack production build only"
	@echo "  build-backends   regenerate the wrapper only (dash-generate-components)"
	@echo "  dist             build + create sdist/wheel in dist/"
	@echo "  check            twine check dist/*"
	@echo "  release          build + dist + check (everything short of actually publishing)"
	@echo "  publish          release, then twine upload dist/* (asks for confirmation first)"
	@echo "  demo             run the standalone usage.py Dash app (localhost:8050)"
	@echo "  serve            webpack-dev-server live-reload playground (no Dash/Python involved)"
	@echo "  watch            webpack --watch: rebuild the served min.js on save (pair with make demo)"
	@echo "  kill-port        kill a leftover Dash server holding :$(PORT) (debug reloader orphans)"
	@echo "  bump-patch/minor/major   bump package.json's version (no git commit/tag)"
	@echo "  version          print the current package.json version"
	@echo "  commit-release   git add -A + commit as vX.Y.Z (no tag, no push - push stays manual)"
	@echo "  install-dev      pip install -e . into CONSUMER_VENV (default: $(CONSUMER_VENV))"
	@echo "  clean            remove dist/build/egg-info artifacts"
	@echo "  distclean        clean + remove node_modules"

install:
	npm install
	$(PYTHON) -m pip install build twine

build-js:
	npm run build:js

build-backends:
	npm run build:backends-activated

build:
	npm run build:activated

dist: build
	rm -rf dist build *.egg-info
	$(PYTHON) -m build --sdist --wheel --outdir dist/

check: dist
	$(PYTHON) -m twine check dist/*

release: check
	@echo ""
	@echo "dist/ ready for $$(grep -m1 '"version"' package.json | grep -oE '[0-9]+\.[0-9]+\.[0-9]+')."
	@echo "Run 'make publish' to upload, or 'twine upload dist/*' yourself."

publish: release
	@echo ""
	@read -p "Upload $$(grep -m1 '"version"' package.json | grep -oE '[0-9]+\.[0-9]+\.[0-9]+') to PyPI? [y/N] " ans; \
	if [ "$$ans" = "y" ] || [ "$$ans" = "Y" ]; then \
		$(PYTHON) -m twine upload dist/*; \
	else \
		echo "Aborted."; \
	fi

demo:
	$(PYTHON) usage.py

serve:
	npm start

watch:
	npm run watch

# Free the demo port if a previous `make demo` left a server behind. Dash's debug reloader runs a
# parent + child, so killing by script name (pkill -f usage.py) misses one; target the port instead.
# Manual only - deliberately NOT a dependency of `demo`, so it can never kill an unrelated process
# on this port as a silent side effect.
kill-port:
	@pids=$$(lsof -ti tcp:$(PORT) 2>/dev/null); \
	if [ -z "$$pids" ]; then \
		echo ":$(PORT) is free"; \
	else \
		echo "Killing PID(s) on :$(PORT): $$pids"; \
		kill $$pids 2>/dev/null || true; \
		sleep 1; \
		pids=$$(lsof -ti tcp:$(PORT) 2>/dev/null); \
		if [ -n "$$pids" ]; then echo "Forcing (SIGKILL): $$pids"; kill -9 $$pids 2>/dev/null || true; fi; \
	fi

bump-patch:
	npm version patch --no-git-tag-version
	@$(MAKE) --no-print-directory version

bump-minor:
	npm version minor --no-git-tag-version
	@$(MAKE) --no-print-directory version

bump-major:
	npm version major --no-git-tag-version
	@$(MAKE) --no-print-directory version

version:
	@grep -m1 '"version"' package.json | grep -oE '[0-9]+\.[0-9]+\.[0-9]+'

# Stage everything and commit as "vX.Y.Z" (version read from package.json). No git tag and no push -
# pushing is deliberately left as manual work so release commits are never published by accident.
# Note: this uses `git add -A`, so make sure the working tree holds only the release changes first.
commit-release:
	@ver=$$($(MAKE) --no-print-directory version); \
	if [ -z "$$(git status --porcelain)" ]; then \
		echo "Nothing to commit (working tree clean)."; \
	else \
		git add -A && git commit -m "v$$ver" && \
		echo "Committed v$$ver. Push is manual when you're ready: git push"; \
	fi

# editable-install into a consuming app's own venv for local dev (set CONSUMER_VENV to its venv)
install-dev:
	$(CONSUMER_VENV)/bin/pip install -e .

clean:
	rm -rf dist build *.egg-info

distclean: clean
	rm -rf node_modules
