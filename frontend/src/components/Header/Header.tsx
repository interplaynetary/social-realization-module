import React, { Fragment, HTMLAttributes, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { useRecoilValue } from "recoil";
import { ROUTES } from "../../core/Routes";
import { playerDataAtom } from "../../state/atoms/playerDataAtom";
import { selectedOrgAtom } from "../../state/atoms/selectedOrgAtom";
import Container from "../ui/Container/Container";
import Logo from "../ui/Logo/Logo";
import * as styles from "./Header.module.css";

interface HeaderProps extends HTMLAttributes<HTMLDivElement> {}

// conditonally show, take first letter of organisation? idea
const showAvatar = true;

const Header: React.FC<HeaderProps> = (props) => {
    const { name } = useRecoilValue(playerDataAtom);
    const navigate = useNavigate();

    const handleBackClick = () => {
        navigate(ROUTES.LOGIN); // Navigate to the login page
    };

    return (
        <Fragment>
            <header {...props} className={styles.header}>
                <Logo />

                {showAvatar && (
                    <span className={styles.avatar}>
                        {name ? name.charAt(0) : ""}
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
