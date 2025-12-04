# Memap Backend

Backend API server for Memap, built with Hono, PostgreSQL, and Cloudflare R2 (S3 Compatible Object Storage).

## Tech Stack

- **Framework**: [Hono](https://hono.dev/) - Fast web framework
- **Database**: PostgreSQL 18 with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [Better Auth](https://www.better-auth.com/)
- **Storage**: S3 Compatible storage for images (Cloudflare R2)
- **Queue**: BullMQ with Redis for background job processing
- **Image Processing**: Sharp for image optimization
- **Runtime**: Node.js with TypeScript (tsx)

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   │   ├── images/        # Image CRUD operations
│   │   ├── trips/         # Trip management
│   │   └── upload/        # File upload handling
│   ├── db/
│   │   ├── schemas/       # Drizzle database schemas
│   │   └── index.ts       # Database connection
│   ├── lib/
│   │   ├── auth.ts        # Better Auth configuration
│   │   ├── s3.ts          # S3 client
│   │   ├── queue.ts       # BullMQ queue setup
│   │   └── redis-connection.ts
│   ├── middleware/        # Request middleware
│   ├── routes/            # API route definitions
│   ├── workers/           # Background job workers
│   │   └── image-processing/
│   └── index.ts           # Application entry point
├── drizzle/               # Database migrations
└── compose.yaml           # Docker Compose for local services
```

## Getting Started

### Prerequisites

- Node.js v22+
- PostgreSQL 18
- Redis 8
- S3 bucket and credentials

### Installation

```bash
npm install
```

### Local Development Setup

1. **Start PostgreSQL and Redis** (using Docker Compose)

   ```bash
   docker compose up -d
   ```

   This starts:

   - PostgreSQL on port 5432
   - Redis on port 6379

2. **Configure environment variables**

   Create a `.env` file in the `backend` directory:

   ```env
   NODE_ENV=development

   DATABASE_URL=postgresql://memap:memap@localhost:5432/memap

   BETTER_AUTH_SECRET= # Long random string
   BETTER_AUTH_URL=http://localhost:3000

   CLOUDFLARE_API_R2_TOKEN= # Token obtained from Cloudflare dashboard
   S3_CLIENT_ACCESS_KEY_ID= # Obtained in Cloudflare dashboard
   S3_CLIENT_SECRET_ACCESS_KEY= # Obtained in Cloudflare dashboard
   S3_ENDPOINT= # Obtained in Cloudflare dashobard. Important:  without regional .eu domain
   S3_BUCKET= # bucket name

   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

3. **Run database migrations**
   Generate migrations:

   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

4. **Generate Better Auth schemas** (if needed)

   ```bash
   npx @better-auth/cli generate --output ./src/db/schemas/auth.ts
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   Server runs on http://localhost:4000

6. **Start the image processing worker** (in a separate terminal)
   ```bash
   npm run worker:dev
   ```

## API Endpoints

### Trips

- `GET /api/trips` - List user's trips
- `GET /api/trips/:id` - Get trip details
- `POST /api/trips` - Create a new trip

### Images

- `GET /api/images/:uuid` - Get image with cache headers
- `DELETE /api/images/:uuid` - Delete an image

### Upload

- `POST /api/upload/single/init` - Initialize single file upload
- `POST /api/upload/single/complete` - Complete single file upload

## Database Schema

### Tables

- **user** - User accounts (managed by Better Auth)
- **trip** - Travel trips with dates and descriptions
- **point** - Geographic points/waypoints on trips
- **image** - Images attached to trips with processing status

### Migrations

Migrations are stored in `drizzle/` directory. Use Drizzle Kit to manage:

```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations
npx drizzle-kit migrate

# Push schema directly (dev only)
npx drizzle-kit push
```

## Background Jobs

The application uses BullMQ for background image processing:

- **Image Processing Worker**: Processes uploaded images (resizing, optimization)
- Queue configuration: `src/lib/queue.ts`
- Worker implementation: `src/workers/image-processing/post-upload.ts`

### Image Processing Job

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Request presigned URL
     ├───────────────────────────────────────────────────────────────┐
     │   GET /api/upload/single/init                                 │
     │                                                               ▼
     │                                                      ┌─────────────────┐
     │                                                      │   API Server    │
     │                                                      │                 │
     │                                                      └────────┬────────┘
     │                                                               │
     │ ◄─────────────────────────────────────────────────────────────┘
     │   Returns presigned URL
     │
     │ 2. Upload image to presigned URL
     ├───────────────────────────────────────────────────────────────┐
     │                                                               │
     │                                                               ▼
     │                                                      ┌─────────────────┐
     │                                                      │  Cloud Storage  │
     │                                                      │ (S3, update db) │
     │                                                      └─────────────────┘
     │
     │ ◄─────────────────────────────────────────────────────────────┘
     │   Upload successful
     │
     │ 3. Confirm upload
     ├───────────────────────────────────────────────────────────────┐
     │                                                               │
     │   POST /api/upload/single/confirm                             ▼
     │                                                      ┌─────────────────┐
     │                                                      │   API Server    │
     │                                                      │                 │
     │                                                      │  4. Queue job   │
     │                                                      └────────┬────────┘
     │   Confirmation received                                       │
     │ ◄─────────────────────────────────────────────────────────────┘
     │                                                               │
     │                                                               ▼
     │                                                      ┌─────────────────┐
     │                                                      │   BullMQ Queue  │
     │                                                      │                 │
     │                                                      └────────┬────────┘
     │                                                               │
     │                                                               │
     │                                                               │
     │                                                               │ 5. Worker
     │                                                               │    picks up job
     │                                                               ▼
     │                                                      ┌─────────────────┐
     │                                                      │  Image Worker   │
     │                                                      │                 │
     │                                                      │  • Thumbnail    │
     │                                                      │    (WebP)       │
     │                                                      │  • Compressed   │
     │                                                      │    big-res      │
     │                                                      │    (WebP)       │
     │                                                      └────────┬────────┘
     │                                                               │
     │                                                               │ Store processed
     │                                                               │ images
     │                                                               ▼
     │                                                      ┌─────────────────┐
     │                                                      │  Cloud Storage  │
     │                                                      │ (S3, update db) │
     │                                                      └─────────────────┘

```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run worker:dev` - Start image processing worker in development mode

## Production Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run migrations:

   ```bash
   npx drizzle-kit migrate
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Start the worker (separate process):
   ```bash
   node dist/workers/image-processing/post-upload.js
   ```
