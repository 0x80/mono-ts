# Mono TS

This is a quest for the ideal Typescript monorepo setup.

My current projects are based on Node, Next.js and Firebase, so that is what I
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

<!-- TOC -->

- [Features](#features)
- [Install](#install)
- [Build](#build)
- [Workspace packages](#workspace-packages)
  - [Packages](#packages)
  - [Apps](#apps)
  - [Services](#services)
- [Deployment](#deployment)
- [Using NPM instead of PNPM](#using-npm-instead-of-pnpm)
- [Using Yarn instead of PNPM](#using-yarn-instead-of-pnpm)
- [Bundling and path aliases](#bundling-and-path-aliases)
- [Code changes in shared packages](#code-changes-in-shared-packages)
- [The "internal packages" strategy](#the-internal-packages-strategy)
- [Deploying to Firebase](#deploying-to-firebase)
- [VSCode settings](#vscode-settings)

<!-- /TOC -->

## Features

- Turborepo for orchestrating the build process with internal packages
- A traditional built package approach, showing how to bundle for multiple entry
  points
- The ["internal packages"](#the-internal-packages-strategy) strategy for live
  shared code updates without using watch tasks.
- Shared configurations for ESLint and Typescript.
- Multiple backend services deploying to Firebase (1st and 2nd gen functions),
  using [isolate-package](https://github.com/0x80/isolate-package/).
- A web app based on Next.js with ShadCN and Tailwind
- Using ES modules throughout, including the Next.js app
- Path aliases
- IDE go-to-type-definition using `.d.ts.map` files
- Vitest

## Install

In this setup, packages are managed using PNPM. I encourage anyone to give it a
try if you haven't already. In my experience it is more convenient and much more
performant than NPM or Yarn, and I get the overall impression that it is
designed better.

If you like to use PNPM and do not have it installed already, follow [these
instructions](https://pnpm.io/installation).

Run `pnpm install` from the repository root.

If you prefer to use a different package manager, that should not be a problem.
See [using NPM](#using-npm-instead-of-pnpm) or [using
Yarn](#using-yarn-instead-of-pnpm) for more info.

## Using

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
  events etc.
- [api](./services/api) A 2nd gen (Cloud Run based) API endpoint, using Express.

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

## Bundling

This setup, besides using the [internal packages
strategy](#the-internal-packages-strategy) also demonstrates how to use a
traditional approach where the package output is being built. You can use
Typscript `tsc` compiler for this, but likely you will want to use a bundler.

The `services` in this codebase use TSUP as a bundler. It is a Rollup inspired
bundler for Typescript.

There can be several reasons for using a bundler, and they are discussed below.

### Path aliases

If you use path aliases like `~/*` or `@/*` to conveniently reference top-level
folders from deeply nested import statements, these paths are not converted by
the Typescript `tsc` compiler.

If your only target is a platform like Next.js, that uses a bundler under the
hood, this these aliases are handled for you. But if you target other platforms
like Firebase, you might have to convert them. A bundler like TSUP can do this
transformation.

### ESM import extensions

A bundler will allow you to output ESM compatible code without having to adhere
to the ESM import rules. ESM requires all relative imports to be explicit with
.js file extensions and imports from folders using /index.js.

A bundler will combine all code in one or more entry files that themselves do
not use relative imports, but only have imports from `node_modules`.

An advantage of writing your code as ESM is that you can import both ES modules
and CommonJS without conversion. An application that uses CJS can not import ESM
directly, because CJS imports are synchronous and ESM imports are asynchronous.

### Tree shaking

Some bundlers like TSUP are capable of eliminating dead code by tree-shaking the
build output, so that less code remains to be deployed.

## Live code changes from internal packages

Traditionally in a monorepo, each package is treated similar to a released NPM
package, meaning that the code and types are resolved from the built "dist"
output for each module. Adding new types and changing code in shared packages
therefor requires you to rebuild these, which can be cumbersome during
development.

Turborepo does not (yet) include a watch task, so
[Turbowatch](https://github.com/gajus/turbowatch) was created to solve this
issue. I haven't tried it but it looks like a neat solution. However, you might
want to use the [internal packages strategy
instead](#the-internal-packages-strategy).

## The "internal packages" strategy

The [internal
packages](https://turbo.build/blog/you-might-not-need-typescript-project-references)
strategy, as it was coined by Jared Palmer of Turborepo, removes the build step
from the internal packages by linking directly to the Typescript source files
from each package's manifest.

There are some advantages to this approach:

- Code and types changes can be picked up directly, removing the need for a
  watch task in development mode.
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

Purely for demonstration purposes, mono-ts uses the internal packages approach
for `@mono/common` and a traditional bundling approach for `@mono/backend`. Both
are compatible with `isolate-package` for deploying to Firebase.

## Deploying to Firebase

Deploying code to Firebase that uses shared packages from a monorepo comes with
its own set of challenges, because the Firebase deploy pipeline requires you to
upload a self-contained package that it can treat similar to an NPM package, by
installing its dependencies and executing the main entry.

This repo includes a solution based on
[isolate-package](https://github.com/0x80/isolate-package/) and I encourage you
to look at that and maybe read the [accompanying
article](https://thijs-koerselman.medium.com/deploy-to-firebase-without-the-hacks-e685de39025e)
to understand what it does and why it is needed.

## VSCode settings

This example includes some VSCode settings that I think are useful.

- Tell VSCode to append .js to local module imports. Useful if you like to write
  your code in ES module format like modern JS.
- Keep auto-import paths as short as possible. Use "./" or "../" over absolute
  paths if the files are relatively close.
- Exclude certain libraries from auto-imports. I have been using my own `assert`
  implementation for example, but VSCode regularly imported it from libraries
  like `node:console`, `node:assert` and `Joi` instead.
