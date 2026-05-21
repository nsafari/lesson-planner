# AGENTS.md — Lesson Planner

Two separate sub-projects: `backend/` (NestJS) and `frontend-angular/` (Angular 17). The root README still references an old vanilla frontend that no longer exists — ignore it.

---

## @backend-dotnet/ (ASP.NET Core 8 + EF Core + SQLite)

Port of the NestJS backend. Same API surface, same SQLite database, same auto-seed on startup.

### Commands
```bash
cd backend-dotnet/LessonPlanner.Api
dotnet run          # dev server on port 5000 (default)
dotnet build        # compile
dotnet test         # (no tests yet)
```

### Startup (automatic)
- SQLite DB `lesson-planner.db` created with `EnsureCreated()` (tables recreated each startup)
- Default admin user: `test` / `password` (userType: `admin`)
- Sample data auto-seeded: 3 students + linked users, 2 courses, 36 daily assignments per course, attachments for day 1, sample submissions
- CORS is wide open (`AllowAnyOrigin`)
- Static files served from `public/` directory

### Key differences from NestJS version
- Uses `[FromForm]` for auth signin (to support both JSON and multipart like the original `FileInterceptor` pattern)
- File uploads use `IFormFile` parameters instead of Multer
- `Guid.NewGuid():N` (32 hex chars) for random filenames instead of 32-char random hex
- Same API routes, same entity names, same behavior for all endpoints
- BCrypt.Net-Next 4.0.3 for password hashing

### Project structure
```
LessonPlanner.Api/
├── Models/          # EF Core entities (same 7 tables)
├── Data/            # AppDbContext
├── DTOs/            # Request/response records
├── Services/        # Service interfaces + implementations
├── Controllers/     # 5 controllers (auth, student, course, admin, seeder)
└── Seeders/         # Sample data seeder
```

### Architecture notes
- Circular UserService ↔ StudentService resolved with interface-based DI (no `forwardRef` needed)
- `SensitiveDataLogging` enabled for dev (matches NestJS `logging: true`)
- No auth middleware (matches the no-op `AuthGuard` in NestJS)

### Test accounts
Same as frontend-angular section: `ali.ahmadi` / `password123`, `test` / `password`, etc.

---

## @backend/ (NestJS + TypeORM + SQLite)

### Commands
```bash
npm run start:dev   # dev server with file watching (port 3000)
npm run build       # compile to dist/
npm run test        # Jest (unit tests in src/**.spec.ts)
npm run test:e2e    # fails — test/ dir and jest-e2e.json are missing
npm run lint        # ESLint with --fix
```

### Startup behavior (automatic)
- SQLite DB `lesson-planner.db` created with `synchronize: true` (tables recreated each time)
- Default admin user: `test` / `password` (userType: `admin`)
- Sample data auto-seeded every startup: 3 students + linked users, 2 courses, 36 daily assignments per course, attachments for day 1, sample submissions
- CORS is wide open (`app.enableCors()` with no origin restriction)

### Auth
- `POST /auth/signin` — not `/auth/login` (Persian error messages, checks `approvalStatus`)
- `POST /auth/signup` — creates user with `approvalStatus: 'pending'`, supports image upload
- `@UseGuards(AuthGuard)` on all controllers except auth — **but `AuthGuard` is a no-op** (always returns `true`). No real JWT verification exists.
- Frontend stores a `dummy-token` in localStorage; the backend never issues real tokens.

### API quirks
- `@Body('username')` on signin uses `FileInterceptor('username')` — supports both JSON and multipart
- Student `/students/me/profile` expects username in request body (not from token)
- Admin endpoints live under `/admin` and bundle course/assignment/user/attachment/statistics management
- `POST /admin/courses/:courseId/assignments/daily-series` creates N consecutive daily assignments from a start date

### Architecture
- Entities: `Student`, `Course`, `Assignment` (daily), `AssignmentSubmission` (daily upsert by date), `AssignmentAttachment`, `StudentCourse` (join), `User`
- `User` and `Student` are separate: User stores credentials, Student stores profile; linked via `studentId` FK after admin approval
- Services: `StudentService`, `CourseService`, `AssignmentSubmissionService`, `UserService`
- Circular dependency between `UserService` and `StudentService` (uses `forwardRef()`)
- Course has `courseCode` and `credits` fields; Student has a string `studentId` (e.g. `ST001`)
- Path alias `@/*` → `src/*` configured but unused (code uses relative imports)

### File uploads
- Uploaded files go to `public/uploads/`, `public/uploads/submissions/`, `public/uploads/attachments/`
- `public/` is gitignored — ensure directories exist at runtime
- File size limit: 10 MB; allowed types: audio, pdf, doc, images, text

### Tests
- Only 1 spec exists: `src/auth.controller.spec.ts`
- Jest rootDir is `src`, test regex: `.*\\.spec\\.ts$`
- No e2e tests exist despite `test:e2e` script and config reference

---

## @frontend-angular/ (Angular 17 standalone)

### Commands
```bash
npm start           # ng serve on port 4200
npm run build       # production build to dist/lesson-planner-frontend
npm run serve       # ng serve --host 0.0.0.0 --port 4200
npm test            # Karma + Jasmine (ng test)
```

### Project structure
- Standalone components, no NgModules
- `main.ts` bootstraps with `provideRouter`, `provideHttpClient` (functional interceptor), `BrowserAnimationsModule`
- Lazy-loaded feature routes: `auth` (login, register), `dashboard` (student), `admin` (dashboard, users, courses, assignments)
- Guards: `AuthGuard` (checks localStorage token), `AdminGuard` (checks userType)
- Services: `AuthService` (login/register/logout, localStorage-based), `ApiService` (data CRUD)

### Key quirks
- API base URL is hardcoded as `http://localhost:3000` in both services
- Auth is localStorage-based: stores `token` (dummy) and `user` (JSON) — no real JWT
- `AuthService.login()` posts to `/auth/signin` then stores `'dummy-token'`
- `AuthService.register()` posts to `/auth/signup`
- Functional interceptor (`auth.interceptor.ts`) attaches `Authorization: Bearer <token>` header
- `ApiService.submitDailyWorkWithAudio()` builds FormData with audio blob

### Bootstrap
- Bootstrap 5 RTL CSS (`bootstrap.rtl.min.css`), Bootstrap Icons, JS bundle loaded via angular.json
- Vazirmatn Persian font loaded from Google Fonts
- `src/index.html`: `<html lang="fa" dir="rtl">`

### Test accounts
| Type    | Username         | Password     |
|---------|------------------|--------------|
| student | ali.ahmadi       | password123  |
| student | fateme.mohammadi | password123  |
| student | mohammad.rezaei  | password123  |
| admin   | test             | password     |

### TypeScript config
- Frontend: strict mode on, target ES2022
- Backend: `strictNullChecks: false`, `noImplicitAny: false`
