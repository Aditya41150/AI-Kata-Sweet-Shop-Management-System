# Sweet Shop Management System 

## Tech Stack
- **Backend**: Node.js with TypeScript, Express
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Testing**: Jest + Supertest
- **ORM**: Prisma

## Initial Setup Steps

### 1. Create Project Directory
```bash
mkdir sweet-shop-management
cd sweet-shop-management
mkdir backend frontend
cd backend
```

### 2. Initialize Node.js Project
```bash
npm init -y
```

### 3. Install Dependencies
```bash
# Core dependencies
npm install express cors dotenv bcrypt jsonwebtoken

# TypeScript dependencies
npm install -D typescript @types/node @types/express @types/cors @types/bcrypt @types/jsonwebtoken ts-node nodemon

# Database (choose one)
npm install pg prisma @prisma/client  # PostgreSQL with Prisma
# OR
npm install typeorm reflect-metadata pg

# Testing dependencies
npm install -D jest @types/jest ts-jest supertest @types/supertest
```

### 4. TypeScript Configuration
Create `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "**/*.test.ts"]
}
```

### 5. Jest Configuration
Create `jest.config.js`:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.interface.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### 6. Package.json Scripts
Add to `package.json`:
```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### 7. Environment Variables
Create `.env`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/sweet_shop
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
```

Create `.env.example`:
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://username:password@localhost:5432/sweet_shop
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

### 8. Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── sweets.controller.ts
│   │   └── inventory.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── admin.middleware.ts
│   │   └── errorHandler.middleware.ts
│   ├── models/
│   │   ├── User.model.ts
│   │   └── Sweet.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── sweets.routes.ts
│   │   └── inventory.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── sweets.service.ts
│   │   └── inventory.service.ts
│   ├── utils/
│   │   └── validators.ts
│   ├── __tests__/
│   │   ├── auth.test.ts
│   │   ├── sweets.test.ts
│   │   └── inventory.test.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── .env.example
├── .gitignore
├── jest.config.js
├── tsconfig.json
└── package.json
```

### 9. Database Setup with Prisma
```bash
npx prisma init
```

This creates `prisma/schema.prisma`. Configure it:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Sweet {
  id        String   @id @default(uuid())
  name      String
  category  String
  price     Float
  quantity  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([name])
  @@index([category])
}

enum Role {
  USER
  ADMIN
}
```

Run migrations:
```bash
npx prisma migrate dev --name init
npx prisma generate
```
