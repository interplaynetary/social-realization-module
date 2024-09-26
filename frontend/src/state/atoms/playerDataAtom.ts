import { atom } from "recoil";

type PlayerData = {
    id: string;
    name: string;
};

export const playerDataAtom = atom<PlayerData>({
    key: "playerDataAtom", // unique ID
    default: {
        id: "",
        name: "",
    }, // initial value
});
