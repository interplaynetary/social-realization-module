import axios from "axios";
import { ApiKey, Org, Phase, PlayerActionType } from "../../../sharedTypes";
import { OrgDataResponse } from "./responseTypes";

const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error(
            "API Error:",
            error.response ? error.response.data : error.message
        );
        return Promise.reject(error);
    }
);

export const authenticate = async (apiKey: ApiKey) => {
    const response = await apiClient.post("/login", { apiKey });
    return response.data;
};

export const registerUser = async (playerName: string) => {
    const response = await apiClient.post("/register", { playerName });
    return response.data;
};

export const fetchOrgs = async () => {
    const response = await apiClient.get("/get-org-registry");
    return response.data;
};

export const joinOrg = async (orgId: string, apiKey: ApiKey) => {
    const response = await apiClient.post("/player-action", {
        apiKey: apiKey,
        actionType: "joinOrg",
        actionParams: [orgId],
    });
    return response.data;
};

// todo: improve typings, maybe improve how express server sents those
export const getOrgData = async (
    orgId: string,
    apiKey: ApiKey
): Promise<OrgDataResponse> => {
    const response = await apiClient.post("/player-action", {
        apiKey: apiKey,
        actionType: "getOrg",
        actionParams: [orgId],
    });
    return response.data;
};

export const fetchPlayerData = async (playerId: string) => {
    const response = await apiClient.get(`/players/${playerId}`);
    return response.data;
};

export const fetchPlayerPhase = async (playerId: string) => {
    const response = await apiClient.get(`/players/${playerId}/phase`);
    return response.data;
};

export const fetchOrgData = async (orgId: string) => {
    const response = await apiClient.get(`/organizations/${orgId}`);
    return response.data;
};

export const fetchOrgPhase = async (orgId: string) => {
    const response = await apiClient.get(`/organizations/${orgId}/phase`);
    return response.data;
};

export const fetchAvailableActions = async (playerId: string) => {
    const response = await apiClient.get(`/players/${playerId}/actions`);
    return response.data;
};

export const executePlayerAction = async (
    apiKey: ApiKey,
    actionType: PlayerActionType,
    actionParams: [Org["id"], string]
) => {
    const response = await apiClient.post("/player-action", {
        apiKey: apiKey,
        actionType: actionType,
        actionParams: actionParams,
    });

    return response.data;
};

export const runPhaseShift = async (apiKey: ApiKey) => {
    const response = await apiClient.post("/player-action", {
        apiKey: apiKey,
        actionType: "runPhaseShift",
        actionParams: [],
    });
    return response.data;
};

// within cycle i see goals registry
