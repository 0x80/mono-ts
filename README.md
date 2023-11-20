# Mono TS

This is a quest for the ideal Typescript monorepo setup.

My current projects are based on Node, Next.js and Firebase, so that is what I
am focussing on. In particular Firebase brings its own set of challenges in a
monorepo context.

If you use different platforms, this can still be a great starting point, as it
should be easy to discard any packages that you have no use for. The monorepo
approach by itself is largely independent of the chosen tool stack.

This is meant as a best-effort approach given the tooling available, so I expect
this code to change as the ecosystem around Typescript and Javascript continue
to evolve.

Contributions are welcome within the scope of this example. I doubt there will
ever be a one-size-fits-all solution, so this code should be viewed as
opinionated.

> NOTE: This branch uses the [internal packages
> strategy](#the-internal-packages-strategy). If you want to view the example
> using a more traditional approach where each package is built separately, you
> can check out the v1 branch on this repo.

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
- [VSCode settings](#vscode-settings)
- [Code changes in shared packages](#code-changes-in-shared-packages)
- [The "internal packages" strategy](#the-internal-packages-strategy)
- [Deploying to Firebase](#deploying-to-firebase)

<!-- /TOC -->
<!-- /TOC -->

## Features

This example tries to showcases what a complete setup could look like:

- Use Turborepo to orchestrate the build process with local dependencies
- The "internal packages" strategy
- A common package for sharing code with both frontend and backend
- A backend-only shared package, exporting multiple entry points to improve tree
  shaking
- Shared configurations for ESLint and Typescript.
- Multiple packages deploying to Firebase (1st and 2nd gen functions) using
  [isolate-package](https://github.com/0x80/isolate-package/).
- A web app (Next.js) using shared code
- Using ES modules for all but Next.js
- Path aliases
- IDE go-to-definition
- Vitest

## Install

In this example, packages are managed using PNPM, so first make sure you have
that installed using [these instructions](https://pnpm.io/installation).

Run `pnpm install` from the repository root to install all dependencies for all
packages at once.

If you prefer to use a different package manager, that shouldn't be a problem.
See [using NPM](#using-npm-instead-of-pnpm) or [using
Yarn](#using-yarn-instead-of-pnpm).

## Build

You can run `turbo build` from the root of the monorepo to build everything.
This should be enough to verify that things are working from a compiler point of
view. If you want to verify that deployments are working you can follow the
instructions in the individual packages that deploy to Vercel and Firebase.

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

## VSCode settings

The repository also includes some VSCode settings that I think are useful.

- Tell VSCode to append .js to local module imports. Useful if you like to write
  your code in ESModule format.
- Keep auto-import paths as short as possible. Use "./" or "../" over absolute
  paths if the files are relatively close.
- Exclude certain libraries from auto-imports. I have been using my own `assert`
  implementation for example, but VSCode regularly imported it from libraries
  like `node:console`, `node:assert` and `Joi` instead.

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

I have so far found one downside to this approach; if you use path aliases like
`~/`, you will need to make sure every package has its own unique aliases. I
chose to not aliases anymore for my shared packages, because those packages
typically do not have a deeply nested folder structures anyway.

This monorepo example uses the internal packages setup for `@mono/common` and
`@mono/backend` and it is compatible with `isolate-package` for deploying to
Firebase.

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

Recently I changed this setup to use [the internal packages
strategy](#the-internal-packages-strategy) and I was happy to find that the
approach is compatible with `isolate-packages`.

In summary it works like this:

1. The package to be deployed lists its internal dependencies as usual, but the
   manifest files for those packages point directly to the Typescript source.
2. You tell the bundler to include the source code for those package in its
   output bundle. In the case of the TSUP for the API service it is:
   `noExternal: ["@mono/common", "@mono/backend"]`
3. When `isolate` runs, it does the exact same thing as always. It will pick up
   the shared packages, and copy and link them to the target package in the
   isolate output folder. Then, when deploying to Firebase the cloud pipeline
   will look at the manifest and install all dependencies of the target package
   including any dependencies of the linked internal packages. The entry points
   in the manifest files for those packages will still point to the Typescript
   source files, but these are never used since the shared code was already
   embedded in the bundled output.
