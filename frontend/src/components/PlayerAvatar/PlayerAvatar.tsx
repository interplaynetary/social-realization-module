import * as classes from "./PlayerAvatar.module.css";

interface PlayerAvatarProps {
    name: string;
    color: string;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ name, color }) => (
    <div className={classes.avatarContainer}>
        <div
            className={classes.avatar}
            style={{ backgroundColor: color || "#ccc" }}
            title={name}
        >
            <span>{name.charAt(0)}</span>
        </div>
        <span className={classes.avatarName}>{name}</span>
    </div>
);
 

export default PlayerAvatar;