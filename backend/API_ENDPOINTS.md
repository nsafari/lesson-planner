# Lesson Planner API Documentation

## Base URL
`http://localhost:3000`

## Authentication
All endpoints (except auth) require authentication. Include the auth token in the request headers:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication
- `POST /auth/login` - Login with username and password
- `POST /auth/register` - Register new user

### Students
- `GET /students` - Get all students
- `GET /students/:id` - Get student by ID
- `GET /students/:id/progress` - Get student progress (courses + submissions)
- `GET /students/:id/assignments/:assignmentId/progress` - Get progress for a specific (daily) assignment
- `GET /students/:id/submissions?assignmentId=1` - List submissions (optional filter by assignment)
- `POST /students/:id/assignments/:assignmentId/submit` - Submit daily work

### Courses
- `GET /courses` - Get all courses
- `GET /courses/active` - Get active courses
- `GET /courses/:id` - Get course by ID
- `GET /courses/:id/assignments` - Get course assignments (daily), ordered by assignmentDate, includes attachments
- `POST /courses/:id/assignments` - Create a daily assignment
- `POST /courses/:id/assignments/daily-series` - Create a daily assignment series (e.g., 12 days)
  - Body:
  ```json
  {
    "startDate": "2024-09-01",
    "days": 12,
    "titlePrefix": "تکلیف روز",
    "descriptionPrefix": "شرح تکلیف روز",
    "type": "homework",
    "maxScore": 100,
    "instructions": "طبق دستورالعمل انجام دهید"
  }
  ```

### Assignments (Daily)
- Each assignment is for exactly one day: uses `assignmentDate`
- Assignments can have multiple attachments (audio/doc/link)
- Scores are typically evaluated in cycles (e.g., every 12 days collection)

#### Attachments
- Attachments are included when fetching assignments and submissions via relations
- Attachment fields:
  - `title`, `description`, `kind` (audio|document|link|other), `url`, `displayOrder`

## Database Schema (Updated)

### Assignments Table (Daily)
- `id` (PK)
- `title`, `description`, `type`, `maxScore`
- `assignmentDate` (Date for that day)
- `status`, `instructions`
- `courseId` (FK)
- `createdAt`, `updatedAt`

### Assignment Attachments Table
- `id` (PK)
- `title` (nullable), `description` (nullable)
- `kind` (audio|document|link|other)
- `url`
- `displayOrder`
- `assignmentId` (FK)
- `createdAt`, `updatedAt`

### Assignment Submissions Table (Daily)
- Same as before; submissions happen for a single day

## Notes on Scoring Cycles
- Although each assignment is daily, courses can define series (e.g., 12 consecutive days).
- You can compute aggregated scores per 12-day window by summing `cumulativeScore` of submissions across that window. 