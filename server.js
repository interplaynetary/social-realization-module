import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import JSOG from 'jsog';

import { 
    apiKeyToPlayer,
    playerAction,
    orgRegistry,
    Org, 
} from './social-realizer.js';

import { loadAll } from './persistence.js';
import { runTests } from './tests.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory


// Set up CORS middleware to allow multiple origins
const allowedOrigins = [
    "http://127.0.0.1:5501",
    "http://localhost:1234"
];

app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);

            // Check if the origin is in the allowedOrigins array
            if (allowedOrigins.indexOf(origin) === -1) {
                const msg =
                    "The CORS policy for this site does not allow access from the specified origin.";
                return callback(new Error(msg), false);
            }

            // If the origin is allowed, pass the request
            return callback(null, true);
        },
    })
);

app.use((err, req, res, next) => {
    const errorId = uuidv4();
    const timestamp = new Date().toISOString();
    const { method, url } = req;
    const statusCode = err.status || 500;

    console.error(`[${timestamp}] Error ID: ${errorId}`);
    console.error(`[${timestamp}] ${method} ${url}`);
    console.error(`[${timestamp}] Status Code: ${statusCode}`);
    console.error(`[${timestamp}] Error Message: ${err.message}`);
    console.error(`[${timestamp}] Stack Trace: ${err.stack}`);

    res.status(statusCode).json({
        success: false,
        errorId,
        message: err.message || 'An unexpected error occurred',
        status: statusCode
    });
});

app.post('/login', (req, res) => {
    console.log('Received login request. Body:', req.body);
    try {
        const { apiKey } = req.body;
        if (!apiKey) {
            throw new Error("API-key is required");
        }
        const player = apiKeyToPlayer[apiKey];
        if(player) {
            console.log('Login successful for player:', player);
            res.json({ success: true, playerId: player });
        }

    } catch (error) {
        console.error('Login error:', error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/register', (req, res) => {
    console.log('Received registration request. Body:', req.body);
    try {
        const { playerName } = req.body;
        if (!playerName) {
            throw new Error("Player name is required");
        }
        const [apiKey, player] = new Org(playerName);
        const playerId = player.id;
        console.log('Registration successful for player:', playerName);
        res.json({ success: true, playerId, apiKey });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post('/player-action', (req, res) => {
    const { apiKey, actionType, actionParams } = req.body;
    try {
        const result = playerAction(apiKey, actionType, actionParams);
        
        // Encode the result using JSOG
        const jsogEncodedResult = JSOG.encode(result);
        
        res.json({ success: true, result: jsogEncodedResult });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});


app.get('/get-org-registry', (req, res) => {
    try {
        const registryData = Object.entries(orgRegistry).map(([id, org]) => {
            const currentCycleData = org.getCurrentSelfData();
            return {
                id,
                name: org.name,
                currentCycle: org.currentCycle,
                currentPhase: org.currentPhase,
                players: currentCycleData.players,
                goals: currentCycleData.goals,
                offers: currentCycleData.offers,
                potentialValue: currentCycleData.potentialValue,
                shares: currentCycleData.shares,
                realizedValue: currentCycleData.realizedValue
            };
        });
        
        // Encode the registryData using JSOG
        const jsogEncodedData = JSOG.encode(registryData);
        
        res.json({ success: true, registryData: jsogEncodedData });
    } catch (error) {
        console.error('Error in /get-org-registry:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 3000;

// Initialize registries at startup
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await loadAll();
    
    // Run tests after server starts
    runTests();
});
