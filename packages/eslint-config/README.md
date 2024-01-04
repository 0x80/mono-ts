# Shared ESLint Configuration

This package exposes various configurations in the root. To avoid repetition,
they are all based on partial configurations, and those are not meant to be used
directly hence they are not exported in the package manifest.

The `base` partial contains all common configuration to avoid repetition in the
other configurations. The `additional-rules` partial contains a list of project
specific rules that are meant to come last in each chains of `extends`, and
overrule anything if needed.

## Rules

@TODO talk about personal preferences, ignoring promises with void
