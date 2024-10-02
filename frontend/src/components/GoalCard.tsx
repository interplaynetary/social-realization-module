import Headline from "./ui/Headline/Headline";

const GoalCard = ({ org }) => {
    return (
        <div>
            <Headline level="h4">Goals</Headline>

            {Object.keys(org.goals).map((goalId) => (
                <div key={goalId} className="card">
                    <span >
                        Goal:{" "}
                        {org.goals[goalId].description || "No Description"}
                    </span>

                    <p>ID: {goalId}</p>

                    <p>
                        Created by: {org.goals[goalId].createdById || "Unknown"}
                    </p>

                    <p>
                        Potential Value: {org.goals[goalId].potentialValue || 0}
                    </p>
                </div>
            ))}
        </div>
    );
};

export default GoalCard;
