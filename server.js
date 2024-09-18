// Points from each goal should be recognizable a from them in the data structure.
// Tags on goals in Orgs
// Collaborators on offers (the ids do not have to be players in the org)
// Ideally we actually make it a request for inclusion, an invitation to join an Offer / Goal
// Pending acceptance
// Each Offer should then include:
// Offered Collaborators
// Accepted Collaborators
// This allows for a natural way to 'join' an organization, you can get a threshold of points from an org before you even try to be a member.

// Add Templates for offer, goal, efforts, completion claims.

import { v4 as uuidv4 } from "uuid";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import JSOG from "jsog";
//import { dataLayer } from './DataAccessLayer.js';

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files from 'public' directory

// Set up CORS middleware to allow multiple origins
const allowedOrigins = ["http://127.0.0.1:5501", "http://localhost:1234"];

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

export const orgRegistry = {};
export const goalRegistry = {};
export const offerRegistry = {};
export const completionRegistry = {};
export const apiKeyToPlayer = {};

//const names = {}; // mantain ordering, when an org is made, it's reference should be stored here, to have playstate-0, playstate-1 etc. names
//introduce name counter into Org class so names don't repeat with a dash, and are followed with -0, -1

class Element {
    constructor() {
        this.id = uuidv4();
        this.orgData = {};
        this.type = this.constructor.name; // Add the .type property
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

export class Goal extends Element {
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
            offersTowardsSelf: new Set(),
        };
    }
}

export class Offer extends Element {
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
            status: "active",
        };
    }

    initForOrg(orgId, ask, targetGoals) {
        super.initForOrg(orgId);
        const orgData = this.getCurrentOtherData(orgId);
        const totalPotentialPoints = Array.from(targetGoals).reduce(
            (sum, goalId) => {
                const goal = goalRegistry[goalId];
                if (!goal) throw new Error("Target goal not found");
                const goalOrgData = goal.getCurrentOtherData(orgId);
                return sum + goalOrgData.potentialValue;
            },
            0
        );

        if (ask > totalPotentialPoints) {
            throw new Error(
                "Offer ask exceeds the aggregate potential points of the target goals"
            );
        }

        orgData.ask = ask;
        orgData.towardsGoals = new Set(targetGoals);
    }
}

export class Completion {
    constructor(offerId, claimDescription, claimedById) {
        this.id = uuidv4();
        this.offerId = offerId;
        this.claimDescription = claimDescription;
        this.claimedById = claimedById;
        this.status = "pending";
        this.challenges = {};
        this.supportVotes = {};
        goalRegistry[this.id] = this;
    }
}

export default class Org extends Element {
    constructor(name) {
        super();
        this.name = name;
        this.currentCycle = 0;
        this.currentPhase = "goalExpression";
        this.cycles = {};
        this.initForSelfCycle();
        orgRegistry[this.id] = this;
        const apiKey = uuidv4();
        apiKeyToPlayer[apiKey] = this.id;
        console.log(this.name, "ID:", this.id);
        console.log(this.name, "API-Key:", apiKey);
        this.joinOrg(this.id);
        return [apiKey, this];
    }

    getInitialOrgData() {
        return {
            shares: 0,
            potentialValue: 0,
            potentialValueDistributedFromOrgToGoals: 0,
            potentialValueDistributedFromGoalToOffers: {},
            joinTime: new Date(),
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
                realizedValue: 0,
            };
        }
        return true;
    }

    getOrg(orgId) {
        return orgRegistry[orgId];
    }

    getGoal(goalId) {
        return goalRegistry[goalId];
    }

    getOffer(offerId) {
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
        const phases = [
            "goalExpression",
            "goalAllocation",
            "offerExpression",
            "offerAllocation",
            "completions",
        ];
        const currentIndex = phases.indexOf(this.currentPhase);
        this.currentPhase = phases[(currentIndex + 1) % phases.length];
        if (this.currentPhase === "goalExpression") {
            this.currentCycle++;
            this.initForSelfCycle();
        }
        return this.currentPhase;
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
        if (amount > org.shares)
            throw new Error("Not enough shares to un-issue");
        org.shares -= amount;
        return org.shares;
    }

    distributeShares(playerId, amount) {
        const org = this.getCurrentSelfData();
        if (amount <= 0) throw new Error("Amount must be positive");
        if (amount > org.shares - org.sharesDistributed)
            throw new Error("Not enough shares to distribute");
        const player = org.players[playerId];
        if (!player) throw new Error("Player not found");
        console.log("distributeShares: player", player);
        console.log("distributeShares: id", this.id);
        const playerOrgData = player.getCurrentOtherData(this.id);
        console.log("distributeShares: playerOrgData", playerOrgData);
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
            offerOrgData.status = "accepted";
            return { status: "accepted", credits: offerOrgData.credits };
        } else {
            const counterofferId = uuidv4();
            const counteroffer = new Offer(
                offer.name,
                offer.description,
                offer.effects,
                offer.createdById
            );
            counteroffer.initForOrg(
                this.id,
                recievedPotentialValue,
                Array.from(offerOrgData.towardsGoals)
            );
            const counterofferOrgData = counteroffer.getCurrentOtherData(
                this.id
            );
            counterofferOrgData.status = "counteroffered";
            counterofferOrgData.originalOfferId = offerId;
            org.offers[counterofferId] = counteroffer;

            offerOrgData.status = "counteroffered";
            offerOrgData.counterofferId = counterofferId;

            return {
                status: "counteroffered",
                counterofferId: counterofferId,
                newAsk: recievedPotentialValue,
            };
        }
    }

    calculateRealizedValue() {
        const org = this.getCurrentSelfData();
        let realizedValue = 0;
        for (const completionId in org.completions) {
            const completion = org.completions[completionId];
            if (completion.status === "accepted") {
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
        console.log(this.name, "JOINED", org);
        const currentOrg = org.getCurrentSelfData();
        if (!org) throw new Error("Organization not found");
        const joinTime = new Date();

        if (!this.orgData[orgId]) {
            const cycleSpecificOrgData = {};
            cycleSpecificOrgData[org.currentCycle] = {
                shares: 0,
                potentialValue: 0,
                potentialValueDistributedFromOrgToGoals: 0,
                potentialValueDistributedFromGoalToOffers: {},
                joinTime: joinTime,
            };
            this.orgData[orgId] = cycleSpecificOrgData;
            currentOrg.players[this.id] = this;
            return true;
        }
        return false;
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
        if (
            !name ||
            !description ||
            !effects ||
            ask <= 0 ||
            !targetGoalIds ||
            targetGoalIds.length === 0
        ) {
            throw new Error("Invalid offer parameters");
        }

        const org = orgRegistry[orgId];
        if (!org) throw new Error(`Organization with ID ${orgId} not found`);
        const currentOrg = org.getCurrentSelfData();

        // Calculate total potential points of the target goals
        const totalPotentialPoints = targetGoalIds.reduce((sum, goalId) => {
            const goal = goalRegistry[goalId];
            if (!goal) throw new Error("Target goal not found");
            const goalOrgData = goal.getCurrentOtherData(orgId);
            return sum + goalOrgData.potentialValue;
        }, 0);

        if (ask > totalPotentialPoints) {
            throw new Error(
                "Offer ask exceeds the aggregate potential points of the target goals"
            );
        }

        const offer = new Offer(name, description, effects, this.id);
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
        console.log("allocateToGoalFromOrg: org", org);
        console.log("allocateToGoalFromOrg: goalId", goalId);
        if (!goal) throw new Error("Goal not found");

        const remainingPotentialValue =
            currentOrg.potentialValue -
            currentOrg.potentialValueDistributedFromSelfToGoals;
        const allocatorPortion =
            remainingPotentialValue *
            (allocatorOrgData.shares / currentOrg.shares);
        const alreadyDistributed =
            allocatorOrgData.potentialValueDistributedFromOrgToGoals;

        if (amount <= allocatorPortion - alreadyDistributed) {
            currentOrg.potentialValueDistributedFromSelfToGoals += amount;
            allocatorOrgData.potentialValueDistributedFromOrgToGoals += amount;
            const goalOrgData = goal.getCurrentOtherData(orgId);
            goalOrgData.potentialValue += amount;
            return true;
        } else {
            throw new Error("Insufficient allocation rights.");
        }
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
        const remainingPotentialValue =
            goalOrgData.potentialValue -
            goalOrgData.potentialValueDistributedFromSelf;
        const allocatorPortion =
            remainingPotentialValue *
            (allocatorOrgData.shares / currentOrg.shares);
        const alreadyDistributed =
            allocatorOrgData.potentialValueDistributedFromGoalToOffers[
                fromId
            ] || 0;

        if (amount <= allocatorPortion - alreadyDistributed) {
            goalOrgData.potentialValueDistributedFromSelf += amount;
            allocatorOrgData.potentialValueDistributedFromGoalToOffers[fromId] =
                alreadyDistributed + amount;
            const offerOrgData = offer.getCurrentOtherData(orgId);
            offerOrgData.potentialValue += amount;
            return true;
        } else {
            throw new Error("Insufficient allocation rights.");
        }
    }

    // Shifts allocated points from one goal to another within the same organization.
    shiftPointsBetweenGoalsInOrg(orgId, amount, fromGoalId, toGoalId) {
        const org = orgRegistry[orgId];
        const currentOrg = org.getCurrentSelfData();

        const fromGoal = currentOrg.goals[fromGoalId];
        const toGoal = currentOrg.goals[toGoalId];
        if (!fromGoal || !toGoal)
            throw new Error("One or both goals not found");

        const fromGoalOrgData = fromGoal.getCurrentOtherData(orgId);
        const toGoalOrgData = toGoal.getCurrentOtherData(orgId);

        if (fromGoalOrgData.potentialValue < amount) {
            throw new Error("Insufficient points in the source goal to shift");
        }

        // Shift points
        fromGoalOrgData.potentialValue -= amount;
        toGoalOrgData.potentialValue += amount;

        return true;
    }

    // Unallocates points from a specific goal.
    unallocatePointsFromGoalInOrg(orgId, amount, goalId) {
        const org = orgRegistry[orgId];
        const currentOrg = org.getCurrentSelfData();

        const goal = currentOrg.goals[goalId];
        if (!goal) throw new Error("Goal not found");

        const goalOrgData = goal.getCurrentOtherData(orgId);

        if (goalOrgData.potentialValue < amount) {
            throw new Error("Insufficient points in the goal to unallocate");
        }

        // Unallocate points
        goalOrgData.potentialValue -= amount;
        currentOrg.potentialValueDistributedFromSelfToGoals -= amount;

        return true;
    }

    // Shifts allocated points from one offer to another under the same goal.
    shiftPointsBetweenOffersInOrg(
        orgId,
        amount,
        fromOfferId,
        toOfferId,
        goalId
    ) {
        const org = orgRegistry[orgId];
        const currentOrg = org.getCurrentSelfData();

        const goal = currentOrg.goals[goalId];
        if (!goal) throw new Error("Goal not found");

        const fromOffer = currentOrg.offers[fromOfferId];
        const toOffer = currentOrg.offers[toOfferId];
        if (!fromOffer || !toOffer)
            throw new Error("One or both offers not found");

        const fromOfferOrgData = fromOffer.getCurrentOtherData(orgId);
        const toOfferOrgData = toOffer.getCurrentOtherData(orgId);

        if (
            !fromOfferOrgData.towardsGoals.has(goalId) ||
            !toOfferOrgData.towardsGoals.has(goalId)
        ) {
            throw new Error("Both offers must be linked to the specified goal");
        }

        if (fromOfferOrgData.potentialValue < amount) {
            throw new Error("Insufficient points in the source offer to shift");
        }

        // Shift points
        fromOfferOrgData.potentialValue -= amount;
        toOfferOrgData.potentialValue += amount;

        return true;
    }

    // Unallocates points from a specific offer.
    unallocatePointsFromOfferInOrg(orgId, amount, offerId, goalId) {
        const org = orgRegistry[orgId];
        const currentOrg = org.getCurrentSelfData();

        const goal = currentOrg.goals[goalId];
        if (!goal) throw new Error("Goal not found");

        const offer = currentOrg.offers[offerId];
        if (!offer) throw new Error("Offer not found");

        const offerOrgData = offer.getCurrentOtherData(orgId);
        const goalOrgData = goal.getCurrentOtherData(orgId);

        if (!offerOrgData.towardsGoals.has(goalId)) {
            throw new Error("This offer is not linked to the specified goal");
        }

        if (offerOrgData.potentialValue < amount) {
            throw new Error("Insufficient points in the offer to unallocate");
        }

        // Unallocate points
        offerOrgData.potentialValue -= amount;
        goalOrgData.potentialValueDistributedFromSelf -= amount;

        return true;
    }

    acceptCounterOffer(orgId, counterofferId, accepted) {
        const org = orgRegistry[orgId];
        if (!org) throw new Error("Organization not found");
        const currentOrg = org.getCurrentSelfData();
        const counteroffer = currentOrg.offers[counterofferId];
        if (!counteroffer) throw new Error("Counteroffer not found");

        const counterofferOrgData = counteroffer.getCurrentOtherData(orgId);
        if (counterofferOrgData.status !== "counteroffered") {
            throw new Error("This offer is not in a counteroffered state");
        }

        const originalOffer =
            currentOrg.offers[counterofferOrgData.originalOfferId];
        const originalOfferOrgData = originalOffer.getCurrentOtherData(orgId);

        if (accepted) {
            counterofferOrgData.status = "accepted";
            originalOfferOrgData.status = "replaced";
            return { status: "accepted", offerId: counterofferId };
        } else {
            counterofferOrgData.status = "rejected";
            originalOfferOrgData.status = "active";
            return {
                status: "rejected",
                offerId: originalOfferOrgData.originalOfferId,
            };
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
        const supportVotes = Object.values(completion.supportVotes).filter(
            (v) => v
        ).length;
        const supportRatio = supportVotes / totalVotes;

        const acceptanceThreshold = 0.5;

        completion.status =
            supportRatio >= acceptanceThreshold ? "accepted" : "rejected";
        return completion.status;
    }

    getGoalLeaderboard(dimension = "potentialValue") {
        const org = orgRegistry[orgId];
        if (!org) throw new Error("Organization not found");
        const currentOrg = org.getCurrentSelfData();
        if (!["potentialValue", "realizedValue"].includes(dimension)) {
            throw new Error(
                "Invalid dimension. Use 'potentialValue' or 'realizedValue'."
            );
        }

        const leaderboard = Object.values(currentOrg.goals).map((goal) => {
            const goalOrgData = goal.getCurrentOtherData(this.id);
            return {
                id: goal.id,
                description: goal.description,
                createdById: goal.createdById,
                potentialValue: goalOrgData.potentialValue,
                realizedValue: goalOrgData.realizedValue || 0, // Add this property if not already present
            };
        });

        return leaderboard.sort((a, b) => b[dimension] - a[dimension]);
    }

    getOfferLeaderboard(dimension = "potentialValue") {
        const org = orgRegistry[orgId];
        if (!org) throw new Error("Organization not found");
        const currentOrg = org.getCurrentSelfData();
        if (!["potentialValue", "realizedValue"].includes(dimension)) {
            throw new Error(
                "Invalid dimension. Use 'potentialValue' or 'realizedValue'."
            );
        }

        const leaderboard = Object.values(currentOrg.offers).map((offer) => {
            const offerOrgData = offer.getCurrentOtherData(this.id);
            return {
                id: offer.id,
                name: offer.name,
                description: offer.description,
                createdById: offer.createdById,
                potentialValue: offerOrgData.potentialValue,
                realizedValue: offerOrgData.realizedValue || 0,
            };
        });

        return leaderboard.sort((a, b) => b[dimension] - a[dimension]);
    }
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
        message: err.message || "An unexpected error occurred",
        status: statusCode,
    });
});

app.post("/login", (req, res) => {
    console.log("Received login request. Body:", req.body);
    try {
        const { apiKey } = req.body;
        if (!apiKey) {
            throw new Error("API-key is required");
        }
        const player = apiKeyToPlayer[apiKey];
        if (player) {
            console.log("Login successful for player:", player);
            res.json({ success: true, playerId: player });
        }
    } catch (error) {
        console.error("Login error:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post("/register", (req, res) => {
    console.log("Received registration request. Body:", req.body);
    try {
        const { playerName } = req.body;
        if (!playerName) {
            throw new Error("Player name is required");
        }
        const [apiKey, player] = new Org(playerName);
        const playerId = player.id;
        console.log("Registration successful for player:", playerName);
        res.json({ success: true, playerId, apiKey });
    } catch (error) {
        console.error("Registration error:", error.message);
        res.status(400).json({ success: false, error: error.message });
    }
});

app.post("/player-action", (req, res) => {
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

app.get("/get-org-registry", (req, res) => {
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
                realizedValue: currentCycleData.realizedValue,
            };
        });

        // Encode the registryData using JSOG
        const jsogEncodedData = JSOG.encode(registryData);

        res.json({ success: true, registryData: jsogEncodedData });
    } catch (error) {
        console.error("Error in /get-org-registry:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

function playerAction(apiKey, actionType, ...actionParams) {
    console.log("ACTIONPARAM", actionParams);
    const playerId = apiKeyToPlayer[apiKey];
    if (!playerId) {
        throw new Error("Invalid API key");
    }

    const player = orgRegistry[playerId];
    if (!player) {
        throw new Error("Player not found");
    }

    const playerCurrentPhase = player.getCurrentPhase();

    // Actions that don't require an orgId
    const noOrgIdActions = [
        "getCurrentSelfData",
        "getCurrentPhase",
        "issueShares",
        "runPhaseShift",
        "unIssueShares",
        "issuePotential",
        "calculateRealizedValue",
        "getGoalLeaderboard",
        "getOfferLeaderboard",
        "acceptOffer",
    ];

    if (noOrgIdActions.includes(actionType)) {
        return player[actionType](...actionParams);
    }

    // Actions that require an orgId as the first parameter
    const orgId = actionParams[0];
    const org = orgRegistry[orgId];
    if (!org) {
        throw new Error(`Organization with ID ${orgId} not found`);
    }

    const orgCurrentPhase = org.getCurrentPhase();

    // Phase-specific actions
    const phaseActions = {
        goalExpression: ["proposeGoalToOrg"],
        goalAllocation: ["allocateToGoalFromOrg"],
        offerExpression: ["offerToOrg"],
        offerAllocation: ["allocateToOfferFromGoalInOrg", "acceptCounterOffer"],
        completions: [
            "claimCompletion",
            "challengeCompletion",
            "supportChallenge",
        ],
    };

    // Always available actions
    const alwaysAvailableActions = [
        "getOrg",
        "getGoal",
        "getOffer",
        "distributeShares",
        "joinOrg",
    ];

    if (
        alwaysAvailableActions.includes(actionType) ||
        phaseActions[orgCurrentPhase]?.includes(actionType)
    ) {
        return player[actionType](...actionParams);
    }

    throw new Error(
        `Action ${actionType} is not allowed in the current phase: ${orgCurrentPhase}`
    );
}

console.log("--- Running Phase Tests ---");

// Create test organizations and players
const [org1ApiKey, org1] = new Org("Playnet");
const [org2ApiKey, org2] = new Org("ECSA");
const [org3ApiKey, org3] = new Org("MOOS");
const [org4ApiKey, org4] = new Org("Germany");
const [org5ApiKey, org5] = new Org("Tanzania");

const [player1ApiKey, player1] = new Org("Ruzgar");
const [player2ApiKey, player2] = new Org("Felipe");

// Test Phase 1: Goal Expression
console.log("--- Testing Phase 1: Goal Expression ---");
testGoalExpression(org1, player1, player2);

// Test Phase 2: Goal Allocation
console.log("--- Testing Phase 2: Goal Allocation ---");
testGoalAllocation(org2, player1, player2);

// Test Phase 3: Offer Expression
console.log("--- Testing Phase 3: Offer Expression ---");
testOfferExpression(org3, player1, player2);

// Test Phase 4: Offer Allocation
console.log("--- Testing Phase 4: Offer Allocation ---");
testOfferAllocation(org4, player1, player2);

// Test Phase 5: Completions
console.log("--- Testing Phase 5: Completions ---");
testCompletions(org5, player1, player2);

console.log("--- Phase Tests Completed ---");

function testGoalExpression(org, player1, player2) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 50);

    const goal1 = player1.proposeGoalToOrg(org.id, "Test Goal 1");
    const goal2 = player2.proposeGoalToOrg(org.id, "Test Goal 2");

    console.log(`Org ${org.name} current phase: ${org.getCurrentPhase()}`);
    console.log(`Goals proposed: ${goal1}, ${goal2}`);
}

function testGoalAllocation(org, player1, player2) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 50);

    const goal1 = player1.proposeGoalToOrg(org.id, "Test Goal 1");
    const goal2 = player2.proposeGoalToOrg(org.id, "Test Goal 2");

    org.runPhaseShift(); // Move to Goal Allocation phase
    org.issuePotential(1000);

    player1.allocateToGoalFromOrg(org.id, 250, goal1);
    player2.allocateToGoalFromOrg(org.id, 250, goal2);

    console.log(`Org ${org.name} current phase: ${org.getCurrentPhase()}`);
    console.log(`Allocated to goals: ${goal1}, ${goal2}`);
}

function testOfferExpression(org, player1, player2) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 50);

    const goal1 = player1.proposeGoalToOrg(org.id, "Test Goal 1");
    const goal2 = player2.proposeGoalToOrg(org.id, "Test Goal 2");

    org.runPhaseShift(); // Move to Goal Allocation phase
    org.issuePotential(1000);
    player1.allocateToGoalFromOrg(org.id, 250, goal1);
    player2.allocateToGoalFromOrg(org.id, 250, goal2);

    org.runPhaseShift(); // Move to Offer Expression phase

    const offer1 = player1.offerToOrg(
        org.id,
        "Offer 1",
        "Test Offer 1",
        "Effect 1",
        100,
        [goal1]
    );
    const offer2 = player2.offerToOrg(
        org.id,
        "Offer 2",
        "Test Offer 2",
        "Effect 2",
        100,
        [goal2]
    );

    console.log(`Org ${org.name} current phase: ${org.getCurrentPhase()}`);
    console.log(`Offers made: ${offer1}, ${offer2}`);
}

function testOfferAllocation(org, player1, player2) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 50);

    const goal1 = player1.proposeGoalToOrg(org.id, "Test Goal 1");
    const goal2 = player2.proposeGoalToOrg(org.id, "Test Goal 2");

    org.runPhaseShift(); // Move to Goal Allocation phase
    org.issuePotential(1000);
    player1.allocateToGoalFromOrg(org.id, 250, goal1);
    player2.allocateToGoalFromOrg(org.id, 250, goal2);

    org.runPhaseShift(); // Move to Offer Expression phase
    const offer1 = player1.offerToOrg(
        org.id,
        "Offer 1",
        "Test Offer 1",
        "Effect 1",
        100,
        [goal1]
    );
    const offer2 = player2.offerToOrg(
        org.id,
        "Offer 2",
        "Test Offer 2",
        "Effect 2",
        100,
        [goal2]
    );

    org.runPhaseShift(); // Move to Offer Allocation phase

    player1.allocateToOfferFromGoalInOrg(org.id, 50, goal1, offer1);
    player2.allocateToOfferFromGoalInOrg(org.id, 50, goal2, offer2);

    console.log(`Org ${org.name} current phase: ${org.getCurrentPhase()}`);
    console.log(`Allocated to offers: ${offer1}, ${offer2}`);
}

function testCompletions(org, player1, player2) {
    player1.joinOrg(org.id);
    player2.joinOrg(org.id);

    org.issueShares(100);
    org.distributeShares(player1.id, 50);
    org.distributeShares(player2.id, 50);

    const goal1 = player1.proposeGoalToOrg(org.id, "Test Goal 1");
    const goal2 = player2.proposeGoalToOrg(org.id, "Test Goal 2");

    org.runPhaseShift(); // Move to Goal Allocation phase
    org.issuePotential(1000);
    player1.allocateToGoalFromOrg(org.id, 250, goal1);
    player2.allocateToGoalFromOrg(org.id, 250, goal2);

    org.runPhaseShift(); // Move to Offer Expression phase
    const offer1 = player1.offerToOrg(
        org.id,
        "Offer 1",
        "Test Offer 1",
        "Effect 1",
        100,
        [goal1]
    );
    const offer2 = player2.offerToOrg(
        org.id,
        "Offer 2",
        "Test Offer 2",
        "Effect 2",
        100,
        [goal2]
    );

    org.runPhaseShift(); // Move to Offer Allocation phase
    player1.allocateToOfferFromGoalInOrg(org.id, 50, goal1, offer1);
    player2.allocateToOfferFromGoalInOrg(org.id, 50, goal2, offer2);

    org.runPhaseShift(); // Move to Completions phase

    const completion1 = player1.claimCompletion(
        org.id,
        offer1,
        "Completed Offer 1"
    );
    const completion2 = player2.claimCompletion(
        org.id,
        offer2,
        "Completed Offer 2"
    );

    player2.challengeCompletion(
        org.id,
        completion1,
        "Challenge for Completion 1"
    );
    player1.challengeCompletion(
        org.id,
        completion2,
        "Challenge for Completion 2"
    );

    player1.supportChallenge(org.id, completion2, true);
    player2.supportChallenge(org.id, completion1, false);

    console.log(`Org ${org.name} current phase: ${org.getCurrentPhase()}`);
    console.log(`Completions claimed: ${completion1}, ${completion2}`);
    console.log(
        `Completion 1 status: ${
            org.getCurrentSelfData().completions[completion1].status
        }`
    );
    console.log(
        `Completion 2 status: ${
            org.getCurrentSelfData().completions[completion2].status
        }`
    );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
