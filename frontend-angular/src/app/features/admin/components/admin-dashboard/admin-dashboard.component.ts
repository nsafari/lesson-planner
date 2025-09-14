import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Site Header -->
    <header class="site-header">
      <div class="d-flex align-items-center gap-2">
        <img src="assets/nehzat.png" alt="لوگو سایت" class="site-logo">
        <h4 class="text-white mb-0">پنل مدیریت</h4>
      </div>

      <div class="dropdown">
        <button class="dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
          <i class="bi bi-person-circle"></i>
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="#" (click)="showUserModal()">
            <i class="bi bi-person"></i> {{ currentUser?.firstName }} {{ currentUser?.lastName }}
          </a></li>
          <li><a class="dropdown-item" href="#">
            <i class="bi bi-envelope"></i> {{ currentUser?.email }}
          </a></li>
          <li><hr class="dropdown-divider"></li>
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
          <button class="admin-btn active" (click)="navigateTo('')">
            <i class="bi bi-speedometer2"></i> داشبورد
          </button>
          <button class="admin-btn" (click)="navigateTo('users')">
            <i class="bi bi-people"></i> مدیریت کاربران
          </button>
          <button class="admin-btn" (click)="navigateTo('courses')">
            <i class="bi bi-book"></i> مدیریت دوره‌ها
          </button>
          <button class="admin-btn" (click)="navigateTo('assignments')">
            <i class="bi bi-file-earmark-text"></i> مدیریت تکالیف
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="col-12 col-md-9 main-content">
        <h2 class="text-center mb-4">داشبورد مدیریت</h2>
        
        <!-- Statistics Cards -->
        <div class="row mb-4">
          <div class="col-md-3 mb-3">
            <div class="card bg-primary text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h4 class="card-title">{{ statistics.totalUsers || 0 }}</h4>
                    <p class="card-text">کل کاربران</p>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-people fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-success text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h4 class="card-title">{{ statistics.approvedUsers || 0 }}</h4>
                    <p class="card-text">کاربران تایید شده</p>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-check-circle fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-warning text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h4 class="card-title">{{ statistics.pendingUsers || 0 }}</h4>
                    <p class="card-text">در انتظار تایید</p>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-clock fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3 mb-3">
            <div class="card bg-info text-white">
              <div class="card-body">
                <div class="d-flex justify-content-between">
                  <div>
                    <h4 class="card-title">{{ statistics.totalCourses || 0 }}</h4>
                    <p class="card-text">کل دوره‌ها</p>
                  </div>
                  <div class="align-self-center">
                    <i class="bi bi-book fs-1"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">عملیات سریع</h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-4 mb-3">
                    <button class="btn btn-primary w-100" (click)="navigateTo('users')">
                      <i class="bi bi-person-plus me-2"></i>
                      تایید کاربران جدید
                    </button>
                  </div>
                  <div class="col-md-4 mb-3">
                    <button class="btn btn-success w-100" (click)="navigateTo('courses')">
                      <i class="bi bi-plus-circle me-2"></i>
                      ایجاد دوره جدید
                    </button>
                  </div>
                  <div class="col-md-4 mb-3">
                    <button class="btn btn-info w-100" (click)="navigateTo('assignments')">
                      <i class="bi bi-file-earmark-plus me-2"></i>
                      ایجاد تکلیف جدید
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="row">
          <div class="col-12">
            <div class="card">
              <div class="card-header">
                <h5 class="mb-0">فعالیت‌های اخیر</h5>
              </div>
              <div class="card-body">
                <div *ngIf="isLoadingActivity" class="text-center">
                  <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">در حال بارگذاری...</span>
                  </div>
                </div>
                <div *ngIf="!isLoadingActivity && recentActivity.length === 0" class="alert alert-info">
                  <i class="bi bi-info-circle me-2"></i>
                  هیچ فعالیتی یافت نشد.
                </div>
                <div *ngIf="!isLoadingActivity && recentActivity.length > 0" class="list-group">
                  <div *ngFor="let activity of recentActivity" class="list-group-item">
                    <div class="d-flex w-100 justify-content-between">
                      <h6 class="mb-1">{{ activity.title }}</h6>
                      <small>{{ activity.date | date:'fa-IR' }}</small>
                    </div>
                    <p class="mb-1">{{ activity.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- User Details Modal -->
    <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content shadow-lg">
          <div class="modal-header text-white" style="background-color: #ff004b;">
            <h5 class="modal-title" id="userModalLabel">اطلاعات کاربر</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="بستن"></button>
          </div>
          <div class="modal-body" *ngIf="currentUser">
            <div class="row mb-3">
              <div class="col-md-6"><strong>نام:</strong> {{ currentUser.firstName }}</div>
              <div class="col-md-6"><strong>نام خانوادگی:</strong> {{ currentUser.lastName }}</div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6"><strong>ایمیل:</strong> {{ currentUser.email }}</div>
              <div class="col-md-6"><strong>شماره تماس:</strong> {{ currentUser.phoneNumber }}</div>
            </div>
            <div class="row mb-3">
              <div class="col-md-6"><strong>نوع کاربر:</strong> {{ currentUser.userType === 'admin' ? 'مدیر' : 'دانش‌آموز' }}</div>
              <div class="col-md-6"><strong>وضعیت:</strong> {{ currentUser.status }}</div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">بستن</button>
          </div>
        </div>
      </div>
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
export class AdminDashboardComponent implements OnInit {
  currentUser: User | null = null;
  statistics: any = {};
  recentActivity: any[] = [];
  isLoadingActivity = false;

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Only admins can access this dashboard
    if (!this.authService.isAdmin()) {
      // If user is a student, redirect to student dashboard
      if (this.authService.isStudent()) {
        this.router.navigate(['/dashboard']);
      } else {
        this.router.navigate(['/auth/login']);
      }
      return;
    }

    this.loadStatistics();
    this.loadRecentActivity();
  }

  loadStatistics(): void {
    this.apiService.getStatistics().subscribe({
      next: (stats) => {
        this.statistics = stats;
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        // Set default values
        this.statistics = {
          totalUsers: 0,
          approvedUsers: 0,
          pendingUsers: 0,
          totalCourses: 0
        };
      }
    });
  }

  loadRecentActivity(): void {
    this.isLoadingActivity = true;
    // This would typically come from an API endpoint
    // For now, we'll simulate some data
    setTimeout(() => {
      this.recentActivity = [
        {
          title: 'کاربر جدید ثبت نام کرد',
          description: 'علی احمدی در سیستم ثبت نام کرد',
          date: new Date()
        },
        {
          title: 'تکلیف جدید ایجاد شد',
          description: 'تکلیف روز 1 برای دوره ریاضی ایجاد شد',
          date: new Date(Date.now() - 86400000)
        },
        {
          title: 'کاربر تایید شد',
          description: 'فاطمه محمدی توسط مدیر تایید شد',
          date: new Date(Date.now() - 172800000)
        }
      ];
      this.isLoadingActivity = false;
    }, 1000);
  }

  navigateTo(route: string): void {
    this.router.navigate(['/admin', route]);
  }

  showUserModal(): void {
    const modal = new (window as any).bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
