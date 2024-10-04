export type OrgDataResponse = {
    success: boolean;
    result: Result;
};

type Result = {
    "@id": string;
    id: string;
    orgData: {
        "@id": string;
        [key: string]: Record<string, OrgData>;
    };
    type: string;
    name: string;
    currentCycle: number;
    currentPhase: string;
    cycles: Record<
        string,
        {
            "@id": string;
            players: Record<string, Player>;
            goals: { "@id": string };
            offers: { "@id": string };
            potentialValue: number;
            potentialValueDistributedFromSelfToGoals: number;
            shares: number;
            sharesDistributed: number;
            completions: { "@id": string };
            realizedValue: number;
        }
    >;
};

type OrgData = {
    "@id": string;
    shares: number;
    potentialValue: number;
    potentialValueDistributedFromOrgToGoals: number;
    potentialValueDistributedFromGoalToOffers: {
        "@id": string;
    };
    joinTime: string;
};

type Player = {
    "@id": string;
    id: string;
    orgData: Record<string, Record<string, OrgData>>;
    type: string;
    name: string;
    currentCycle: number;
    currentPhase: string;
    cycles: Record<
        string,
        {
            "@id": string;
            players: Record<string, { "@ref"?: string } & Player>;
            goals: { "@id": string };
            offers: { "@id": string };
            potentialValue: number;
            potentialValueDistributedFromSelfToGoals: number;
            shares: number;
            sharesDistributed: number;
            completions: { "@id": string };
            realizedValue: number;
        }
    >;
};
