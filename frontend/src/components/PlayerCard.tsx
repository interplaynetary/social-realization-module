import { useEffect } from "react";

const PlayerCard = ({ org }) => {
    useEffect(() => {
        console.log(org.players);
    }, [org.players]);
    return (
        <div>
            <h4>Players</h4>

            {Object.keys(org.players).map((playerId) => (
                <div key={playerId} className="card">
                    <h3>{org.players[playerId].name || "Unknown Player"}</h3>

                    <p>ID: {playerId}</p>
                    <p>Shares: {org.players[playerId].shares || 0}</p>
                </div>
            ))}
        </div>
    );
};

export default PlayerCard;
