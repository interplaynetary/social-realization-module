import { atom, selector, selectorFamily } from "recoil";

import {
    fetchPlayerData,
    fetchPlayerPhase,
    fetchOrgData,
    fetchOrgPhase,
} from "../api/api"; // Assume these API functions are defined elsewhere
import { apiKeyAtom } from "./atoms/apiKeyAtom";
import { playerDataAtom } from "./atoms/playerDataAtom";


// 3. Selector for player's current phase
export const playerPhaseState = selector({
    key: "playerPhaseState",
    get: async ({ get }) => {
        const playerData = get(playerDataAtom);
        
        try {
            const phase = await fetchPlayerPhase(playerData.id);
            return phase;
        } catch (error) {
            throw new Error("Error fetching player phase");
        }
    },
});

// 4. Atom for selected organization ID
export const selectedOrgIdState = atom({
    key: "selectedOrgIdState",
    default: null, // Initially no organization selected
});

// 5. Selector to fetch organization data
export const orgDataState = selectorFamily({
    key: "orgDataState",
    get: (orgId) => async () => {
        if (!orgId) return null;
        try {
            const orgData = await fetchOrgData(orgId);
            if (!orgData) throw new Error("Organization with ID not found");
            return orgData;
        } catch (error) {
            throw new Error(error.message);
        }
    },
});

// 6. Selector to get organization’s current phase
export const orgPhaseState = selector({
    key: "orgPhaseState",
    get: async ({ get }) => {
        const orgId = get(selectedOrgIdState);
        if (!orgId) return null; // No org selected

        try {
            const orgPhase = await fetchOrgPhase(orgId);
            return orgPhase;
        } catch (error) {
            throw new Error("Error fetching organization phase");
        }
    },
});

// 7. Selector to fetch available actions for the player and organization based on phases
export const availableActionsState = selector({
    key: "availableActionsState",
    get: ({ get }) => {
        const playerPhase = get(playerPhaseState);
        const orgPhase = get(orgPhaseState);
        const actions = [];

        // Actions available based on player's phase
        if (playerPhase === "Goal Expression Phase") {
            actions.push("proposeGoalToOrg");
        }

        if (playerPhase === "Offer Expression Phase") {
            actions.push("offerToOrg");
        }

        // Actions available based on organization's phase
        if (orgPhase === "Completions Phase") {
            actions.push("claimCompletion", "supportChallenge");
        }

        // Always available actions
        actions.push("getOrg", "getGoal", "joinOrg");

        return actions;
    },
});

// 8. Selector for error handling and validation
export const errorState = selector({
    key: "errorState",
    get: ({ get }) => {
        try {
            get(apiKeyState); // Ensure API key is valid
            get(playerDataState); // Ensure player data is loaded
            get(playerPhaseState); // Ensure player phase is valid
            get(orgDataState(get(selectedOrgIdState))); // Ensure org is valid if selected
        } catch (error) {
            return error.message;
        }

        return null; // No errors
    },
});
