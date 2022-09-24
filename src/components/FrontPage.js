import logo from "../assets/logo.png";
import heroBanner from "../assets/heroBanner.png";
import { Link } from "react-router-dom";

const FrontPage = ({isAuth}) => {
    return(
        <div className="frontPage">
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
            <header>
                <div className="wrapper">
                    <div className="flexHeader">
                        <div className="heroInfo heroContainer">
                            <h1>Say goodbye to unfulfilled New Year's resolutions!</h1>
                            <p>We’re more than just a simple productivity app. Habit Rabbit eliminates the complexity of tracking habits, and busy agendas.</p>
                            <button className="heroBtn">Join Today!</button>
                        </div>
                        <div className="heroImageContainer heroContainer">
                            <img src={heroBanner} alt="" />
                        </div>
                    </div>
                </div>
            </header>
        </div>
    )
}

export default FrontPage;