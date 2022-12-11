import { Link } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../Contexts/AppContext";
import logo from "../assets/logo.png";

const FrontPageSlideMenu = ({setIsNavExpanded}) => {

    const {isAuth} = useContext(AppContext);

    return(
        <nav className="slideMenu">
            <ul>
                <li className="logo">
                    <div className="navLogoContainer">
                        <img src={logo} alt="" />
                    </div>
                </li>
                <li className="aboutUsButton">
                    <a href="https://github.com/LesterYiu">Product
                        <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                    </a>
                </li>
                <li>
                    <a href="https://github.com/LesterYiu">About Us
                        <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                    </a>
                </li>
                <li>
                    <a href="https://www.linkedin.com/in/lester-y-404010238/">Contact
                        <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                    </a>
                </li>
                <li>
                    <a href="https://github.com/LesterYiu/habit-rabbit">Source Code
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
    )
}

export default FrontPageSlideMenu;