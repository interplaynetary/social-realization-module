// this can later be shared between server and frontend

export type Orgs = Array<Org>

export type Org = {
    id: string;
    name: string,
    currentPhase: string,
    currentCycle: string,
    goals: Record<string, any>,
    offers: Record<string, any>,
    potentialValue: number,
    realizedValue: number,
    shares: number,
    players:   {
        [playerId: string]: {
            name: string,
            shares?: number,
            currentCycle: number,
            currentPhase: Phase,
            cycles: any,
            orgData: any;
            type: string;
        };
    };
};

export type Phase =  "goalExpression" | "goalAllocation" | "offerExpression" | "offerAllocation" | "completions" 