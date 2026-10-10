# Next.js template

This is a Next.js template with shadcn/ui.

## Running the sign-in page

The sign-in page uses NextAuth's credentials provider and sends credentials
through a server-side route to the Express API at
`/authentication/login`. Copy `env.example` to `.env.local` and set
`NEXTAUTH_SECRET` to a unique random value (for example, generate one with
`openssl rand -base64 32`). Set `AUTH_API_URL` to the running API origin.
To enable Google sign-in, set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
to the Google OAuth credentials for the same client ID configured as
`OAUTH_GOOGLE_CLIENT_ID` in the server environment. Google sign-in is hidden
until both frontend variables are set.

The API server loads `server/.env.dev` when started with `NODE_ENV=dev`; its
configured port is `9090`. Start the server with `npm run start:dev` from the
`server` directory, then start the client with `npm run dev` from this
directory.

## Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

## Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button";
```
