import { v4 as uuidv4 } from 'uuid';
import { save } from './persistence.js';

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

// Add Method for finding out how much someone can allocate
// input: Org, Player, (Optional: Goal/Org)
// output [totalPoints, leftForPlayerToDistribute]

// We need to ensure that we are using UUIDs everywhere instead of Object References
// So we can save the each object with JSOG and reconstruct the state from JSOG simply by reinstantiating the object corresponding to the UUID in the appropriate registry, with the updated JSOG Data.


// mantain ordering, when an org is made, it's reference should be stored here, to have playstate-0, playstate-1 etc. names
//introduce name counter into Org class so names don't repeat with a dash, and are followed with -0, -1


// Each org should mantain a log of all process events
// with possibility for custom time.

// Offers to Offers
// Record: Points of merging: merge-events go into the primary timeline (the main branch)

// Function that does a filter map reduce 

// Value time

// Merge points between goals
// Where players are orgs, their timelines, their timelines meet in the production of offers towards goals in other goals.

// diagrammed as a git merge / gannt chart

// Registries
export const orgRegistry = {};
export const goalRegistry = {};
export const offerRegistry = {};
export const completionRegistry = {};
export const apiKeyToPlayer = {};
export const nameRegistry = {}

export class Element {
    constructor() {
        this.id = uuidv4();
        this.orgData = {};
        this.type = this.constructor.name;
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
    saveToJSOG() {
        const data = JSOG.encode(this);
        console.log(data);
        return data;
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
            offersTowardsSelf: new Set()
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
            status: 'active',
        };
    }

    initForOrg(orgId, ask, targetGoals) {
        super.initForOrg(orgId);
        const orgData = this.getCurrentOtherData(orgId);
        const totalPotentialPoints = Array.from(targetGoals).reduce((sum, goalId) => {
            const goal = goalRegistry[goalId];
            if (!goal) throw new Error("Target goal not found");
            const goalOrgData = goal.getCurrentOtherData(orgId);
            return sum + goalOrgData.potentialValue;
        }, 0);
    
        if (ask > totalPotentialPoints) {
            throw new Error("Offer ask exceeds the aggregate potential points of the target goals");
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
        this.status = 'pending';
        this.challenges = {};
        this.supportVotes = {};
        this.type = this.constructor.name;
        goalRegistry[this.id] = this;
    }
}

export class Org extends Element {
    constructor(name) {
        super();
        this.name = this.getUniqueName(name);

        this.currentCycle = 0;
        this.currentPhase = 'goalExpression';
        this.cycles = {};
        this.initForSelfCycle();
        orgRegistry[this.id] = this;
        const apiKey = uuidv4();
        apiKeyToPlayer[apiKey] = this.id;
        console.log(this.name, 'ID:', this.id);
        console.log(this.name, 'API-Key:', apiKey);
        this.joinOrg(this.id)
        return [apiKey, this];
    }
    getUniqueName(baseName) {
        if (!nameRegistry[baseName]) {
            nameRegistry[baseName] = 0;
            // then lets generate a random 4 digit number
            return `${baseName}-0`;
        } else {
            nameRegistry[baseName]++;
            return `${baseName}-${nameRegistry[baseName]}`;
        }
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
        return true
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
        return this.currentPhase
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
        console.log('distributeShares: player', player);
        console.log('distributeShares: id', this.id);
        const playerOrgData = player.getCurrentOtherData(this.id);
        console.log('distributeShares: playerOrgData', playerOrgData);
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
            currentOrg.players[this.id] = this;
            return true
        }
        return false
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
        throw new Error("Offer ask exceeds the aggregate potential points of the target goals");
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
        console.log('allocateToGoalFromOrg: org', org);
        console.log('allocateToGoalFromOrg: goalId',  goalId);
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
        const remainingPotentialValue = goalOrgData.potentialValue - goalOrgData.potentialValueDistributedFromSelf;
        const allocatorPortion = remainingPotentialValue * (allocatorOrgData.shares / currentOrg.shares);
        const alreadyDistributed = allocatorOrgData.potentialValueDistributedFromGoalToOffers[fromId] || 0;

        if (amount <= allocatorPortion - alreadyDistributed) {
            goalOrgData.potentialValueDistributedFromSelf += amount;
            allocatorOrgData.potentialValueDistributedFromGoalToOffers[fromId] = alreadyDistributed + amount;
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
    if (!fromGoal || !toGoal) throw new Error("One or both goals not found");

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
shiftPointsBetweenOffersInOrg(orgId, amount, fromOfferId, toOfferId, goalId) {
    const org = orgRegistry[orgId];
    const currentOrg = org.getCurrentSelfData();

    const goal = currentOrg.goals[goalId];
    if (!goal) throw new Error("Goal not found");

    const fromOffer = currentOrg.offers[fromOfferId];
    const toOffer = currentOrg.offers[toOfferId];
    if (!fromOffer || !toOffer) throw new Error("One or both offers not found");

    const fromOfferOrgData = fromOffer.getCurrentOtherData(orgId);
    const toOfferOrgData = toOffer.getCurrentOtherData(orgId);

    if (!fromOfferOrgData.towardsGoals.has(goalId) || !toOfferOrgData.towardsGoals.has(goalId)) {
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


export async function playerAction(apiKey, actionType, ...actionParams) {
    console.log('ACTIONPARAM', actionParams);
    const playerId = apiKeyToPlayer[apiKey];
    if (!playerId) throw new Error("Invalid API key");

    const player = orgRegistry[playerId];
    if (!player) throw new Error("Player not found");

    // Set to track modified elements that need saving
    const elementsToSave = new Set();
    let result;

    try {
        // Actions that don't require an orgId
        const noOrgIdActions = ['getCurrentSelfData', 'getCurrentPhase', 'issueShares', 'runPhaseShift', 
                               'unIssueShares', 'issuePotential', 'calculateRealizedValue', 
                               'getGoalLeaderboard', 'getOfferLeaderboard', 'acceptOffer'];
        
        if (noOrgIdActions.includes(actionType)) {
            result = await player[actionType](...actionParams);
            elementsToSave.add(player);

            // Special case for acceptOffer
            if (actionType === 'acceptOffer') {
                const offerId = actionParams[0];
                const offer = player.getOffer(offerId);
                if (offer) elementsToSave.add(offer);
            }
        } else {
            // Actions that require an orgId
            const orgId = actionParams[0];
            const org = orgRegistry[orgId];
            if (!org) throw new Error(`Organization with ID ${orgId} not found`);

            const orgCurrentPhase = org.getCurrentPhase();
            
            // Phase-specific actions mapping to affected elements
            const actionEffects = {
                'proposeGoalToOrg': (result) => {
                    const goal = goalRegistry[result];
                    if (goal) elementsToSave.add(goal);
                },
                'offerToOrg': (result) => {
                    const offer = offerRegistry[result];
                    if (offer) elementsToSave.add(offer);
                },
                'allocateToGoalFromOrg': () => {
                    const goalId = actionParams[2];
                    const goal = goalRegistry[goalId];
                    if (goal) elementsToSave.add(goal);
                },
                'allocateToOfferFromGoalInOrg': () => {
                    const fromId = actionParams[2];
                    const toId = actionParams[3];
                    const goal = goalRegistry[fromId];
                    const offer = offerRegistry[toId];
                    if (goal) elementsToSave.add(goal);
                    if (offer) elementsToSave.add(offer);
                },
                'claimCompletion': (result) => {
                    const completion = completionRegistry[result];
                    if (completion) elementsToSave.add(completion);
                },
                'challengeCompletion': () => {
                    const completionId = actionParams[1];
                    const completion = completionRegistry[completionId];
                    if (completion) elementsToSave.add(completion);
                },
                'supportChallenge': () => {
                    const completionId = actionParams[1];
                    const completion = completionRegistry[completionId];
                    if (completion) elementsToSave.add(completion);
                },
                'shiftPointsBetweenGoalsInOrg': () => {
                    const [, , fromGoalId, toGoalId] = actionParams;
                    const fromGoal = goalRegistry[fromGoalId];
                    const toGoal = goalRegistry[toGoalId];
                    if (fromGoal) elementsToSave.add(fromGoal);
                    if (toGoal) elementsToSave.add(toGoal);
                },
                'unallocatePointsFromGoalInOrg': () => {
                    const goalId = actionParams[2];
                    const goal = goalRegistry[goalId];
                    if (goal) elementsToSave.add(goal);
                },
                'shiftPointsBetweenOffersInOrg': () => {
                    const [, , fromOfferId, toOfferId] = actionParams;
                    const fromOffer = offerRegistry[fromOfferId];
                    const toOffer = offerRegistry[toOfferId];
                    if (fromOffer) elementsToSave.add(fromOffer);
                    if (toOffer) elementsToSave.add(toOffer);
                },
                'unallocatePointsFromOfferInOrg': () => {
                    const [, , offerId, goalId] = actionParams;
                    const offer = offerRegistry[offerId];
                    const goal = goalRegistry[goalId];
                    if (offer) elementsToSave.add(offer);
                    if (goal) elementsToSave.add(goal);
                }
            };

            // Always available actions
            const alwaysAvailableActions = ['getOrg', 'getGoal', 'getOffer', 'distributeShares', 'joinOrg'];

            if (alwaysAvailableActions.includes(actionType) || 
                actionType in actionEffects && org.getCurrentPhase() === getPhaseForAction(actionType)) {
                
                // Execute the action
                result = await player[actionType](...actionParams);
                
                // Add basic elements that are always modified
                elementsToSave.add(player);
                elementsToSave.add(org);

                // Add action-specific elements
                if (actionEffects[actionType]) {
                    actionEffects[actionType](result);
                }
            } else {
                throw new Error(`Action ${actionType} is not allowed in the current phase: ${orgCurrentPhase}`);
            }
        }

        // Save all modified elements in parallel
        await Promise.all([...elementsToSave].map(element => save(element)));
        
        return result;

    } catch (error) {
        console.error('Error in playerAction:', error);
        throw error;
    }
}

// Helper function to determine which phase an action belongs to
function getPhaseForAction(actionType) {
    const phaseActions = {
        'goalExpression': ['proposeGoalToOrg'],
        'goalAllocation': ['allocateToGoalFromOrg'],
        'offerExpression': ['offerToOrg'],
        'offerAllocation': ['allocateToOfferFromGoalInOrg', 'acceptCounterOffer'],
        'completions': ['claimCompletion', 'challengeCompletion', 'supportChallenge']
    };

    for (const [phase, actions] of Object.entries(phaseActions)) {
        if (actions.includes(actionType)) return phase;
    }
    return null;
}