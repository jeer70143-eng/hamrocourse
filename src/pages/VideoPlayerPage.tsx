import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, orderBy, query, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { Course, Lesson } from '../types';
import { DUMMY_COURSES, DUMMY_LESSONS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Maximize, Settings, ArrowLeft, CheckCircle, Lock, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const VideoPlayerPage: React.FC = () => {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !lessonId) return;
      setLoading(true);
      try {
        // Fetch course
        const courseDoc = await getDoc(doc(db, 'courses', courseId));
        if (courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
        } else {
          setCourse(DUMMY_COURSES.find(c => c.id === courseId) || null);
        }

        // Fetch lessons
        const lessonsRef = collection(db, 'courses', courseId, 'lessons');
        const q = query(lessonsRef, orderBy('order', 'asc'));
        const lessonsSnap = await getDocs(q);
        const fetchedLessons = lessonsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Lesson[];

        const finalLessons = fetchedLessons.length > 0 ? fetchedLessons : (DUMMY_LESSONS[courseId] || []);
        setLessons(finalLessons);
        
        const lesson = finalLessons.find(l => l.id === lessonId);
        setCurrentLesson(lesson || null);

        // Security check
        const isPurchased = user?.purchasedCourses?.includes(courseId) || (course?.price === 0);
        if (lesson?.isPremium && !isPurchased) {
          navigate(`/course/${courseId}`);
        }
      } catch (error) {
        console.error('Error fetching video data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, lessonId, user]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      setCurrentTime(current);
      setProgress((current / total) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVideoEnd = async () => {
    setIsPlaying(false);
    
    // Track progress in Firestore
    if (user && courseId && lessonId) {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          [`progress.${courseId}.completedLessons`]: arrayUnion(lessonId),
          [`progress.${courseId}.lastLessonId`]: lessonId
        });
      } catch (error) {
        console.error('Error updating progress:', error);
      }
    }

    // Auto-play next lesson
    const currentIndex = lessons.findIndex(l => l.id === lessonId);
    if (currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      navigate(`/watch/${courseId}/${nextLesson.id}`);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!currentLesson || !course) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
        <h2 className="text-2xl font-bold mb-4">Lesson not found</h2>
        <Link to="/" className="text-blue-400 hover:underline">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col lg:flex-row">
      {/* Video Section */}
      <div className="flex-grow flex flex-col">
        <div className="p-4 flex items-center justify-between bg-black/20">
          <Link to={`/course/${courseId}`} className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors font-bold text-sm">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Course</span>
          </Link>
          <div className="text-sm font-bold text-gray-400">
            {course.title}
          </div>
        </div>

        <div className="relative flex-grow flex items-center justify-center bg-black group">
          <video
            ref={videoRef}
            src={currentLesson.videoUrl}
            className="w-full h-full max-h-[80vh]"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleVideoEnd}
            onClick={togglePlay}
          />

          {/* Custom Controls Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-black tracking-tight">{currentLesson.title}</h2>
              <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                <Settings className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={progress}
                  onChange={handleSeek}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div 
                  className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <button onClick={togglePlay} className="p-2 hover:scale-110 transition-transform">
                    {isPlaying ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current" />}
                  </button>
                  <div className="flex items-center space-x-4">
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <SkipBack className="h-5 w-5 fill-current" />
                    </button>
                    <button className="text-gray-400 hover:text-white transition-colors">
                      <SkipForward className="h-5 w-5 fill-current" />
                    </button>
                  </div>
                  <div className="text-sm font-bold font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-3 group/volume">
                    <button onClick={toggleMute} className="text-gray-400 hover:text-white transition-colors">
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-white/20 rounded-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    <Maximize className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-900">
          <h1 className="text-2xl font-black mb-4 tracking-tight">{currentLesson.title}</h1>
          <p className="text-gray-400 leading-relaxed max-w-4xl">
            In this lesson, we'll dive deep into the core concepts of {course.title}. 
            Make sure to follow along with the examples and practice what you learn.
          </p>
        </div>
      </div>

      {/* Playlist Sidebar */}
      <div className="w-full lg:w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-black tracking-tight flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-500" />
            <span>Course Content</span>
          </h3>
          <div className="mt-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
            {lessons.length} Lessons • {course.duration}
          </div>
        </div>

        <div className="flex-grow overflow-y-auto no-scrollbar">
          {lessons.map((lesson, i) => {
            const isCompleted = user?.progress?.[courseId]?.completedLessons?.includes(lesson.id);
            const isActive = lesson.id === lessonId;
            const isLocked = lesson.isPremium && !user?.purchasedCourses?.includes(courseId) && course.price > 0;

            return (
              <div
                key={lesson.id}
                onClick={() => !isLocked && navigate(`/watch/${courseId}/${lesson.id}`)}
                className={cn(
                  "p-4 border-b border-gray-700/50 flex items-start space-x-4 transition-all cursor-pointer",
                  isActive ? "bg-blue-600/10 border-l-4 border-l-blue-500" : "hover:bg-gray-700/50",
                  isLocked && "opacity-50 cursor-not-allowed"
                )}
              >
                <div className="flex-shrink-0 mt-1">
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : isLocked ? (
                    <Lock className="h-5 w-5 text-gray-500" />
                  ) : (
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold",
                      isActive ? "border-blue-500 text-blue-500" : "border-gray-600 text-gray-600"
                    )}>
                      {i + 1}
                    </div>
                  )}
                </div>
                <div className="flex-grow">
                  <h4 className={cn(
                    "text-sm font-bold leading-tight",
                    isActive ? "text-blue-400" : "text-gray-200"
                  )}>
                    {lesson.title}
                  </h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{lesson.duration}</span>
                    {lesson.isPremium && (
                      <span className="text-[10px] font-bold text-blue-500 uppercase bg-blue-500/10 px-1.5 rounded">Pro</span>
                    )}
                  </div>
                </div>
                {isActive && (
                  <div className="flex-shrink-0">
                    <Play className="h-4 w-4 text-blue-500 fill-current animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
