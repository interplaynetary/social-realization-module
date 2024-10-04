import { atom } from "recoil";

// Define the structure for player data
type PlayerData = {
    id: string;
    name?: string;
};

// Create the atom with localStorage effect
export const playerDataAtom = atom<PlayerData>({
    key: "playerDataAtom", // unique ID for this atom
    default: {
        id: "",
        name: "",
    }, // initial default value
    effects_UNSTABLE: [
        ({ setSelf, onSet }) => {
            // Retrieve player data from localStorage on atom initialization
            const savedPlayerData = localStorage.getItem("playerData");
            if (savedPlayerData) {
                const parsedData = JSON.parse(savedPlayerData);
                console.log(
                    "Loaded player data from localStorage:",
                    parsedData
                ); // Log loaded data
                setSelf(parsedData); // Set atom value from localStorage
            } else {
                console.log("No player data found in localStorage."); // Log if no data found
            }

            // Save player data to localStorage whenever it changes
            onSet((newPlayerData) => {
                console.log(
                    "Saving new player data to localStorage:",
                    newPlayerData
                ); // Log data being saved
                localStorage.setItem(
                    "playerData",
                    JSON.stringify(newPlayerData)
                );
            });
        },
    ],
});
