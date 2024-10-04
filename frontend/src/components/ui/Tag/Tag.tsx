import * as classes from "./Tag.module.css";

interface TagProps {
    children: React.ReactNode;
}

const Tag: React.FunctionComponent<TagProps> = (props) => {
    return <span className={classes.tag}>{props.children}</span>;
};

export default Tag;
