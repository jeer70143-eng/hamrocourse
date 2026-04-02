import { Course, Lesson } from './types';

export const DUMMY_COURSES: Course[] = [
  {
    id: 'course-1',
    title: 'Complete React Mastery',
    description: 'Master React from scratch with hooks, context, and modern patterns.',
    instructor: 'John Doe',
    price: 49.99,
    rating: 4.8,
    thumbnail: 'https://picsum.photos/seed/react/800/450',
    category: 'Development',
    duration: '20h 30m',
    lessonsCount: 45
  },
  {
    id: 'course-2',
    title: 'Advanced TypeScript Patterns',
    description: 'Deep dive into advanced TypeScript features for large-scale applications.',
    instructor: 'Jane Smith',
    price: 39.99,
    rating: 4.9,
    thumbnail: 'https://picsum.photos/seed/typescript/800/450',
    category: 'Development',
    duration: '15h 45m',
    lessonsCount: 32
  },
  {
    id: 'course-3',
    title: 'UI/UX Design Fundamentals',
    description: 'Learn the core principles of design and how to build beautiful interfaces.',
    instructor: 'Alice Johnson',
    price: 29.99,
    rating: 4.7,
    thumbnail: 'https://picsum.photos/seed/design/800/450',
    category: 'Design',
    duration: '12h 20m',
    lessonsCount: 28
  },
  {
    id: 'course-4',
    title: 'Modern CSS with Tailwind',
    description: 'Build responsive, beautiful websites quickly with Tailwind CSS.',
    instructor: 'Bob Wilson',
    price: 0,
    rating: 4.6,
    thumbnail: 'https://picsum.photos/seed/tailwind/800/450',
    category: 'Design',
    duration: '8h 15m',
    lessonsCount: 15
  }
];

export const DUMMY_LESSONS: Record<string, Lesson[]> = {
  'course-1': [
    {
      id: 'lesson-1-1',
      courseId: 'course-1',
      title: 'Introduction to React',
      duration: '10:00',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      isPremium: false,
      order: 1
    },
    {
      id: 'lesson-1-2',
      courseId: 'course-1',
      title: 'Setting up the Environment',
      duration: '15:00',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      isPremium: true,
      order: 2
    },
    {
      id: 'lesson-1-3',
      courseId: 'course-1',
      title: 'Understanding JSX',
      duration: '20:00',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      isPremium: true,
      order: 3
    }
  ],
  'course-2': [
    {
      id: 'lesson-2-1',
      courseId: 'course-2',
      title: 'Generics in TypeScript',
      duration: '12:00',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      isPremium: false,
      order: 1
    }
  ]
};
