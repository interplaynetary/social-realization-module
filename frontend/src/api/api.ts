import axios from "axios";

/* 
    this can later, based on .env varibales can point to an actual server
*/

const API_BASE_URL = "http://localhost:3000"; // Replace with your actual API URL

// Create an Axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Fetch player data
export const fetchPlayerData = async (playerId: string) => {
    const response = await apiClient.get(`/players/${playerId}`);
    return response.data;
};

// Fetch player phase
export const fetchPlayerPhase = async (playerId: string) => {
    const response = await apiClient.get(`/players/${playerId}/phase`);
    return response.data;
};

// Fetch organization data
export const fetchOrgData = async (orgId: string) => {
    const response = await apiClient.get(`/organizations/${orgId}`);
    return response.data;
};

// Fetch organization phase
export const fetchOrgPhase = async (orgId: string) => {
    const response = await apiClient.get(`/organizations/${orgId}/phase`);
    return response.data;
};

// Fetch available actions
export const fetchAvailableActions = async (playerId: string) => {
    const response = await apiClient.get(`/players/${playerId}/actions`);
    return response.data;
};
