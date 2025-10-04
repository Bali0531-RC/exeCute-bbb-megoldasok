const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const OpenAI = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'spaceship_game';
const COLLECTION_NAME = 'leaderboard';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

let db = null;
let collection = null;

const bannedWords = [
    'fasz', 'pina', 'pocs', 'kurva', 'geci', 'szar', 'bazmeg', 'picsa',
    'buzi', 'nigger', 'cigany', 'zsido', 'faszt', 'faszfej', 'faszkalap',
    'picsaba', 'kurvanyo', 'kurvaisten', 'kocsog', 'seggfej'
];

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

async function connectToDatabase() {
    try {
        const client = new MongoClient(MONGODB_URI);
        await client.connect();
        console.log('✅ Connected to MongoDB');
        
        db = client.db(DB_NAME);
        collection = db.collection(COLLECTION_NAME);
        
        await collection.createIndex({ moves: 1 });
        await collection.createIndex({ name: 1 }, { unique: true });
        
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        return false;
    }
}

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Spaceship Leaderboard API is running',
        database: db ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

async function moderateContent(text) {
    try {
        const normalizedText = text.toLowerCase().replace(/\s+/g, '');
        
        for (const word of bannedWords) {
            if (normalizedText.includes(word)) {
                console.log(`🚫 Blacklist match for "${text}": contains "${word}"`);
                return {
                    acceptable: false,
                    reason: `Name contains inappropriate content (blacklisted word)`,
                    category: 'blacklist',
                    score: 1.0,
                    flagged: true
                };
            }
        }
        
        const moderation = await openai.moderations.create({
            input: text,
            model: "omni-moderation-latest"
        });

        const result = moderation.results[0];
        
        console.log(`🔍 Moderation check for "${text}":`, JSON.stringify({
            flagged: result.flagged,
            categories: result.categories,
            category_scores: result.category_scores
        }, null, 2));
        
        const categories = result.categories;
        const categoryScores = result.category_scores;
        
        for (const [category, flagged] of Object.entries(categories)) {
            const score = categoryScores[category];
            if (score > 0.3) {
                return {
                    acceptable: false,
                    reason: `Content flagged as potentially ${category.replace(/_/g, ' ')}`,
                    category: category,
                    score: score,
                    flagged: flagged
                };
            }
        }

        return { acceptable: true };
    } catch (error) {
        console.error('OpenAI Moderation Error:', error);
        return { acceptable: true, warning: 'Moderation check failed, allowing content' };
    }
}

app.get('/leaderboard', async (req, res) => {
    try {
        if (!collection) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const limit = parseInt(req.query.limit) || 5;
        
        const leaderboard = await collection
            .find({})
            .sort({ moves: 1, name: 1 })
            .limit(limit)
            .toArray();

        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard', details: error.message });
    }
});

app.post('/leaderboard', async (req, res) => {
    try {
        if (!collection) {
            return res.status(503).json({ error: 'Database not connected' });
        }

        const { name, moves, timestamp } = req.body;
        
        console.log(`📝 Score submission received - Name: "${name}", Moves: ${moves}`);

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

        const moderationResult = await moderateContent(name);
        
        if (!moderationResult.acceptable) {
            console.log(`🚫 Name rejected - "${name}" (${moderationResult.category}: ${moderationResult.score})`);
            return res.status(400).json({ 
                error: 'Name contains inappropriate content',
                reason: moderationResult.reason,
                category: moderationResult.category,
                score: moderationResult.score
            });
        }
        
        console.log(`✅ Name approved - "${name}"`);

        const existing = await collection.findOne({ name: name.trim() });

        if (existing) {
            if (existing.moves <= moves) {
                return res.status(200).json({
                    message: 'Score not updated - existing score is better or equal',
                    current: existing,
                    updated: false
                });
            }
        }

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
        
        console.log(`💾 Score saved - Name: "${name}", Moves: ${moves}, Action: ${existing ? 'Updated' : 'New'}`);
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        
        if (error.code === 11000) {
            return res.status(409).json({ error: 'Duplicate entry', details: error.message });
        }
        
        res.status(500).json({ error: 'Failed to update leaderboard', details: error.message });
    }
});

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

app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
});

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

process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    process.exit(0);
});
