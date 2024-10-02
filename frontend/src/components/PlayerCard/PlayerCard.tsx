import { Fragment, useEffect, useState } from "react";
import Headline from "../ui/Headline/Headline";
import * as classes from "./PlayerCard.module.css";
import { palette } from "./PlayerColorPalette";

interface Org {
    players: {
        [playerId: string]: {
            name: string;
            shares?: number;
        };
    };
}

interface PlayerCardProps {
    org: Org;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ org }) => {
    const [playerColors, setPlayerColors] = useState<{
        [playerId: string]: string;
    }>({});

    useEffect(() => {
        // Shuffle the palette and assign a unique color to each player
        const shuffledPalette = [...palette].sort(() => 0.5 - Math.random());

        const colors = Object.keys(org.players).reduce(
            (acc, playerId, index) => {
                acc[playerId] = shuffledPalette[index % shuffledPalette.length];
                return acc;
            },
            {}
        );

        setPlayerColors(colors);
    }, [org.players]);

    const getRandomColor = () => {
        return palette[Math.floor(Math.random() * palette.length)];
    };
    return (
        <Fragment>
            <Headline level="h4">Players</Headline>

            <div className={classes.playerCard}>
                {Object.keys(org.players).map((playerId) => (
                    <div key={playerId} className={classes.avatarContainer}>
                        <div
                            className={classes.avatar}
                            style={{
                                backgroundColor:
                                    playerColors[playerId] || "#ccc",
                            }}
                            title={org.players[playerId].name}
                        >
                            <span>
                                {(org.players[playerId].name &&
                                    org.players[playerId].name.charAt(0)) ||
                                    "U"}
                            </span>
                        </div>

                        <span className={classes.avatarName}>
                            {org.players[playerId].name}
                        </span>

                        <div className={classes.playerDetails}>
                            {false && <p>ID: {playerId}</p>}

                            {false && (
                                <p>
                                    Shares: {org.players[playerId].shares || 0}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Fragment>
    );
};

export default PlayerCard;
