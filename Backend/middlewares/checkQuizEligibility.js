const Result = require('../models/Result');

async function checkQuizEligibility(req, res, next) {
     try {
    const quizId = req.params.id;
    const userId = req.user._id;

    // Find the last attempt for this user and quiz
    const lastAttempt = await Result.findOne({
      userId: userId,
      quizId: quizId
    }).sort({ completedAt: -1 });

    if (lastAttempt) {
      const now = new Date();
      const lastAttemptDate = new Date(lastAttempt.completedAt);
      const daysSinceLastAttempt = Math.floor((now - lastAttemptDate) / (1000 * 60 * 60 * 24));//convert millisec to days

      if (daysSinceLastAttempt < 7) {
        const nextAttemptDate = new Date(lastAttemptDate);
        nextAttemptDate.setDate(nextAttemptDate.getDate() + 7);
        
        return res.status(403).json({
          success: false,
          message: 'You can only take this quiz once every 7 days',
          canRetakeAt: nextAttemptDate,
          daysRemaining: 7 - daysSinceLastAttempt
        });
      }
    }

    next();
    } catch (error) {
    console.error('Error checking quiz eligibility:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking quiz eligibility'
    });
  }

}
module.exports = { checkQuizEligibility };