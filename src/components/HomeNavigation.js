import { useLocation } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../Contexts/AppContext";
import { useNavigate } from "react-router-dom";
import FocusLock from 'react-focus-lock';

// Component Imports
import ConditionalWrapper from "./ConditionalWrapper";

const HomeNavigation = () => {

    // useContext variables
    const {username, userPic, setIsNewTaskClicked, setIsTaskExpanded, isTaskExpanded, isNavExpanded, setIsNavExpanded, setIsLateSelected, setIsSignOutModalOn} = useContext(AppContext)

    const location = useLocation();
    const navigate = useNavigate();

    const handleNewTask = () => {
        setIsNavExpanded(false);
        setIsNewTaskClicked(true);
    }

    const redirectToPage = (pathname) => {
        if(location.pathname !== `/${pathname}`) {
            setIsTaskExpanded(false);
            setIsNavExpanded(false);
            navigate(`/${pathname}`);
            return;
        }

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
        if(isNavExpanded) {
            setIsNavExpanded(false);
        } else {
            setIsNavExpanded(true);
        }
    }  

    const handleGoBackToHome = () => {
        setIsTaskExpanded(false);
        setIsNavExpanded(false);
    }

    return(
        <ConditionalWrapper condition={isNavExpanded} wrapper={children => <FocusLock>{children}</FocusLock>}>
            <>
                <nav className={isNavExpanded ? "homeNavigation homeSection" : "homeNavigation homeSection minimizedNav"}>
                    <div className={isNavExpanded ? "profileInfoContainer" : "profileInfoContainer minimizedInfoContainer"}>
                        <div className="profilePicCont">
                            <img src={userPic ? userPic : null} alt="" />
                        </div>
                        <div className={isNavExpanded ? "profileInfoText" : "profileInfoText defaultHidden"}>
                            <p className="profileWelcome">Good&nbsp;Day&nbsp;👋</p>
                            <p className="navDisplayName">{username.split(" ")[0]}</p>
                        </div>
                    </div>
                    <ul className={isNavExpanded ? "" : "minimizedUl"}>
                        <li>
                            <button onClick={() => {redirectToPage('home')}} className={location.pathname === "/home" ? "homeBtnOne homeBtn currentPath" : "homeBtnOne homeBtn"}>
                                <span aria-hidden="true">🏡</span>&nbsp;
                                <span className={isNavExpanded ? "" : "defaultHidden"}>Home</span>
                                <i className={isNavExpanded ? "fa-solid fa-chevron-right" : "fa-solid fa-chevron-right defaultHidden"} aria-hidden="true"></i>                        
                            </button>
                        </li>
                        <li>
                            <button onClick={handleNewTask} className="homeBtnFive homeBtn">
                                <span aria-hidden="true">✨</span>&nbsp;
                                <span className={isNavExpanded ? "" : "defaultHidden"}>New&nbsp;Task</span>
                                <i className={isNavExpanded ? "fa-solid fa-chevron-right" : "fa-solid fa-chevron-right defaultHidden"} aria-hidden="true"></i>
                            </button>
                        </li>
                        <li>
                            <button to="/calendar" className={location.pathname === "/calendar" ? "homeBtnTwo homeBtn currentPath" : "homeBtnTwo homeBtn"} onClick={() => {redirectToPage('calendar')}}>
                                <span aria-hidden="true">🗓️</span> 
                                <span className={isNavExpanded ? "" : "defaultHidden"}>Calendar</span>
                                <i className={isNavExpanded ? "fa-solid fa-chevron-right" : "fa-solid fa-chevron-right defaultHidden"} aria-hidden="true"></i>
                            </button>
                        </li>
                        <li>
                            <button className={location.pathname === "/habit-tracker" ? "homeBtnThree homeBtn currentPath" : "homeBtnThree homeBtn"} onClick={() => {redirectToPage('habit-tracker')}}>
                                <span aria-hidden="true">📊</span>
                                <span className={isNavExpanded ? "" : "defaultHidden"}>Habit Tracker</span>
                                <i className={isNavExpanded ? "fa-solid fa-chevron-right" : "fa-solid fa-chevron-right defaultHidden"} aria-hidden="true"></i>
                            </button>
                        </li>
                    </ul>
                    <ul className={isNavExpanded ? "accountButtons" : "minimizedUl accountButtons"}>
                        <li>                    
                            <button onClick={() => {setIsSignOutModalOn(true)}} className="homeBtnSix homeBtn">
                                <span aria-hidden="true">🚪</span>
                                <span className={isNavExpanded ? "" : "defaultHidden"}>Logout</span>
                                <i className={isNavExpanded ? "fa-solid fa-chevron-right" : "fa-solid fa-chevron-right defaultHidden"} aria-hidden="true"></i>
                            </button>
                        </li>
                    </ul>
                    <button className="expandBtn homeBtn" onClick={handleNavToggleBtn}>
                        {!isNavExpanded ? 
                        <>
                            <i className="fa-solid fa-chevron-right"></i>
                            <span className="sr-only">Expand navigation</span>
                        </> : 
                        <>
                            <i className="fa-solid fa-chevron-left"></i>
                            <span className="sr-only">Minimize navigation</span>
                        </>}
                    </button>
                    {isTaskExpanded ? 
                        <button onClick={handleGoBackToHome} className="exitTaskDetailsBtn homeBtn">
                            <i className="fa-solid fa-left-long" aria-hidden="true"></i>
                            <span className="sr-only">Go Back</span>
                        </button> 
                    : null}
                </nav>
                {isNavExpanded ? <div className="overlayBackground homeNavigationOverlay" onClick={() => {setIsNavExpanded(false)}}></div> : null}
            </>
        </ConditionalWrapper>
    )
}

export default HomeNavigation;