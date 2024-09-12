import React from "react";
import styles from "./Home.module.css";

const Home: React.FC = () => {
    return (
        <div className={styles.hero}>
            <div className={styles.heroText}>
                Welcome to the Acentis Collaborative Editor
            </div>
        </div>
    );
};

export default Home;
