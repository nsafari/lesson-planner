# Lesson Planner Backend

A comprehensive backend system for managing student progress tracking and assignment submissions.

## 🏗️ Architecture

The backend is built with:
- **NestJS** - Progressive Node.js framework
- **TypeORM** - Object-Relational Mapping for database operations
- **SQLite** - Lightweight database for development
- **TypeScript** - Type-safe JavaScript

## 📁 Project Structure

```
backend/
├── src/
│   ├── entities/           # Database entities/models
│   │   ├── student.entity.ts
│   │   ├── course.entity.ts
│   │   ├── assignment.entity.ts
│   │   ├── assignment-submission.entity.ts
│   │   ├── student-course.entity.ts
│   │   └── index.ts
│   ├── services/           # Business logic layer
│   │   ├── student.service.ts
│   │   ├── course.service.ts
│   │   ├── assignment-submission.service.ts
│   │   └── index.ts
│   ├── controllers/        # API endpoints
│   │   ├── student.controller.ts
│   │   ├── course.controller.ts
│   │   └── index.ts
│   ├── auth.controller.ts  # Authentication
│   ├── auth.guard.ts       # Authentication guard
│   ├── user.service.ts     # User management
│   ├── app.module.ts       # Main module
│   └── main.ts            # Application entry point
├── API_ENDPOINTS.md       # Complete API documentation
├── package.json
├── tsconfig.json
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run start:dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   npm run start:prod
   ```

## 📊 Database Schema

### Core Entities

#### 1. Student
- Personal information (name, email, student ID)
- Contact details (phone, address)
- Academic status tracking
- Relationships to courses and submissions

#### 2. Course
- Course information (title, description, code)
- Instructor and scheduling details
- Assignment management
- Student enrollment tracking

#### 3. Assignment
- Assignment details (title, description, type)
- Scoring and deadline information
- Duration tracking (every 2 weeks)
- File attachments and instructions

#### 4. AssignmentSubmission
- Daily progress tracking
- Score accumulation
- Audio recordings and documents
- Time tracking and completion status

#### 5. StudentCourse (Enrollment)
- Student-course relationships
- Enrollment status and grades
- Academic progress tracking

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Students
- `GET /students` - Get all students
- `GET /students/:id` - Get student by ID
- `GET /students/:id/progress` - Get student progress
- `GET /students/:id/assignments/:assignmentId/progress` - Get assignment progress
- `POST /students/:id/assignments/:assignmentId/submit` - Submit daily work
- `POST /students` - Create new student
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

### Courses
- `GET /courses` - Get all courses
- `GET /courses/active` - Get active courses
- `GET /courses/:id` - Get course by ID
- `GET /courses/:id/assignments` - Get course assignments
- `POST /courses/:id/assignments` - Create assignment
- `POST /courses` - Create new course
- `PUT /courses/:id` - Update course
- `DELETE /courses/:id` - Delete course

## 🎯 Key Features

### Daily Progress Tracking
- Students submit daily work for assignments
- Automatic score accumulation
- Progress percentage calculation
- Timeline visualization support

### Audio Recording Support
- Audio file upload and storage
- Integration with frontend recording functionality
- Quality assessment tracking

### Assignment Management
- 2-week assignment cycles
- Multiple assignment types (homework, quiz, project, exam)
- Flexible scoring system
- File attachment support

### Student-Course Relationships
- Enrollment management
- Grade tracking
- Academic status monitoring

## 🔧 Configuration

### Database
The application uses SQLite by default for development:
```typescript
TypeOrmModule.forRoot({
  type: 'sqlite',
  database: 'lesson-planner.db',
  entities: [Student, Course, Assignment, AssignmentSubmission, StudentCourse],
  synchronize: true,
  logging: true,
})
```

### Environment Variables
Create a `.env` file for production configuration:
```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
PORT=3000
```

## 🧪 Testing

### Run tests:
```bash
npm run test
```

### Run e2e tests:
```bash
npm run test:e2e
```

## 📈 Data Flow

1. **Student Enrollment**: Students are enrolled in courses through the StudentCourse entity
2. **Assignment Creation**: Teachers create assignments for courses with 2-week durations
3. **Daily Submissions**: Students submit daily work for assignments
4. **Progress Tracking**: System calculates cumulative scores and progress percentages
5. **Reporting**: Frontend displays progress through charts and timelines

## 🔒 Security

- JWT-based authentication
- Route guards for protected endpoints
- Input validation and sanitization
- SQL injection prevention through TypeORM

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker (Optional)
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 📝 Development Notes

### Adding New Features
1. Create entity in `src/entities/`
2. Add service in `src/services/`
3. Create controller in `src/controllers/`
4. Update `app.module.ts`
5. Add API documentation

### Database Migrations
For production, consider using TypeORM migrations instead of `synchronize: true`:
```bash
npm run typeorm migration:generate -- -n CreateInitialTables
npm run typeorm migration:run
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include input validation
4. Write tests for new features
5. Update API documentation

## 📞 Support

For questions or issues, please refer to the API documentation in `API_ENDPOINTS.md` or create an issue in the repository. 