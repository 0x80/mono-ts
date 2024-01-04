# Mono TS

<!-- TOC -->

- [Introduction](#introduction)
- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Workspace](#workspace)
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
and Javascript evolves.

My current projects are based on Node.js, Next.js, and Firebase, so that is what
I am focussing on. If you use different platforms, I believe this is still a
great reference, as it should be easy discard anything you have no use for. The
approach itself is largely independent of the chosen technology stack.

Also, I am still working on some Firestore abstractions (server and client-side)
that will hopefully make it in here in the coming months.

Contributions and suggestions are welcome within the scope of this example, but
I doubt there ever will be a one-size-fits-all solution, so this code should be
viewed as opinionated.

I ended up basing a lot of things on the
[Turborepo starter](https://turbo.build/repo/docs/getting-started/create-new),
and I recommend reading
[their monorepo handbook](https://turbo.build/repo/docs/handbook).

## Features

- [Turborepo](https://turbo.build/) to orchestrate the build process and
  dependencies
- Showing a traditional "built package" with multiple entry points as well as
  the ["internal package"](#the-internal-packages-strategy) strategy referencing
  Typescript code directly
- Multiple isolated Firebase deployments, using
  [isolate-package](https://github.com/0x80/isolate-package/)
- Firebase emulators with live code updates using
  [firebase-tools-with-isolate](https://github.com/0x80/firebase-tools-with-isolate)
- A web app based on Next.js with [ShadCN](https://ui.shadcn.com/) and
  [Tailwind CSS](https://tailwindcss.com/)
- Using ESM throughout, including the Next.js app
- Shared configurations for ESLint and Typescript
- Path aliases
- Working IDE go-to-definition and go-to-type-definition using `.d.ts.map` files
- Vitest

## Install

In the main branch of this repo, packages are managed with PNPM, but if you
prefer to use a different package manager, there is
[a branch using NPM](https://github.com/0x80/mono-ts/tree/use-npm),
[a branch using classic Yarn (v1)](https://github.com/0x80/mono-ts/tree/use-yarn-classic),
and
[a branch using modern Yarn (v4)](https://github.com/0x80/mono-ts/tree/use-yarn-modern)

I encourage anyone to give PNPM a try if you haven't already.

<!-- If you like to try PNPM but do not have it installed yet, follow
[these instructions](https://pnpm.io/installation). -->

You can install PNPM with `corepack` which is part of modern Node.js versions:

- `corepack enable` (if you have not used it before)
- `corepack prepare pnpm@latest --activate`

Then run `pnpm install` from the repository root.

## Usage

To get started quickly run `npx turbo dev` from the root.

This will:

- Build the `web` app and start its dev server
- Build the `api` and `fns` backend services and start their emulators.

The web app should become available on http://localhost:3000 and the emulators
UI on http://localhost:4000.

Alternatively, you can start the emulators and dev server separately. It makes
the console output more readable and preserves coloring:

- In `apps/web` run `pnpm dev`
- In `services/fns` run `pnpm dev`
- In `services/api` run `pnpm dev`

Additional information can be found in the README files of the various packages.

## Workspace

### Namespace

Typically in a monorepo, you will never publish the packages to NPM, and because
of that, the namespace you use to prefix your package names does not matter. You
might as well pick a generic one that you can use in every private codebase.

At first I used `@mono`, and later I switched to `@repo` when I discovered that
in the Turborepo examples. I like both, because they are equally short and
clear, but I went with `@repo` because I expect it is more likely to become a
standard.

### Packages

- [common](./packages/common) Code that can shared across both front-end and
  back-end environments.
- [backend](./packages/backend) Code that is shared between server environments
  like cloud functions.

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
- Since the consuming application is treating the package as a regular source
  code, you can not make your package an ESM module if your consuming context is
  not configured to use ESM. This demo shows how to use ESM for all packages
  including the Next.js app.

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
