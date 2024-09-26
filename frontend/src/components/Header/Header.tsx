import React, { Fragment, HTMLAttributes } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useRecoilValue } from "recoil";
import { selectedOrgAtom } from "../../state/atoms/selectedOrgAtom";
import Container from "../ui/Container/Container";
import Logo from "../ui/Logo/Logo";
import * as styles from "./Header.module.css";

interface HeaderProps extends HTMLAttributes<HTMLDivElement> {}

// conditonally show, take first letter of organisation? idea
const showAvatar = true;

const Header: React.FC<HeaderProps> = (props) => {
    const selectedOrg = useRecoilValue(selectedOrgAtom);
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate("/"); // Navigate to the login page
    };

    return (
        <Fragment>
            <header {...props} className={styles.header}>
                <Logo />

                {showAvatar && (
                    <span className={styles.avatar}>
                        {selectedOrg?.name ? selectedOrg.name.charAt(0) : ""}
                    </span>
                )}
            </header>

            <Container>
                {location.pathname !== "/" && ( // Conditionally render the back link
                    <div onClick={handleBackClick} className={styles.back}>
                        ← back
                    </div>
                )}
            </Container>
        </Fragment>
    );
};

export default Header;
