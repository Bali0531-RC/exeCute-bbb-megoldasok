const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'spaceship_game';
const COLLECTION_NAME = 'leaderboard';
2
let db = null;
let collection = null;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Connect to MongoDB
async function connectToDatabase() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        db = client.db(DB_NAME);
        collection = db.collection(COLLECTION_NAME);
        
        // Create index for better performance
        await collection.createIndex({ moves: 1 });
        await collection.createIndex({ name: 1 }, { unique: true });
        
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        return false;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Spaceship Leaderboard API is running',
        database: db ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Get leaderboard (top scores)
app.get('/leaderboard', async (req, res) => {
    try {
        if (!collection) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const limit = parseInt(req.query.limit) || 10;
        
        const leaderboard = await collection
            .find({})
            .sort({ moves: 1 })  // Sort by moves ascending (lowest = best)
            .limit(limit)
            .toArray();

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard', details: error.message });
    }
});

// Submit or update score
app.post('/leaderboard', async (req, res) => {
    try {
        if (!collection) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const { name, moves, timestamp } = req.body;

        // Validation
        if (!name || !moves) {
            return res.status(400).json({ error: 'Name and moves are required' });
        }

        if (typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'Name must be a non-empty string' });
        }

        if (name.length > 20) {
            return res.status(400).json({ error: 'Name must be 20 characters or less' });
        }

        if (!Number.isInteger(moves) || moves <= 0) {
            return res.status(400).json({ error: 'Moves must be a positive integer' });
        }

        // Check if player exists
        const existing = await collection.findOne({ name: name.trim() });

        if (existing) {
            // Only update if new score is better (lower moves)
            if (existing.moves <= moves) {
                return res.status(200).json({
                    message: 'Score not updated - existing score is better or equal',
                    current: existing,
                    updated: false
                });
            }
        }

        // Update or insert new score
        const result = await collection.findOneAndUpdate(
            { name: name.trim() },
            {
                $set: {
                    name: name.trim(),
                    moves: moves,
                    timestamp: timestamp || new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                }
            },
            {
                upsert: true,
                returnDocument: 'after'
            }
        );

        res.status(200).json({
            message: existing ? 'Score updated successfully' : 'New score added successfully',
            record: result.value || result,
            updated: true
        });
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Duplicate entry', details: error.message });
        }
        
        res.status(500).json({ error: 'Failed to update leaderboard', details: error.message });
    }
});

// Get player's rank
app.get('/rank/:name', async (req, res) => {
    try {
        if (!collection) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const playerName = req.params.name;
        const player = await collection.findOne({ name: playerName });

        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }

        // Count how many players have better scores
        const betterPlayers = await collection.countDocuments({ moves: { $lt: player.moves } });
        const rank = betterPlayers + 1;

        res.json({
            name: player.name,
            moves: player.moves,
            rank: rank,
            timestamp: player.timestamp
        });
    } catch (error) {
        console.error('Error fetching rank:', error);
        res.status(500).json({ error: 'Failed to fetch rank', details: error.message });
    }
});

// Delete player (for testing/admin)
app.delete('/leaderboard/:name', async (req, res) => {
    try {
        if (!collection) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const playerName = req.params.name;
        const result = await collection.deleteOne({ name: playerName });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }

        res.json({ message: 'Player deleted successfully', name: playerName });
    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ error: 'Failed to delete player', details: error.message });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

// Start server
async function startServer() {
    const dbConnected = await connectToDatabase();
    
    if (!dbConnected) {
        console.warn('⚠️  Starting server without database connection');
    }

    app.listen(PORT, () => {
        console.log(`🚀 Spaceship Leaderboard API running on port ${PORT}`);
        console.log(`📊 Health check: http://localhost:${PORT}/health`);
        console.log(`🏆 Leaderboard: http://localhost:${PORT}/leaderboard`);
    });
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});
