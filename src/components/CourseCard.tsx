import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, BookOpen, User } from 'lucide-react';
import { Course } from '../types';
import { formatPrice, cn } from '../lib/utils';
import { motion } from 'motion/react';

interface CourseCardProps {
  course: Course;
  isPurchased?: boolean;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, isPurchased = false }) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all group"
    >
      <Link to={`/course/${course.id}`}>
        <div className="relative aspect-video overflow-hidden">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-blue-600 uppercase tracking-wider">
            {course.category}
          </div>
        </div>
        <div className="p-5">
          <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>{course.instructor}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{course.duration}</span>
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-bold text-gray-700">{course.rating}</span>
            </div>
            <div className="text-lg font-black text-blue-600">
              {isPurchased ? (
                <span className="text-green-600 text-sm font-bold flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>Purchased</span>
                </span>
              ) : (
                formatPrice(course.price)
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
