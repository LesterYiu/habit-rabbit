import { Link } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../Contexts/AppContext";
import FocusLock from 'react-focus-lock';

// Image Imports
import logo from "../assets/logo.png";

const FrontPageSlideMenu = ({setIsNavExpanded}) => {

    const {isAuth} = useContext(AppContext);

    return(
        <FocusLock>
            <nav className="slideMenu">
                <ul>
                    <li className="logo">
                        <div className="navLogoContainer">
                            <img src={logo} alt="" />
                        </div>
                    </li>
                    <li className="aboutUsButton">
                        <a href="https://github.com/LesterYiu" target="_blank"  rel="noreferrer">Product
                            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/LesterYiu" target="_blank"  rel="noreferrer">About Us
                            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                        </a>
                    </li>
                    <li>
                        <a href="https://www.linkedin.com/in/lester-y-404010238/" target="_blank"  rel="noreferrer">Contact
                            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                        </a>
                    </li>
                    <li>
                        <a href="https://github.com/LesterYiu/habit-rabbit" target="_blank"  rel="noreferrer">Source Code
                            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                        </a>
                    </li>
                    <div className="bottomNavContainer">
                        {isAuth ?
                        <li>
                            <Link to="/home">Dashboard
                                <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                            </Link>
                        </li>: 
                        <>
                            <li>
                                <Link to="/login" className="loginButton">Login
                                    <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                                </Link>
                            </li>
                            <li>
                                <Link to="/create-account">Create Account
                                    <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                                </Link>
                            </li>
                        </>}
                    </div>
                </ul>
                <button className="exitModalBtn" onClick={() => {setIsNavExpanded(false)}}>
                    <span className="sr-only">Exit Menu</span>
                    <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                </button>
            </nav>
        </FocusLock>
    )
}

export default FrontPageSlideMenu;