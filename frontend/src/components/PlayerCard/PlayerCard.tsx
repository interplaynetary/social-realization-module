import { useEffect, useState } from "react";
import { Org } from "../../../../sharedTypes";
import Headline from "../ui/Headline/Headline";
import * as classes from "./PlayerCard.module.css";
import { palette } from "./PlayerColorPalette";

interface PlayerCardProps {
    org: Org;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ org }) => {
    const [playerColors, setPlayerColors] = useState<Record<string, string>>(
        {}
    );

    useEffect(() => {
        // Shuffle the palette and assign a unique color to each player
        const shuffledPalette = [...palette].sort(() => 0.5 - Math.random());

        const colors = Object.keys(org.players).reduce(
            (acc, playerId, index) => {
                acc[playerId] = shuffledPalette[index % shuffledPalette.length];
                return acc;
            },
            {} as Record<string, string>
        );

        setPlayerColors(colors);
    }, [org.players]);

    return (
        <div className={classes.section}>
            <Headline level="h4">
                Players in <span className={classes.orgName}>{org.name}</span>
            </Headline>

            <div className={classes.playerCard}>
                {Object.keys(org.players).map((playerId) => {
                    const player = org.players[playerId];
                    if (!player.name) return null;

                    return (
                        <div key={playerId} className={classes.avatarContainer}>
                            <div
                                className={classes.avatar}
                                style={{
                                    backgroundColor:
                                        playerColors[playerId] || "#ccc",
                                }}
                                title={player.name}
                            >
                                <span>{player.name.charAt(0)}</span>
                            </div>

                            <span className={classes.avatarName}>
                                {player.name}
                            </span>

                            <div className={classes.playerDetails}>
                                {false && <p>ID: {playerId}</p>}
                                {false && <p>Shares: {player.shares || 0}</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PlayerCard;
