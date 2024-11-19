# Mono TS

<!-- TOC -->

- [Introduction](#introduction)
- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Workspace](#workspace)
  - [Namespace](#namespace)
  - [Packages](#packages)
  - [Apps](#apps)
  - [Services](#services)
- [Deployment](#deployment)
- [The "built packages" strategy](#the-built-packages-strategy)
  - [Convert path aliases](#convert-path-aliases)
  - [Write ESM without import file extensions](#write-esm-without-import-file-extensions)
  - [Tree shaking](#tree-shaking)
- [The "internal packages" strategy](#the-internal-packages-strategy)
- [Live code changes from internal packages](#live-code-changes-from-internal-packages)
- [Firebase](#firebase)
  - [Demo Project](#demo-project)
  - [Deploying](#deploying)
  - [Running Emulators](#running-emulators)
    - [Secrets](#secrets)

<!-- /TOC -->

## Introduction

> There is an accompanying article
> ["My quest for the perfect TS monorepo"](https://thijs-koerselman.medium.com/my-quest-for-the-perfect-ts-monorepo-62653d3047eb)
> that you might want to read for context.

This is a personal quest for the perfect Typescript monorepo setup.

It is the best I could come up with given the tooling that is available, so
expect this repository to change over time as the ecosystem around Typescript
evolves.

My current projects are based on Node.js, Next.js, and Firebase, so that is what
I am focussing on primarily. If you use different a different stack, I believe
this can still be a great reference, as the approach itself does not depend on
it.

Contributions and suggestions are welcome within the scope of this example, but
I doubt there ever will be a one-size-fits-all solution, so this code should be
viewed as opinionated.

I ended up basing a lot of things on the
[Turborepo starter](https://turbo.build/repo/docs/getting-started/create-new),
and I recommend reading
[their monorepo handbook](https://turbo.build/repo/docs/handbook).

> For demonstration purposes, mono-ts uses the "internal packages approach" for
> `@repo/common` and a traditional built approach for `@repo/backend`. Read
> below for more info.

## Features

- [Turborepo](https://turbo.build/) to orchestrate the build process and
  dependencies, including the v2 watch task.
- Showcasing a traditional "built package" with multiple entry points, as well
  as the ["internal package"](#the-internal-packages-strategy) strategy
  referencing Typescript code directly.
- Multiple isolated Firebase deployments, using
  [firebase-tools-with-isolate](https://github.com/0x80/firebase-tools-with-isolate)
- Firebase emulators with hot reloading
- A web app based on Next.js with [ShadCN](https://ui.shadcn.com/) and
  [Tailwind CSS](https://tailwindcss.com/)
- Working IDE go-to-definition and go-to-type-definition using `.d.ts.map` files
- ES modules for everything
- Path aliases
- Shared configurations for ESLint
- Simple standardized configuration for TypeScript
- Vitest

## Install

In the main branch of this repo, packages are managed with PNPM.

There is also a branch for [NPM](https://github.com/0x80/mono-ts/tree/use-npm)

Originally, I included branches for
[Yarn classic (v1)](https://github.com/0x80/mono-ts/tree/use-yarn-classic),
[and modern (v4)](https://github.com/0x80/mono-ts/tree/use-yarn-modern), but I
stopped updating them as Yarn is not that commonly used anymore.

I recommended using `pnpm` over `npm` or `yarn`. Apart from being fast and
efficient, I believe PNPM has better support for monorepos.

You can install PNPM with `corepack` which is part of modern Node.js versions:

- `corepack enable` (if you have not used it before)
- `corepack prepare pnpm@latest --activate`

Then run `pnpm install` from the repository root.

## Usage

There are 4 commands to run in separate processes:

- From the monorepo root, run `pnpm watch`. This builds all the code (except the
  web app) using the Turborepo watch task.
- From `apps/web` run `pnpm dev`. This start the Next.js dev server and builds
  its pages on request.
- From `services/api` run `pnpm emulate`. This starts the emulators for the API
  server.
- From `services/fns` run `pnpm emulate`. This starts the emulators for the
  (other) Firebase functions.

The web app should become available on http://localhost:3000 and the emulators
UI on http://localhost:4000.

You should now have a working local setup, in which code changes to any package
are picked up.

> Note that hot-reloading for the firebase packages like API are not as instant
> as you are used to with front-end tooling like Next.js. When code changes are
> detected, the isolate process needs to run again to compile new output and the
> function needs to reload.

## Workspace

### Namespace

Typically in a monorepo, you will never publish the packages to NPM, and because
of that, the namespace you use to prefix your package names does not matter. You
might as well pick a generic one that you can use in every private codebase.

At first I used `@mono`, and later I switched to `@repo` when I discovered that
in the Turborepo examples. I like both, because they are equally short and
clear, but I went with `@repo` because I expect it will become the standard.

### Packages

- [common](./packages/common) Code that can shared across both front-end and
  back-end environments.
- [firebase](./packages/firebase) Code that is shared between server
  environments like cloud functions.

### Apps

- [web](./apps/web) A Next.js based web application configured to use Tailwind
  CSS and ShadCN components.

### Services

- [fns](./services/fns) Various Firebase functions that execute on document
  writes, pubsub events etc. This package shows how to use [isolate-package]
  explicitly as part of the predeploy phase.
- [api](./services/api) A 2nd gen Firebase function (based on Cloud Run) serving
  as an API endpoint, using Express. This package shows how to use
  [firebase-tools-with-isolate](https://github.com/0x80/firebase-tools-with-isolate)
  to have the isolation integrated as part of the `firebase deploy` command. In
  addition, it illustrates how to use secrets.

## Deployment

I consider deployment a bit out-of-scope for this demo.

For deployment to Firebase, you will have to set up and configure an actual
project, but it is not required to run this demo since by default it runs on
local emulators. Additional info about the use of
[isolate-package](https://github.com/0x80/isolate-package) (used by fns) and
[firestore-tools-with-isolate](https://github.com/0x80/firebase-tools-with-isolate)
(used by api) can be found in the instructions for each package.

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

A bundler will typically remove path aliases, because it combines your code into
self-contained files that do not import other local files themselves.

If you target platforms without using bundler, you will have to convert them.
You can run something like `tsc-alias` after your build step. Note that path
aliases can also end up in `d.ts` files.

### Write ESM without import file extensions

A bundler will allow you to output ESM-compatible code without having to adhere
to the ESM import rules. ESM requires all relative imports to be explicit,
appending a `.js` file extension for importing TS files and appending
`/index.js` when importing from the root of a directory.

The reason you need to use `.js` and not `.ts` is because these imports, like
path aliases are not converted by the Typescript compiler, and so at runtime the
transpiled JS file is what is getting imported.

Because a bundler, by nature, will bundle code into one or more isolated files,
those files do not use relative imports and only contain imports from
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
- The shared package is effectively just a source folder, and as a whole it
  needs to be transpiled and bundled into the consuming package. This means that
  its dependencies must also be available in the consuming package. Next.js can
  do this for you with the `transpilePackage` setting, but this is the reason
  `services/api` includes `remeda`, as it is used by `packages/common`.

For testing and comparison, mono-ts uses the internal packages approach for
`@repo/common` and a traditional built approach for `@repo/backend`. Both are
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

## Firebase

### Demo Project

Throughout this repository, we use a Firebase demo project called `demo-mono-ts`
A demo project allows you to run emulators for the different components like
database without creating a Firebase projects with resources. To make this work
you pass the `--project` flag when starting the emulator, and you need to use a
name that starts with `demo-`.

When passing configuration to initializeApp you can use any non-empty string for
the API keys as you can see in
[apps/web/.env.development](apps/web/.env.development).

### Deploying

Deploying code to Firebase that uses shared packages from a monorepo comes with
its own set of challenges, because the Firebase deploy pipeline requires you to
upload a self-contained package that can be treated similarly to an NPM package,
by installing its dependencies and executing the main entry.

This repo includes a solution based on
[isolate-package](https://github.com/0x80/isolate-package/) I wrote an
[article](https://thijs-koerselman.medium.com/deploy-to-firebase-without-the-hacks-e685de39025e)
explaining what it does and why it is needed.

This demo can be run using only the emulators, but if you would like to see the
deployment to Firebase working you can simply execute
`npx firebase deploy --project your-project-name` from any of the service
packages. For `services/fns` this will trigger a deploy using `isolate-package`
and the standard `firebase-tools`, and for `services/api` this will invoke a
deploy using the
[firestore-tools-with-isolate](https://github.com/0x80/firebase-tools-with-isolate)
fork where both are integrated.

You might notice `@google-cloud/functions-framework` as a dependency in the
service package even though it is not being used in code imports. It is
currently required for Firebase to be able to deploy a PNPM workspace. Without
it you will get an error asking you to install the dependency. I don't quite
understand how the two are related, but it works.

### Running Emulators

For Firebase Functions each service (api and fns) start separate emulators on
port 5001 and 5002. The backend service (using the firebase-admin api) connects
to emulators by setting various environment variables.

I have stored these in `.env` files in the respective service packages. Normally
you would want to store them in a file that is not part of the repository like
`.env.local` but by placing them in `.env` I prevent having to give instructions
for setting them up just for running the demo.

#### Secrets

The api service uses a secret for DEMO_API_KEY. To make secrets work with the
emulator you currently have to add the secret to `.secret.local` and also a
`.env` or `.env.local` file. See
[this issue](https://github.com/firebase/firebase-tools/issues/5520) for more
info. I have placed it in `.env` which is part of the repo, so you don't have to
set anything up, but .env.local is the proper location probably because that
file is not checked into git.
