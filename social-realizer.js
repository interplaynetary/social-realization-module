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

// Add debug logger utility
const DEBUG = true;
function debug(...args) {
    if (DEBUG) {
        console.log('[DEBUG]', ...args);
        // Optionally add timestamp
        console.log('[DEBUG] Timestamp:', new Date().toISOString());
    }
}

// Add this near the top of the file with other utility functions
String.prototype.rsplit = function(sep, maxsplit) {
    const split = this.split(sep);
    if (maxsplit) {
        return [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit));
    }
    return split;
};


export class Element {
    constructor(id = null) {
        if(id === null){
            this.id = uuidv4();
        } else {
            this.id = id;
        }        debug('Created new Element:', {
            type: this.constructor.name,
            id: this.id
        });
        this.orgData = {};
        this.type = this.constructor.name;
    }

    initForOrg(orgId) {
        debug('Initializing Element for Org:', {
            elementId: this.id,
            elementType: this.type,
            orgId: orgId
        });
        
        const org = orgRegistry[orgId];
        if (!org) {
            debug('Organization not found in registry:', {
                orgId,
                availableOrgs: Object.keys(orgRegistry)
            });
            throw new Error("Organization not found");
        }

        if (!this.orgData[orgId]) {
            debug('Creating new org data for element');
            const cycleSpecificOrgData = {};
            cycleSpecificOrgData[org.currentCycle] = this.getInitialOrgData();
            this.orgData[orgId] = cycleSpecificOrgData;
            debug('Created org data:', this.orgData[orgId]);
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
    constructor(description, createdById, id = null) {
        super(id);
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
    constructor(name, description, effects, createdById, id = null) {
        super(id);
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

    initForOrg(orgId, ask, targetGoalIds) {
        super.initForOrg(orgId);
        const orgData = this.getCurrentOtherData(orgId);
        const totalPotentialPoints = Array.from(targetGoalIds).reduce((sum, goalId) => {
            const goal = goalRegistry[goalId];
            if (!goal) throw new Error("Target goal not found");
            const goalOrgData = goal.getCurrentOtherData(orgId);
            return sum + goalOrgData.potentialValue;
        }, 0);
    
        if (ask > totalPotentialPoints) {
            throw new Error("Offer ask exceeds the aggregate potential points of the target goals");
        }
    
        orgData.ask = ask;
        orgData.towardsGoals = new Set(targetGoalIds);
    }
    
}

export class Completion {
    constructor(offerId, claimDescription, claimedById, id = null) {
        if(id === null){
            this.id = uuidv4();
        } else {
            this.id = id;
        }
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
    constructor(name, id = null	) {
        super(id);
        debug('Creating new Org:', { name });
        this.name = this.getUniqueName(name);
        debug('Generated unique name:', this.name);

        this.currentCycle = 0;
        this.currentPhase = 'goalExpression';
        this.cycles = {};
        
        debug('Initializing first cycle');
        this.initForSelfCycle();
        
        debug('Registering org:', {
            id: this.id,
            name: this.name,
            registrySize: Object.keys(orgRegistry).length
        });
        orgRegistry[this.id] = this;
        
        const apiKey = uuidv4();
        debug('Generated API key:', {
            orgId: this.id,
            apiKey: apiKey
        });
        apiKeyToPlayer[apiKey] = this.id;
        
        debug('Joining org to itself');
        const joinResult = this.joinOrg(this.id);
        debug('Join result:', joinResult);
        
        return [apiKey, this];
    }
    getUniqueName(baseName) {
        // If this is a name being loaded from persistence that already has a number
        console.log('[nameRegistry:]', nameRegistry);
        
        if (baseName.match(/-\d+$/)) {
            // Register the existing name and number
            const [base, num] = baseName.rsplit('-', 1);
            nameRegistry[base] = Math.max(parseInt(num), nameRegistry[base] || 0);
            console.log('[Loaded name:]', nameRegistry[base]);
            return baseName;
        }

        // For new names
        if (nameRegistry[baseName] == undefined) {
            console.log('[New name:]', nameRegistry[baseName]);
            nameRegistry[baseName] = 0;
            return `${baseName}-0`;
        } else {
            nameRegistry[baseName]++;
            console.log('[Incremented name:]', nameRegistry[baseName]);
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
        debug('Attempting to join org:', {
            playerId: this.id,
            targetOrgId: orgId
        });

        const org = orgRegistry[orgId];
        if (!org) {
            debug('Failed to find org in registry:', {
                orgId,
                availableOrgs: Object.keys(orgRegistry)
            });
            throw new Error("Organization not found");
        }

        debug('Found org:', {
            orgName: org.name,
            orgCurrentCycle: org.currentCycle
        });

        const currentOrg = org.getCurrentSelfData();
        debug('Current org data:', currentOrg);

        const joinTime = new Date();
        debug('Join attempt timestamp:', joinTime);

        if(!this.orgData[orgId]){
            debug('Creating new org data for player');
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
            debug('Successfully joined org:', {
                playerId: this.id,
                orgId: orgId,
                cycleData: cycleSpecificOrgData
            });
            return true;
        }
        
        debug('Player already member of org:', {
            playerId: this.id,
            orgId: orgId
        });
        return false;
    }

    proposeGoalToOrg(orgId, description) {
        console.log('proposeGoalToOrg called with:', { orgId, description });
        console.log('Current orgRegistry:', orgRegistry);
                
        const org = orgRegistry[orgId];
        console.log('Found org:', org);
        
        if (!org) {
            console.error('Organization not found for ID:', orgId);
            console.error('Available orgs:', Object.keys(orgRegistry));
            throw new Error(`Organization with ID ${orgId} not found`);
        }
        
        const goal = new Goal(description, this.id);
        console.log('Created new goal:', goal);
        
        const currentOrg = org.getCurrentSelfData();
        console.log('Current org data:', currentOrg);
        
        goal.initForOrg(orgId);
        currentOrg.goals[goal.id] = goal;
        
        console.log('Successfully added goal to org');
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

        const completion = new Completion(null, offerId, claimDescription, this.id);
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
    debug('Player action called:', {
        actionType,
        params: actionParams,
        apiKey: apiKey
    });

    const playerId = apiKeyToPlayer[apiKey];
    if (!playerId) {
        debug('Invalid API key:', {
            providedKey: apiKey,
            knownKeys: Object.keys(apiKeyToPlayer)
        });
        throw new Error("Invalid API key");
    }

    debug('Found player ID:', playerId);

    const player = orgRegistry[playerId];
    if (!player) {
        debug('Player not found in registry:', {
            playerId,
            availableOrgs: Object.keys(orgRegistry)
        });
        throw new Error("Player not found");
    }

    debug('Found player:', {
        id: player.id,
        name: player.name
    });

    const elementsToSave = new Set();
    let result;

    try {
        const noOrgIdActions = ['getCurrentSelfData', 'getCurrentPhase', 'issueShares', 'runPhaseShift', 
                               'unIssueShares', 'issuePotential', 'calculateRealizedValue', 
                               'getGoalLeaderboard', 'getOfferLeaderboard', 'acceptOffer'];
        
        debug('Action category:', {
            actionType,
            isNoOrgIdAction: noOrgIdActions.includes(actionType)
        });

        if (noOrgIdActions.includes(actionType)) {
            debug('Executing no-orgId action');
            result = await player[actionType](...actionParams);
            elementsToSave.add(player);

            if (actionType === 'acceptOffer') {
                const offerId = actionParams[0];
                const offer = player.getOffer(offerId);
                if (offer) elementsToSave.add(offer);
            }
        } else {
            const orgId = actionParams[0];
            debug('Looking up org for action:', {
                orgId,
                availableOrgs: Object.keys(orgRegistry)
            });

            const org = orgRegistry[orgId];
            if (!org) {
                debug('Organization not found:', {
                    requestedId: orgId,
                    availableIds: Object.keys(orgRegistry)
                });
                throw new Error(`Organization with ID ${orgId} not found`);
            }

            const orgCurrentPhase = org.getCurrentPhase();
            debug('Current org phase:', orgCurrentPhase);

            // Execute action and track modifications
            debug('Executing action:', {
                type: actionType,
                params: actionParams
            });

            result = await player[actionType](...actionParams);
            
            debug('Action result:', result);

            // Track modified elements
            elementsToSave.add(player);
            elementsToSave.add(org);
        }

        // Save modifications
        debug('Saving modified elements:', {
            count: elementsToSave.size,
            elements: [...elementsToSave].map(e => ({
                id: e.id,
                type: e.type
            }))
        });

        await Promise.all([...elementsToSave].map(element => save(element)));
        
        debug('Action completed successfully:', {
            actionType,
            result
        });

        return result;

    } catch (error) {
        debug('Error in playerAction:', {
            actionType,
            error: error.message,
            stack: error.stack
        });
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
