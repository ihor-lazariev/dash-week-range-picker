.PHONY: help install build build-js build-backends dist check release publish \
        demo serve watch bump-patch bump-minor bump-major version install-dev clean distclean

# override on the command line if needed, e.g. `make install-dev CONSUMER_VENV=../other-app/venv`
VENV        ?= venv
PYTHON      := $(VENV)/bin/python
# venv of an app that consumes this component, for `make install-dev` (override on the command line)
CONSUMER_VENV ?= ../app/venv

help:
	@echo "dash-week-range-picker"
	@echo ""
	@echo "  install          npm install + pip install build/twine into $(VENV)"
	@echo "  build            webpack production build + regenerate the Python/R/Julia wrapper"
	@echo "  build-js         webpack production build only"
	@echo "  build-backends   regenerate the wrapper only (dash-generate-components)"
	@echo "  dist             build + create sdist/wheel in dist/"
	@echo "  check            twine check dist/*"
	@echo "  release          build + dist + check (everything short of actually publishing)"
	@echo "  publish          release, then twine upload dist/* (asks for confirmation first)"
	@echo "  demo             run the standalone usage.py Dash app (localhost:8050)"
	@echo "  serve            webpack-dev-server live-reload playground (no Dash/Python involved)"
	@echo "  watch            webpack --mode development --watch (rebuild JS on save)"
	@echo "  bump-patch/minor/major   bump package.json's version (no git commit/tag)"
	@echo "  version          print the current package.json version"
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

# editable-install into a consuming app's own venv for local dev (set CONSUMER_VENV to its venv)
install-dev:
	$(CONSUMER_VENV)/bin/pip install -e .

clean:
	rm -rf dist build *.egg-info

distclean: clean
	rm -rf node_modules
