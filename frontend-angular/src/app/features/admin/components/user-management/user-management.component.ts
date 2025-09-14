import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <!-- Site Header -->
    <header class="site-header">
      <div class="d-flex align-items-center gap-2">
        <img src="assets/nehzat.png" alt="لوگو سایت" class="site-logo">
        <h4 class="text-white mb-0">مدیریت کاربران</h4>
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
          <button class="admin-btn active" (click)="navigateTo('users')">
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
        <h2 class="text-center mb-4">مدیریت کاربران</h2>
        
        <!-- Pending Users -->
        <div class="card mb-4">
          <div class="card-header">
            <h5 class="mb-0">کاربران در انتظار تایید</h5>
          </div>
          <div class="card-body">
            <div *ngIf="isLoadingPending" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">در حال بارگذاری...</span>
              </div>
            </div>
            <div *ngIf="!isLoadingPending && pendingUsers.length === 0" class="alert alert-info">
              <i class="bi bi-info-circle me-2"></i>
              هیچ کاربری در انتظار تایید نیست.
            </div>
            <div *ngIf="!isLoadingPending && pendingUsers.length > 0" class="row">
              <div *ngFor="let user of pendingUsers" class="col-md-6 col-lg-4 mb-3">
                <div class="card h-100">
                  <div class="card-header bg-warning text-white">
                    <h6 class="mb-0">
                      <i class="bi bi-clock me-2"></i>
                      {{ user.firstName }} {{ user.lastName }}
                    </h6>
                  </div>
                  <div class="card-body">
                    <div class="mb-2">
                      <small class="text-muted">ایمیل:</small>
                      <div>{{ user.email }}</div>
                    </div>
                    <div class="mb-2">
                      <small class="text-muted">شماره تماس:</small>
                      <div>{{ user.phoneNumber }}</div>
                    </div>
                    <div class="mb-2">
                      <small class="text-muted">نام کاربری:</small>
                      <div>{{ user.username }}</div>
                    </div>
                    <div class="mb-3">
                      <small class="text-muted">تاریخ ثبت نام:</small>
                      <div>{{ user.createdAt | date:'fa-IR' }}</div>
                    </div>
                    <div class="d-flex gap-2">
                      <button class="btn btn-success btn-sm flex-fill" (click)="approveUser(user)">
                        <i class="bi bi-check me-1"></i>
                        تایید
                      </button>
                      <button class="btn btn-danger btn-sm flex-fill" (click)="rejectUser(user)">
                        <i class="bi bi-x me-1"></i>
                        رد
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Approve User Modal -->
    <div class="modal fade" id="approveModal" tabindex="-1" aria-labelledby="approveModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="approveModalLabel">تایید کاربر</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="بستن"></button>
          </div>
          <div class="modal-body" *ngIf="selectedUser">
            <form [formGroup]="approveForm" (ngSubmit)="submitApproval()">
              <div class="row">
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label for="firstName" class="form-label">نام</label>
                    <input
                      type="text"
                      id="firstName"
                      formControlName="firstName"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('firstName')"
                    >
                    <div *ngIf="isFieldInvalid('firstName')" class="invalid-feedback">
                      نام الزامی است
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label for="lastName" class="form-label">نام خانوادگی</label>
                    <input
                      type="text"
                      id="lastName"
                      formControlName="lastName"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('lastName')"
                    >
                    <div *ngIf="isFieldInvalid('lastName')" class="invalid-feedback">
                      نام خانوادگی الزامی است
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label for="email" class="form-label">ایمیل</label>
                    <input
                      type="email"
                      id="email"
                      formControlName="email"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('email')"
                    >
                    <div *ngIf="isFieldInvalid('email')" class="invalid-feedback">
                      ایمیل الزامی است
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label for="phoneNumber" class="form-label">شماره تماس</label>
                    <input
                      type="tel"
                      id="phoneNumber"
                      formControlName="phoneNumber"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('phoneNumber')"
                    >
                    <div *ngIf="isFieldInvalid('phoneNumber')" class="invalid-feedback">
                      شماره تماس الزامی است
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label for="studentId" class="form-label">کد دانشجویی</label>
                    <input
                      type="text"
                      id="studentId"
                      formControlName="studentId"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('studentId')"
                    >
                    <div *ngIf="isFieldInvalid('studentId')" class="invalid-feedback">
                      کد دانشجویی الزامی است
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="form-group mb-3">
                    <label for="courseIds" class="form-label">دوره‌ها</label>
                    <select
                      id="courseIds"
                      formControlName="courseIds"
                      class="form-control"
                      [class.is-invalid]="isFieldInvalid('courseIds')"
                      multiple
                    >
                      <option *ngFor="let course of availableCourses" [value]="course.id">
                        {{ course.title }}
                      </option>
                    </select>
                    <div *ngIf="isFieldInvalid('courseIds')" class="invalid-feedback">
                      انتخاب حداقل یک دوره الزامی است
                    </div>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">انصراف</button>
                <button type="submit" class="btn btn-success" [disabled]="approveForm.invalid || isSubmitting">
                  <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-2"></span>
                  تایید کاربر
                </button>
              </div>
            </form>
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
export class UserManagementComponent implements OnInit {
  pendingUsers: any[] = [];
  availableCourses: any[] = [];
  selectedUser: any = null;
  approveForm: FormGroup;
  isLoadingPending = false;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private apiService: ApiService,
    private router: Router
  ) {
    this.approveForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      studentId: ['', [Validators.required]],
      courseIds: [[], [Validators.required]]
    });
  }

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

    this.loadPendingUsers();
    this.loadAvailableCourses();
  }

  loadPendingUsers(): void {
    this.isLoadingPending = true;
    this.apiService.getPendingUsers().subscribe({
      next: (users) => {
        this.pendingUsers = users;
        this.isLoadingPending = false;
      },
      error: (error) => {
        console.error('Error loading pending users:', error);
        this.isLoadingPending = false;
      }
    });
  }

  loadAvailableCourses(): void {
    this.apiService.getAllCourses().subscribe({
      next: (courses) => {
        this.availableCourses = courses;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
      }
    });
  }

  approveUser(user: any): void {
    this.selectedUser = user;
    this.approveForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      studentId: `ST${String(user.id).padStart(3, '0')}`,
      courseIds: []
    });
    
    const modal = new (window as any).bootstrap.Modal(document.getElementById('approveModal'));
    modal.show();
  }

  rejectUser(user: any): void {
    if (confirm(`آیا مطمئن هستید که می‌خواهید کاربر ${user.firstName} ${user.lastName} را رد کنید؟`)) {
      this.apiService.rejectUser(user.id).subscribe({
        next: () => {
          alert('کاربر با موفقیت رد شد');
          this.loadPendingUsers();
        },
        error: (error) => {
          console.error('Error rejecting user:', error);
          alert('خطا در رد کردن کاربر');
        }
      });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.approveForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  submitApproval(): void {
    if (this.approveForm.valid && this.selectedUser) {
      this.isSubmitting = true;
      const approvalData = this.approveForm.value;

      this.apiService.approveUser(this.selectedUser.id, approvalData).subscribe({
        next: () => {
          this.isSubmitting = false;
          alert('کاربر با موفقیت تایید شد');
          this.loadPendingUsers();
          const modal = (window as any).bootstrap.Modal.getInstance(document.getElementById('approveModal'));
          modal.hide();
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Error approving user:', error);
          alert('خطا در تایید کاربر');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.approveForm.controls).forEach(key => {
      const control = this.approveForm.get(key);
      control?.markAsTouched();
    });
  }

  navigateTo(route: string): void {
    this.router.navigate(['/admin', route]);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
