# Mono TS

<!-- TOC -->

- [Introduction](#introduction)
- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Monorepo Setup](#monorepo-setup)
  - [Namespace](#namespace)
  - [Packages](#packages)
  - [Apps](#apps)
  - [Services](#services)
- [Firebase](#firebase)
  - [Demo Project](#demo-project)
  - [Deploying](#deploying)
  - [Running Emulators](#running-emulators)
    - [Secrets](#secrets)

<!-- /TOC -->

## Introduction

This is a personal quest for the perfect Typescript monorepo setup.

> There is an accompanying article
> ["My quest for the perfect TS monorepo"](https://thijs-koerselman.medium.com/my-quest-for-the-perfect-ts-monorepo-62653d3047eb)
> that you might want to read for context.

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

## Features

- [Turborepo](https://turbo.build/) to orchestrate the build process and
  dependencies, including the v2 watch task.
- Multiple isolated Firebase deployments, using
  [firebase-tools-with-isolate](https://github.com/0x80/firebase-tools-with-isolate)
- Firebase emulators with hot reloading
- A web app based on Next.js with [ShadCN](https://ui.shadcn.com/) and
  [Tailwind CSS](https://tailwindcss.com/)
- Working IDE go-to-definition and go-to-type-definition using `.d.ts.map` files
- ESM everything
- Path aliases
- Shared configurations for ESLint v9 with strict type-aware rules
- Simple standard configuration for TypeScript
- Vitest
- Clean, typed Firestore abstractions using
  [@typed-firestore/react](https://github.com/0x80/typed-firestore) and
  [@typed-firestore/server](https://github.com/0x80/typed-firestore-server)

## Install

In the main branch of this repo, packages are managed with PNPM.

There is also a branch for [NPM](https://github.com/0x80/mono-ts/tree/use-npm)

Originally, I included branches for
[Yarn classic (v1)](https://github.com/0x80/mono-ts/tree/use-yarn-classic),
[and modern (v4)](https://github.com/0x80/mono-ts/tree/use-yarn-modern), but I
stopped updating them as Yarn is not that commonly used anymore.

I recommend using `pnpm` over `npm` or `yarn`. Apart from being fast and
efficient, PNPM has better support for monorepos.

You can install PNPM with `corepack` which is part of modern Node.js versions:

- `corepack enable` (if you have not used it before)
- `corepack prepare pnpm@latest --activate`

Then run `pnpm install` from the repository root.

## Usage

To get started, execute the following 3 scripts with `pnpm [script name]` from
the root of the monorepo:

| Script    | Description                                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| `watch`   | Continuously builds everything using the Turborepo watch task, except for the web app which has its own dev server |
| `emulate` | Starts the Firebase emulators.                                                                                     |
| `dev`     | Starts the Next.js dev server to build the app on request.                                                         |

The web app should become available on http://localhost:3000 and the emulators
UI on http://localhost:4000.

You should now have a working local setup, in which code changes to any package
are picked up.

## Monorepo Setup

> There is an accompanying article
> ["My quest for the perfect TS monorepo"](https://thijs-koerselman.medium.com/my-quest-for-the-perfect-ts-monorepo-62653d3047eb)
> that you might want to read for context.

This monorepo used to showcase the "internal packages approach" for
`@repo/common`, as described in the article, which lets you link to sources
directly without a build step.

I removed it because I ran into some issues, and I can not really recommend it.
With the right configuration of incremental builds, references, and build
orchestration, modern build tools seem to work fast and smoothly enough.

### Namespace

Often in a monorepo, you will never publish the shared packages to NPM or some
other registry, and because of that, the namespace you use to prefix your
package names does not matter. You might as well pick a standard one that you
can use in every project.

At first I used `@mono`, and later I switched to `@repo` when I encountered that
in the Turborepo examples. I like both, because they are equally short and
clear, but I went with `@repo` because I expect it might become a standard
sooner.

### Packages

- [common](./packages/common) Code that is shared across both front-end and
  back-end environments simultaneously.
- [core](./packages/core) Code that is only shared between server environments,
  like cloud functions, containing mostly "core" business logic.

A standard name for a package that is only shared between client-side apps is
`ui`. Besides sharing UI components, I also use it to share other things that
are solely relevant to the clients.

### Apps

- [web](./apps/web) A Next.js based web application configured to use Tailwind
  CSS and ShadCN components.

### Services

- [fns](./services/fns) Various Firebase functions that execute on document
  writes, pubsub events etc.
- [api](./services/api) A 2nd gen Firebase function (based on Cloud Run) serving
  as an API endpoint. This package also illustrates how to use secrets.

## Firebase

In their
[documentation for monorepos](https://firebase.google.com/docs/functions/organize-functions?gen=2nd#managing_multiple_source_packages_monorepo),
Firebase recommends putting all configurations in the root of the monorepo. This
makes it possible to deploy all packages at once, and easily start the emulators
shared between all packages.

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

Firebase does not natively support monorepos where packages used shared code
from other packages. The Firebase deploy pipeline wants to upload a
self-contained package that can be treated similarly to an NPM package, so that
it can run an install and execute the main entry from the manifest.

To support shared packages, this repo uses
[firestore-tools-with-isolate](https://github.com/0x80/firebase-tools-with-isolate),
which is a firebase-tools fork I created to integrate
[isolate-package](https://github.com/0x80/isolate-package/). I wrote an
[article](https://thijs-koerselman.medium.com/deploy-to-firebase-without-the-hacks-e685de39025e)
explaining what it does and why it is needed.

This demo can be run using only the emulators, but if you would like to see the
deployment to Firebase working you can simply execute
`npx firebase deploy --project your-project-name` the root of the monorepo.

You might notice `@google-cloud/functions-framework` as a dependency in the
service package even though it is not being used in code imports. It is
currently required for Firebase to be able to deploy a PNPM workspace. Without
it you will get an error asking you to install the dependency. I don't quite
understand how the two are related, but it works.

### Running Emulators

With the firebase config in the root of the monorepo, you can configure and
start the emulators for all packages at once with `pnpm emulate`.

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

## Typed Firestore

This repo uses [@typed-firestore/react](https://github.com/0x80/typed-firestore)
and [@typed-firestore/server](https://github.com/0x80/typed-firestore-server) to
provide typed Firestore abstractions for both React and Node.js.

If you're interested here is an
[in-depth article](https://dev.to/0x80/how-to-write-clean-typed-firestore-code-37j2)
of how they came about.
