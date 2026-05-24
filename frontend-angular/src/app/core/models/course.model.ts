export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  courseCode: string;
  status: 'active' | 'inactive' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  assignments?: Assignment[];
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  type: 'homework' | 'quiz' | 'project' | 'exam';
  maxScore: number;
  assignmentDate: Date;
  status: 'active' | 'inactive' | 'completed';
  instructions?: string;
  courseId: number;
  createdAt: Date;
  updatedAt: Date;
  attachments?: AssignmentAttachment[];
  submissions?: AssignmentSubmission[];
}

export interface AssignmentAttachment {
  id: number;
  title?: string;
  description?: string;
  kind: 'audio' | 'document' | 'link' | 'other';
  url: string;
  displayOrder: number;
  assignmentId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssignmentSubmission {
  id: number;
  studentId: number;
  assignmentId: number;
  dailyScore?: number;
  cumulativeScore?: number;
  isCompleted: boolean;
  status: 'draft' | 'submitted' | 'graded';
  audioFileUrl?: string;
  notes?: string;
  feedback?: string;
  submissionDate: Date;
  createdAt: Date;
  updatedAt: Date;
  assignment?: Assignment;
}

export interface StudentProgress {
  studentId: number;
  courses: Course[];
  submissions: AssignmentSubmission[];
  totalAssignments: number;
  completedAssignments: number;
  averageScore: number;
}
