# Shared ESLint Configuration

This package exposes various configurations in the root. To avoid repetition,
they are all based on partial configurations, and those are not meant to be used
directly hence they are not exported in the package manifest.

The `base` partial contains all common configuration to avoid repetition in the
other configurations. The `additional-rules` partial contains a list of project
specific rules that are meant to come last in each chains of `extends`, and
overrule anything if needed.

## Only Warn

The only-warn plugin turns all rule errors into warning and emits returns an
error code from the linting process. This allows us to treat all rules as
warnings and by triggering the linting via `eslint . --max-warnings 0` we make
sure that no warnings are allowed to be in the code after a successful linting
task.

I picked this op from the Turborepo starter.

## CJS Extensions

In the packages that use these configs, you will see that the files are named
`.eslintrc.cjs`. The cjs extension is required because each of the packages is
declared to be an ES Module in their package manifest. When ESLint loads the
configuration it uses a CommonJS require for it, and thus importing and ESM file
will throw an error.

You could instead declare them as JSON but JS allows for comments and type
checking.

## Additional Rules

@TODO talk about personal preferences, ignoring promises with void
