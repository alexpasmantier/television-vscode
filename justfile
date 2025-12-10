NAME := "television-vscode"

default:
    just --list

release-patch:
    @echo "Releasing patch version..."
    npm version patch
    git push origin main --tags

release-minor:
    @echo "Releasing minor version..."
    npm version minor
    git push origin main --tags
