const { GraphQLError } = require('graphql');
const { PubSub } = require('graphql-subscriptions');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pubsub = new PubSub();

// Mock data for demonstration
let games = [];
let reviews = [];
let users = [];

const resolvers = {
  Query: {
    // Game queries
    games: (_, { search, genres, platforms, sortBy, sortOrder, limit, offset }) => {
      let filteredGames = [...games];
      
      if (search) {
        filteredGames = filteredGames.filter(game => 
          game.title.toLowerCase().includes(search.toLowerCase()) ||
          game.description.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      if (genres && genres.length > 0) {
        filteredGames = filteredGames.filter(game => 
          genres.some(genre => game.genres.includes(genre))
        );
      }
      
      if (platforms && platforms.length > 0) {
        filteredGames = filteredGames.filter(game => 
          platforms.some(platform => game.platforms.includes(platform))
        );
      }
      
      if (sortBy) {
        filteredGames.sort((a, b) => {
          const order = sortOrder === 'DESC' ? -1 : 1;
          return (a[sortBy] > b[sortBy] ? 1 : -1) * order;
        });
      }
      
      const start = offset || 0;
      const end = limit ? start + limit : undefined;
      
      return filteredGames.slice(start, end);
    },
    
    game: (_, { id }) => {
      const game = games.find(g => g.id === id);
      if (!game) {
        throw new GraphQLError('Game not found');
      }
      return game;
    },
    
    // Review queries
    reviews: (_, { gameId, userId, limit, offset }) => {
      let filteredReviews = [...reviews];
      
      if (gameId) {
        filteredReviews = filteredReviews.filter(review => review.gameId === gameId);
      }
      
      if (userId) {
        filteredReviews = filteredReviews.filter(review => review.userId === userId);
      }
      
      const start = offset || 0;
      const end = limit ? start + limit : undefined;
      
      return filteredReviews.slice(start, end);
    },
    
    review: (_, { id }) => {
      const review = reviews.find(r => r.id === id);
      if (!review) {
        throw new GraphQLError('Review not found');
      }
      return review;
    },
    
    // User queries
    users: (_, { limit, offset }) => {
      const start = offset || 0;
      const end = limit ? start + limit : undefined;
      return users.slice(start, end);
    },
    
    user: (_, { id }) => {
      const user = users.find(u => u.id === id);
      if (!user) {
        throw new GraphQLError('User not found');
      }
      return user;
    },
    
    me: (_, __, context) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated');
      }
      return context.user;
    }
  },
  
  Mutation: {
    // Authentication mutations
    register: async (_, { input }) => {
      const { username, email, password } = input;
      
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        throw new GraphQLError('Email already registered');
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = {
        id: String(users.length + 1),
        username,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      users.push(user);
      
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
      return { token, user };
    },
    
    login: async (_, { input }) => {
      const { email, password } = input;
      
      const user = users.find(u => u.email === email);
      if (!user) {
        throw new GraphQLError('Invalid credentials');
      }
      
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        throw new GraphQLError('Invalid credentials');
      }
      
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
      return { token, user };
    },
    
    // Game mutations
    createGame: (_, { input }, context) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated');
      }
      
      const game = {
        id: String(games.length + 1),
        ...input,
        rating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      games.push(game);
      pubsub.publish('GAME_CREATED', { gameCreated: game });
      return game;
    },
    
    updateGame: (_, { id, input }, context) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated');
      }
      
      const index = games.findIndex(g => g.id === id);
      if (index === -1) {
        throw new GraphQLError('Game not found');
      }
      
      const game = {
        ...games[index],
        ...input,
        updatedAt: new Date().toISOString()
      };
      
      games[index] = game;
      pubsub.publish('GAME_UPDATED', { gameUpdated: game });
      return game;
    },
    
    deleteGame: (_, { id }, context) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated');
      }
      
      const index = games.findIndex(g => g.id === id);
      if (index === -1) {
        throw new GraphQLError('Game not found');
      }
      
      games.splice(index, 1);
      pubsub.publish('GAME_DELETED', { gameDeleted: id });
      return true;
    },
    
    // Review mutations
    createReview: (_, { input }, context) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated');
      }
      
      const { gameId, rating, content } = input;
      
      const game = games.find(g => g.id === gameId);
      if (!game) {
        throw new GraphQLError('Game not found');
      }
      
      const review = {
        id: String(reviews.length + 1),
        gameId,
        userId: context.user.id,
        rating,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      reviews.push(review);
      pubsub.publish('REVIEW_CREATED', { reviewCreated: review });
      return review;
    },
    
    updateReview: (_, { id, content, rating }, context) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated');
      }
      
      const index = reviews.findIndex(r => r.id === id);
      if (index === -1) {
        throw new GraphQLError('Review not found');
      }
      
      if (reviews[index].userId !== context.user.id) {
        throw new GraphQLError('Not authorized');
      }
      
      const review = {
        ...reviews[index],
        content,
        rating,
        updatedAt: new Date().toISOString()
      };
      
      reviews[index] = review;
      pubsub.publish('REVIEW_UPDATED', { reviewUpdated: review });
      return review;
    },
    
    deleteReview: (_, { id }, context) => {
      if (!context.user) {
        throw new GraphQLError('Not authenticated');
      }
      
      const index = reviews.findIndex(r => r.id === id);
      if (index === -1) {
        throw new GraphQLError('Review not found');
      }
      
      if (reviews[index].userId !== context.user.id) {
        throw new GraphQLError('Not authorized');
      }
      
      reviews.splice(index, 1);
      pubsub.publish('REVIEW_DELETED', { reviewDeleted: id });
      return true;
    }
  },
  
  Subscription: {
    gameCreated: {
      subscribe: () => pubsub.asyncIterator(['GAME_CREATED'])
    },
    gameUpdated: {
      subscribe: () => pubsub.asyncIterator(['GAME_UPDATED'])
    },
    gameDeleted: {
      subscribe: () => pubsub.asyncIterator(['GAME_DELETED'])
    },
    reviewCreated: {
      subscribe: () => pubsub.asyncIterator(['REVIEW_CREATED'])
    },
    reviewUpdated: {
      subscribe: () => pubsub.asyncIterator(['REVIEW_UPDATED'])
    },
    reviewDeleted: {
      subscribe: () => pubsub.asyncIterator(['REVIEW_DELETED'])
    }
  },
  
  Game: {
    reviews: (game) => reviews.filter(r => r.gameId === game.id)
  },
  
  Review: {
    user: (review) => users.find(u => u.id === review.userId),
    game: (review) => games.find(g => g.id === review.gameId)
  },
  
  User: {
    reviews: (user) => reviews.filter(r => r.userId === user.id)
  }
};

module.exports = resolvers; 