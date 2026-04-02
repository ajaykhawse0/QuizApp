import { useState, useEffect } from 'react';
import { resultAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
import { Target, Activity, Clock, Hash, TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const ProgressTracking = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      setLoading(true);
      const response = await resultAPI.getUserResults({ page: 1, limit: 200 });
      setResults(response.data.resultList || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl shadow-sm">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-20 bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl border border-gray-100 dark:border-gray-800">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 dark:text-indigo-400 mb-6">
            <TrendingUp className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No progress data</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-0">Take some quizzes to visualize your learning journey!</p>
        </div>
      </div>
    );
  }

  // Process data for charts
  const processChartData = () => {
    const sortedResults = [...results].sort((a, b) => 
      new Date(a.submittedAt) - new Date(b.submittedAt)
    );

    const quizzesOverTime = sortedResults.map((result, index) => ({
      attempt: index + 1,
      date: new Date(result.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: result.percentage,
      quiz: result.quizTitle?.substring(0, 15) + '...' || 'Quiz'
    }));

    const scoreRanges = {
      '90-100%': 0,
      '70-89%': 0,
      '50-69%': 0,
      '0-49%': 0
    };

    results.forEach(result => {
      const percentage = result.percentage;
      if (percentage >= 90) scoreRanges['90-100%']++;
      else if (percentage >= 70) scoreRanges['70-89%']++;
      else if (percentage >= 50) scoreRanges['50-69%']++;
      else scoreRanges['0-49%']++;
    });

    const scoreDistribution = Object.entries(scoreRanges).map(([range, count]) => ({
      range,
      count
    }));

    const quizPerformance = {};
    results.forEach(result => {
      const quizName = result.quizTitle || 'Unknown Quiz';
      if (!quizPerformance[quizName]) {
        quizPerformance[quizName] = {
          name: quizName.length > 20 ? quizName.substring(0, 20) + '...' : quizName,
          attempts: 0,
          avgScore: 0,
          bestScore: 0,
          totalScore: 0
        };
      }
      quizPerformance[quizName].attempts++;
      quizPerformance[quizName].totalScore += result.percentage;
      if (result.percentage > quizPerformance[quizName].bestScore) {
        quizPerformance[quizName].bestScore = result.percentage;
      }
    });

    const quizPerformanceData = Object.values(quizPerformance)
      .map(quiz => ({
        ...quiz,
        avgScore: (quiz.totalScore / quiz.attempts).toFixed(1)
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);

    const monthlyData = {};
    results.forEach(result => {
      const date = new Date(result.submittedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthLabel,
          quizzes: 0,
          avgScore: 0,
          totalScore: 0
        };
      }
      monthlyData[monthKey].quizzes++;
      monthlyData[monthKey].totalScore += result.percentage;
    });

    const monthlyProgress = Object.values(monthlyData)
      .map(month => ({
        ...month,
        avgScore: (month.totalScore / month.quizzes).toFixed(1)
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      quizzesOverTime,
      scoreDistribution,
      quizPerformanceData,
      monthlyProgress
    };
  };

  const chartData = processChartData();

  // Statistics
  const totalQuizzes = results.length;
  const avgScore = results.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes;
  const uniqueQuizzes = new Set(results.map(r => r.quizTitle)).size;
  const totalTimeSpent = results.reduce((sum, r) => sum + r.timeTaken, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 border-b border-gray-200 dark:border-gray-800 pb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">Progress Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400">Deep dive into your learning patterns and quiz metrics over time.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between group hover:shadow-soft-xl transition-all">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Attempts</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">{totalQuizzes}</div>
          </div>
          <div className="w-14 h-14 rounded-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
            <Activity className="w-7 h-7" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between group hover:shadow-soft-xl transition-all">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Average Score</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 transition-colors">{avgScore.toFixed(1)}%</div>
          </div>
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Target className="w-7 h-7" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between group hover:shadow-soft-xl transition-all">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Unique Quizzes</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">{uniqueQuizzes}</div>
          </div>
          <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Hash className="w-7 h-7" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 flex items-center justify-between group hover:shadow-soft-xl transition-all">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Time Spent</div>
            <div className="text-4xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{Math.floor(totalTimeSpent / 60)}m</div>
          </div>
          <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Clock className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Growth Tracker */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 w-full">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Learning Curve</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.quizzesOverTime}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                <XAxis dataKey="attempt" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: 'none', color: '#fff', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`${value}%`, 'Score']}
                  labelFormatter={(label) => `Attempt ${label}`}
                />
                <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 w-full">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Score Distribution</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                <Tooltip
                  cursor={{fill: '#f3f4f6', className: 'dark:fill-gray-800'}}
                  contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: 'none', color: '#fff' }}
                  formatter={(value) => [value, 'Quizzes']}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Monthly & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {chartData.monthlyProgress.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 w-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Monthly Highlights</h2>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.monthlyProgress}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <Tooltip
                    cursor={{fill: '#f3f4f6', className: 'dark:fill-gray-800'}}
                    contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: 'none', color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px' }} />
                  <Bar dataKey="quizzes" name="Attempts" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="avgScore" name="Avg Score (%)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartData.quizPerformanceData.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-soft border border-gray-100 dark:border-gray-800 p-6 w-full overflow-hidden">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Top Categories</h2>
            <div className="h-72 w-full -ml-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={chartData.quizPerformanceData}
                  layout="vertical"
                  margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" className="dark:stroke-gray-800" />
                  <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis dataKey="name" type="category" width={90} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 11}} />
                  <Tooltip
                    cursor={{fill: '#f3f4f6', className: 'dark:fill-gray-800'}}
                    contentStyle={{ backgroundColor: '#111827', borderRadius: '12px', border: 'none', color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '15px', paddingLeft: '20px' }} />
                  <Bar dataKey="avgScore" name="Average %" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="bestScore" name="Best %" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressTracking;
