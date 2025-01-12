# Firebase Functions

This package contains the main / internal Firebase functions as well as the
storage and database rules.

## Deploy

In order to deploy this, first create a Firebase project and set the name in
`.firebaserc`, or call `npx firebase use my-project-name`.

Then run `npx firebase deploy --only functions:fns` from the root of the
monorepo, to deploy only this package.
