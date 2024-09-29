import React, { HTMLAttributes, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useRecoilValue } from "recoil";
import { fetchPlayerData } from "../../api/api";
import { playerDataAtom } from "../../state/atoms/playerDataAtom";
import { selectedOrgAtom } from "../../state/atoms/selectedOrgAtom";
import Container from "../ui/Container/Container";
import * as styles from "./PlayerInfo.module.css";

const PlayerInfo: React.FC = () => {
    const { id } = useRecoilValue(playerDataAtom);
    const navigate = useNavigate();

    const [playerData, setPlayerData] = useState();

    useEffect(() => {
        id && fetchData();
    }, [id]);

    useEffect(() => {
        console.log(playerData, "player!");
        console.log(id, "id?");
    }, [playerData]);

    const fetchData = async () => {
        try {
            const data = await fetchPlayerData(id);

            if (data.success) {
                setPlayerData(data);
            } else {
                console.error("Failed to fetch playerInfo");
            }
        } catch (err) {
            console.error("An error occurred while fetching player data");
        }
    };

    return <div>PlayerInfo</div>;
};

export default PlayerInfo;
