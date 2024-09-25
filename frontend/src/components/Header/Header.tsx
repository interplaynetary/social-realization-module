import React, { HTMLAttributes } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import Container from "../ui/Container/Container";
import Logo from "../ui/Logo/Logo";
import * as styles from "./Header.module.css";

interface HeaderProps extends HTMLAttributes<HTMLDivElement> {}

const Header: React.FC<HeaderProps> = (props) => {
    const navigate = useNavigate(); // Initialize useNavigate

    const handleBackClick = () => {
        navigate("/"); // Navigate to the login page
    };

    return (
        <header {...props} className={styles.header}>
            <Logo />

            <Container>
                {location.pathname !== "/" && ( // Conditionally render the back link
                    <span
                        onClick={handleBackClick}
                        style={{
                            cursor: "pointer",
                            display: "block",
                            marginTop: "var(--page-padding)",
                        }}
                    >
                        ← back
                    </span>
                )}
            </Container>

            <span className={styles.avatar}>D</span>
        </header>
    );
};

export default Header;
