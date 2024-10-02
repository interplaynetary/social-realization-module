import { atom } from "recoil";

// Initialize the atom with localStorage value if it exists, or an empty string otherwise
export const apiKeyAtom = atom<string>({
    key: "apiKeyState",
    default: localStorage.getItem("apiKey") || "",
    effects_UNSTABLE: [
        ({ onSet }) => {
            // Save to localStorage whenever the atom's value changes
            onSet((newValue) => {
                if (newValue) {
                    localStorage.setItem("apiKey", newValue);
                } else {
                    localStorage.removeItem("apiKey"); // Remove key from localStorage when it's cleared
                }
            });
        },
    ],
});
