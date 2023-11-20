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

<!-- TOC -->

- [Features](#features)
- [Definition and requirements](#definition-and-requirements)
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
- [Go-To-Definition](#go-to-definition)
- [VSCode settings](#vscode-settings)
- [Code changes in shared packages](#code-changes-in-shared-packages)
  - [Using Turbowatch](#using-turbowatch)
  - [Using the "internal packages" approach](#using-the-internal-packages-approach)
- [Deploying to Firebase](#deploying-to-firebase)

<!-- /TOC -->

## Features

- Turborepo to orchestrate the build process with local dependencies
- A common package for sharing code with both frontend and backend
- A backend-only shared package
- Multiple package entry points to improve tree shaking
- Packages for sharing ESLint and Typescript configurations so it is easy to
  keep configurations consistent without repeating yourself.
- Multiple packages deploying to Firebase (1st and 2nd gen functions) without
  scripting hacks, using
  [isolate-package](https://github.com/0x80/isolate-package/).
- A front-end app (Next.js) using shared code
- ESM build output for all packages
- Path aliases
- IDE go-to-definition using type definition maps and project references
- Vitest
- PNPM

## Definition and requirements

## Install

Packages are managed using PNPM, so first make sure you have that installed
using [these instructions](https://pnpm.io/installation).

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

@TODO Make instructions for running everything locally using emulators.

## Workspace packages

This repo demonstrates the use of two shared packages. One shared between
between both frontend and backend code, called "common", and one backend-only
package called "backend".

In addition there is a user-facing Next.js application, and two backend services
that deploy to Firebase.

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

The code uses TSUP as a bundler. It's a Rollup inspired bundler for Typescript.
There are several reasons for using this. If you use path aliases like `~/*` or
`@/*` to reference your source root from deeply nested sources, these paths are
not converted by the standard Typescript compiler `tsc`.

If your only deployment is a Next.js app, this is not a problem, because using
the `transpileModules` configuration setting, you can have Next transform and
bundle things correctly for you. But if you need to target other platforms, like
Firebase, you do not have this luxury.

A bundler like TSUP can do this transformation for you. In addition, it will
allow you to output ESM without having to adhere to the ESM import rules like
having to use .js and /index.js for relative imports, because the bundler will
combine everything in one or more entry files that themselves do not use
relative imports.

## Go-To-Definition

One important thing to have working in a monorepo is the IDE go-to-definition
when you cmd-click on an imported class or function. You want to jump to the
source and not the compiled dist output location or the type.

In order to do this, it seems we need type-definition maps. They are similar to
source maps, but then for compiled `.d.ts` output files.

TSUP can generate dts files, but they will represent the already bundled source
code, and that is not what we want if we want to jump to the origin of the code.
Also, at the time of writing TSUP can not generate type definition map files.

For this reason, we only use TSUP for bundling, and then run TSC to generate the
type definitions and the type definition map files, and as a result, in all the
packages that are imported by others (packages/common and packages/backend) you
will see `"tsup && tsc --emitDeclarationOnly"` as the build script.

In order to make go-to-definition work, it seems to be important to also set up
the typescript project references in the tsconfig files of the packages that use
them.

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

Each package is treated similar to a released NPM package, meaning that the code
and types are resolved from the built "dist" output for each module. Adding new
types and changing code in shared packages therefor requires you to rebuild
these. The exception I think is NextJS which can use its "transpileModules"
configuration to pick things up when the sources of its dependencies change.

### Using Turbowatch

Turborepo does not include a watch task (yet) so people have created
[Turbowatch](https://github.com/gajus/turbowatch) for this purpose. I haven't
tried it but it looks like a great solution.

### Using the "internal packages" approach

There is also the [internal
packages](https://turbo.build/blog/you-might-not-need-typescript-project-references)
strategy as it was coined by Jared Palmer of Turborepo, in which you link
directly to the package source. With this approach, if you use path aliases like
`~/`, you need to make sure every package has its own unique alias to point to
its src folder. Alternatively you could choose to not aliases at all for your
shared packages. Typically shared packages do not have a deeply nested structure
anyway.

## Deploying to Firebase

Deploying code to Firebase that uses shared packages from a monorepo comes with
its own set of challenges, because the Firebase deploy pipeline requires you to
upload a self-contained package that it can treat similar to an NPM package, by
installing its dependencies and executing the main entry.

This repo includes a solution based on
[isolate-package](https://github.com/0x80/isolate-package/) and I encourage you
to look at that and maybe read the [accompanying article](https://thijs-koerselman.medium.com/deploy-to-firebase-without-the-hacks-e685de39025e) to understand what
it does and why it is needed.
