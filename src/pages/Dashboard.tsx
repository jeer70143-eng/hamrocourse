import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Course, CourseProgress } from '../types';
import { DUMMY_COURSES } from '../constants';
import { CourseCard } from '../components/CourseCard';
import { User, Mail, Shield, BookOpen, Clock, Trophy, Play, CheckCircle, ArrowRight, Settings, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      if (!user?.purchasedCourses || user.purchasedCourses.length === 0) {
        setPurchasedCourses([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const courses: Course[] = [];
        for (const courseId of user.purchasedCourses) {
          let courseDoc;
          try {
            courseDoc = await getDoc(doc(db, 'courses', courseId));
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `courses/${courseId}`);
          }

          if (courseDoc && courseDoc.exists()) {
            courses.push({ id: courseDoc.id, ...courseDoc.data() } as Course);
          } else {
            const dummy = DUMMY_COURSES.find(c => c.id === courseId);
            if (dummy) courses.push(dummy);
          }
        }
        setPurchasedCourses(courses);
      } catch (error) {
        console.error('Error fetching purchased courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchasedCourses();
  }, [user]);

  if (!user) return null;

  const calculateProgress = (courseId: string) => {
    const progress = user.progress?.[courseId];
    if (!progress) return 0;
    const course = purchasedCourses.find(c => c.id === courseId);
    if (!course?.lessonsCount) return 0;
    return Math.round((progress.completedLessons.length / course.lessonsCount) * 100);
  };

  const continueWatching = purchasedCourses.find(c => user.progress?.[c.id]?.lastLessonId);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-100 pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="w-32 h-32 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-100">
                {user.name?.[0] || user.email[0].toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-white w-8 h-8 rounded-full shadow-sm" />
            </motion.div>
            
            <div className="text-center md:text-left flex-grow">
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl font-black text-gray-900 mb-2 tracking-tight"
              >
                {user.name || 'User'}
              </motion.h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <span>{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-blue-500" />
                  <span>{user.role} Account</span>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8">
                <button className="bg-gray-50 text-gray-700 px-6 py-2.5 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center space-x-2 border border-gray-100">
                  <Settings className="h-4 w-4" />
                  <span>Edit Profile</span>
                </button>
                <button className="bg-gray-50 text-gray-700 px-6 py-2.5 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center space-x-2 border border-gray-100">
                  <CreditCard className="h-4 w-4" />
                  <span>Billing</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6 w-full md:w-auto">
              {[
                { label: 'Courses', value: user.purchasedCourses?.length || 0, icon: BookOpen },
                { label: 'Completed', value: Object.values(user.progress || {}).filter(p => p.completedLessons.length > 5).length, icon: CheckCircle },
                { label: 'Points', value: '1,250', icon: Trophy },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100"
                >
                  <stat.icon className="h-5 w-5 text-blue-600 mx-auto mb-2" />
                  <div className="text-xl font-black text-gray-900">{stat.value}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Continue Watching Section */}
        {continueWatching && (
          <section className="mb-16">
            <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight flex items-center space-x-3">
              <Play className="h-6 w-6 text-blue-600 fill-current" />
              <span>Continue Watching</span>
            </h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8"
            >
              <div className="relative w-full md:w-64 aspect-video rounded-2xl overflow-hidden shadow-lg">
                <img
                  src={continueWatching.thumbnail}
                  alt={continueWatching.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-xl">
                    <Play className="h-5 w-5 text-blue-600 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
              <div className="flex-grow text-center md:text-left">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-1">{continueWatching.category}</div>
                <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">{continueWatching.title}</h3>
                <p className="text-sm text-gray-500 font-medium mb-4">Instructor: {continueWatching.instructor}</p>
                
                <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${calculateProgress(continueWatching.id)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-400 uppercase tracking-widest">
                  <span>{calculateProgress(continueWatching.id)}% Completed</span>
                  <span>{user.progress?.[continueWatching.id]?.completedLessons.length} / {continueWatching.lessonsCount || 10} Lessons</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/watch/${continueWatching.id}/${user.progress?.[continueWatching.id]?.lastLessonId}`)}
                className="w-full md:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center space-x-2"
              >
                <span>Resume Lesson</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          </section>
        )}

        {/* My Courses Section */}
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">My Courses</h2>
              <p className="text-gray-500 font-medium">Access all your purchased content</p>
            </div>
            <Link to="/" className="text-blue-600 font-bold hover:underline text-sm flex items-center space-x-1">
              <span>Browse More</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : purchasedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {purchasedCourses.map((course, i) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="relative group"
                >
                  <CourseCard course={course} isPurchased={true} />
                  <div className="absolute bottom-20 left-5 right-5 h-1.5 bg-gray-100 rounded-full overflow-hidden pointer-events-none">
                    <div 
                      className="h-full bg-green-500 rounded-full transition-all duration-1000"
                      style={{ width: `${calculateProgress(course.id)}%` }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-8">You haven't purchased any courses yet. Start your journey today!</p>
              <Link
                to="/"
                className="inline-flex items-center space-x-2 bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                <span>Browse Courses</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
