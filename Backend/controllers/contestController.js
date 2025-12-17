const Contest = require("../models/Contest.js");
const Quiz = require("../models/Quiz");
const Result = require("../models/Result");
const mongoose = require("mongoose");
const { invalidateCache } = require("../config/redis");

// Create a new contest
async function handleCreateContest(req, res) {
  try {
    const { title, description, quizId, startTime, endTime, maxParticipants, prizeInfo } = req.body;

    // Validation
    if (!title || !quizId || !startTime || !endTime) {
      return res.status(400).json({
        message: "Title, quiz, start time, and end time are required",
      });
    }

    // Validate quiz exists
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Validate time logic
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (start >= end) {
      return res.status(400).json({
        message: "End time must be after start time",
      });
    }

    const contest = new Contest({
      title,
      description,
      quiz: quizId,
      startTime: start,
      endTime: end,
      maxParticipants: maxParticipants || null,
      prizeInfo: prizeInfo || {},
      createdBy: req.user._id,
    });

    await contest.save();

    // Invalidate contest caches
    await invalidateCache('cache:/api/contests*');

    return res.status(201).json({
      message: "Contest created successfully",
      contest: {
        id: contest._id,
        title: contest.title,
        startTime: contest.startTime,
        endTime: contest.endTime,
        status: contest.status,
      },
    });
  } catch (err) {
    console.error("Error creating contest:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get all contests with filters
async function handleGetAllContests(req, res) {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Update contest statuses
    await Contest.updateAllStatuses();

    const filter = { isPublished: true };
    if (status) filter.status = status;

    const [contests, totalContests] = await Promise.all([
      Contest.find(filter)
        .populate("quiz", "title difficulty questionCount")
        .populate("createdBy", "name")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ startTime: status === "completed" ? -1 : 1 }),
      Contest.countDocuments(filter),
    ]);

    const contestList = contests.map((contest) => ({
      id: contest._id,
      title: contest.title,
      description: contest.description,
      quiz: contest.quiz,
      startTime: contest.startTime,
      endTime: contest.endTime,
      status: contest.status,
      participantCount: contest.participantCount,
      maxParticipants: contest.maxParticipants,
      isFull: contest.isFull(),
      prizeInfo: contest.prizeInfo,
      createdBy: contest.createdBy?.name || "Admin",
    }));

    return res.status(200).json({
      contests: contestList,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalContests / limit),
      totalContests,
    });
  } catch (err) {
    console.error("Error fetching contests:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get contest by ID
async function handleGetContestById(req, res) {

  
  try {
    const { id } = req.params;

    
    const userId = req.user._id;

    const contest = await Contest.findById(id)
      .populate("quiz", "title difficulty questions timeLimit")
      .populate("createdBy", "name")
      .populate("participants.user", "name profilePicture");

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // Update status
    contest.updateStatus();
    await contest.save();

    const hasJoined = contest.hasUserJoined(userId);
    const userParticipant = contest.participants.find(
      (p) => p.user._id.toString() === userId.toString()
    );

    return res.status(200).json({
      contest: {
        id: contest._id,
        title: contest.title,
        description: contest.description,
        quiz: contest.quiz,
        startTime: contest.startTime,
        endTime: contest.endTime,
        status: contest.status,
        participantCount: contest.participantCount,
        maxParticipants: contest.maxParticipants,
        isFull: contest.isFull(),
        prizeInfo: contest.prizeInfo,
        hasJoined,
        hasCompleted: userParticipant?.hasCompleted || false,
        createdBy: contest.createdBy?.name || "Admin",
      },
    });
  } catch (err) {
    console.error("Error fetching contest:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Join a contest
async function handleJoinContest(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    
    contest.updateStatus();

    // Check if contest is live or upcoming
    if (contest.status === "completed") {
      return res.status(400).json({ message: "Contest has ended" });
    }

    // Check if already joined
    if (contest.hasUserJoined(userId)) {
      return res.status(400).json({ message: "Already joined this contest" });
    }

    // Check if full
    if (contest.isFull()) {
      return res.status(400).json({ message: "Contest is full" });
    }

    // Add participant
    contest.participants.push({
      user: userId,
      joinedAt: new Date(),
    });

    await contest.save();

    // Invalidate contest caches (list, specific contest, leaderboard, my-contests)
    await invalidateCache('cache:/api/contests*');

    return res.status(200).json({
      message: "Successfully joined contest",
      contest: {
        id: contest._id,
        title: contest.title,
        participantCount: contest.participantCount,
      },
    });
  } catch (err) {
    console.error("Error joining contest:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get contest leaderboard
async function handleGetContestLeaderboard(req, res) {
  try {
    const { id } = req.params;

    const contest = await Contest.findById(id).populate(
      "participants.user",
      "name profilePicture"
    );

    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // Sort participants by score (desc) and completion time (asc)
    const leaderboard = contest.participants
      .filter((p) => p.hasCompleted)
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return new Date(a.completedAt) - new Date(b.completedAt);
      })
      .map((p, index) => ({
        rank: index + 1,
        user: {
          id: p.user._id,
          name: p.user.name,
          profilePicture: p.user.profilePicture,
        },
        score: p.score,
        completedAt: p.completedAt,
        joinedAt: p.joinedAt,
      }));

    return res.status(200).json({
      contest: {
        id: contest._id,
        title: contest.title,
        status: contest.status,
        totalParticipants: contest.participantCount,
        completedParticipants: leaderboard.length,
      },
      leaderboard,
    });
  } catch (err) {
    console.error("Error fetching leaderboard:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Get user's contests
async function handleGetMyContests(req, res) {
  try {
    const userId = req.user._id;

    const contests = await Contest.find({
      "participants.user": userId,
    })
      .populate("quiz", "title difficulty")
      .sort({ startTime: -1 });

    const myContests = contests.map((contest) => {
      const participant = contest.participants.find(
        (p) => p.user.toString() === userId.toString()
      );

      return {
        id: contest._id,
        title: contest.title,
        quiz: contest.quiz,
        startTime: contest.startTime,
        endTime: contest.endTime,
        status: contest.status,
        hasCompleted: participant?.hasCompleted || false,
        score: participant?.score || 0,
        completedAt: participant?.completedAt,
      };
    });

    return res.status(200).json({ contests: myContests });
  } catch (err) {
    console.error("Error fetching user contests:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

// Update contest (Admin only)
async function handleUpdateContest(req, res) {
  try {
    const { id } = req.params;
    const { title, description, startTime, endTime, maxParticipants, prizeInfo, isPublished } = req.body;

    const contest = await Contest.findById(id);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    
    if (contest.status !== "upcoming") {
      return res.status(400).json({
        message: "Cannot update contest that has already started",
      });
    }

    if (title) contest.title = title;
    if (description !== undefined) contest.description = description;
    if (startTime) contest.startTime = new Date(startTime);
    if (endTime) contest.endTime = new Date(endTime);
    if (maxParticipants !== undefined) contest.maxParticipants = maxParticipants;
    if (prizeInfo) contest.prizeInfo = prizeInfo;
    if (typeof isPublished === "boolean") contest.isPublished = isPublished;

    await contest.save();

    // Invalidate contest caches
    await invalidateCache('cache:/api/contests*');

    return res.status(200).json({
      message: "Contest updated successfully",
      contest,
    });
  } catch (err) {
    console.error("Error updating contest:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


async function handleDeleteContest(req, res) {
  try {
    const { id } = req.params;

    const contest = await Contest.findByIdAndDelete(id);
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    // Invalidate contest caches
    await invalidateCache('cache:/api/contests*');

    return res.status(200).json({ message: "Contest deleted successfully" });
  } catch (err) {
    console.error("Error deleting contest:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = {
  handleCreateContest,
  handleGetAllContests,
  handleGetContestById,
  handleJoinContest,
  handleGetContestLeaderboard,
  handleGetMyContests,
  handleUpdateContest,
  handleDeleteContest,
};
