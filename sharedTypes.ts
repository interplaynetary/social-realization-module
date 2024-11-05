// This can later be shared between server and frontend

export type ApiKey = string;

export type Orgs = Array<Org>;

// Represents an organization
export type Org = {
    id: string; // Unique identifier for the organization
    name: string; // Name of the organization
    currentPhase: Phase; // The current phase of the organization
    currentCycle: string; // The current cycle identifier
    goals: Record<string, Goal>; // Dictionary of goals associated with the organization
    offers: Record<string, Offer>; // Dictionary of offers associated with the organization
    potentialValue: number; // The potential value associated with the organization
    realizedValue: number; // The realized value associated with the organization
    shares: number; // The number of shares in the organization
    players: Record<string, Player>; // Dictionary of players in the organization
};

// Represents a player in an organization
export type Player = {
    name: string; // Name of the player
    shares?: number; // Optional number of shares held by the player
    currentCycle: number; // The current cycle number for the player
    currentPhase: Phase; // The current phase the player is in
    cycles: Cycle[]; // Array of cycles the player has participated in
    orgData: Org; // Reference to the organization the player is part of
    type: PlayerType; // Type of player (e.g., regular, admin, etc.)
};

// Represents a goal within an organization
export type Goal = {
    id: string; // Unique identifier for the goal
    description: string; // Description of the goal
    createdById: string; // ID of the player who created the goal
    effects: string[]; // Effects of achieving the goal
    status: GoalStatus; // Current status of the goal (e.g., active, completed, etc.)
};

// Represents an offer within an organization
export type Offer = {
    id: string; // Unique identifier for the offer
    name: string; // Name of the offer
    description: string; // Description of the offer
    effects: string[]; // Effects of the offer
    createdById: string; // ID of the player who created the offer
    askAmount: number; // Amount requested in the offer
    targetGoalIds: string[]; // IDs of the goals targeted by the offer
};

// Represents a cycle a player has participated in
export type Cycle = {
    cycleNumber: number; // The cycle number
    data: any; // Any additional data related to the cycle
};

// Represents the different phases in an organization
export type Phase = 
    "goalExpression" | 
    "goalAllocation" | 
    "offerExpression" | 
    "offerAllocation" | 
    "completions";

// Represents the status of a goal
export type GoalStatus = 
    "active" | 
    "completed" | 
    "archived";

// Represents different types of players
export type PlayerType = 
    "regular" | 
    "admin" | 
    "guest";


// Player Actions (TODO: think about better way of representing them as values and type at same time)
export const PlayerActionTypes = {
    DistributeShares: "distributeShares",
    ProposeGoalToOrg: "proposeGoalToOrg",
    AllocateToGoalFromOrg: "allocateToGoalFromOrg",
    OfferToOrg: "offerToOrg",
    AllocateToOfferFromGoalInOrg: "allocateToOfferFromGoalInOrg",
    AcceptOffer: "acceptOffer",
    AcceptCounterOffer: "acceptCounterOffer",
    ClaimCompletion: "claimCompletion",
    ChallengeCompletion: "challengeCompletion",
    SupportChallenge: "supportChallenge",
    GetLeaderboard: "getLeaderboard"
} as const;

export type PlayerActionType = typeof PlayerActionTypes[keyof typeof PlayerActionTypes];