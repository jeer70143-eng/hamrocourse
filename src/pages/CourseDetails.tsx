import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Course, Lesson } from '../types';
import { DUMMY_COURSES, DUMMY_LESSONS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { formatPrice, cn } from '../lib/utils';
import { Star, Clock, BookOpen, Play, Lock, CheckCircle, ArrowLeft, User, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const CourseDetails: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        // Fetch course
        let courseDoc;
        try {
          courseDoc = await getDoc(doc(db, 'courses', courseId));
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `courses/${courseId}`);
        }

        if (courseDoc && courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
        } else {
          // Fallback to dummy
          const dummyCourse = DUMMY_COURSES.find(c => c.id === courseId);
          if (dummyCourse) setCourse(dummyCourse);
        }

        // Fetch lessons
        const lessonsRef = collection(db, 'courses', courseId, 'lessons');
        const q = query(lessonsRef, orderBy('order', 'asc'));
        let lessonsSnap;
        try {
          lessonsSnap = await getDocs(q);
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, `courses/${courseId}/lessons`);
        }

        const fetchedLessons = lessonsSnap ? lessonsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Lesson[] : [];

        if (fetchedLessons.length > 0) {
          setLessons(fetchedLessons);
        } else {
          // Fallback to dummy
          setLessons(DUMMY_LESSONS[courseId] || []);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
        <Link to="/" className="text-blue-600 font-bold hover:underline">Back to Home</Link>
      </div>
    );
  }

  const isPurchased = user?.purchasedCourses?.includes(course.id) || course.price === 0;

  const handleAction = () => {
    if (isPurchased) {
      navigate(`/watch/${course.id}/${lessons[0]?.id}`);
    } else {
      navigate(`/payment/${course.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Header */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center space-x-2 text-gray-500 hover:text-blue-600 font-bold mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Courses</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                <ShieldCheck className="h-3 w-3" />
                <span>Certified Course</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {course.description}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 mb-10">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">Instructor</div>
                    <div className="text-sm font-bold text-gray-900">{course.instructor}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">Rating</div>
                    <div className="text-sm font-bold text-gray-900">{course.rating} / 5.0</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 font-bold uppercase">Duration</div>
                    <div className="text-sm font-bold text-gray-900">{course.duration}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={handleAction}
                  className={cn(
                    "w-full sm:w-auto px-10 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center space-x-2",
                    isPurchased 
                      ? "bg-green-600 text-white hover:bg-green-700 shadow-green-100" 
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-100"
                  )}
                >
                  {isPurchased ? (
                    <>
                      <Play className="h-5 w-5 fill-current" />
                      <span>Watch Now</span>
                    </>
                  ) : (
                    <>
                      <span>Buy Now - {formatPrice(course.price)}</span>
                    </>
                  )}
                </button>
                <button className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">
                  Add to Wishlist
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl shadow-gray-200"
            >
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center group cursor-pointer">
                <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                  <Play className="h-8 w-8 text-blue-600 fill-current ml-1" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Curriculum */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Course Curriculum</h2>
            <div className="space-y-4">
              {lessons.map((lesson, i) => (
                <div
                  key={lesson.id}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-2xl border transition-all",
                    isPurchased || !lesson.isPremium
                      ? "bg-white border-gray-100 hover:border-blue-200 cursor-pointer"
                      : "bg-gray-50 border-gray-100 opacity-75"
                  )}
                  onClick={() => {
                    if (isPurchased || !lesson.isPremium) {
                      navigate(`/watch/${course.id}/${lesson.id}`);
                    }
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-sm font-bold text-gray-400">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{lesson.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-gray-400 font-bold uppercase mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {lesson.isPremium && !isPurchased ? (
                      <div className="bg-gray-200 p-2 rounded-lg">
                        <Lock className="h-4 w-4 text-gray-500" />
                      </div>
                    ) : (
                      <div className="bg-blue-50 p-2 rounded-lg">
                        <Play className="h-4 w-4 text-blue-600 fill-current" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">What you'll learn</h3>
              <ul className="space-y-4">
                {[
                  'Comprehensive understanding of core concepts',
                  'Hands-on projects and real-world examples',
                  'Best practices and industry standards',
                  'Expert tips and tricks for efficiency',
                  'Lifetime access to course materials'
                ].map((item, i) => (
                  <li key={i} className="flex items-start space-x-3 text-sm text-gray-600">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-xl shadow-blue-100">
              <h3 className="text-xl font-black mb-4 tracking-tight">Ready to start?</h3>
              <p className="text-blue-100 mb-8 text-sm font-medium leading-relaxed">
                Join thousands of students and start your journey today. Get instant access to all lessons and materials.
              </p>
              <button
                onClick={handleAction}
                className="w-full bg-white text-blue-600 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-lg"
              >
                {isPurchased ? 'Start Learning' : 'Enroll Now'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
