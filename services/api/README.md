# API

The external API is deployed as a 2nd gen Firebase function.

## Deploy

In order to deploy this, first create a Firebase project and set the name in
`.firebaserc`.

Then run `pnpm deploy` or `npx firebase deploy` to deploy
the api function.

The first time you deploy the function, Firebase will notice that a secret is
being used but not set yet. The CLI will ask you for the value, you can enter
some random string, but you'll need to match it with the nextapp `.env.local`
setting for `NEXT_PUBLIC_DEMO_API_KEY`.

## Parameters

Gen2 function runtime parameters can either be [defined via env variables or
secrets](https://firebase.google.com/docs/functions/config-env?gen=2nd#params).

<!-- TOC -->

- [Deploy](#deploy)
- [Parameters](#parameters)

<!-- /TOC -->
