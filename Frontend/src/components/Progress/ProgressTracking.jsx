import { useState, useEffect } from 'react';
import { resultAPI } from '../../services/api';
import LoadingSpinner from '../Common/LoadingSpinner';
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
      const response = await resultAPI.getUserResults();
      setResults(response.data.resultList || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No progress data available yet.</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">Take some quizzes to see your progress!</p>
      </div>
    );
  }

  // Process data for charts
  const processChartData = () => {
    // Sort by date
    const sortedResults = [...results].sort((a, b) => 
      new Date(a.submittedAt) - new Date(b.submittedAt)
    );

    // Data for quizzes solved over time
    const quizzesOverTime = sortedResults.map((result, index) => ({
      attempt: index + 1,
      date: new Date(result.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: result.percentage,
      quiz: result.quizTitle?.substring(0, 15) + '...' || 'Quiz'
    }));

    // Data for score distribution
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

    // Data for performance by quiz (top 10)
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

    // Monthly progress data
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
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];

  // Calculate statistics
  const totalQuizzes = results.length;
  const avgScore = results.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes;
  const uniqueQuizzes = new Set(results.map(r => r.quizTitle)).size;
  const totalTimeSpent = results.reduce((sum, r) => sum + r.timeTaken, 0);

  return (
    <div className="pb-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Progress Tracking</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">Visualize your learning journey and performance</p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">{totalQuizzes}</div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Attempts</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-green-600 dark:text-green-400 mb-2">{avgScore.toFixed(1)}%</div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Average Score</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{uniqueQuizzes}</div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Unique Quizzes</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <div className="text-2xl md:text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {Math.floor(totalTimeSpent / 60)}m
          </div>
          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Total Time Spent</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
        {/* Score Progress Over Time */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Score Progress Over Time</h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData.quizzesOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis 
                dataKey="attempt" 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                label={{ value: 'Attempt Number', position: 'insideBottom', offset: -5, style: { fill: '#6b7280' } }}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#6b7280"
                className="dark:stroke-gray-400"
                label={{ value: 'Score (%)', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
                domain={[0, 100]}
                tick={{ fill: '#6b7280' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value) => [`${value}%`, 'Score']}
                labelFormatter={(label) => `Attempt ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#0ea5e9" 
                fill="#0ea5e9" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Score Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Score Distribution</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.scoreDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="range" stroke="#6b7280" className="dark:stroke-gray-400" tick={{ fill: '#6b7280' }} />
              <YAxis stroke="#6b7280" className="dark:stroke-gray-400" tick={{ fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value) => [`${value} quizzes`, 'Count']} 
              />
              <Bar dataKey="count" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Progress */}
      {chartData.monthlyProgress.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6 mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Monthly Progress</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.monthlyProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis dataKey="month" stroke="#6b7280" className="dark:stroke-gray-400" tick={{ fill: '#6b7280' }} />
              <YAxis stroke="#6b7280" className="dark:stroke-gray-400" tick={{ fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="quizzes" fill="#0ea5e9" name="Quizzes Taken" radius={[8, 8, 0, 0]} />
              <Bar dataKey="avgScore" fill="#10b981" name="Avg Score (%)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Performance by Quiz - Smaller */}
      {chartData.quizPerformanceData.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 md:p-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-4">Performance by Quiz (Top 10)</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart 
              data={chartData.quizPerformanceData}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
              <XAxis type="number" domain={[0, 100]} stroke="#6b7280" className="dark:stroke-gray-400" tick={{ fill: '#6b7280' }} />
              <YAxis dataKey="name" type="category" width={70} stroke="#6b7280" className="dark:stroke-gray-400" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                formatter={(value, name) => {
                  if (name === 'avgScore') return [`${value}%`, 'Average Score'];
                  if (name === 'bestScore') return [`${value}%`, 'Best Score'];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="avgScore" fill="#0ea5e9" name="Average Score (%)" radius={[0, 8, 8, 0]} />
              <Bar dataKey="bestScore" fill="#10b981" name="Best Score (%)" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ProgressTracking;
