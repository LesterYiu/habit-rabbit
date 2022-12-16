import { Link, useLocation } from "react-router-dom";
import { useContext, useRef } from "react";
import { AppContext } from "../Contexts/AppContext";
import { useNavigate } from "react-router-dom";
import FocusLock from 'react-focus-lock';

const HomeNavigation = () => {

    // useContext variables
    const {username, userPic, setIsNewTaskClicked, setIsTaskExpanded, isTaskExpanded, isNavExpanded, setIsNavExpanded, setIsLateSelected, setIsSignOutModalOn} = useContext(AppContext)

    const homeText = useRef(null);
    const newTaskText = useRef(null);
    const calendarText = useRef(null);
    const habitText = useRef(null);
    // const settingsText = useRef(null);
    const logOutText = useRef(null);

    const navEl = useRef(null);
    const ulOneEl = useRef(null);
    const ulTwoEl = useRef(null);
    const profileTextEl = useRef(null);
    const profileInfoContainerEl = useRef(null);

    const arrowIconOne = useRef(null);
    const arrowIconTwo = useRef(null);
    const arrowIconThree = useRef(null);
    const arrowIconFour = useRef(null);
    // const arrowIconFive = useRef(null);
    const arrowIconSix = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();

    const handleNewTask = () => {
        handleShrinkBtn();
        setIsNavExpanded(false);
        setIsNewTaskClicked(true);
    }

    const redirectToPage = (pathname) => {
        if(location.pathname !== `/${pathname}`) navigate(`/${pathname}`);

        if(isNavExpanded === true) {
            setIsNavExpanded(false)
            handleNavToggleBtn()
        }

        if(isTaskExpanded === undefined) return

        if(isTaskExpanded) {
            setIsTaskExpanded(false);
        } else {
            setIsLateSelected(false);
            navigate(`/${pathname}`);
        }
    }

    const handleNavToggleBtn = () => {

        if (!isNavExpanded) {
            handleExpandNav();
            setIsNavExpanded(true);
        } else {
            handleShrinkBtn();
            setIsNavExpanded(false);
        }
    }
    
    const handleExpandNav = () => {
        // Only occurs if on home component

        // navPaddingDiv.current.className = "navExpandedPadding";
        navEl.current.className = "homeNavigation homeSection";
        profileTextEl.current.className = "profileInfoText"
        profileInfoContainerEl.current.className = "profileInfoContainer";

        // Button Text
        homeText.current.className = "expandedButtonText";
        newTaskText.current.className = "expandedButtonText";
        calendarText.current.className = "expandedButtonText";
        habitText.current.className = "expandedButtonText";
        // settingsText.current.className = "expandedButtonText";
        logOutText.current.className = "expandedButtonText";

        // Button Ul Container
        ulOneEl.current.className =  "";
        ulTwoEl.current.className = "accountButtons";

        arrowIconOne.current.className = "fa-solid fa-chevron-right";
        arrowIconTwo.current.className = "fa-solid fa-chevron-right";
        arrowIconThree.current.className = "fa-solid fa-chevron-right";
        arrowIconFour.current.className = "fa-solid fa-chevron-right";
        // arrowIconFive.current.className = "fa-solid fa-chevron-right";
        arrowIconSix.current.className = "fa-solid fa-chevron-right";
    }

    const handleShrinkBtn = () => {
        navEl.current.className = "homeNavigation homeSection minimizedNav";
        profileTextEl.current.className = "profileInfoText defaultHidden";
        profileInfoContainerEl.current.className = "profileInfoContainer minimizedInfoContainer";

        homeText.current.className = "expandedButtonText defaultHidden";
        newTaskText.current.className = "expandedButtonText defaultHidden";
        calendarText.current.className = "expandedButtonText defaultHidden";
        habitText.current.className = "expandedButtonText defaultHidden";
        // settingsText.current.className = "expandedButtonText defaultHidden";
        logOutText.current.className = "expandedButtonText defaultHidden";

        ulOneEl.current.className =  "minimizedUl";
        ulTwoEl.current.className = "minimizedUl accountButtons";

        arrowIconOne.current.className = "fa-solid fa-chevron-right defaultHidden";
        arrowIconTwo.current.className = "fa-solid fa-chevron-right defaultHidden";
        arrowIconThree.current.className = "fa-solid fa-chevron-right defaultHidden";
        arrowIconFour.current.className = "fa-solid fa-chevron-right defaultHidden";
        // arrowIconFive.current.className = "fa-solid fa-chevron-right defaultHidden";
        arrowIconSix.current.className = "fa-solid fa-chevron-right defaultHidden";
    }

    const handleGoBackToHome = () => {
        setIsTaskExpanded(false);
        handleShrinkBtn();
        setIsNavExpanded(false);
    }

    if(!isNavExpanded) {
        return(
        <>
            <nav className="homeNavigation homeSection minimizedNav" ref={navEl}>
                <div className="profileInfoContainer minimizedInfoContainer" ref={profileInfoContainerEl}>
                    <div className="profilePicCont">
                        <img src={userPic ? userPic : null} alt="" />
                    </div>
                    <div className="profileInfoText defaultHidden" ref={profileTextEl}>
                        <p className="profileWelcome">Good&nbsp;Day&nbsp;👋</p>
                        <p className="navDisplayName">{username.split(" ")[0]}</p>
                    </div>
                </div>
                <ul className="minimizedUl" ref={ulOneEl}>
                    <li>
                        <button onClick={() => {redirectToPage('home')}} className="homeBtnOne homeBtn">
                            <span aria-hidden="true">🏡</span>&nbsp;<span className="defaultHidden" ref={homeText}>Home</span>
                            <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true" ref={arrowIconOne}></i>                        
                        </button>
                    </li>
                    <li>
                        <button onClick={handleNewTask} className="homeBtnFive homeBtn">
                            <span aria-hidden="true">✨</span>&nbsp;<span className="defaultHidden" ref={newTaskText}>New&nbsp;Task</span>
                        </button>
                        <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true" ref={arrowIconTwo}></i>
                    </li>
                    <li>
                        <button to="/calendar" className="homeBtnTwo homeBtn" onClick={() => {redirectToPage('calendar')}}>
                            <span aria-hidden="true">🗓️</span> 
                            <span className="defaultHidden" ref={calendarText}>Calendar</span>
                        </button>
                        <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true" ref={arrowIconThree}></i>
                    </li>
                    <li>
                        <button className="homeBtnThree homeBtn" onClick={() => {redirectToPage('habit-tracker')}}>
                            <span aria-hidden="true">📊</span>
                            <span className="defaultHidden" ref={habitText}>Habit Tracker</span>
                        </button>
                        <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true" ref={arrowIconFour}></i>
                    </li>
                </ul>
                <ul className="minimizedUl accountButtons" ref={ulTwoEl}>
                    {/* <li>
                        <Link to="/settings" className="homeBtnFour homeBtn">
                            <span aria-hidden="true">⚙️</span>
                            <span className="defaultHidden" ref={settingsText}>Settings</span>
                        </Link>
                        <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true" ref={arrowIconFive}></i>
                    </li> */}
                    <li>                    
                        <button onClick={() => {setIsSignOutModalOn(true)}} className="homeBtnSix homeBtn">
                            <span aria-hidden="true">🚪</span>
                            <span className="defaultHidden" ref={logOutText}>Logout</span>
                        </button>
                        <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true" ref={arrowIconSix}></i>
                    </li>
                </ul>
                <button className="expandBtn homeBtn" onClick={handleNavToggleBtn}>
                    <span className="sr-only">Expand navigation</span>
                    {!isNavExpanded ? 
                    <i className="fa-solid fa-chevron-right"></i> : 
                    <i className="fa-solid fa-chevron-left"></i>}
                </button>
                {isTaskExpanded ? 
                    <button onClick={handleGoBackToHome} className="exitTaskDetailsBtn homeBtn">
                        <i className="fa-solid fa-left-long" aria-hidden="true"></i>
                        <span className="sr-only">Go Back</span>
                    </button> 
                : null}
            </nav>
            {isNavExpanded ? <div className="overlayBackground homeNavigationOverlay"></div> : null}
        </>
        )
    } else {
        return(
            <FocusLock>
                <nav className="homeNavigation homeSection" ref={navEl}>
                    <div className="profileInfoContainer" ref={profileInfoContainerEl}>
                        <div className="profilePicCont">
                            <img src={userPic ? userPic : null} alt="" />
                        </div>
                        <div className="profileInfoText" ref={profileTextEl}>
                            <p className="profileWelcome">Good&nbsp;Day&nbsp;👋</p>
                            <p className="navDisplayName">{username.split(" ")[0]}</p>
                        </div>
                    </div>
                    <ul ref={ulOneEl}>
                        <li>
                            <button onClick={() => {redirectToPage('home')}} className="homeBtnOne homeBtn">
                                <span aria-hidden="true">🏡</span><span ref={homeText}>Home</span>
                                <i className="fa-solid fa-chevron-right" aria-hidden="true" ref={arrowIconOne}></i>                        
                            </button>
                        </li>
                        <li>
                            <button onClick={handleNewTask} className="homeBtnFive homeBtn">
                                <span aria-hidden="true">✨</span><span ref={newTaskText}>New&nbsp;Task</span>
                            </button>
                            <i className="fa-solid fa-chevron-right" aria-hidden="true" ref={arrowIconTwo}></i>
                        </li>
                        <li>
                            <button className="homeBtnTwo homeBtn" onClick={() => {redirectToPage('calendar')}}>
                                <span aria-hidden="true">🗓️</span> 
                                <span ref={calendarText}>Calendar</span>
                            </button>
                            <i className="fa-solid fa-chevron-right" aria-hidden="true" ref={arrowIconThree}></i>
                        </li>
                        <li>
                            <button className="homeBtn homeBtnThree" onClick={() => {redirectToPage('habit-tracker')}}>
                                <span aria-hidden="true">📊</span>
                                <span ref={habitText}>Habit Tracker</span>
                            </button>
                            <i className="fa-solid fa-chevron-right" aria-hidden="true" ref={arrowIconFour}></i>
                        </li>
                    </ul>
                    <ul className="accountButtons" ref={ulTwoEl}>
                        {/* <li>
                            <Link to="/settings" className="homeBtnFour homeBtn">
                                <span aria-hidden="true">⚙️</span>
                                <span className="defaultHidden" ref={settingsText}>Settings</span>
                            </Link>
                            <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true" ref={arrowIconFive}></i>
                        </li> */}
                        <li>                    
                            <button onClick={() => {setIsSignOutModalOn(true)}} className="homeBtnSix homeBtn">
                                <span aria-hidden="true">🚪</span>
                                <span ref={logOutText}>Logout</span>
                            </button>
                            <i className="fa-solid fa-chevron-right" aria-hidden="true" ref={arrowIconSix}></i>
                        </li>
                    </ul>
                    <button className="expandBtn homeBtn" onClick={handleNavToggleBtn}>
                        <span className="sr-only">Expand navigation</span>
                        {!isNavExpanded ? 
                        <i className="fa-solid fa-chevron-right"></i> : 
                        <i className="fa-solid fa-chevron-left"></i>}
                    </button>
                    {isTaskExpanded ? 
                        <button onClick={handleGoBackToHome} className="exitTaskDetailsBtn homeBtn">
                            <i className="fa-solid fa-left-long" aria-hidden="true"></i>
                            <span className="sr-only">Go Back</span>
                        </button> 
                    : null}
                </nav>
                {isNavExpanded ? <div className="overlayBackground homeNavigationOverlay"></div> : null}
            </FocusLock>
        )
    }
}

export default HomeNavigation;