import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ApiService } from '../../../../core/services/api.service';
import { Course, Assignment, AssignmentSubmission } from '../../../../core/models/course.model';
import { User } from '../../../../core/models/user.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Site Header -->
    <header class="site-header">
      <div class="d-flex align-items-center gap-2">
        <img src="assets/nehzat.png" alt="لوگو سایت" class="site-logo">
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
          <li><a class="dropdown-item" href="#" (click)="showUserModal()">
            <i class="bi bi-gear"></i> نمایش جزئیات
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
        <div class="lesson-menu flex-md-column" id="lessonMenu">
          <button
            *ngFor="let course of courses"
            class="lesson-btn"
            [class.active]="selectedCourse?.id === course.id"
            (click)="selectCourse(course)"
          >
            <i class="bi bi-book"></i> {{ course.title }}
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="col-12 col-md-9 main-content">
        <h2 class="text-center mb-4">داشبورد پیشرفت دروس</h2>
        
        <!-- Course Info -->
        <div *ngIf="selectedCourse" class="lesson-info mb-4">
          <div class="mb-3 text-center">
            <h3>{{ selectedCourse.title }}</h3>
          </div>
          <div class="mb-3">
            <strong>استاد:</strong> {{ selectedCourse.instructor }}<br>
            <strong>درباره درس:</strong> {{ selectedCourse.description }}
          </div>
        </div>

        <!-- Timeline -->
        <div class="timeline-container" *ngIf="selectedCourse && assignments.length > 0">
          <h4 class="mb-3">تایم‌لاین تکالیف</h4>
          <div class="timeline-horizontal">
            <div *ngFor="let assignment of assignments; let i = index" class="timeline-item">
              <div *ngIf="i > 0" class="timeline-bar"></div>
              <div class="timeline-dot-container">
                <div 
                  class="timeline-dot"
                  [class.gray]="getAssignmentStatus(assignment) === 'future'"
                  [class.blue]="getAssignmentStatus(assignment) === 'today'"
                  [class.green]="getAssignmentStatus(assignment) === 'past'"
                  (click)="showAssignmentDetails(assignment)"
                  [title]="assignment.title + ' - تاریخ: ' + (assignment.assignmentDate | date:'fa-IR')"
                >
                  <i *ngIf="assignment.attachments?.length" class="bi bi-file-earmark-audio"></i>
                  <i *ngIf="!assignment.attachments?.length" class="bi bi-book"></i>
                </div>
                <div class="timeline-label">روز {{ i + 1 }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Chart -->
        <div class="chart-container" *ngIf="selectedCourse">
          <h4 class="mb-3">نمودار پیشرفت</h4>
          <div id="progressChart"></div>
        </div>

        <!-- Audio Recorder -->
        <div class="audio-recorder">
          <h4 class="mb-3">ضبط صوت</h4>
          <div class="recorder-controls">
            <button 
              class="record-btn"
              [class.recording]="isRecording"
              (click)="toggleRecording()"
              [disabled]="!selectedAssignment"
            >
              <i *ngIf="!isRecording" class="bi bi-mic"></i>
              <i *ngIf="isRecording" class="bi bi-stop-fill"></i>
            </button>
            <div *ngIf="isRecording" class="recording-status">
              <span class="text-danger">در حال ضبط...</span>
            </div>
          </div>
          <div *ngIf="audioBlob" class="audio-preview mt-3">
            <audio [src]="audioUrl" controls></audio>
            <button class="btn btn-success btn-sm ms-2" (click)="submitAudio()" [disabled]="isSubmitting">
              <span *ngIf="isSubmitting" class="spinner-border spinner-border-sm me-1"></span>
              ارسال صوت
            </button>
          </div>
        </div>

        <!-- Submissions -->
        <div class="submissions-container mt-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="mb-0">ارسال‌های من</h4>
            <button class="btn btn-primary btn-sm" (click)="loadSubmissions()">
              <i class="bi bi-arrow-clockwise me-1"></i>
              بروزرسانی
            </button>
          </div>
          <div *ngIf="isLoadingSubmissions" class="text-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">در حال بارگذاری...</span>
            </div>
            <p class="mt-2">در حال بارگذاری ارسال‌ها...</p>
          </div>
          <div *ngIf="!isLoadingSubmissions && submissions.length === 0" class="alert alert-info">
            <i class="bi bi-info-circle me-2"></i>
            هنوز هیچ ارسالی ثبت نشده است.
          </div>
          <div *ngIf="!isLoadingSubmissions && submissions.length > 0" class="row">
            <div *ngFor="let submission of submissions" class="col-md-6 col-lg-4 mb-3">
              <div class="card h-100 submission-card">
                <div class="card-header bg-primary text-white">
                  <h6 class="mb-0">
                    <i class="bi bi-file-earmark-audio me-2"></i>
                    {{ submission.assignment?.title || 'تکلیف ' + submission.assignmentId }}
                  </h6>
                </div>
                <div class="card-body">
                  <div class="mb-2">
                    <small class="text-muted">تاریخ ارسال:</small>
                    <div>{{ submission.submissionDate | date:'fa-IR' }}</div>
                  </div>
                  <div class="mb-2">
                    <small class="text-muted">نمره روزانه:</small>
                    <div class="badge bg-success">{{ submission.dailyScore || 0 }}</div>
                  </div>
                  <div class="mb-2">
                    <small class="text-muted">وضعیت:</small>
                    <div class="badge" [class.bg-primary]="submission.status === 'submitted'" [class.bg-secondary]="submission.status !== 'submitted'">
                      {{ submission.status === 'submitted' ? 'ارسال شده' : submission.status }}
                    </div>
                  </div>
                  <div *ngIf="submission.notes" class="mb-2">
                    <small class="text-muted">یادداشت:</small>
                    <div class="small">{{ submission.notes }}</div>
                  </div>
                  <div *ngIf="submission.audioFileUrl" class="mt-3">
                    <button class="btn btn-sm btn-outline-primary" (click)="playAudio(submission.audioFileUrl)">
                      <i class="bi bi-play me-1"></i>
                      پخش صوت
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>

    <!-- Assignment Details Modal -->
    <div class="modal fade" id="assignmentModal" tabindex="-1" aria-labelledby="assignmentModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="assignmentModalLabel">جزئیات تکلیف</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="بستن"></button>
          </div>
          <div class="modal-body" *ngIf="selectedAssignment">
            <h5>{{ selectedAssignment.title }}</h5>
            <p><strong>تاریخ:</strong> {{ selectedAssignment.assignmentDate | date:'fa-IR' }}</p>
            <p><strong>توضیحات:</strong> {{ selectedAssignment.description }}</p>
            <p><strong>دستورالعمل:</strong> {{ selectedAssignment.instructions }}</p>

            <div *ngIf="selectedAssignment.attachments?.length" class="mt-4">
              <h6>فایل‌های ضمیمه:</h6>
              <div class="list-group">
                <a *ngFor="let attachment of selectedAssignment.attachments" 
                   [href]="attachment.url" 
                   class="list-group-item list-group-item-action">
                  <i [class]="getAttachmentIcon(attachment.kind)" class="me-2"></i>
                  {{ attachment.title }}
                  <small *ngIf="attachment.description" class="d-block text-muted">{{ attachment.description }}</small>
                </a>
              </div>
            </div>

            <div *ngIf="assignmentProgress" class="mt-4">
              <div class="alert" [class.alert-success]="assignmentProgress.isCompleted" [class.alert-warning]="!assignmentProgress.isCompleted">
                <strong>وضعیت:</strong> {{ assignmentProgress.isCompleted ? 'تکمیل شده' : 'در انتظار تکمیل' }}<br>
                <strong>نمره روزانه:</strong> {{ assignmentProgress.dailyScore || '-' }}<br>
                <strong>نمره تجمعی:</strong> {{ assignmentProgress.cumulativeScore || '-' }}
              </div>
              <div *ngIf="assignmentProgress.feedback" class="alert alert-info">
                <strong>بازخورد استاد:</strong><br>{{ assignmentProgress.feedback }}
              </div>
            </div>

            <div *ngIf="!assignmentProgress?.isCompleted" class="mt-3">
              <button class="btn btn-primary" (click)="startRecordingForAssignment(selectedAssignment)">
                شروع ضبط صوت
              </button>
            </div>
          </div>
        </div>
      </div>
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
  styles: []
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  courses: Course[] = [];
  selectedCourse: Course | null = null;
  assignments: Assignment[] = [];
  submissions: AssignmentSubmission[] = [];
  selectedAssignment: Assignment | null = null;
  assignmentProgress: any = null;
  
  // Audio recording
  isRecording = false;
  mediaRecorder: MediaRecorder | null = null;
  audioBlob: Blob | null = null;
  audioUrl: string | null = null;
  isSubmitting = false;
  
  // Loading states
  isLoadingSubmissions = false;

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

    // Check if user is admin - redirect to admin dashboard
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
      return;
    }

    // Only students can access this dashboard
    if (!this.authService.isStudent()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loadCourses();
    this.loadSubmissions();
  }

  loadCourses(): void {
    this.apiService.getActiveCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
        if (courses.length > 0) {
          this.selectCourse(courses[0]);
        }
      },
      error: (error) => {
        console.error('Error loading courses:', error);
      }
    });
  }

  selectCourse(course: Course): void {
    this.selectedCourse = course;
    this.loadAssignments(course.id);
    this.loadChart(course);
  }

  loadAssignments(courseId: number): void {
    this.apiService.getCourseAssignments(courseId).subscribe({
      next: (assignments) => {
        this.assignments = assignments.sort((a, b) => 
          new Date(a.assignmentDate).getTime() - new Date(b.assignmentDate).getTime()
        );
      },
      error: (error) => {
        console.error('Error loading assignments:', error);
      }
    });
  }

  loadSubmissions(): void {
    if (!this.currentUser?.studentId) return;
    
    this.isLoadingSubmissions = true;
    this.apiService.getStudentSubmissions(this.currentUser.studentId).subscribe({
      next: (submissions) => {
        this.submissions = submissions;
        this.isLoadingSubmissions = false;
      },
      error: (error) => {
        console.error('Error loading submissions:', error);
        this.isLoadingSubmissions = false;
      }
    });
  }

  loadChart(course: Course): void {
    // Chart implementation will be added here
    // For now, we'll create a placeholder
    setTimeout(() => {
      const chartElement = document.getElementById('progressChart');
      if (chartElement) {
        chartElement.innerHTML = '<div class="alert alert-info">نمودار پیشرفت در حال توسعه است</div>';
      }
    }, 100);
  }

  getAssignmentStatus(assignment: Assignment): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const assignmentDate = new Date(assignment.assignmentDate);
    assignmentDate.setHours(0, 0, 0, 0);

    if (assignmentDate > today) {
      return 'future';
    } else if (assignmentDate.getTime() === today.getTime()) {
      return 'today';
    } else {
      return 'past';
    }
  }

  showAssignmentDetails(assignment: Assignment): void {
    this.selectedAssignment = assignment;
    this.loadAssignmentProgress(assignment.id);
    
    // Show modal
    const modal = new (window as any).bootstrap.Modal(document.getElementById('assignmentModal'));
    modal.show();
  }

  loadAssignmentProgress(assignmentId: number): void {
    if (!this.currentUser?.studentId) return;
    
    this.apiService.getAssignmentProgress(this.currentUser.studentId, assignmentId).subscribe({
      next: (progress) => {
        this.assignmentProgress = progress;
      },
      error: (error) => {
        console.error('Error loading assignment progress:', error);
      }
    });
  }

  startRecordingForAssignment(assignment: Assignment): void {
    this.selectedAssignment = assignment;
    this.toggleRecording();
  }

  async toggleRecording(): Promise<void> {
    if (this.isRecording) {
      this.stopRecording();
    } else {
      await this.startRecording();
    }
  }

  async startRecording(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      this.mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      this.mediaRecorder.onstop = () => {
        this.audioBlob = new Blob(chunks, { type: 'audio/wav' });
        this.audioUrl = URL.createObjectURL(this.audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      this.mediaRecorder.start();
      this.isRecording = true;
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('خطا در شروع ضبط صوت');
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }
  }

  submitAudio(): void {
    if (!this.audioBlob || !this.selectedAssignment || !this.currentUser?.studentId) return;

    this.isSubmitting = true;
    const submissionData = {
      dailyScore: 85, // This should come from a form
      isCompleted: true,
      notes: 'تکلیف امروز انجام شد'
    };

    this.apiService.submitDailyWorkWithAudio(
      this.currentUser.studentId,
      this.selectedAssignment.id,
      this.audioBlob,
      submissionData
    ).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        alert('فایل صوتی با موفقیت ارسال شد');
        this.audioBlob = null;
        this.audioUrl = null;
        this.loadSubmissions();
      },
      error: (error) => {
        this.isSubmitting = false;
        console.error('Error submitting audio:', error);
        alert('خطا در ارسال فایل صوتی');
      }
    });
  }

  playAudio(audioUrl: string): void {
    const fullUrl = audioUrl.startsWith('http') ? audioUrl : `http://localhost:5253${audioUrl}`;
    const audio = new Audio(fullUrl);
    audio.play().catch(error => {
      console.error('Error playing audio:', error);
      alert('خطا در پخش فایل صوتی');
    });
  }

  getAttachmentIcon(kind: string): string {
    switch (kind) {
      case 'audio': return 'bi bi-file-earmark-audio';
      case 'document': return 'bi bi-file-earmark-text';
      case 'link': return 'bi bi-link-45deg';
      default: return 'bi bi-file-earmark';
    }
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
