# API

The external API is deployed as a 2nd gen Firebase function.

## Deploy

In order to deploy this, first create a Firebase project and set the name in
`.firebaserc`, or call `npx firebase use my-project-name`.

Then run `npx firebase deploy --only functions:api` from the root of the
monorepo, to deploy only this package.

The first time you deploy the function, Firebase will notice that a secret is
being used but not set yet. The CLI will ask you for the value, you can enter
some random string, but you'll need to match it with the apps/web `.env.local`
setting for `NEXT_PUBLIC_DEMO_API_KEY`.

## Parameters

Gen2 function runtime parameters can either be
[defined via env variables or secrets](https://firebase.google.com/docs/functions/config-env?gen=2nd#params).
