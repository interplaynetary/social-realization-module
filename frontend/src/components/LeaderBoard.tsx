import { useState } from "react";

const Leaderboard = ({ apiKey, currentOrgId }) => {
    const [leaderboardData, setLeaderboardData] = useState([]);
    const [dimension, setDimension] = useState("potentialValue");

    const fetchLeaderboard = async () => {
        const response = await fetch("http://localhost:3001/player-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apiKey,
                actionType: "getGoalLeaderboard",
                actionParams: [currentOrgId, dimension],
            }),
        });
        const data = await response.json();
        if (data.success) {
            setLeaderboardData(data.result);
        } else {
            alert("Failed to fetch leaderboard");
        }
    };

    return (
        <div>
            <h3>Leaderboards</h3>

            <select
                value={dimension}
                onChange={(e) => setDimension(e.target.value)}
            >
                <option value="potentialValue">Potential Value</option>
                <option value="realizedValue">Realized Value</option>
            </select>

            <button onClick={fetchLeaderboard}>Fetch Leaderboard</button>

            <div>
                {leaderboardData.map((item) => (
                    <div key={item.id} className="leaderboard-item">
                        <h4>{item.description || item.name}</h4>
                        <p>
                            {dimension}: {item[dimension]}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
