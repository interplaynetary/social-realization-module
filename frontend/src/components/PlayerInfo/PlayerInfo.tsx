import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useRecoilValue } from "recoil";
import { fetchPlayerData } from "../../api/api";
import { playerDataAtom } from "../../state/atoms/playerDataAtom";
import { selectedOrgAtom } from "../../state/atoms/selectedOrgAtom";
import Container from "../ui/Container/Container";
import Button from "../ui/Button/Button"; // Assuming there's a Button component for navigation
import * as styles from "./PlayerInfo.module.css";

const PlayerInfo: React.FC = () => {
    const { id } = useRecoilValue(playerDataAtom);
    const navigate = useNavigate();

    const [playerData, setPlayerData] = useState<any>(null); // State for player data
    const [loading, setLoading] = useState<boolean>(true); // Loading state
    const [error, setError] = useState<string | null>(null); // Error state

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        setLoading(true);

        try {
            const data = await fetchPlayerData(id);

            if (data.success) {
                setPlayerData(data);
                setError(null); // Reset error if fetch is successful
            } else {
                setError("Failed to fetch player information.");
            }
        } catch (err) {
            setError("An error occurred while fetching player data.");
        } finally {
            setLoading(false);
        }
    };

    const handleEditProfile = () => {
        navigate(`/edit-player/${id}`); // Navigate to edit player page
    };

    return (
        <Container>
            <div className={styles.playerInfo}>
                {loading && <p>Loading player information...</p>}{" "}
                {error && <p className={styles.error}>{error}</p>}{" "}
                {playerData && (
                    <div className={styles.playerDetails}>
                        <h2>{playerData.name}</h2>
                        <p>
                            <strong>ID:</strong> {playerData.id}
                        </p>
                        <p>
                            <strong>Email:</strong> {playerData.email}
                        </p>
                        <p>
                            <strong>Organization:</strong>{" "}
                            {playerData.organization || "N/A"}
                        </p>
                        <p>
                            <strong>Joined:</strong>{" "}
                            {new Date(playerData.joined).toLocaleDateString()}
                        </p>

                        {/* Add a button to edit player profile */}
                        <Button onClick={handleEditProfile}>
                            Edit Profile
                        </Button>
                    </div>
                )}
            </div>
        </Container>
    );
};

export default PlayerInfo;
