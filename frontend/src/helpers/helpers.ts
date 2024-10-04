import { Org, Orgs } from "../../../sharedTypes";

export const getPlayersNameById = (org: Orgs, id: string) => {
    const foundItem = org.find((item: Org) => item.id === id);
    return foundItem ? foundItem.name : "";
};
