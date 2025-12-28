### OpenApi spec for BetterAuth

http://localhost:4000/api/auth/reference

- to view all the endpoint used by the betterauth.
- it uses openApi spec you can see the and interact with it easily
- it is super important.
- need to configure the Email Provider to send email for verification
- tsup to build api package which produces the js file needed by vercel

bun --env-file=apps/api/.env.production packages/api/src/utils/query.ts
