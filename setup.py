"""Packaging for PyPI.

Everything identifying comes from package.json, which is the single place a version is ever
edited by hand. Note it reads package.json, NOT the package-info.json copy shipped inside the
wheel: that copy only refreshes when `npm run build:backends` runs, so bumping the version and
building a wheel without rebuilding would produce a correctly-named wheel that reports the old
version at runtime. Bump, then build, then package.
"""

import json
from pathlib import Path

from setuptools import setup

here = Path(__file__).parent
with open("package.json") as f:
    package = json.load(f)
long_description = (here / "README.md").read_text()

package_name = package["name"].replace(" ", "_").replace("-", "_")

setup(
    name=package_name,
    version=package["version"],
    author=package["author"],
    packages=[package_name],
    include_package_data=True,
    license=package["license"],
    description=package.get("description", package_name),
    long_description=long_description,
    long_description_content_type="text/markdown",
    install_requires=[],
    classifiers=[
        "Framework :: Dash",
    ],
)
