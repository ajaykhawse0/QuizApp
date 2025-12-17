const User = require('../models/User');
const Quiz = require('../models/Quiz');
const Result = require('../models/Result');
const Contest = require('../models/Contest');
const { invalidateCache } = require("../config/redis");


async function handleSubmitQuiz(req,res){
    const userId = req.user._id;
    console.log(req.body);
    
    const{quizId , answers , timetaken, contestId } = req.body;
        
        
    try{
        if(!quizId || !answers){
            return res.status(400).json({message:"Quiz ID and answers are required"});
        }

        const quiz = await Quiz.findById(quizId);
        if(!quiz){
            return res.status(404).json({message:"Quiz not found"});
        }
        let score = 0;
        let total = quiz.questions.length;
         for(let i=0;i<total;i++){
            let question = quiz.questions[i];
            let userAnswer = answers[i];

            if(userAnswer === question.correctAnswer){
                score++;
            }

         }

         const percentage = (score/total)*100;
         
         const nextAttemptDate = new Date();
    nextAttemptDate.setDate(nextAttemptDate.getDate() + 7);

         const result = new Result({
            userId,
            quizId,
            contestId: contestId || null,
            score,
            total,
            timeTaken:timetaken,
            completedAt: new Date(),
            nextAttemptAllowedAt: nextAttemptDate,
            percentage,
            correctAnswers: answers 
         });
         await result.save();

        // If this is a contest submission, update contest participant data
         if (contestId) {
            const contest = await Contest.findById(contestId);
            if (contest) {
                const participantIndex = contest.participants.findIndex(
                    p => p.user.toString() === userId.toString()
                );
                
                if (participantIndex !== -1) {
                    contest.participants[participantIndex].hasCompleted = true;
                    contest.participants[participantIndex].score = score;
                    contest.participants[participantIndex].completedAt = new Date();
                    await contest.save();
                }
            }
         }

        
            const user = await User.findById(userId);
            user.progress.push({
                quizId,
                score,
                total,
                timeTaken:timetaken,
            });
            await user.save();
         
         // Invalidate relevant caches
         await invalidateCache('cache:/api/result*');
         await invalidateCache('cache:/api/contests*'); // If contest result
         
         
         return res.status(200).json({
            message:"Quiz submitted successfully",
            result:{
                id: result._id,
                score: result.score,
                total: result.total,
                percentage: result.percentage,
                timeTaken: result.timeTaken,
                correctAnswers: result.correctAnswers,
            }
         });
    }

    catch(err){
        console.error("Error submitting quiz:", err);
        return res.status(500).json({message:"Server Error"});
    }
}

async function handleGetResultsByUser(req,res){
    const userId = req.user._id;
    const highest = req.query.highest === 'true';
   
    
    try{
        const results = await Result.find({userId});
        results.sort((a,b) => b.score - a.score);
        
        if(highest){
            const topResult = results[0];
            return res.status(200).json({
                result:{
                    quizTitle: (await Quiz.findById(topResult.quizId)).title,
                    score: topResult.score,
                    total: topResult.total,
                    percentage: topResult.percentage,
                    timeTaken: topResult.timeTaken,
                    submittedAt: topResult.submittedAt,
                }
            });
        }
        
        


    // Get all unique quiz IDs
const quizIds = results.map(r => r.quizId);
// Fetch all quizzes at once
const quizzes = await Quiz.find({_id: {$in: quizIds}});
const quizMap = Object.fromEntries(quizzes.map(q => [q._id.toString(), q.title]));

// Then map without async
const resultList = results.map(result => ({
    id: result._id,
    quizTitle: quizMap[result.quizId.toString()],
    score: result.score,
    total: result.total,
    percentage: result.percentage,
    timeTaken: result.timeTaken,
    submittedAt: result.submittedAt,
}));



        return res.status(200).json({resultList});
    }
    catch(err){
        console.error("Error fetching results:", err);
        return res.status(500).json({message:"Server Error"});
    }
} 

async function leaderboard(req,res){
    const quizId = req.params.quizId;

    try{
        const results = await Result.find({quizId});
      
        
        results.sort((a,b) => a.score===b.score?a.timeTaken-b.timeTaken:b.score-a.score);
        

        const topResults = results.slice(0,10);
        const leaderboard = await Promise.all(
            topResults.map(async(result)=>{
                const user = await User.findById(result.userId);
                return{
                    username: user.name,
                    score: result.score,
                    total: result.total,
                    percentage: result.percentage,
                    timeTaken: result.timeTaken,
                };
            }));

        return res.status(200).json({leaderboard});
    }
    catch(err){
        console.error("Error fetching leaderboard:", err);  
        return res.status(500).json({message:"Server Error"});
    }
} 
// Get result by ID
async function handleGetResultById(req, res) {
    const resultId = req.params.id;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    try {
        // Validate ObjectId format
        if (!resultId || !resultId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid result ID format" });
        }

        const result = await Result.findById(resultId)
            .populate('userId', 'name email')
            .populate('quizId', 'title questions');

        if (!result) {
            return res.status(404).json({ message: "Result not found" });
        }

        // Only allow user to see their own results or admin to see all
        if (!isAdmin && result.userId._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }
        console.log(result);
        

        // Get detailed question breakdown
        const quiz = await Quiz.findById(result.quizId._id);
        const questionBreakdown = quiz.questions.map((question, index) => ({
            questionNumber: index + 1,
            question: question.question,
            options: question.options,
            correctAnswer: question.correctAnswer,
            userAnswer: result.correctAnswers[index] !== undefined ? result.correctAnswers[index] : null,
            isCorrect: result.correctAnswers[index] === question.correctAnswer,
            explanation: question.explanation || null
        }));

        return res.status(200).json({
            result: {
                id: result._id,
                userId: {
                    id: result.userId._id,
                    name: result.userId.name,
                    email: result.userId.email
                },
                quiz: {
                    id: result.quizId._id,
                    title: result.quizId.title
                },
                score: result.score,
                total: result.total,
                lasttakenat: result.completedAt,
                percentage: result.percentage,
                timeTaken: result.timeTaken,
                submittedAt: result.submittedAt,
                questionBreakdown
            }
        });
    } catch (err) {
        console.error("Error fetching result:", err);
        return res.status(500).json({ message: "Server Error" });
    }
}

// Get all results (admin only)
async function handleGetAllResults(req, res) {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

  
        const filter = {};
        if (req.query.quizId) filter.quizId = req.query.quizId;
        if (req.query.userId) filter.userId = req.query.userId;

        // Sorting
        let sortOption = { submittedAt: -1 }; // newest first by default
        if (req.query.sort === 'score') sortOption = { score: -1 };
        if (req.query.sort === '-score') sortOption = { score: 1 };
        if (req.query.sort === 'time') sortOption = { timeTaken: 1 };

        const [results, totalResults] = await Promise.all([
            Result.find(filter)
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name email')
                .populate('quizId', 'title'),
            Result.countDocuments(filter)
        ]);

        const resultList = results.map(result => ({
            id: result._id,
            user: {
                id: result.userId._id,
                name: result.userId.name,
                email: result.userId.email
            },
            quiz: {
                id: result.quizId._id,
                title: result.quizId.title
            },
            score: result.score,
            total: result.total,
            percentage: result.percentage,
            timeTaken: result.timeTaken,
            submittedAt: result.submittedAt
        }));

        return res.status(200).json({
            totalResults,
            currentPage: page,
            totalPages: Math.ceil(totalResults / limit),
            results: resultList
        });
    } catch (err) {
        console.error("Error fetching all results:", err);
        return res.status(500).json({ message: "Server Error" });
    }
}

// Get results by quiz ID
async function handleGetResultsByQuiz(req, res) {
    const quizId = req.params.quizId;

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        let sortOption = { score: -1, timeTaken: 1 }; 
        if (req.query.sort === 'time') sortOption = { timeTaken: 1 };
        if (req.query.sort === 'date') sortOption = { submittedAt: -1 };

        const [results, totalResults] = await Promise.all([
            Result.find({ quizId })
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .populate('userId', 'name email'),
            Result.countDocuments({ quizId })//totalResults
        ]);

        const resultList = results.map((result, index) => ({
            rank: skip + index + 1,
            user: {
                id: result.userId._id,
                name: result.userId.name,
                email: result.userId.email
            },
            score: result.score,
            total: result.total,
            percentage: result.percentage,
            timeTaken: result.timeTaken,
            submittedAt: result.submittedAt
        }));

        return res.status(200).json({
            quiz: {
                id: quiz._id,
                title: quiz.title
            },
            totalResults,
            currentPage: page,
            totalPages: Math.ceil(totalResults / limit),
            results: resultList
        });
    } catch (err) {
        console.error("Error fetching results by quiz:", err);
        return res.status(500).json({ message: "Server Error" });
    }
}

// Delete result
async function handleDeleteResult(req, res) {
    const resultId = req.params.id;
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';

    try {
        const result = await Result.findById(resultId);
        if (!result) {
            return res.status(404).json({ message: "Result not found" });
        }

        // Only allow user to delete their own results or admin to delete any
        if (!isAdmin && result.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Access denied" });
        }

        // Remove from user's progress
        const user = await User.findById(result.userId);
        if (user) {
            user.progress = user.progress.filter(
                p => p.quizId.toString() !== result.quizId.toString() ||
                     p.date.getTime() !== result.submittedAt.getTime()
            );
            await user.save();
        }

        await Result.findByIdAndDelete(resultId);

        // Invalidate result caches
        await invalidateCache('cache:/api/result*');

        return res.status(200).json({ message: "Result deleted successfully" });
    } catch (err) {
        console.error("Error deleting result:", err);
        return res.status(500).json({ message: "Server Error" });
    }
}

// Get quiz statistics
async function handleGetQuizStatistics(req, res) {
    const quizId = req.params.quizId;

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        const results = await Result.find({ quizId });

        if (results.length === 0) {
            return res.status(200).json({
                quiz: {
                    id: quiz._id,
                    title: quiz.title
                },
                totalAttempts: 0,
                message: "No attempts yet"
            });
        }

        // Calculate statistics
        const totalAttempts = results.length;
        const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalAttempts;
        const averagePercentage = results.reduce((sum, r) => sum + r.percentage, 0) / totalAttempts;
        const averageTime = results.reduce((sum, r) => sum + r.timeTaken, 0) / totalAttempts;
        const highestScore = Math.max(...results.map(r => r.score));
        const lowestScore = Math.min(...results.map(r => r.score));

        // Score distribution
        const scoreDistribution = {
            excellent: results.filter(r => r.percentage >= 90).length,
            good: results.filter(r => r.percentage >= 70 && r.percentage < 90).length,
            average: results.filter(r => r.percentage >= 50 && r.percentage < 70).length,
            poor: results.filter(r => r.percentage < 50).length
        };

        // Question-wise analysis
        const questionStats = quiz.questions.map((question, index) => {
            const correctCount = results.filter(result => {
                return result.correctAnswers[index] === question.correctAnswer;
            }).length;
            return {
                questionNumber: index + 1,
                question: question.question,
                correctAttempts: correctCount,
                totalAttempts: totalAttempts,
                accuracy: ((correctCount / totalAttempts) * 100).toFixed(2)
            };
        });
  
        return res.status(200).json({
            quiz: {
                id: quiz._id,
                title: quiz.title,
                totalQuestions: quiz.questions.length
            },
            statistics: {
                totalAttempts,
                averageScore: averageScore.toFixed(2),
                averagePercentage: averagePercentage.toFixed(2),
                averageTime: averageTime.toFixed(2),
                highestScore,
                lowestScore,
                scoreDistribution,
                questionStats
            }
        });
    } catch (err) {
        console.error("Error fetching quiz statistics:", err);
        return res.status(500).json({ message: "Server Error" });
    }
}

// Get user statistics
// Get user statistics
async function handleGetUserStatistics(req, res) {
  
    const userId = req.user._id;

    try {
        const results = await Result.find({ userId })
            .populate('quizId', 'title');

        if (results.length === 0) {
            return res.status(200).json({
                totalQuizzes: 0,
                message: "No quiz attempts yet"
            });
        }

        const totalQuizzes = results.length;
        const averageScore = results.reduce((sum, r) => sum + r.score, 0) / totalQuizzes;
        const averagePercentage = results.reduce((sum, r) => sum + r.percentage, 0) / totalQuizzes;
        const totalTimeSpent = results.reduce((sum, r) => sum + r.timeTaken, 0);
        const bestScore = Math.max(...results.map(r => r.percentage));
        const bestResult = results.find(r => r.percentage === bestScore);

        // Get quiz titles attempted
        //Filter out results where quizId is null (deleted) before mapping
        const quizzesAttempted = [...new Set(
            results
                .filter(r => r.quizId) // Only include results that have a valid quiz
                .map(r => r.quizId.title)
        )];
        if(!quizzesAttempted){
            console.log("No quizzes attempted found for user:", userId);
        }

        return res.status(200).json({
            statistics: {
                totalQuizzes,
                averageScore: averageScore.toFixed(2),
                averagePercentage: averagePercentage.toFixed(2),
                totalTimeSpent: totalTimeSpent.toFixed(2),
                bestScore: bestScore.toFixed(2),
                bestQuiz: bestResult ? {
                    //  Check if bestResult.quizId exists 


                    title: bestResult.quizId ? bestResult.quizId.title : 'Deleted Quiz',
                    score: bestResult.score,
                    total: bestResult.total,
                    percentage: bestResult.percentage
                } : null,
                quizzesAttempted: quizzesAttempted.length
            },
            recentAttempts: results
                .sort((a, b) => b.submittedAt - a.submittedAt)
                .slice(0, 5)
                .map(r => ({
                    // Check if r.quizId exists 

                    quizTitle: r.quizId ? r.quizId.title : 'Deleted Quiz',
                    score: r.score,
                    total: r.total,
                    percentage: r.percentage,
                    submittedAt: r.submittedAt
                }))
        });
    } catch (err) {
        console.error("Error fetching user statistics:", err);
        return res.status(500).json({ message: "Server Error" });
    }
}

module.exports = {
    handleSubmitQuiz,
    handleGetResultsByUser,
    leaderboard,
    handleGetResultById,
    handleGetAllResults,
    handleGetResultsByQuiz,
    handleDeleteResult,
    handleGetQuizStatistics,
    handleGetUserStatistics
};