import { selector } from "recoil";
import { fetchPlayerData } from "../../api/api";
import { apiKeyAtom } from "../atoms/apiKeyAtom";

// Selector to fetch player data based on API key
export const playerDataSelector = selector({
    key: "playerDataSelector",
    get: async ({ get }) => {
        const apiKey = get(apiKeyAtom);

        if (!apiKey) throw new Error("Invalid API key");

        try {
            const playerData = await fetchPlayerData(apiKey);

            if (!playerData) throw new Error("Player not found");

            return playerData; // Return fetched data
        } catch (error) {
            throw new Error(error.message);
        }
    },
});
