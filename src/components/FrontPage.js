import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import heroBanner from "../assets/heroBanner.png";

const FrontPage = () => {

    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/login');
    }

    return(
        <div className="wrapper frontPage">
            <nav>
                <ul className="topNavigation">
                    <div className="leftNavigation">
                        <div className="logoContainer">
                            <li className="logoImageCont">
                                <img src={logo} alt="" />
                            </li>
                        <p className="companyName">Rabit Habbit</p>
                        </div>
                        <li className="aboutUsButton">
                            <a href="https://github.com/LesterYiu.com">About Us</a>
                        </li>
                        <li>
                            <a href="https://github.com/LesterYiu">Source Code</a>
                        </li>
                    </div>
                    <div className="rightNavigation">
                        <li onClick={handleButtonClick} className="loginButton">Login</li>
                        <li>Create Account</li>
                    </div>
                </ul>
            </nav>
            <header>
                <div className="heroInfo heroContainer">
                    <h1>Say goodbye to unfulfilled New Year's resolutions!</h1>
                    <p>We’re more than just a simple productivity app. Habit Rabbit eliminates the complexity of tracking habits, and busy agendas.</p>
                    <button className="heroBtn">Join Today!</button>
                </div>
                <div className="heroImageContainer heroContainer">
                    <img src={heroBanner} alt="" />
                </div>
            </header>
        </div>
    )
}

export default FrontPage;