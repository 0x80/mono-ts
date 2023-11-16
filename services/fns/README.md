# Firebase Functions

This package contains the main / internal Firebase functions as well as the
storage and database rules.

## Deploy

In order to deploy this, first create a Firebase project and set the name in `.firebaserc`.

Then run `pnpm deploy` or `npx firebase deploy` to deploy the functions and the firestore indexes and rules.

If you only want to deploy functions you can use `npx firebase deploy --functions`
