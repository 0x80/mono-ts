# Mono TS

This is a quest for the ideal Typescript monorepo setup.

My current projects are based on Node, Next.js, and Firebase, so that is what I
am focussing on.

If you use different platforms, this can still be a great starting point, as it
should be easy to discard any packages that you have no use for. The monorepo
approach by itself is largely independent of the chosen technology stack.

This is meant as a best-effort approach given the tooling that is available, so
I expect this code to change as the ecosystem around Typescript and Javascript
continue to evolve.

Contributions are welcome within the scope of this example, but I doubt there
will ever be a one-size-fits-all solution, so this code should be viewed as
opinionated.

> Disclaimer: This example is not yet finished to the standard that I would
> like. While the setup works fine, some of the code could be improved. I am in
> the middle of integrating isolate-package as part of firebase-tools. Once that
> is done I will write an article about this setup.

<!-- TOC -->

- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Workspace packages](#workspace-packages)
  - [Packages](#packages)
  - [Apps](#apps)
  - [Services](#services)
- [Deployment](#deployment)
- [Using NPM instead of PNPM](#using-npm-instead-of-pnpm)
- [Using Yarn instead of PNPM](#using-yarn-instead-of-pnpm)
- [The "built packages" strategy](#the-built-packages-strategy)
  - [Convert path aliases](#convert-path-aliases)
  - [Write ESM without import extensions](#write-esm-without-import-extensions)
  - [Tree shaking](#tree-shaking)
  - [](#)
- [The "internal packages" strategy](#the-internal-packages-strategy)
- [Live code changes from internal packages](#live-code-changes-from-internal-packages)
- [Deploying to Firebase](#deploying-to-firebase)
- [VSCode settings](#vscode-settings)

<!-- /TOC -->

## Features

- Turborepo for orchestrating the build process with internal packages.
- A traditional built packages approach, showing how to bundle multiple entry
  points.
- The ["internal packages"](#the-internal-packages-strategy) strategy for live
  code updates without the need for a watch task.
- Multiple backend services deploying to Firebase (1st and 2nd gen functions),
  using [isolate-package](https://github.com/0x80/isolate-package/) and
  [firebase-tools-with-isolate](https://github.com/0x80/firebase-tools-with-isolate).
- A web app based on Next.js with ShadCN and Tailwind.
- Using ES modules throughout, including the Next.js app.
- Shared configurations for ESLint and Typescript.
- Path aliases.
- Working IDE go-to-definition and go-to-type-definition using `.d.ts.map`
  files.
- Vitest.

## Install

In this codebase, packages are managed by PNPM. I encourage anyone to give it a
try if you haven't already because in my experience it is the better choice,
especially for monorepos. See the
[feature comparison to NPN and Yarn](https://pnpm.io/feature-comparison).

If you like to use PNPM but do not have it installed yet, follow
[these instructions](https://pnpm.io/installation).

Run `pnpm install` from the repository root.

If you prefer to use a different package manager, that should not be a problem.
See [using NPM](#using-npm-instead-of-pnpm) or
[using Yarn](#using-yarn-instead-of-pnpm) for more info.

## Usage

Run `pnpm dev`. This will:

- Build the dependencies of the web app and start its dev server
- Build the backend services and their dependencies, and
  [isolate](#deploying-to-firebase) the output
- Start the backend emulators

## Workspace packages

### Packages

- [common](./packages/common) Code that can shared across both front-end and
  back-end environments.
- [backend](./packages/backend) Code that is shared between server environments
  like cloud functions.

### Apps

- [web](./apps/web) A Next.js based web application.

### Services

- [fns](./services/fns) Cloud functions that execute on document writes, pubsub
  events etc. This package shows how to set up the firebase.json config if you
  would like to use isolate-package as part of your predeploy script. The
  downside of this is that a watch task on your build does not result in live
  code updates when running the emulator, because the results would then still
  need to be isolated.
- [api](./services/api) A 2nd gen (Cloud Run based) API endpoint, using Express.
  This package shows how to use
  [firebase-tools-with-isolate](https://github.com/0x80/firebase-tools-with-isolate)
  in order to have the isolation process integrated as part of the
  `firebase deploy` command. This does not interfere in any way and allows you
  to use a build watch task to keep live code updates flowing to the emulator.

## Deployment

Deployment instructions can be found in the individual packages:

- [web](./apps/web/README.md)
- [fns](./services/fns/README.md#deployment)
- [api](./services/api/README.md#deployment)

## Using NPM instead of PNPM

You should be able to make this work with NPM using the steps below:

- Delete the root manifest `packageManger` field
- Delete the `pnpm-lock.yaml` and `pnpm-workspace.yaml` files
- Do a find on `workspace:*` and replace them with `*`.
- Add the following config to the root package.json:
  ```
   "workspaces": [
    "./packages/*",
    "./apps/*",
    "./services/*"
  ],
  ```
- Run `npm install` from the root and commit the resulting `package-lock.json`
  file.

## Using Yarn instead of PNPM

You should be able to make this work with Yarn using the steps below:

- Delete the root manifest `packageManger` field
- Delete the `pnpm-lock.yaml` and `pnpm-workspace.yaml` files
- Add the following config to the root package.json:
  ```
   "workspaces": [
    "./packages/*",
    "./apps/*",
    "./services/*"
  ],
  ```
- Run `yarn install` from the root and commit the resulting `yarn.lock` file.

## The "built packages" strategy

In a traditional monorepo setup, each package exposes its code as if it was a
published NPM package. For Typescript this means the code has to be transpiled
and the manifest entry points reference to the build output files. You can use
Typescript `tsc` compiler for this, but it is likely you will want to use a
bundler for the reasons explained below.

The `services` in this codebase use TSUP as a bundler. It is a modern, simple to
use Rollup-inspired bundler for Typescript.

The advantages of using a bundler are discussed below.

### Convert path aliases

If you use path aliases like `~/*` or `@/*` to conveniently reference top-level
folders from deeply nested import statements, these paths are not converted by
the standard Typescript `tsc` compiler.

If your only target is a platform like Next.js, that uses a bundler under the
hood, this is not an issue because these aliases are handled for you. But if you
target other platforms like Firebase, you might have to convert them. A bundler
like TSUP can do this transformation.

### Write ESM without import file extensions

A bundler will allow you to output ESM-compatible code without having to adhere
to the ESM import rules. ESM requires all relative imports to be explicit,
appending a `.js` file extension for importing TS files and appending
`/index.js` when importing from the root of a directory.

The reason you need to use `.js` and not `.ts` is because these imports, like
path aliases are not converted by the Typescript compiler, and so at runtime the
transpiled JS file is what is getting imported.

Because a bundler, by nature, will bundle code into one or more isolated files,
they themselves do not use relative imports and only contain imports from
`node_modules`, which do not require a file extension. For this reason, a
bundled js file that uses import and export keywords is an ES module.

An advantage of writing your code as ESM is that you can import both ES modules
and CommonJS without conversion. An application that uses CJS can not import ESM
directly, because CJS imports are synchronous and ESM imports are asynchronous.

Not having to use ESM import extensions can be especially valuable if you are
trying to convert a large codebase to ESM, because I have yet to find a solution
that can convert existing imports. There is
[this ESLint plugin](https://github.com/solana-labs/eslint-plugin-require-extensions)
that you could use it in combination with the --fix flag to inject the
extensions, but at the time of writing it does not understand path aliases.

### Tree shaking

Some bundlers like TSUP are capable of eliminating dead code by tree-shaking the
build output, so that less code remains to be deployed. Eliminating dead code is
most important for client-side code that is shipped to the user, but for the
backend it can also reduce cold-start times for serverless functions, although
in most situations, it is probably not going to be noticeable.

## The "internal packages" strategy

The
[internal packages](https://turbo.build/blog/you-might-not-need-typescript-project-references)
strategy, as it was coined by Jared Palmer of Turborepo, removes the build step
from the internal packages by linking directly to the Typescript source files in
the package manifest.

There are some advantages to this approach:

- Code and type changes can be picked up directly, removing the need for a watch
  task in development mode.
- Removing the build step reduces overall complexity where you might otherwise
  use a bundler with configuration.
- IDE go-to-definition, in which cmd-clicking on a reference takes you to the
  source location instead of the typed exports, works without the need for
  Typescript project references or generating `d.ts.map` files.

But, as always, there are also some disadvantages you should be aware of:

- You can not publish the shared packages to NPM, as you do not expose them as
  Javascript.
- If you use path aliases like `~/`, you will need to make sure every package
  has its own unique aliases. You might not need aliases, because shared
  packages typically do not have a deeply nested folder structure anyway.
- Since all source code gets compiled by the consuming application, build times
  can start to suffer when the codebase grows. See
  [caveats](https://turbo.build/blog/you-might-not-need-typescript-project-references#caveats)
  for more info.
- Since the consuming application is treating the package as a regular source
  code, you can not make your package an ESM module if your consuming context is
  not configured to use ESM. This demo shows how to use ESM for all packages
  including the Next.js app.

For testing and comparison, mono-ts uses the internal packages approach for
`@mono/common` and a traditional built approach for `@mono/backend`. Both are
compatible with `isolate-package` for deploying to Firebase.

## Live code changes from internal packages

Traditionally in a monorepo, each package is treated similarly to a released NPM
package, meaning that the code and types are resolved from the built "dist"
output for each module. Adding new types and changing code in shared packages
therefore requires you to rebuild these, which can be cumbersome during
development.

Turborepo does not (yet) include a watch task, so
[Turbowatch](https://github.com/gajus/turbowatch) was created to solve this
issue. I haven't tried it but it looks like a neat solution. However, you might
want to use the
[internal packages strategy instead](#the-internal-packages-strategy).

## Deploying to Firebase

Deploying code to Firebase that uses shared packages from a monorepo comes with
its own set of challenges, because the Firebase deploy pipeline requires you to
upload a self-contained package that can be treated similarly to an NPM package,
by installing its dependencies and executing the main entry.

This repo includes a solution based on
[isolate-package](https://github.com/0x80/isolate-package/) and I encourage you
to look at that and maybe read the
[accompanying article](https://thijs-koerselman.medium.com/deploy-to-firebase-without-the-hacks-e685de39025e)
to understand what it does and why it is needed.
