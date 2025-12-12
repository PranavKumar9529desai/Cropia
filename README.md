# Cropia

Cropia is a modern web application built with a robust monorepo architecture using Turborepo. It leverages the power of Bun for fast package management and execution.

## Tech Stack

- **Monorepo**: [Turborepo](https://turbo.build/repo)
- **Package Manager**: [Bun](https://bun.sh/)
- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [TanStack Router](https://tanstack.com/router/latest) (`apps/web`)
- **Backend**: [Hono](https://hono.dev/) (`apps/api`)
- **Auth**: [BetterAuth](https://better-auth.com/)
  - Handler: `apps/api/src/auth.ts`
  - Client: `apps/web/src/lib/auth/auth-client.ts`
- **Database**: MongoDB (via [Prisma](https://www.prisma.io/) in `packages/db`)
- **Type-Safety**: End-to-end type safety with Hono RPC (`apps/web/src/lib/rpc.ts`)
- **UI**: [Shadcn UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/) (`packages/ui`)

## Project Structure

- `apps/web`: The main frontend application built with Vite and TanStack Router.
- `apps/api`: The backend API server built with Hono.
- `packages/ui`: A shared UI component library using Shadcn UI and Tailwind CSS.
- `packages/db`: Database schema and Prisma client configuration.
- `packages/tsconfig`: Shared TypeScript configurations used throughout the monorepo.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or later)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd Cropia
bun install
```

### Environment Variables

Copy the example environment file to create your local `.env` file:

```bash
cp .env.example .env
```

Ensure you update the `DATABASE_URL` in `.env` to point to your MongoDB instance.

### Database Setup

Start the MongoDB database using Podman:

```bash
cd packages/db && bun run db:up
```

Then, generate the Prisma client and push the schema:

```bash
# Generate Prisma Client
cd packages/db && bun run db:generate

# Push schema to the database
cd packages/db && bun run db:push
```

### Running Development Server

Start the development server for all apps and packages:

```bash
bun run dev
```

This will start:

- Web App: `http://localhost:5173` (usually)
- API Server: `http://localhost:4000` (check console for exact port)

## Scripts

- `bun run dev`: Starts the development server.
- `bun run build`: Builds the application for production.
- `bun run lint`: Runs the linter to ensure code quality.
- `bun run check-types`: Runs TypeScript type checking.



### Admin Features
- 1) Maps UI
- 2) Agent Run
- 3) Alert Creator 
- 4) Extra Feature : Crop Health Certificate, which can be approved by goverment inorder take any form of the insurence.
( this is wy much more extra first we need to focus initail things we must focus on things which are super important )