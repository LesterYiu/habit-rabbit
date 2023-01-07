import { useState } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../Contexts/AppContext";
import { disableScrollForModalOn } from "../utils/globalFunctions";

// Image Imports
import heroBanner from "../assets/heroBanner.png";
import displayImageOne from "../assets/displayImageOne.png";
import displayImageIcon from "../assets/displayImageIcon.png";
import displayImageTwo from "../assets/displayImageTwo.png";
import displayImageIconTwo from "../assets/displayImageIconTwo.png";
import displayImageThree from "../assets/displayImageThree.png";
import displayImageIconThree from "../assets/displayImageIconThree.png";

// Component Imports
import NavigationBar from "./NavigationBar";
import FrontPageSlideMenu from "./FrontPageSlideMenu";
import { useEffect } from "react";


const FrontPage = () => {

    const {isAuth} = useContext(AppContext);
    const [isNavExpanded, setIsNavExpanded] = useState(false);

    useEffect( () => {
        disableScrollForModalOn(isNavExpanded)
    }, [isNavExpanded])

    return(
        <div className="frontPage">
            <NavigationBar isAuth={isAuth} setIsNavExpanded={setIsNavExpanded} isNavExpanded={isNavExpanded}/>

            {isNavExpanded ?
            <>
                <FrontPageSlideMenu setIsNavExpanded={setIsNavExpanded}/> 
                <div className="overlayBackground" onClick={() => {setIsNavExpanded(false)}}></div>
            </>
            : null
            }
            <header>
                <div className="wrapper">
                    <div className="flexHeader">
                        <div className="heroInfo heroContainer">
                            <h1>Say goodbye to unfulfilled New Year's resolutions!</h1>
                            <p>We’re more than just a simple productivity app. Habit Rabbit eliminates the complexity of tracking habits, and busy agendas.</p>
                            <Link to="/home" className="heroBtn">{isAuth ? "Go to Dashboard" : "Join Today!"}</Link>
                        </div>
                        <div className="heroImageContainer heroContainer">
                            <img src={heroBanner} alt="" />
                        </div>
                    </div>
                </div>
            </header>
            <main id="product">
                <div className="wrapper">
                    <div className="contentOneContainer">
                        <div className="imageContainer">
                            <img src={displayImageOne} alt="" />
                        </div>
                        <div className="contentOneInfo">
                            <div className="contentOneIconContainer">
                                <img src={displayImageIcon} alt="" />
                            </div>
                            <h2>Manage all your daily tasks in style</h2>
                            <p>Stay organized everyday without overcomplicating your thought process! With Rabit Habbit's simple interface, you will never lose your train of thought.</p>
                        </div>
                    </div>
                    <div className="contentOneContainer">
                        <div className="imageContainer">
                            <img src={displayImageTwo} alt="" />
                        </div>
                        <div className="contentOneInfo">
                            <div className="contentOneIconContainer">
                                <img src={displayImageIconTwo} alt="" />
                            </div>
                            <h2>Control your daily chaotic schedule</h2>
                            <p>Redefine how you stay organized. In Rabit Habbit, you are able to form healthy habbits by keeping track of your daily tasks with precision and accuracy.</p>
                        </div>
                    </div>
                    <div className="contentOneContainer">
                        <div className="imageContainer">
                            <img src={displayImageThree} alt="" />
                        </div>
                        <div className="contentOneInfo">
                            <div className="contentOneIconContainer">
                                <img src={displayImageIconThree} alt="" />
                            </div>
                            <h2>Build healthy habits</h2>
                            <p>Customize your everyday workflow by building healthy habits that will last.</p>
                        </div>
                    </div>
                </div>
            </main>
            <footer>
                <div className="wrapper">
                    <ul>
                        <li>
                            <p>©2022 Habit Rabbit Labs, Inc.</p>
                        </li>
                        <li className="creditFooterLink">
                            <p>Made by <a href="https://github.com/LesterYiu" target="_blank"  rel="noreferrer">Lester Yiu</a></p>
                        </li>
                    </ul>
                </div>
            </footer>
        </div>
    )
}

export default FrontPage;