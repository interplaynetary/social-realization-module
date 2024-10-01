import { Fragment, useEffect, useState } from "react";
import * as classes from "./PlayerCard.module.css";

const palette = [
    "#F4A261", // Soft Orange
    "#E9C46A", // Muted Yellow
    "#F6BD60", // Light Peach
    "#A8DADC", // Soft Teal
    "#BDE0FE", // Pale Sky Blue
    "#E5989B", // Muted Pink
    "#B5E48C", // Light Mint Green
    "#C3A7A6", // Muted Mauve
    "#F4BFBF", // Soft Rosy Pink
    "#FFDDC1", // Light Peachy Beige
    "#C9ADA7", // Muted Taupe
    "#FFB4A2", // Soft Coral
    "#A9DEF9", // Pastel Blue
    "#D4A5A5", // Soft Rose
    "#D8E2DC", // Soft Grayish Pink
    "#9CADCE", // Muted Lavender Blue
    "#EEC4C4", // Light Rosy Beige
    "#B7E4C7", // Soft Mint
    "#E9E4E1", // Off-White Grayish Beige
    "#F4D06F", // Muted Light Gold
];

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
            {" "}
            <h4>Players</h4>
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
