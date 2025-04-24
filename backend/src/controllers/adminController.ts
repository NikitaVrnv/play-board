// backend/src/controllers/adminController.ts
const { Game, User, Review, Company } = require('../models');

// Admin Dashboard Summary
exports.getAdminSummary = async (req, res) => {
  try {
    const [totalGames, totalUsers, totalReviews, pendingGames, pendingReviews] = await Promise.all([
      Game.countDocuments(),
      User.countDocuments(),
      Review.countDocuments(),
      Game.countDocuments({ status: 'PENDING' }),
      Review.countDocuments({ status: 'PENDING' })
    ]);

    // Get recent activities
    const recentActivities = await Promise.all([
      // Recent game submissions
      Game.find().sort({ createdAt: -1 }).limit(3).populate('createdBy', 'username'),
      // Recent reviews
      Review.find().sort({ createdAt: -1 }).limit(3).populate('user', 'username').populate('game', 'title'),
      // Recent user registrations
      User.find().sort({ createdAt: -1 }).limit(3)
    ]);

    // Format activities
    const recentActivity = [
      ...recentActivities[0].map(game => ({
        id: game._id,
        type: 'game_added',
        title: game.title,
        timestamp: game.createdAt,
        user: game.createdBy ? { id: game.createdBy._id, username: game.createdBy.username } : null
      })),
      ...recentActivities[1].map(review => ({
        id: review._id,
        type: 'review_added',
        title: `Review for ${review.game?.title || 'Unknown Game'}`,
        timestamp: review.createdAt,
        user: review.user ? { id: review.user._id, username: review.user.username } : null
      })),
      ...recentActivities[2].map(user => ({
        id: user._id,
        type: 'user_registered',
        title: `New user registration`,
        timestamp: user.createdAt,
        user: { id: user._id, username: user.username }
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

    res.json({
      totalGames,
      totalUsers,
      totalReviews,
      pendingGames,
      pendingReviews,
      recentActivity
    });
  } catch (error) {
    console.error('Error getting admin summary:', error);
    res.status(500).json({ error: 'Failed to fetch admin summary' });
  }
};

// Admin Games
exports.getAdminGames = async (req, res) => {
  try {
    const games = await Game.find()
      .populate('createdBy', 'username')
      .populate('company', 'name')
      .sort({ createdAt: -1 });

    res.json(games.map(game => ({
      id: game._id,
      title: game.title,
      description: game.description,
      genre: game.genre,
      releaseDate: game.releaseDate,
      coverImage: game.coverImage,
      status: game.status || 'PENDING',
      averageRating: game.averageRating,
      reviewCount: game.reviewCount,
      createdBy: game.createdBy ? { 
        id: game.createdBy._id, 
        username: game.createdBy.username 
      } : null,
      company: game.company ? {
        id: game.company._id,
        name: game.company.name
      } : null
    })));
  } catch (error) {
    console.error('Error getting admin games:', error);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
};

// Admin Pending Games
exports.getAdminPendingGames = async (req, res) => {
  try {
    const games = await Game.find({ status: 'PENDING' })
      .populate('createdBy', 'username')
      .populate('company', 'name')
      .sort({ createdAt: -1 });

    res.json(games.map(game => ({
      id: game._id,
      title: game.title,
      description: game.description,
      genre: game.genre,
      releaseDate: game.releaseDate,
      coverImage: game.coverImage,
      status: 'PENDING',
      averageRating: game.averageRating,
      reviewCount: game.reviewCount,
      createdBy: game.createdBy ? { 
        id: game.createdBy._id, 
        username: game.createdBy.username 
      } : null,
      company: game.company ? {
        id: game.company._id,
        name: game.company.name
      } : null
    })));
  } catch (error) {
    console.error('Error getting pending games:', error);
    res.status(500).json({ error: 'Failed to fetch pending games' });
  }
};

// Approve Game
exports.approveGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findByIdAndUpdate(id, { status: 'APPROVED' }, { new: true });
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({ 
      id: game._id,
      title: game.title,
      status: 'APPROVED'
    });
  } catch (error) {
    console.error('Error approving game:', error);
    res.status(500).json({ error: 'Failed to approve game' });
  }
};

// Reject Game
exports.rejectGame = async (req, res) => {
  try {
    const { id } = req.params;
    const game = await Game.findByIdAndUpdate(id, { status: 'REJECTED' }, { new: true });
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    res.json({ 
      id: game._id,
      title: game.title,
      status: 'REJECTED'
    });
  } catch (error) {
    console.error('Error rejecting game:', error);
    res.status(500).json({ error: 'Failed to reject game' });
  }
};

// Reviews
exports.getAdminReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'username')
      .populate('game', 'title')
      .sort({ createdAt: -1 });

    res.json(reviews.map(review => ({
      id: review._id,
      comment: review.comment,
      rating: review.rating,
      status: review.status || 'PENDING',
      createdAt: review.createdAt,
      user: review.user ? { 
        id: review.user._id, 
        username: review.user.username 
      } : null,
      game: review.game ? {
        id: review.game._id,
        title: review.game.title
      } : null
    })));
  } catch (error) {
    console.error('Error getting admin reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Admin Pending Reviews
exports.getAdminPendingReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'PENDING' })
      .populate('user', 'username')
      .populate('game', 'title')
      .sort({ createdAt: -1 });

    res.json(reviews.map(review => ({
      id: review._id,
      comment: review.comment,
      rating: review.rating,
      status: 'PENDING',
      createdAt: review.createdAt,
      user: review.user ? { 
        id: review.user._id, 
        username: review.user.username 
      } : null,
      game: review.game ? {
        id: review.game._id,
        title: review.game.title
      } : null
    })));
  } catch (error) {
    console.error('Error getting pending reviews:', error);
    res.status(500).json({ error: 'Failed to fetch pending reviews' });
  }
};

// Approve Review
exports.approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(id, { status: 'APPROVED' }, { new: true });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Update game average rating
    await updateGameRating(review.game);

    res.json({ 
      id: review._id,
      status: 'APPROVED'
    });
  } catch (error) {
    console.error('Error approving review:', error);
    res.status(500).json({ error: 'Failed to approve review' });
  }
};

// Reject Review
exports.rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findByIdAndUpdate(id, { status: 'REJECTED' }, { new: true });
    
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ 
      id: review._id,
      status: 'REJECTED'
    });
  } catch (error) {
    console.error('Error rejecting review:', error);
    res.status(500).json({ error: 'Failed to reject review' });
  }
};

// Users
exports.getAdminUsers = async (req, res) => {
  try {
    const { search, role, sortBy = 'createdAt', sortDir = 'desc', page = 1, limit = 10 } = req.query;
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) {
      query.role = role;
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortDir === 'asc' ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute queries
    const [users, totalCount] = await Promise.all([
      User.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password'),
      User.countDocuments(query)
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.json({
      users: users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        reviewCount: user.reviewCount || 0,
        status: user.status || 'ACTIVE'
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error getting admin users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Update User Role
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['USER', 'MODERATOR', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      id: user._id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

// Admin Stats
exports.getAdminStats = async (req, res) => {
  try {
    const { range, startDate, endDate } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    switch (range) {
      case 'daily':
        dateFilter = { 
          createdAt: { 
            $gte: new Date(now.setDate(now.getDate() - 7)) 
          } 
        };
        break;
      case 'weekly':
        dateFilter = { 
          createdAt: { 
            $gte: new Date(now.setDate(now.getDate() - 30)) 
          } 
        };
        break;
      case 'monthly':
        dateFilter = { 
          createdAt: { 
            $gte: new Date(now.setMonth(now.getMonth() - 6)) 
          } 
        };
        break;
      case 'custom':
        if (startDate && endDate) {
          dateFilter = { 
            createdAt: { 
              $gte: new Date(startDate),
              $lte: new Date(endDate)
            } 
          };
        }
        break;
      default:
        dateFilter = {};
    }

    // Get stats
    const [
      newGamesData,
      newUsersData,
      newReviewsData
    ] = await Promise.all([
      getTimeSeriesData(Game, dateFilter, range),
      getTimeSeriesData(User, dateFilter, range),
      getTimeSeriesData(Review, dateFilter, range)
    ]);

    res.json({
      gameStats: {
        timeSeries: newGamesData,
        total: await Game.countDocuments()
      },
      userStats: {
        timeSeries: newUsersData,
        total: await User.countDocuments()
      },
      reviewStats: {
        timeSeries: newReviewsData,
        total: await Review.countDocuments()
      }
    });
  } catch (error) {
    console.error('Error getting admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

// Genre Stats
exports.getGenreStats = async (req, res) => {
  try {
    const genreCounts = await Game.aggregate([
      { $group: { _id: '$genre', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(genreCounts.map(item => ({
      genre: item._id || 'Uncategorized',
      count: item.count
    })));
  } catch (error) {
    console.error('Error getting genre stats:', error);
    res.status(500).json({ error: 'Failed to fetch genre stats' });
  }
};

// Rating Distribution
exports.getRatingDistribution = async (req, res) => {
  try {
    const ratingDistribution = await Review.aggregate([
      { $match: { status: 'APPROVED' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Create full distribution (1-5 stars)
    const fullDistribution = Array.from({ length: 5 }, (_, i) => {
      const found = ratingDistribution.find(item => item._id === i + 1);
      return { rating: i + 1, count: found ? found.count : 0 };
    });

    res.json(fullDistribution);
  } catch (error) {
    console.error('Error getting rating distribution:', error);
    res.status(500).json({ error: 'Failed to fetch rating distribution' });
  }
};

// Utility function to update game average rating
async function updateGameRating(gameId) {
  try {
    const approvedReviews = await Review.find({ 
      game: gameId,
      status: 'APPROVED'
    });
    
    if (approvedReviews.length === 0) return;
    
    const totalRating = approvedReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / approvedReviews.length;
    
    await Game.findByIdAndUpdate(gameId, {
      averageRating: parseFloat(averageRating.toFixed(1)),
      reviewCount: approvedReviews.length
    });
  } catch (error) {
    console.error('Error updating game rating:', error);
  }
}

// Helper function to get time series data
async function getTimeSeriesData(Model, dateFilter, timeRange) {
  let groupFormat;
  let dateFormat;
  
  switch (timeRange) {
    case 'daily':
      groupFormat = { day: { $dayOfMonth: '$createdAt' }, month: { $month: '$createdAt' }, year: { $year: '$createdAt' } };
      dateFormat = date => `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
      break;
    case 'weekly':
      groupFormat = { week: { $week: '$createdAt' }, year: { $year: '$createdAt' } };
      dateFormat = date => `${date.year}-W${date.week.toString().padStart(2, '0')}`;
      break;
    case 'monthly':
    default:
      groupFormat = { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } };
      dateFormat = date => `${date.year}-${date.month.toString().padStart(2, '0')}`;
  }
  
  const data = await Model.aggregate([
    { $match: dateFilter },
    { $group: { _id: groupFormat, count: { $sum: 1 } } },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
  ]);
  
  return data.map(item => ({
    date: dateFormat(item._id),
    count: item.count
  }));
}