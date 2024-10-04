import { Fragment } from "react/jsx-runtime";
import Headline from "../ui/Headline/Headline";
import Tag from "../ui/Tag/Tag";
import * as classes from "./GoalInfo.module.css";

const GoalInfo = ({ org }) => {
    return (
        <div className={classes.section}>
            <Headline level="h4">Goals</Headline>

            <div className={classes.tags}>
                {Object.keys(org.goals).map((goalId) => (
                    <div key={goalId}>
                        {org.goals[goalId].description && (
                            <Tag>
                                {org.goals[goalId].description ||
                                    "No Description"}
                            </Tag>
                        )}

                        {false && (
                            <Fragment>
                                <p>ID: {goalId}</p>
                                <p>
                                    Created by:{" "}
                                    {org.goals[goalId].createdById || "Unknown"}
                                </p>

                                <p>
                                    Potential Value:{" "}
                                    {org.goals[goalId].potentialValue || 0}
                                </p>
                            </Fragment>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GoalInfo;
