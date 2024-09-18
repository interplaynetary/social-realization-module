import React from "react";

const GoalCard = ({ org }) => {
  return (
    <div>
      <h4>Goals</h4>

      {Object.keys(org.goals).map((goalId) => (
        <div key={goaId} className="card">
          <h3>Goal: {org.goals[goalId].description || "No Description"}</h3>
          <p>ID: {goalId}</p>
          <p>Created by: {org.goals[goalId].createdById || "Unknown"}</p>
          <p>Potential Value: {org.goals[goalId].potentialValue || 0}</p>
        </div>
      ))}
    </div>
  );
};

export default GoalCard;
