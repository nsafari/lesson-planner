import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { RegisterRequest } from '../../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <img src="assets/nehzat.png" alt="لوگو سایت" class="auth-logo">
          <h2 class="auth-title">ثبت نام</h2>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="row">
            <div class="col-md-6">
              <div class="form-group">
                <label for="firstName" class="form-label">نام</label>
                <input
                  type="text"
                  id="firstName"
                  formControlName="firstName"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('firstName')"
                  placeholder="نام خود را وارد کنید"
                >
                <div *ngIf="isFieldInvalid('firstName')" class="invalid-feedback">
                  <div *ngIf="registerForm.get('firstName')?.errors?.['required']">
                    نام الزامی است
                  </div>
                  <div *ngIf="registerForm.get('firstName')?.errors?.['minlength']">
                    نام باید حداقل 2 کاراکتر باشد
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="lastName" class="form-label">نام خانوادگی</label>
                <input
                  type="text"
                  id="lastName"
                  formControlName="lastName"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('lastName')"
                  placeholder="نام خانوادگی خود را وارد کنید"
                >
                <div *ngIf="isFieldInvalid('lastName')" class="invalid-feedback">
                  <div *ngIf="registerForm.get('lastName')?.errors?.['required']">
                    نام خانوادگی الزامی است
                  </div>
                  <div *ngIf="registerForm.get('lastName')?.errors?.['minlength']">
                    نام خانوادگی باید حداقل 2 کاراکتر باشد
                  </div>
                </div>
              </div>
            </div>
          </div>

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
              <div *ngIf="registerForm.get('username')?.errors?.['required']">
                نام کاربری الزامی است
              </div>
              <div *ngIf="registerForm.get('username')?.errors?.['minlength']">
                نام کاربری باید حداقل 3 کاراکتر باشد
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="email" class="form-label">ایمیل</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('email')"
              placeholder="ایمیل خود را وارد کنید"
            >
            <div *ngIf="isFieldInvalid('email')" class="invalid-feedback">
              <div *ngIf="registerForm.get('email')?.errors?.['required']">
                ایمیل الزامی است
              </div>
              <div *ngIf="registerForm.get('email')?.errors?.['email']">
                فرمت ایمیل صحیح نیست
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="phoneNumber" class="form-label">شماره تماس</label>
            <input
              type="tel"
              id="phoneNumber"
              formControlName="phoneNumber"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('phoneNumber')"
              placeholder="شماره تماس خود را وارد کنید"
            >
            <div *ngIf="isFieldInvalid('phoneNumber')" class="invalid-feedback">
              <div *ngIf="registerForm.get('phoneNumber')?.errors?.['required']">
                شماره تماس الزامی است
              </div>
              <div *ngIf="registerForm.get('phoneNumber')?.errors?.['pattern']">
                شماره تماس باید 11 رقم باشد
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6">
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
                  <div *ngIf="registerForm.get('password')?.errors?.['required']">
                    رمز عبور الزامی است
                  </div>
                  <div *ngIf="registerForm.get('password')?.errors?.['minlength']">
                    رمز عبور باید حداقل 6 کاراکتر باشد
                  </div>
                </div>
              </div>
            </div>
            <div class="col-md-6">
              <div class="form-group">
                <label for="retryPassword" class="form-label">تکرار رمز عبور</label>
                <input
                  type="password"
                  id="retryPassword"
                  formControlName="retryPassword"
                  class="form-control"
                  [class.is-invalid]="isFieldInvalid('retryPassword')"
                  placeholder="رمز عبور را مجدداً وارد کنید"
                >
                <div *ngIf="isFieldInvalid('retryPassword')" class="invalid-feedback">
                  <div *ngIf="registerForm.get('retryPassword')?.errors?.['required']">
                    تکرار رمز عبور الزامی است
                  </div>
                  <div *ngIf="registerForm.get('retryPassword')?.errors?.['passwordMismatch']">
                    رمزهای عبور مطابقت ندارند
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            class="btn btn-primary auth-btn"
            [disabled]="registerForm.invalid || isLoading"
          >
            <span *ngIf="isLoading" class="spinner-border spinner-border-sm me-2" role="status"></span>
            {{ isLoading ? 'در حال ثبت نام...' : 'ثبت نام' }}
          </button>

          <div class="auth-footer">
            <p class="text-center">
              قبلاً ثبت نام کرده‌اید؟
              <a routerLink="/auth/login" class="auth-link">وارد شوید</a>
            </p>
          </div>
        </form>

        <div *ngIf="errorMessage" class="alert alert-danger mt-3">
          {{ errorMessage }}
        </div>

        <div *ngIf="successMessage" class="alert alert-success mt-3">
          {{ successMessage }}
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
      max-width: 600px;
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
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      retryPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const retryPassword = form.get('retryPassword');
    
    if (password && retryPassword && password.value !== retryPassword.value) {
      retryPassword.setErrors({ passwordMismatch: true });
    } else {
      if (retryPassword?.errors?.['passwordMismatch']) {
        delete retryPassword.errors['passwordMismatch'];
        if (Object.keys(retryPassword.errors).length === 0) {
          retryPassword.setErrors(null);
        }
      }
    }
    
    return null;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.registerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const registerData: RegisterRequest = this.registerForm.value;

      this.authService.register(registerData).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.successMessage = response.message || 'ثبت نام با موفقیت انجام شد. در انتظار تایید مدیر سیستم هستید.';
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
          }, 3000);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'خطا در ثبت نام';
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }
}
