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

- Use Turborepo to orchestrate the build process with local dependencies
- A traditional built package approach, bundling for multiple entry points
- The ["internal packages"](#the-internal-packages-strategy) strategy
- Shared configurations for ESLint and Typescript.
- Multiple backend services deploying to Firebase (1st and 2nd gen functions),
  using [isolate-package](https://github.com/0x80/isolate-package/).
- A Next.js web app, with live reloads from shared code
- Using ES modules throughout, including the Next.js app
- Path aliases
- IDE go-to-definition
- Vitest

## Install

In this setup, packages are managed using PNPM. If you prefer to use a different
package manager, that should not be a problem. See [using
NPM](#using-npm-instead-of-pnpm) or [using Yarn](#using-yarn-instead-of-pnpm)
for more info.

If you like to use PNPM and don not have it installed already, see [these
instructions](https://pnpm.io/installation).

Then, run `pnpm install` from the repository root.

## Build

You can run `npx turbo build` from the root of the monorepo to build everything.
This should be enough to verify that things are working from a compiler point of
view. If you would like to verify that deployments are working you can follow
the instructions in the individual packages that deploy to Vercel and Firebase.

@TODO Add instructions for running everything locally using emulators.

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
- Delete the pnpm-lock.yaml and pnpm-workspace.yaml files
- Do a find on `workspace:*` and replace them with `*`.
- Add a [workspaces
  configuration](https://docs.npmjs.com/cli/v7/using-npm/workspaces) to the root
  manifest.
- Run `npm install` from the root

## Using Yarn instead of PNPM

You should be able to make this work with Yarn using the steps below:

- Delete the root manifest `packageManger` field
- Delete the pnpm-lock.yaml and pnpm-workspace.yaml files
- Add a [workspaces
  configuration](https://classic.yarnpkg.com/lang/en/docs/workspaces/) to the
  root manifest.
- Run `yarn install` from the root

## Bundling and path aliases

Note: This branch now uses the [internal packages
strategy](#the-internal-packages-strategy), meaning that the shared packages get
bundled together with the deployed apps and services, and those packages can
link directly to the ts source code without requiring a build step.

The deployed services use TSUP as a bundler. It is a Rollup inspired bundler for
Typescript. There can be several reasons for using this. If you use path aliases
like `~/*` or `@/*` to reference your source root from deeply nested sources,
these paths are not converted by the standard Typescript compiler `tsc`.

If your only deployment is a Next.js app, this is not a problem, because using
the `transpileModules` configuration setting, you can have Next transform and
bundle things correctly for you. But if you need to target other platforms, like
Firebase, you do not have this luxury.

A bundler like TSUP can do this transformation for you. In addition, it will
allow you to output ESM without having to adhere to the ESM import rules like
having to use .js and /index.js for relative imports, because the bundler will
combine everything in one or more entry files that themselves do not use
relative imports.

## Code changes in shared packages

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

There are a few advantages to this approach:

- Code and types changes can be picked up directly, removing the need for a
  watch task.
- Having no build step reduces overall configuration and complexity where you
  might otherwise use a bundler.
- IDE go-to-type-definition function (the thing you want to happen when you
  cmd-click on a type or function in your code), works out of the box, without
  the need for Typescript project references or generating `d.ts.map` files.

There are also a few disadvantages to this approach:

- You can not publish the shared packages to NPM, as you do not expose them as
  Javascript.
- If you use path aliases like `~/`, you will need to make sure every package
  has its own unique aliases. I chose to not aliases anymore for my shared
  packages, because those packages typically do not have a deeply nested folder
  structures anyway.
- Since all source code gets compiled by the consuming application, build times
  can start to suffer when the codebase grows. See
  [caveats](https://turbo.build/blog/you-might-not-need-typescript-project-references#caveats)
  for more info.
- Since the consuming application is treating the package as a regular source
  file, you can not make your package an ESM module if your consuming context is
  not configured to use ESM.

This monorepo example uses the internal packages setup for `@mono/common` and a
traditional bundling approach for `@mono/backend`. Both are compatible with
`isolate-package` for deploying to Firebase.

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

## Not Quite There Yet

There are still a few things I would like have figured out:

- [ ] Live code reloads for the "internal packages" like @mono/common. Currently
      a change in `areWeThereYet` doesn't seem to propagate to the rendered page
      when the dev server is running.
- [ ] Live code changes for functions in the Firestore emulator. This would
      require isolate to become an integral part of the firebase-tools deploy
      command, so that the isolation only happens on the actual deployment and
      not pre-deploy, because pre-deploy also affects the emulator.
