// Add Templates for offer, goal, efforts, completion claims.

//introduce name counter into Org class so names don't repeat with a dash, and are followed with -0, -1

import { v4 as uuidv4 } from 'uuid';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import JSOG from 'jsog';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from 'public' directory

app.use(cors({
    origin: 'http://127.0.0.1:5501'
}));

//const names = {}; // mantain ordering, when an org is made, it's reference should be stored here, to have playstate-0, playstate-1 etc. names
const orgRegistry = {};
const goalRegistry = {};
const offerRegistry = {};
const completionRegistry = {};

const apiKeyToPlayer = {};

class Element {
    constructor(id) {
        this.id = id || uuidv4();
        this.orgData = {};
    }

    initForOrg(orgId) {
        const org = orgRegistry[orgId];
        if (!org) throw new Error("Organization not found");
        if (!this.orgData[orgId]) {
            const cycleSpecificOrgData = {};
            cycleSpecificOrgData[org.currentCycle] = this.getInitialOrgData();
            this.orgData[orgId] = cycleSpecificOrgData;
        }
    }

    getInitialOrgData() {
        // This method should be overridden by child classes
        return {};
    }

    getCurrentOtherData(orgId) {
        const org = orgRegistry[orgId];
        const cycleSpecificOrgData = this.orgData[orgId];
        return cycleSpecificOrgData[org.currentCycle];
    }

    getOtherData(orgId, cycle) {
        const cycleSpecificOrgData = this.orgData[orgId];
        return cycleSpecificOrgData[cycle];
    }
}

class Goal extends Element {
    constructor(description, createdById) {
        super();
        this.description = description;
        this.createdById = createdById;
        goalRegistry[this.id] = this;
    }

    getInitialOrgData() {
        return {
            potentialValue: 0,
            potentialValueDistributedFromSelf: 0,
            offersTowardsSelf: new Set()
        };
    }
}

class Offer extends Element {
    constructor(name, description, effects, createdById) {
        super();
        this.name = name;
        this.description = description;
        this.effects = effects;
        this.createdById = createdById;
        offerRegistry[this.id] = this;
    }

    getInitialOrgData() {
        return {
            ask: 0,
            towardsGoals: new Set(),
            potentialValue: 0,
            distributedFromSelf: 0,
            credits: 0,
            realizedValue: 0,
            status: 'active',
        };
    }

    initForOrg(orgId, ask, targetGoals) {
        super.initForOrg(orgId);
        const orgData = this.getCurrentOtherData(orgId);
        orgData.ask = ask;
        orgData.towardsGoals = new Set(targetGoals);
    }
}

class Completion {
    constructor(offerId, claimDescription, claimedById) {
        this.id = uuidv4();
        this.offerId = offerId;
        this.claimDescription = claimDescription;
        this.claimedById = claimedById;
        this.status = 'pending';
        this.challenges = {};
        this.supportVotes = {};
        goalRegistry[this.id] = this;
    }
}

class Org extends Element {
    constructor(name) {
        super();
        this.name = name;
        this.currentCycle = 0;
        this.currentPhase = 'goalExpression';
        this.cycles = {};
        this.initForSelfCycle();
        orgRegistry[this.id] = this;
        const apiKey = uuidv4();
        apiKeyToPlayer[apiKey] = this.id;
        console.log(this.name, 'ID:', this.id);
        console.log(this.name, 'API-Key:', apiKey);
        return [apiKey, this];
    }

    getInitialOrgData() {
        return {
            shares: 0,
            potentialValue: 0,
            potentialValueDistributedFromOrgToGoals: 0,
            potentialValueDistributedFromGoalToOffers: {},
            joinTime: new Date()
        };
    }

    initForSelfCycle() {
        if (!this.cycles[this.currentCycle]) {
            this.cycles[this.currentCycle] = {
                players: {},
                goals: {},
                offers: {},
                potentialValue: 0,
                potentialValueDistributedFromSelfToGoals: 0,
                shares: 0,
                sharesDistributed: 0,
                completions: {},
                realizedValue: 0
            };
        }
    }

    getOrg(orgId){
        return orgRegistry[orgId];
    }

    getGoal(goalId){
        return goalRegistry[goalId];
    }

    getOffer(offerId){
        return offerRegistry[offerId];
    }

    getCurrentSelfData() {
        const currentData = this.cycles[this.currentCycle];
        return currentData;
    }

    getCurrentPhase() {
        return this.currentPhase;
    }

    // These Methods are as an Org:
    runPhaseShift() {
        const phases = ['goalExpression', 'goalAllocation', 'offerExpression', 'offerAllocation', 'completions'];
        const currentIndex = phases.indexOf(this.currentPhase);
        this.currentPhase = phases[(currentIndex + 1) % phases.length];
        if (this.currentPhase === 'goalExpression') {
            this.currentCycle++;
            this.initForSelfCycle();
        }
    }

    issueShares(amount) {
        const org = this.getCurrentSelfData();
        if (amount <= 0) throw new Error("Amount must be positive");
        org.shares += amount;
        return org.shares;
    }

    unIssueShares(amount) {
        const org = this.getCurrentSelfData();
        if (amount <= 0) throw new Error("Amount must be positive");
        if (amount > org.shares) throw new Error("Not enough shares to un-issue");
        org.shares -= amount;
        return org.shares;
    }

    distributeShares(playerId, amount) {
        const org = this.getCurrentSelfData();
        if (amount <= 0) throw new Error("Amount must be positive");
        if (amount > (org.shares - org.sharesDistributed)) throw new Error("Not enough shares to distribute");
        const player = org.players[playerId];
        if (!player) throw new Error("Player not found");
        console.log(player);
        console.log(this.id);
        const playerOrgData = player.getCurrentOtherData(this.id);
        console.log(playerOrgData);
        playerOrgData.shares += amount;
        org.sharesDistributed += amount;
        return playerOrgData.shares;
    }
    
    issuePotential(amount) {
        const org = this.getCurrentSelfData();
        if (amount <= 0) throw new Error("Amount must be positive");
        org.potentialValue += amount;
        return org.potentialValue;
    }

    acceptOffer(offerId) {
        const org = this.getCurrentSelfData();
        const offer = org.offers[offerId];
        if (!offer) throw new Error("Offer not found");

        const offerOrgData = offer.getCurrentOtherData(this.id);
        const recievedPotentialValue = offerOrgData.potentialValue;

        if (recievedPotentialValue >= offerOrgData.ask) {
            offerOrgData.status = 'accepted';
            return { status: 'accepted', credits: offerOrgData.credits };
        } else {
            const counterofferId = uuidv4();
            const counteroffer = new Offer(offer.name, offer.description, offer.effects, offer.createdById);
            counteroffer.initForOrg(this.id, recievedPotentialValue, Array.from(offerOrgData.towardsGoals));
            const counterofferOrgData = counteroffer.getCurrentOtherData(this.id);
            counterofferOrgData.status = 'counteroffered';
            counterofferOrgData.originalOfferId = offerId;
            org.offers[counterofferId] = counteroffer;
            
            offerOrgData.status = 'counteroffered';
            offerOrgData.counterofferId = counterofferId;

            return { 
                status: 'counteroffered', 
                counterofferId: counterofferId,
                newAsk: recievedPotentialValue
            };
        }
    }

    calculateRealizedValue() {
        const org = this.getCurrentSelfData();
        let realizedValue = 0;
        for (const completionId in org.completions) {
            const completion = org.completions[completionId];
            if (completion.status === 'accepted') {
                const offer = org.offers[completion.offerId];
                if (offer) {
                    const offerOrgData = offer.getCurrentOtherData(this.id);
                    realizedValue += offerOrgData.ask;
                    offerOrgData.realizedValue += offerOrgData.ask;
                }
            }
        }
        
        org.realizedValue += realizedValue;
        return org.realizedValue;
    }

    // These Methods are as a Player:
    joinOrg(orgId) {
        const org = orgRegistry[orgId];
        console.log(this.name, 'JOINED', org);
        const currentOrg = org.getCurrentSelfData();
        if (!org) throw new Error("Organization not found");
        const joinTime = new Date();

        if(!this.orgData[orgId]){
            const cycleSpecificOrgData = {};
            cycleSpecificOrgData[org.currentCycle] = {
                shares: 0,
                potentialValue: 0,
                potentialValueDistributedFromOrgToGoals: 0,
                potentialValueDistributedFromGoalToOffers: {},
                joinTime: joinTime 
            };
            this.orgData[orgId] = cycleSpecificOrgData;
        }

        currentOrg.players[this.id] = this;
    }

    proposeGoalToOrg(orgId, description) {
        if (!description) throw new Error("Description is required");
        const goal = new Goal(description, this.id);
            const org = orgRegistry[orgId];
            if (!org) throw new Error(`Organization with ID ${orgId} not found`);
            const currentOrg = org.getCurrentSelfData();
            goal.initForOrg(orgId);
            currentOrg.goals[goal.id] = goal;
        return goal.id;
    }

    offerToOrg(orgId, name, description, effects, ask, targetGoalIds) {
        if (!name || !description || !effects || ask <= 0 || !targetGoalIds || targetGoalIds.length === 0) {
            throw new Error("Invalid offer parameters");
        }
        
        const offer = new Offer(name, description, effects, this.id);
        
            const org = orgRegistry[orgId];
            if (!org) throw new Error(`Organization with ID ${orgId} not found`);
            const currentOrg = org.getCurrentSelfData();
            offer.initForOrg(orgId, ask, targetGoalIds);
            currentOrg.offers[offer.id] = offer;
        
        return offer.id;
    }

    allocateToGoalFromOrg(orgId, amount, goalId) {
        const org = orgRegistry[orgId];
        const currentOrg = org.getCurrentSelfData();
        const allocator = currentOrg.players[this.id];
        if (!allocator) throw new Error("Allocator not found in organization");
        const allocatorOrgData = allocator.getCurrentOtherData(orgId);

        const goal = currentOrg.goals[goalId];
        console.log(org);
        console.log('Entry',  goalId);
        if (!goal) throw new Error("Goal not found");

        const remainingPotentialValue = currentOrg.potentialValue - currentOrg.potentialValueDistributedFromSelfToGoals;
        const allocatorPortion = remainingPotentialValue * (allocatorOrgData.shares / currentOrg.shares);
        const alreadyDistributed = allocatorOrgData.potentialValueDistributedFromOrgToGoals;

        if (amount <= allocatorPortion - alreadyDistributed) {
            currentOrg.potentialValueDistributedFromSelfToGoals += amount;
            allocatorOrgData.potentialValueDistributedFromOrgToGoals += amount;
            const goalOrgData = goal.getCurrentOtherData(orgId);
            goalOrgData.potentialValue += amount;
            return true;
        }
        return false;
    }

    allocateToOfferFromGoalInOrg(orgId, amount, fromId, toId) {
        const org = orgRegistry[orgId];
        const currentOrg = org.getCurrentSelfData();

        const allocator = currentOrg.players[this.id];
        if (!allocator) throw new Error("Allocator not found in organization");
        const allocatorOrgData = allocator.getCurrentOtherData(orgId);

        const goal = currentOrg.goals[fromId];
        if (!goal) throw new Error("Goal not found");
        const offer = currentOrg.offers[toId];
        if (!offer) throw new Error("Offer not found");

        const offerOrgData = offer.getCurrentOtherData(orgId);
        if (!offerOrgData.towardsGoals.has(fromId)) {
            throw new Error("This offer is not towards the specified goal");
        }

        const goalOrgData = goal.getCurrentOtherData(orgId);
        const remainingPotentialValue = goalOrgData.potentialValue - goalOrgData.potentialValueDistributedFromSelf;
        const allocatorPortion = remainingPotentialValue * (allocatorOrgData.shares / currentOrg.shares);
        const alreadyDistributed = allocatorOrgData.potentialValueDistributedFromGoalToOffers[fromId] || 0;

        if (amount <= allocatorPortion - alreadyDistributed) {
            goalOrgData.potentialValueDistributedFromSelf += amount;
            allocatorOrgData.potentialValueDistributedFromGoalToOffers[fromId] = alreadyDistributed + amount;
            const offerOrgData = offer.getCurrentOtherData(orgId);
            offerOrgData.potentialValue += amount;
            return true;
        }
        return false;
    }

    acceptCounterOffer(orgId, counterofferId, accepted) {
        const org = orgRegistry[orgId];
        if (!org) throw new Error("Organization not found");
        const currentOrg = org.getCurrentSelfData();
        const counteroffer = currentOrg.offers[counterofferId];
        if (!counteroffer) throw new Error("Counteroffer not found");

        const counterofferOrgData = counteroffer.getCurrentOtherData(orgId);
        if (counterofferOrgData.status !== 'counteroffered') {
            throw new Error("This offer is not in a counteroffered state");
        }

        const originalOffer = currentOrg.offers[counterofferOrgData.originalOfferId];
        const originalOfferOrgData = originalOffer.getCurrentOtherData(orgId);

        if (accepted) {
            counterofferOrgData.status = 'accepted';
            originalOfferOrgData.status = 'replaced';
            return { status: 'accepted', offerId: counterofferId };
        } else {
            counterofferOrgData.status = 'rejected';
            originalOfferOrgData.status = 'active';
            return { status: 'rejected', offerId: originalOfferOrgData.originalOfferId };
        }
    }

    claimCompletion(orgId, offerId, claimDescription) {
        const org = orgRegistry[orgId];
        if (!org) throw new Error("Organization not found");
        const currentOrg = org.getCurrentSelfData();
        const offer = currentOrg.offers[offerId];
        if (!offer) throw new Error("Offer not found");

        const completion = new Completion(offerId, claimDescription, this.id);
        currentOrg.completions[completion.id] = completion;
        return completion.id;
    }

    challengeCompletion(orgId, completionId, challengeDescription) {
        const org = orgRegistry[orgId];
        if (!org) throw new Error("Organization not found");
        const currentOrg = org.getCurrentSelfData();
        const completion = currentOrg.completions[completionId];
        if (!completion) throw new Error("Completion Claim not found");
        completion.challenges[this.id] = challengeDescription;
    }

    supportChallenge(orgId, completionId, support) {
        const org = orgRegistry[orgId];
        if (!org) throw new Error("Organization not found");
        const currentOrg = org.getCurrentSelfData();
        const completion = currentOrg.completions[completionId];
        if (!completion) throw new Error("Completion Claim not found");
        completion.supportVotes[this.id] = support;

        const totalVotes = Object.keys(completion.supportVotes).length;
        const supportVotes = Object.values(completion.supportVotes).filter(v => v).length;
        const supportRatio = supportVotes / totalVotes;

        const acceptanceThreshold = 0.5;

        completion.status = supportRatio >= acceptanceThreshold ? 'accepted' : 'rejected';
        return completion.status;
    }

    getGoalLeaderboard(dimension = 'potentialValue') {
        const org = orgRegistry[orgId];
        if (!org) throw new Error("Organization not found");
        const currentOrg = org.getCurrentSelfData();
        if (!['potentialValue', 'realizedValue'].includes(dimension)) {
            throw new Error("Invalid dimension. Use 'potentialValue' or 'realizedValue'.");
        }

        const leaderboard = Object.values(currentOrg.goals).map(goal => {
            const goalOrgData = goal.getCurrentOtherData(this.id);
            return {
                id: goal.id,
                description: goal.description,
                createdById: goal.createdById,
                potentialValue: goalOrgData.potentialValue,
                realizedValue: goalOrgData.realizedValue || 0  // Add this property if not already present
            };
        });

        return leaderboard.sort((a, b) => b[dimension] - a[dimension]);
    }

    getOfferLeaderboard(dimension = 'potentialValue') {
        const org = orgRegistry[orgId];
        if (!org) throw new Error("Organization not found");
        const currentOrg = org.getCurrentSelfData();
        if (!['potentialValue', 'realizedValue'].includes(dimension)) {
            throw new Error("Invalid dimension. Use 'potentialValue' or 'realizedValue'.");
        }

        const leaderboard = Object.values(currentOrg.offers).map(offer => {
            const offerOrgData = offer.getCurrentOtherData(this.id);
            return {
                id: offer.id,
                name: offer.name,
                description: offer.description,
                createdById: offer.createdById,
                potentialValue: offerOrgData.potentialValue,
                realizedValue: offerOrgData.realizedValue || 0
            };
        });

        return leaderboard.sort((a, b) => b[dimension] - a[dimension]);
    }
}

function getPlayerFromApiKey(apiKey) {
    return apiKeyToPlayer[apiKey];
}

function playerAction(apiKey, actionType, ...actionParams) {
    console.log('PLAYER ACTION');

    const playerId = getPlayerFromApiKey(apiKey);
    if (!playerId) {
        throw new Error("Invalid API key");
    }
    
    const player = orgRegistry[playerId];
    if (!player) {
        throw new Error("Player not found");
    }
    console.log('PLAYER', player);

    const playerCurrentPhase = player.getCurrentPhase();

    const [orgId, ...restParams] = actionParams;

    // Actions allowed in any phase
    const alwaysAvailableActions = [
        'runPhaseShift', 'getCurrentPhase', 'getOrg', 'getGoal', 'getOffer', 'issueShares', 'unIssueShares', 
        'distributeShares', 'joinOrg', 'getCurrentSelfData', 'getCurrentOtherData', 
        'getOtherData', 'getGoalLeaderboard', 'getOfferLeaderboard'
    ];

    if (alwaysAvailableActions.includes(actionType)) {
        return player[actionType](...actionParams);
    }


    let org = undefined
    if(orgRegistry[orgId] instanceof Org) {
        org = orgRegistry[orgId]
        const orgCurrentPhase = org.getCurrentPhase();
        console.log(`Player Current Phase: ${playerCurrentPhase}`);
        console.log(`Org Current Phase: ${orgCurrentPhase}`);
        console.log('APIKEY:', apiKey);
        console.log('ACTIONTYPE:', actionType);
        console.log('ACTIONPARAM:', ...actionParams);

        switch (orgCurrentPhase) {
            case 'goalExpression':
                if (actionType === 'proposeGoalToOrg') {
                    return player.proposeGoalToOrg(...actionParams);
                }
                break;
            case 'goalAllocation':
                if (actionType === 'allocateToGoalFromOrg') {
                    return player.allocateToGoalFromOrg(...actionParams);
                }
                break;
            case 'offerExpression':
                if (actionType === 'offerToOrg') {
                    return player.offerToOrg(...actionParams);
                }
                break;
            case 'offerAllocation':
                if (actionType === 'allocateToOfferFromGoalInOrg' || actionType === 'acceptCounterOffer') {
                    return player[actionType](...actionParams);
                }
                break;
            case 'completions':
                if (['claimCompletion', 'challengeCompletion', 'supportChallenge'].includes(actionType)) {
                    return player[actionType](...actionParams);
                }
                if (actionType === 'calculateRealizedValue' && player instanceof Org) {
                    return player.calculateRealizedValue(...restParams);
                }
                break;
            default:
                throw new Error(`Action ${actionType} not allowed in current phase ${playerCurrentPhase}`);
        }
    }
    if(goalRegistry[orgId] instanceof Goal) {
        org = goalRegistry[orgId]
    }
    if(offerRegistry[orgId] instanceof Offer) {
        org = offerRegistry[orgId]
    }
    if(completionRegistry[orgId] instanceof Completion) {
        org = completionRegistry[orgId]
    }

    if (!org) {
        throw new Error(`Element with ID ${orgId} not found`);
    }

    throw new Error(`Action ${actionType} is not allowed in the current phase: ${playerCurrentPhase}`);
}

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
        const result = playerAction(apiKey, actionType, ...actionParams);
        
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
        
        return res.json({ success: true, registryData: jsogEncodedData });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Example usage and extended testing

console.log("--- Initializing Organizations and Players ---");
const [org1apiKey, org1] = new Org('Playnet');

const [org2apiKey, org2] = new Org('ECSA');

org1.issueShares(100);
org2.issueShares(200);

const [player1apiKey, player1] = new Org("Ruz");

const [player2apiKey, player2] = new Org("Kyle");

player1.joinOrg(org1.id);
player1.joinOrg(org2.id);
player2.joinOrg(org1.id);
player2.joinOrg(org2.id);

org1.distributeShares(player1.id, 50);
org2.distributeShares(player1.id, 100);
org1.distributeShares(player2.id, 50);
org2.distributeShares(player2.id, 100);

console.log("--- Phase 1: Goal Expression ---");
console.log("Current phase for Org 1:", org1.getCurrentPhase());
console.log("Current phase for Org 2:", org2.getCurrentPhase());

const goals1 = player1.proposeGoalToOrg(org1.id, "Improve product quality");
const goals2 = player2.proposeGoalToOrg(org1.id, "Expand market reach");

console.log("Goals proposed by Player 1:", goals1);
console.log("Goals proposed by Player 2:", goals2);

console.log("--- Phase 2: Goal Allocation ---");
org1.runPhaseShift();
org2.runPhaseShift();
console.log("Current phase for Org 1:", org1.getCurrentPhase());
console.log("Current phase for Org 2:", org2.getCurrentPhase());

org1.issuePotential(1000);
org2.issuePotential(2000);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});