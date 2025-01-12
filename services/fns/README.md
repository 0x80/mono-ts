# Firebase Functions

This package contains the main / internal Firebase functions as well as the
storage and database rules.

## Deploy

In order to deploy this, first create a Firebase project and set the name in
`.firebaserc`, or call `npx firebase use my-project-name`.

Then run `npx firebase deploy` to deploy the api function.

## Firebase Config

The `firebase.json` file in this packages contains:

```json
"functions": {
  "source": ".",
  "runtime": "nodejs20",
  "predeploy": ["turbo build"],
  "codebase": "fns"
},
```

This looks a little different from the configuration in
[services/api/firebase.json](../api/README.md#firebase-config) and that is
because this package uses
[isolate-package](https://github.com/0x80/isolate-package) directly instead of
the integrated approach with
[firebase-tools-with-isolate](https://github.com/0x80/firebase-tools-with-isolate).

This setup is here mainly to showcase the alternative, but Ii is not recommended
and I might remove it from this demo once I get the impression that
firebase-tools-with-isolate is working for everyone.

The `codebase` field is only required if you want to deploy to Firebase
Functions from more than one package. It acts as a namespace.
