# Lesson Planner Frontend - Angular

This is the Angular frontend for the Lesson Planner application, converted from the original vanilla HTML/CSS/JS implementation.

## Features

- **Authentication System**: Login and registration with JWT tokens
- **Role-based Access Control**: Separate interfaces for students and admins
- **Student Dashboard**: Course progress tracking, assignment timeline, audio recording
- **Admin Panel**: User management, course management, assignment management
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **RTL Support**: Full right-to-left language support for Persian
- **Audio Recording**: Built-in audio recorder for student submissions

## Technology Stack

- **Angular 17**: Latest version with standalone components
- **TypeScript**: Type-safe development
- **Bootstrap 5**: UI framework with RTL support
- **RxJS**: Reactive programming
- **Highcharts**: Progress visualization (to be implemented)

## Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── models/          # TypeScript interfaces
│   │   ├── services/        # API and authentication services
│   │   ├── guards/          # Route guards
│   │   └── interceptors/    # HTTP interceptors
│   ├── features/
│   │   ├── auth/            # Authentication module
│   │   ├── dashboard/       # Student dashboard
│   │   └── admin/           # Admin panel
│   ├── app.component.ts     # Root component
│   └── app.routes.ts        # Main routing configuration
├── assets/                  # Static assets (images, fonts, etc.)
└── styles.scss             # Global styles
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+

### Installation

1. **Install dependencies:**
   ```bash
   cd frontend-angular
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

The application will be available at `http://localhost:4200`

## API Configuration

The frontend connects to the backend API at `http://localhost:3000`. Make sure the backend is running before starting the frontend.

## Authentication Flow

1. **Registration**: New users register and await admin approval
2. **Login**: Approved users can log in with their credentials
3. **Role-based Routing**: 
   - Students are redirected to `/dashboard`
   - Admins are redirected to `/admin`
4. **Protected Routes**: All routes except auth are protected by guards

## Key Components

### Authentication
- `LoginComponent`: User login form
- `RegisterComponent`: User registration form
- `AuthService`: Handles authentication logic
- `AuthGuard`: Protects routes requiring authentication

### Student Dashboard
- `DashboardComponent`: Main student interface
- Course selection and assignment timeline
- Audio recording functionality
- Progress tracking and submissions

### Admin Panel
- `AdminDashboardComponent`: Admin overview with statistics
- `UserManagementComponent`: Approve/reject pending users
- `CourseManagementComponent`: Manage courses (placeholder)
- `AssignmentManagementComponent`: Manage assignments (placeholder)

## Development Notes

### Adding New Features

1. **Create Models**: Define TypeScript interfaces in `core/models/`
2. **Add Services**: Create API services in `core/services/`
3. **Build Components**: Create feature components
4. **Update Routes**: Add routes to appropriate routing files
5. **Add Guards**: Implement guards for protected routes

### Styling

- Global styles are in `src/styles.scss`
- Bootstrap RTL is included for Persian language support
- Custom CSS classes follow the existing design system

### API Integration

- All API calls go through the `ApiService`
- Authentication tokens are automatically added via interceptors
- Error handling is implemented in services

## Migration from Original Frontend

This Angular version maintains the same functionality as the original vanilla JS frontend:

- ✅ Authentication system
- ✅ Student dashboard with course selection
- ✅ Assignment timeline
- ✅ Audio recording
- ✅ Admin user management
- ✅ Responsive design
- ✅ RTL support

### Improvements

- Type safety with TypeScript
- Component-based architecture
- Better state management
- Lazy loading for better performance
- Route guards for security
- Reactive programming with RxJS

## Future Enhancements

- [ ] Complete course management functionality
- [ ] Complete assignment management functionality
- [ ] Highcharts integration for progress visualization
- [ ] File upload with progress indicators
- [ ] Real-time notifications
- [ ] PWA capabilities
- [ ] Unit and integration tests

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the backend CORS is configured for `http://localhost:4200`
2. **Authentication Issues**: Check that the backend is running and accessible
3. **Build Errors**: Make sure all dependencies are installed with `npm install`

### Development Tips

- Use Angular DevTools browser extension for debugging
- Check browser console for detailed error messages
- Use `ng serve --open` to automatically open the browser
- Use `ng build --watch` for continuous building during development

## Contributing

1. Follow Angular style guide
2. Use TypeScript strict mode
3. Add proper error handling
4. Include JSDoc comments for public methods
5. Test on different screen sizes
6. Ensure RTL support is maintained
