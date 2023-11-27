This is a [Next.js](https://nextjs.org/) project bootstrapped with
[`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Deploy on Vercel

Because this app uses Firebase, and we do not want to have to create actual
Firebase resources just to run this code we use a so-called "demo" project. Any
project name starting with `demo-` passed to the emulators will make them run
without ever talking to real cloud resources.

variables in a `.env.development` file like so:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_DEMO_API_KEY=
NEXT_PUBLIC_DEMO_API_ENDPOINT=
```

The value for `NEXT_PUBLIC_DEMO_API_KEY` can be some random string, but you'll
need to match it with the secret that is being used by the API endpoint when you
first deploy that.

The value for `NEXT_PUBLIC_DEMO_API_ENDPOINT` should be
`"http://localhost:5002/mono-ts/europe-west3/api/v1"` if you use the local
firebase emulator. Otherwise it should point to your firebase function instance
in the correct region.

The easiest way to deploy your Next.js app is to use the
[Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)
from the creators of Next.js.

Check out our
[Next.js deployment documentation](https://nextjs.org/docs/deployment) for more
details.

## Run dev server

```bash
pnpm dev
```
