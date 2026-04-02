export interface User {
  uid: string;
  name?: string;
  email: string;
  role: 'user' | 'admin';
  purchasedCourses?: string[];
  progress?: Record<string, CourseProgress>;
}

export interface CourseProgress {
  lastLessonId: string;
  completedLessons: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  rating?: number;
  thumbnail: string;
  category?: string;
  duration?: string;
  lessonsCount?: number;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  duration?: string;
  videoUrl: string;
  isPremium: boolean;
  order: number;
}

export interface Purchase {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  status: 'completed' | 'failed' | 'pending';
  createdAt: any;
}
