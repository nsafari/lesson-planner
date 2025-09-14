import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'users',
    loadComponent: () => import('./components/user-management/user-management.component').then(m => m.UserManagementComponent)
  },
  {
    path: 'courses',
    loadComponent: () => import('./components/course-management/course-management.component').then(m => m.CourseManagementComponent)
  },
  {
    path: 'assignments',
    loadComponent: () => import('./components/assignment-management/assignment-management.component').then(m => m.AssignmentManagementComponent)
  }
];
