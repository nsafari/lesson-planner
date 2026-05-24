import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Course, Assignment, AssignmentSubmission, StudentProgress } from '../models/course.model';
import { Student } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly API_BASE = 'http://localhost:5253';

  constructor(private http: HttpClient) {}

  // Student related endpoints
  getStudentProgress(studentId: number): Observable<StudentProgress> {
    return this.http.get<StudentProgress>(`${this.API_BASE}/students/${studentId}/progress`);
  }

  getStudentSubmissions(studentId: number, assignmentId?: number): Observable<AssignmentSubmission[]> {
    const url = assignmentId 
      ? `${this.API_BASE}/students/${studentId}/submissions?assignmentId=${assignmentId}`
      : `${this.API_BASE}/students/${studentId}/submissions`;
    return this.http.get<AssignmentSubmission[]>(url);
  }

  submitDailyWork(studentId: number, assignmentId: number, submissionData: any): Observable<any> {
    return this.http.post(`${this.API_BASE}/students/${studentId}/assignments/${assignmentId}/submit`, submissionData);
  }

  submitDailyWorkWithAudio(studentId: number, assignmentId: number, audioBlob: Blob, submissionData: any = {}): Observable<any> {
    const formData = new FormData();
    formData.append('audioFile', audioBlob, 'recording.wav');
    
    Object.keys(submissionData).forEach(key => {
      formData.append(key, submissionData[key]);
    });

    return this.http.post(`${this.API_BASE}/students/${studentId}/assignments/${assignmentId}/submit`, formData);
  }

  getAssignmentProgress(studentId: number, assignmentId: number): Observable<any> {
    return this.http.get(`${this.API_BASE}/students/${studentId}/assignments/${assignmentId}/progress`);
  }

  // Course related endpoints
  getActiveCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.API_BASE}/courses/active`);
  }

  getCourseAssignments(courseId: number): Observable<Assignment[]> {
    return this.http.get<Assignment[]>(`${this.API_BASE}/courses/${courseId}/assignments`);
  }

  getCourse(courseId: number): Observable<Course> {
    return this.http.get<Course>(`${this.API_BASE}/courses/${courseId}`);
  }

  // Admin endpoints
  getPendingUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_BASE}/admin/users/pending`);
  }

  approveUser(userId: number, userData: any): Observable<any> {
    return this.http.post(`${this.API_BASE}/admin/users/${userId}/approve`, userData);
  }

  rejectUser(userId: number): Observable<any> {
    return this.http.post(`${this.API_BASE}/admin/users/${userId}/reject`, {});
  }

  getAllCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.API_BASE}/admin/courses`);
  }

  createCourse(courseData: any): Observable<Course> {
    return this.http.post<Course>(`${this.API_BASE}/admin/courses`, courseData);
  }

  updateCourse(courseId: number, courseData: any): Observable<Course> {
    return this.http.put<Course>(`${this.API_BASE}/admin/courses/${courseId}`, courseData);
  }

  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete(`${this.API_BASE}/admin/courses/${courseId}`);
  }

  createAssignment(courseId: number, assignmentData: any): Observable<Assignment> {
    return this.http.post<Assignment>(`${this.API_BASE}/admin/courses/${courseId}/assignments`, assignmentData);
  }

  createDailySeries(courseId: number, seriesData: any): Observable<any> {
    return this.http.post(`${this.API_BASE}/admin/courses/${courseId}/assignments/daily-series`, seriesData);
  }

  uploadAttachment(assignmentId: number, file: File, attachmentData: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    Object.keys(attachmentData).forEach(key => {
      formData.append(key, attachmentData[key]);
    });

    return this.http.post(`${this.API_BASE}/admin/assignments/${assignmentId}/attachments`, formData);
  }

  getStatistics(): Observable<any> {
    return this.http.get(`${this.API_BASE}/admin/statistics`);
  }
}
