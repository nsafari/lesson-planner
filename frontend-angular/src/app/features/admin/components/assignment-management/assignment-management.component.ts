import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-assignment-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Site Header -->
    <header class="site-header">
      <div class="d-flex align-items-center gap-2">
        <img src="assets/nehzat.png" alt="لوگو سایت" class="site-logo">
        <h4 class="text-white mb-0">مدیریت تکالیف</h4>
      </div>

      <div class="dropdown">
        <button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-circle"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="#" (click)="logout()">
            <i class="bi bi-box-arrow-right"></i> خروج
          </a></li>
        </ul>
      </div>
    </header>

    <div class="dashboard-container bg-white row flex-nowrap">
      <!-- Sidebar -->
      <aside class="col-12 col-md-3 sidebar" id="sidebarMenu">
        <div class="admin-menu flex-md-column">
          <button class="admin-btn" (click)="navigateTo('')">
            <i class="bi bi-speedometer2"></i> داشبورد
          </button>
          <button class="admin-btn" (click)="navigateTo('users')">
            <i class="bi bi-people"></i> مدیریت کاربران
          </button>
          <button class="admin-btn" (click)="navigateTo('courses')">
            <i class="bi bi-book"></i> مدیریت دوره‌ها
          </button>
          <button class="admin-btn active" (click)="navigateTo('assignments')">
            <i class="bi bi-file-earmark-text"></i> مدیریت تکالیف
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="col-12 col-md-9 main-content">
        <h2 class="text-center mb-4">مدیریت تکالیف</h2>
        
        <div class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>
          این بخش در حال توسعه است. به زودی قابلیت‌های مدیریت تکالیف اضافه خواهد شد.
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-menu {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .admin-btn {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 1px solid #e9ecef;
      background: white;
      border-radius: 0.5rem;
      text-align: right;
      transition: all 0.3s ease;
      cursor: pointer;
      font-family: 'Vazirmatn', sans-serif;
    }

    .admin-btn:hover {
      background: #f8f9fa;
      border-color: #007bff;
    }

    .admin-btn.active {
      background: #007bff;
      color: white;
      border-color: #007bff;
    }

    .admin-btn i {
      margin-left: 0.5rem;
    }
  `]
})
export class AssignmentManagementComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (!this.authService.getCurrentUser()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.authService.isAdmin()) {
      // If user is a student, redirect to student dashboard
      if (this.authService.isStudent()) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/auth/login']);
      }
      return;
    }
  }

  navigateTo(route: string): void {
    this.router.navigate(['/admin', route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
