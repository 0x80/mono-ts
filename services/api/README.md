# API

The external API is deployed as a 2nd gen Firebase function.

## Deploy

In order to deploy this, first create a Firebase project and set the name in `.firebaserc`.

Then run `pnpm deploy` or `npx firebase deploy --only functions:api` to deploy
the api function.

The first time you deploy the function, Firebase will notice that a secret is
being used but not set yet. The CLI will ask you for the value, you can enter
some random string, but you'll need to match it with the nextapp `.env.local`
setting for `NEXT_PUBLIC_DEMO_API_KEY`.

## Parameters

Gen2 function runtime parameters can either be [defined via env variables or
secrets](https://firebase.google.com/docs/functions/config-env?gen=2nd#params).
If a parameter is declared in the code but not available during deployment the
CLI will ask for input and store it.

In the case of a secret the parameter will be stored in the Cloud Secrets API.
In the case of an env variable it will be stored in `.env.[project-name]`, but
because the deployment happens from the `isolate` directory, the generated file
will be cleared on the next build.

Therefore, in order to make env files persistent for deployment they need to be
added to the package.json "files" section, so that the isolate process sees them
as part of the to-be-published files.

The env files must match the project name. If you are using separate projects
for development and production, it could be `.env.your-dev-project-name` and
`.env.your-prd-project-name`.
