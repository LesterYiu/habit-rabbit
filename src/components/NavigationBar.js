import { Link } from "react-router-dom";

// Image Imports
import logo from "../assets/logo.png";

const NavigationBar = ({isAuth, setIsNavExpanded, isNavExpanded}) => {
    return(
        <nav>
            <div className="wrapper">
                <ul className="topNavigation">
                    <div className="leftNavigation">
                        <div className="logoContainer">
                            <li className="logoImageCont">
                                <img src={logo} alt="" />
                            </li>
                        </div>
                        <li className="aboutUsButton desktopHiddenAnchor">
                            <a href="https://github.com/LesterYiu">Product</a>
                        </li>
                        <li className="desktopHiddenAnchor">
                            <a href="https://github.com/LesterYiu">About Us</a>
                        </li>
                        <li className="desktopHiddenAnchor">
                            <a href="https://www.linkedin.com/in/lester-y-404010238/">Contact</a>
                        </li>
                        <li className="desktopHiddenAnchor">
                            <a href="https://github.com/LesterYiu/habit-rabbit">Source Code</a>
                        </li>
                    </div>
                    {isAuth ?
                    <div className="rightNavigation">
                        <li className="desktopHiddenAnchor">
                            <Link to="/home">Dashboard</Link>
                        </li>
                    </div>: 
                    <div className="rightNavigation">
                        <li className="desktopHiddenAnchor">
                            <Link to="/login" className="loginButton">Login</Link>
                        </li>
                        <li className="desktopHiddenAnchor">
                            <Link to="/create-account">Create Account</Link>
                        </li>
                    </div>}
                    <div className="rightNavigation mobileHambugerBtn">
                        <button onClick={() => {setIsNavExpanded(!isNavExpanded)}}>
                            <span className="sr-only">Open Menu</span>
                            <i className="fa-solid fa-bars hamburgerIcon"></i>
                        </button>
                    </div>
                </ul>
            </div>
        </nav>
    )
}

export default NavigationBar;