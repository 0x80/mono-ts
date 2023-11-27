# API

The external API is deployed as a 2nd gen Firebase function.

## Deploy

In order to deploy this, first create a Firebase project and set the name in
`.firebaserc`, or call `npx firebase use my-project-name`.

Then run `npx firebase deploy` to deploy the api function.

The first time you deploy the function, Firebase will notice that a secret is
being used but not set yet. The CLI will ask you for the value, you can enter
some random string, but you'll need to match it with the apps/web `.env.local`
setting for `NEXT_PUBLIC_DEMO_API_KEY`.

## Parameters

Gen2 function runtime parameters can either be
[defined via env variables or secrets](https://firebase.google.com/docs/functions/config-env?gen=2nd#params).

## Firebase Config

The `firebase.json` file in this packages contains:

```json
"functions": {
  "source": ".",
  "runtime": "nodejs20",
  "isolate": true,
  "predeploy": ["turbo build"],
  "codebase": "api"
},
```

This looks a little different from the configuration in
[services/fns/firebase.json](../fns/README.md#firebase-config) and that is
because this package uses
[firebase-tools-with-isolate](https://github.com/0x80/firebase-tools-with-isolate)
instead of [isolate-package](https://github.com/0x80/isolate-package) directly.

Setting the `isolate` field to true is an opt-in for isolate to execute. Any
configuration is still picked up from the `isolate.config.json` and
`tsconfig.json` files.

The big advantage of this approach over the one in
[services/fns](../fns/README.md#firebase-config) is that you can keep the
configuration the same as a standard non-monorepo setup, and the isolation
process happens auto-magically as part of the `firebase deploy` command. What is
even more exciting; If you have an emulator running, and build code using a
watch task, you will get live updates in the emulator! 🌈✨

The `codebase` field is only required if you want to deploy to Firebase
Functions from more than one package. It acts as a namespace.
