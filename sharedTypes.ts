// this can later be shared between server and frontend

export type Org = {
    id: string;
    name: string;
    currentPhase: string;
    players: Record<string, any>;
};