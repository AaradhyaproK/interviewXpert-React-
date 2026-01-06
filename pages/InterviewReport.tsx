import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { jsPDF } from 'jspdf';

const InterviewReport: React.FC = () => {
  const { interviewId } = useParams();
  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterview = async () => {
      if (!interviewId) return;
      try {
        const docRef = doc(db, 'interviews', interviewId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setInterview({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [interviewId]);

  const downloadPDF = () => {
    if (!interview) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text('Interview Report', 20, 20);
    
    doc.setFontSize(16);
    doc.text(`Job: ${interview.jobTitle}`, 20, 35);
    doc.text(`Date: ${interview.submittedAt?.toDate().toLocaleDateString()}`, 20, 45);
    
    doc.setFontSize(14);
    doc.text(`Overall Score: ${interview.score}%`, 20, 60);
    doc.text(`Resume Match: ${interview.resumeScore}%`, 20, 70);
    doc.text(`Q&A Score: ${interview.qnaScore}%`, 20, 80);
    
    doc.save(`report-${interview.jobTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
  };

  if (loading) return <div className="text-center py-20 dark:text-slate-400">Loading report...</div>;
  if (!interview) return <div className="text-center py-20 dark:text-slate-400">Report not found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors duration-300 px-4 sm:px-6 py-8">
      <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/candidate/interviews" className="inline-flex items-center text-sm text-gray-500 dark:text-slate-400 hover:text-primary mb-2 transition-colors">
            <i className="fas fa-arrow-left mr-2"></i> Back to History
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{interview.jobTitle}</h1>
          <p className="text-gray-500 dark:text-slate-400 mt-1">
            Interviewed on {interview.submittedAt?.toDate().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button 
          onClick={downloadPDF}
          className="inline-flex items-center justify-center px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-semibold shadow-lg shadow-primary/30 transition-all transform hover:-translate-y-0.5"
        >
          <i className="fas fa-download mr-2"></i> Download PDF
        </button>
      </div>

      {/* Score Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Overall Score */}
        <div className="bg-white dark:bg-black/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <i className="fas fa-trophy text-8xl text-blue-500"></i>
          </div>
          <h3 className="text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-sm mb-4">Overall Score</h3>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100 dark:text-slate-800" />
              <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={`${(parseInt(interview.score) / 100) * 351} 351`} className="text-blue-500" strokeLinecap="round" />
            </svg>
            <span className="absolute text-3xl font-bold text-gray-900 dark:text-white">{interview.score}%</span>
          </div>
          <div className="mt-4 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs font-bold">
            {parseInt(interview.score) >= 70 ? 'Excellent' : parseInt(interview.score) >= 40 ? 'Good' : 'Needs Improvement'}
          </div>
        </div>

        {/* Resume Score */}
        <div className="bg-white dark:bg-black/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <i className="fas fa-file-alt text-8xl text-purple-500"></i>
          </div>
          <h3 className="text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-sm mb-2">Resume Match</h3>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{interview.resumeScore}%</div>
          <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-3 mb-2">
            <div className="bg-purple-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${interview.resumeScore}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">ATS Compatibility Score</p>
        </div>

        {/* Q&A Score */}
        <div className="bg-white dark:bg-black/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <i className="fas fa-comments text-8xl text-orange-500"></i>
          </div>
          <h3 className="text-gray-500 dark:text-slate-400 font-medium uppercase tracking-wider text-sm mb-2">Q&A Performance</h3>
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-4">{interview.qnaScore}%</div>
          <div className="w-full bg-gray-100 dark:bg-slate-800 rounded-full h-3 mb-2">
            <div className="bg-orange-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${interview.qnaScore}%` }}></div>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">Technical & Behavioral</p>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strengths */}
        <div className="bg-white dark:bg-black/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
              <i className="fas fa-check"></i>
            </div>
            Key Strengths
          </h3>
          <ul className="space-y-4">
            {(interview.strengths || ['Strong communication skills', 'Good technical foundation', 'Relevant project experience']).map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-slate-300">
                <i className="fas fa-check-circle text-green-500 mt-1"></i>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas for Improvement */}
        <div className="bg-white dark:bg-black/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <i className="fas fa-chart-line"></i>
            </div>
            Areas for Improvement
          </h3>
          <ul className="space-y-4">
            {(interview.weaknesses || ['Elaborate more on system design', 'Use more specific metrics in answers', 'Improve pacing of speech']).map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-slate-300">
                <i className="fas fa-arrow-up text-orange-500 mt-1"></i>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* AI Feedback Summary */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-black/80 dark:to-slate-900/80 backdrop-blur-sm p-8 rounded-2xl border border-blue-100 dark:border-slate-700">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <i className="fas fa-robot text-blue-600 dark:text-blue-400"></i> AI Feedback Summary
          </h3>
          <p className="text-gray-700 dark:text-slate-300 leading-relaxed">
            {interview.feedback || "The candidate demonstrated a solid understanding of the core concepts. Their resume is well-structured but could benefit from more quantifiable achievements. During the Q&A, they answered technical questions confidently but hesitated slightly on behavioral scenarios. Overall, a strong candidate with potential for growth in this role."}
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default InterviewReport;