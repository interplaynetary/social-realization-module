import { atom } from "recoil";
import { Org } from "../../../../sharedTypes";

export const selectedOrgAtom = atom<Org | null>({
    key: "selectedOrgAtom",
    default: null,
});
