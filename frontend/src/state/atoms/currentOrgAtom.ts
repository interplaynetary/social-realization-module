import { atom } from "recoil";
import { Org } from "../../../../sharedTypes";

export const currentOrgAtom = atom<Org | null>({
    key: "currentOrgState",
    default: null, // Default to an empty array before the data is fetched
});
