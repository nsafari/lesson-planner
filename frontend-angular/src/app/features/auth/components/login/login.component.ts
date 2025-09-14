import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <img src="assets/nehzat.png" alt="لوگو سایت" class="auth-logo">
          <h2 class="auth-title">ورود به سیستم</h2>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="username" class="form-label">نام کاربری</label>
            <input
              type="text"
              id="username"
              formControlName="username"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('username')"
              placeholder="نام کاربری خود را وارد کنید"
            >
            <div *ngIf="isFieldInvalid('username')" class="invalid-feedback">
              <div *ngIf="loginForm.get('username')?.errors?.['required']">
                نام کاربری الزامی است
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="password" class="form-label">رمز عبور</label>
            <input
              type="password"
              id="password"
              formControlName="password"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('password')"
              placeholder="رمز عبور خود را وارد کنید"
            >
            <div *ngIf="isFieldInvalid('password')" class="invalid-feedback">
              <div *ngIf="loginForm.get('password')?.errors?.['required']">
                رمز عبور الزامی است
              </div>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary auth-btn"
            [disabled]="loginForm.invalid || isLoading"
          >
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoading ? 'در حال ورود...' : 'ورود' }}
          </button>

          <div class="auth-footer">
            <p class="text-center">
              حساب کاربری ندارید؟
              <a routerLink="/auth/register" class="auth-link">ثبت نام کنید</a>
            </p>
          </div>
        </form>

        <div *ngIf="errorMessage" class="alert alert-danger mt-3">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .auth-card {
      background: white;
      border-radius: 1rem;
      box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      padding: 2rem;
      width: 100%;
      max-width: 400px;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-logo {
      height: 60px;
      width: auto;
      margin-bottom: 1rem;
    }

    .auth-title {
      color: #333;
      font-weight: 600;
      margin: 0;
    }

    .auth-form {
      margin-bottom: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-label {
      font-weight: 500;
      color: #555;
      margin-bottom: 0.5rem;
    }

    .form-control {
      border: 2px solid #e9ecef;
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-control:focus {
      border-color: #007bff;
      box-shadow: 0 0 0 0.2rem rgba(0,123,255,0.25);
    }

    .form-control.is-invalid {
      border-color: #dc3545;
    }

    .auth-btn {
      width: 100%;
      padding: 0.75rem;
      font-size: 1.1rem;
      font-weight: 500;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }

    .auth-footer {
      text-align: center;
    }

    .auth-link {
      color: #007bff;
      text-decoration: none;
      font-weight: 500;
    }

    .auth-link:hover {
      text-decoration: underline;
    }

    .invalid-feedback {
      display: block;
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginData: LoginRequest = this.loginForm.value;

      this.authService.login(loginData).subscribe({
        next: (response) => {
          this.isLoading = false;
          
          // Redirect based on user type
          if (response.userType === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'خطا در ورود به سیستم';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
