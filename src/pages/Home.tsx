import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowRight, Sparkles, BookOpen, Users, Trophy, Star } from 'lucide-react';
import { collection, getDocs, query, limit } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Course } from '../types';
import { DUMMY_COURSES } from '../constants';
import { CourseCard } from '../components/CourseCard';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Home: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>(DUMMY_COURSES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);

  // Fetch courses from Firestore (optional, fallback to dummy)
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'courses'), limit(10));
        let querySnapshot;
        try {
          querySnapshot = await getDocs(q);
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, 'courses');
        }

        const fetchedCourses = querySnapshot ? querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Course[] : [];
        
        if (fetchedCourses.length > 0) {
          setCourses(fetchedCourses);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const categories = ['All', 'Development', 'Design', 'Business', 'Marketing'];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredCourses = courses.slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Section */}
      <section className="relative bg-white pt-16 pb-24 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold mb-6"
            >
              <Sparkles className="h-4 w-4" />
              <span>Learn from the best in the industry</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-black text-gray-900 mb-6 tracking-tight leading-tight"
            >
              Master New Skills with <span className="text-blue-600">EduStream</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-gray-600 mb-10 leading-relaxed"
            >
              Access high-quality courses, expert instructors, and a community of learners. 
              Start your journey today and transform your career.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4"
            >
              <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                />
              </div>
              <button className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center space-x-2">
                <span>Explore Now</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </motion.div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 border-t border-gray-100 pt-12">
            {[
              { icon: BookOpen, label: 'Courses', value: '500+' },
              { icon: Users, label: 'Students', value: '10k+' },
              { icon: Trophy, label: 'Awards', value: '25+' },
              { icon: Star, label: 'Rating', value: '4.9/5' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-xl mb-3">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-black text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Featured Courses</h2>
            <p className="text-gray-500 font-medium">Handpicked courses to get you started</p>
          </div>
          <button className="text-blue-600 font-bold hover:underline flex items-center space-x-1">
            <span>View All</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <CourseCard course={course} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Course Explorer */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 space-y-4 md:space-y-0">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">All Courses</h2>
          
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                  selectedCategory === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 4) * 0.1 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
              <Search className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        )}
      </section>
    </div>
  );
};
