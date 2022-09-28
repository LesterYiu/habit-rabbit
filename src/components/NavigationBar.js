import logo from "../assets/logo.png";
import { Link } from "react-router-dom";

const NavigationBar = ({isAuth}) => {
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
                        <li className="aboutUsButton">
                            <a href="https://github.com/LesterYiu.com">Product</a>
                        </li>
                        <li>
                            <a href="https://github.com/LesterYiu">About Us</a>
                        </li>
                        <li>
                            <a href="https://github.com/LesterYiu">Contact</a>
                        </li>
                        <li>
                            <a href="https://github.com/LesterYiu">Source Code</a>
                        </li>
                    </div>
                    {isAuth ?
                    <div className="rightNavigation">
                        <li>
                            <Link to="/home">Dashboard</Link>
                        </li>
                    </div>: 
                    <div className="rightNavigation">
                        <li>
                            <Link to="/login" className="loginButton">Login</Link>
                        </li>
                        <li>
                            <Link to="/create-account">Create Account</Link>
                        </li>
                    </div>}
                </ul>
            </div>
        </nav>
    )
}

export default NavigationBar;