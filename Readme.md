<<<<<<< HEAD
# 🍬 Sweet Shop Management System
=======
# Sweet Shop Management System 
>>>>>>> 6d9ee45c3b1c50d84f4dfeb638c7ecf843a08400

A full-stack sweet shop management system built with Node.js, TypeScript, Express, and React, following Test-Driven Development (TDD) principles.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [My AI Usage](#my-ai-usage)
- [Screenshots](#screenshots)

## ✨ Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access control (User/Admin)

### Sweet Management
- Create, read, update, and delete sweets (Admin only)
- Search and filter sweets by name, category, and price range
- View all available sweets

### Inventory Management
- Purchase sweets (decreases quantity)
- Restock sweets (Admin only, increases quantity)
- Real-time quantity tracking

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **Testing**: Jest + Supertest
<<<<<<< HEAD
=======
- **ORM**: Prisma
>>>>>>> 6d9ee45c3b1c50d84f4dfeb638c7ecf843a08400

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks

## 📁 Project Structure

```
sweet-shop-management/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   └── sweets.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── admin.middleware.ts
│   │   │   └── errorHandler.middleware.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   └── sweets.service.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   └── sweets.routes.ts
│   │   ├── __tests__/
│   │   │   ├── auth.service.test.ts
│   │   │   ├── sweets.service.test.ts
│   │   │   └── integration/
│   │   │       └── api.test.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env
│   ├── .env.example
│   ├── jest.config.js
│   ├── tsconfig.json
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── services/
    │   ├── types/
    │   └── App.tsx
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sweet-shop-management/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://username:password@localhost:5432/sweet_shop
   JWT_SECRET=your-super-secret-jwt-key-change-this
   JWT_EXPIRES_IN=7d
   ```

4. **Set up the database**
   ```bash
   # Create the database
   createdb sweet_shop
   
   # Run migrations
   npx prisma migrate dev --name init
   
   # Generate Prisma Client
   npx prisma generate
   ```

5. **Run tests**
   ```bash
   npm test
   npm run test:coverage
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The API will be available at `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   ```bash
   echo "VITE_API_URL=http://localhost:3000/api" > .env
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173`

### Creating an Admin User

To create an admin user, you can use the Prisma Studio or run a script:

```bash
cd backend
npx prisma studio
```

Then manually update a user's role to `ADMIN`.

Or create a seed script:

```typescript
// backend/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sweetshop.com' },
    update: {},
    create: {
      email: 'admin@sweetshop.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN'
    }
  });
  
  console.log('Admin user created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run it with:
```bash
npx ts-node prisma/seed.ts
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  }
}
```

### Sweets Endpoints (All require authentication)

#### Get All Sweets
```http
GET /sweets
Authorization: Bearer <token>
```

#### Search Sweets
```http
GET /sweets/search?name=chocolate&category=chocolate&minPrice=1&maxPrice=5
Authorization: Bearer <token>
```

#### Create Sweet (Admin only)
```http
POST /sweets
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Chocolate Bar",
  "category": "Chocolate",
  "price": 2.5,
  "quantity": 100
}
```

#### Update Sweet (Admin only)
```http
PUT /sweets/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 3.0,
  "quantity": 150
}
```

#### Delete Sweet (Admin only)
```http
DELETE /sweets/:id
Authorization: Bearer <token>
```

#### Purchase Sweet
```http
POST /sweets/:id/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 5
}
```

#### Restock Sweet (Admin only)
```http
POST /sweets/:id/restock
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 50
}
```

## 🧪 Testing

### Running Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

The project maintains high test coverage with:
- Unit tests for services
- Integration tests for API endpoints
- Test coverage threshold: 70%

### Test Structure

```
__tests__/
├── auth.service.test.ts        # Auth service unit tests
├── sweets.service.test.ts      # Sweets service unit tests
└── integration/
    └── api.test.ts             # Full API integration tests
```

## 🤖 My AI Usage

### AI Tools Used

I used **Claude (Anthropic)** as my primary AI assistant throughout this project development.

### How I Used AI

1. **Project Architecture & Planning**
   - Asked Claude to help design the project structure following best practices
   - Discussed the implementation of TDD approach and how to structure tests
   - Got recommendations on folder organization and separation of concerns

2. **Boilerplate Code Generation**
   - Used AI to generate initial TypeScript configuration files (tsconfig.json, jest.config.js)
   - Generated Prisma schema structure with proper relations and indices
   - Created initial Express app setup with middleware configuration

3. **Test-Driven Development**
   - AI helped write comprehensive test cases before implementation
   - Generated test scenarios for edge cases I might have missed
   - Assisted in writing meaningful test descriptions and assertions
   - Example: For the auth service, I asked Claude to help generate tests for:
     - Valid registration scenarios
     - Email validation edge cases
     - Password strength requirements
     - Duplicate email handling

4. **Service Layer Implementation**
   - After writing tests, used AI to help implement services to pass tests
   - AI suggested using Prisma's query methods effectively
   - Got help with error handling patterns and custom error messages

5. **API Controller Development**
   - Used AI to generate controller boilerplate
   - Got suggestions for proper HTTP status codes for different scenarios
   - AI helped with request validation and error response formatting

6. **Middleware Implementation**
   - AI assisted in writing JWT authentication middleware
   - Got help implementing role-based access control (RBAC)
   - Received suggestions for error handling middleware patterns

7. **Integration Testing**
   - Claude helped design comprehensive integration tests
   - Generated test flows for complete user journeys
   - Assisted in setting up test database configuration

8. **Code Review & Refactoring**
   - Asked AI to review code for potential improvements
   - Got suggestions for better variable naming
   - Received recommendations for SOLID principles application

9. **Documentation**
   - AI helped structure this README
   - Generated API documentation examples
   - Assisted in writing clear setup instructions

10. **Debugging**
    - When facing TypeScript type errors, asked AI for solutions
    - Got help resolving Prisma query issues
    - AI assisted in fixing Jest mock configurations

### My Reflection on AI Impact

**Positive Impacts:**
- **Accelerated Development**: AI helped me scaffold the project much faster than doing it manually
- **Better Test Coverage**: AI suggested edge cases I hadn't considered, leading to more robust tests
- **Learning Opportunity**: By reviewing AI-generated code, I learned new patterns and best practices
- **Focus on Logic**: AI handled boilerplate, allowing me to focus on business logic and architecture
- **Confidence**: Having AI as a "pair programmer" gave me confidence to try new approaches

**Challenges & Learnings:**
- **Not Blindly Accepting**: I had to carefully review all AI-generated code to ensure it matched requirements
- **Understanding First**: I made sure I understood every piece of code before committing it
- **Testing AI Code**: AI-generated code still needed thorough testing and sometimes had subtle bugs
- **Context Limitations**: Sometimes had to break down complex requests into smaller, more specific ones
- **Maintaining Consistency**: Ensured AI suggestions aligned with the overall project architecture

**Best Practices I Developed:**
1. Always write tests first, then ask AI to help implement solutions
2. Review and understand all AI-generated code before using it
3. Use AI for brainstorming and exploring alternatives
4. Keep prompts specific and provide context
5. Treat AI as a junior developer - review everything it produces

**AI Transparency:**
Every commit where I used AI assistance includes proper co-authorship attribution:
```
Co-authored-by: Claude <claude@anthropic.com>
```

### Conclusion

AI was an invaluable tool in this project, functioning as an intelligent assistant that accelerated development while helping me learn. However, the architecture decisions, understanding of requirements, and final code quality were my responsibility. AI augmented my capabilities but didn't replace critical thinking and software engineering principles.

## 📸 Screenshots

### User Registration
![Registration Page](./screenshots/register.png)

### Login Page
![Login Page](./screenshots/login.png)

### Dashboard (User View)
![Dashboard](./screenshots/dashboard.png)

### Admin Panel
![Admin Panel](./screenshots/admin.png)

### Sweet Details
![Sweet Details](./screenshots/sweet-details.png)

### Search & Filter
![Search](./screenshots/search.png)

## 🚀 Deployment

### Backend Deployment (Heroku/Railway)

1. Create a PostgreSQL database
2. Set environment variables
3. Deploy using Git:
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Vercel/Netlify)

1. Update `VITE_API_URL` to production URL
2. Deploy:
   ```bash
   vercel deploy
   ```

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

Your Name
- GitHub: [@yourusername](https://github.com/yourusername)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Built with guidance from Anthropic's Claude AI
- Inspired by modern e-commerce systems
- Thanks to the open-source community

---

**Note**: This project was developed as part of a technical assessment demonstrating TDD practices, clean code principles, and responsible AI usage.