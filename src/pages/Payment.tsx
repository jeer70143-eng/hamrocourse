import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, arrayUnion, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Course } from '../types';
import { DUMMY_COURSES } from '../constants';
import { formatPrice, cn } from '../lib/utils';
import { CreditCard, ShieldCheck, Lock, ArrowRight, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Payment: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      setLoading(true);
      try {
        let courseDoc;
        try {
          courseDoc = await getDoc(doc(db, 'courses', courseId));
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `courses/${courseId}`);
        }

        if (courseDoc && courseDoc.exists()) {
          setCourse({ id: courseDoc.id, ...courseDoc.data() } as Course);
        } else {
          setCourse(DUMMY_COURSES.find(c => c.id === courseId) || null);
        }
      } catch (err) {
        console.error('Error fetching course:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !course) return;

    setProcessing(true);
    setError('');

    // Simulate payment processing
    setTimeout(async () => {
      try {
        // 1. Create purchase record
        const purchaseId = `purchase-${Date.now()}`;
        try {
          await setDoc(doc(db, 'purchases', purchaseId), {
            id: purchaseId,
            userId: user.uid,
            courseId: course.id,
            amount: course.price,
            status: 'completed',
            createdAt: serverTimestamp()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `purchases/${purchaseId}`);
        }

        // 2. Update user's purchased courses
        const userDocRef = doc(db, 'users', user.uid);
        try {
          await updateDoc(userDocRef, {
            purchasedCourses: arrayUnion(course.id)
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
        }

        setSuccess(true);
        setProcessing(false);
        
        // Redirect after 2 seconds
        setTimeout(() => {
          navigate(`/dashboard`);
        }, 2000);
      } catch (err: any) {
        setError(err.message || 'Payment failed. Please try again.');
        setProcessing(false);
      }
    }, 2000);
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to={`/course/${course.id}`} className="inline-flex items-center space-x-2 text-gray-500 hover:text-blue-600 font-bold mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Course</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h2 className="text-2xl font-black text-gray-900 mb-6 tracking-tight">Order Summary</h2>
              <div className="flex items-center space-x-4 mb-8">
                <div className="w-24 aspect-video rounded-xl overflow-hidden shadow-md">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-gray-900 leading-tight">{course.title}</h3>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">{course.instructor}</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Course Price</span>
                  <span>{formatPrice(course.price)}</span>
                </div>
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Tax (0%)</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-xl font-black text-gray-900 pt-4 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-blue-600">{formatPrice(course.price)}</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 flex items-start space-x-4">
              <ShieldCheck className="h-6 w-6 text-blue-600 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-blue-900 text-sm">Secure Checkout</h4>
                <p className="text-blue-700 text-xs font-medium leading-relaxed mt-1">
                  Your payment information is encrypted and processed securely. We never store your card details.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Payment Successful!</h3>
                    <p className="text-gray-500 font-medium mb-8">Redirecting you to your dashboard...</p>
                    <div className="animate-pulse text-blue-600 font-bold">Please wait...</div>
                  </motion.div>
                ) : (
                  <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Payment Details</h2>
                    
                    {error && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-600 text-sm">
                        <AlertCircle className="h-5 w-5 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}

                    <form onSubmit={handlePayment} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Cardholder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700 ml-1">Card Number</label>
                        <div className="relative">
                          <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                          <input
                            type="text"
                            required
                            placeholder="0000 0000 0000 0000"
                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 ml-1">Expiry Date</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700 ml-1">CVV</label>
                          <input
                            type="text"
                            required
                            placeholder="123"
                            className="w-full px-4 py-3.5 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                          />
                        </div>
                      </div>

                      <div className="pt-4">
                        <button
                          type="submit"
                          disabled={processing}
                          className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                          ) : (
                            <>
                              <Lock className="h-5 w-5" />
                              <span>Pay {formatPrice(course.price)}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    <div className="mt-8 flex items-center justify-center space-x-6 grayscale opacity-50">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
