import { auth } from "./firebase";
import { Link, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useContext, useRef } from "react";
import { AppContext } from "../Contexts/AppContext";
import { useNavigate } from "react-router-dom";

const HomeNavigation = () => {

    // useContext variables
    const {setIsAuth, username, setUsername, setUserUID, userPic, setIsNewTaskClicked, setIsTaskExpanded, isTaskExpanded, isNavExpanded, setIsNavExpanded, setIsLateSelected} = useContext(AppContext)

    const homeText = useRef(null);
    const newTaskText = useRef(null);
    const calendarText = useRef(null);
    const statisticsText = useRef(null);
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

    const signUserOut = () => {
        signOut(auth).then( () => {
            setIsAuth(false);
            setUsername('');
            setUserUID('notSignedIn');
            localStorage.clear();
        })
        navigate('/login')
    }

    const redirectToHome = () => {
        
        if(location.pathname !== "/home") navigate('/home');

        if(isNavExpanded === true) {
            setIsNavExpanded(false)
            handleNavToggleBtn()
        }

        if(isTaskExpanded === undefined) return

        if(isTaskExpanded) {
            setIsTaskExpanded(false);
        } else {
            setIsLateSelected(false);
            navigate('/home');
        }
    }

    const redirectToCalendar = () => {
        if(location.pathname !== "/calendar") navigate('/calendar');

        if(isNavExpanded === true) {
            setIsNavExpanded(false)
            handleNavToggleBtn()
        }

        if(isTaskExpanded === undefined) return

        if(isTaskExpanded) {
            setIsTaskExpanded(false);
        } else {
            navigate('/calendar');
            
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
        statisticsText.current.className = "expandedButtonText";
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
        statisticsText.current.className = "expandedButtonText defaultHidden";
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
                        <button onClick={redirectToHome} className="homeBtnOne homeBtn">
                            <div><span aria-hidden="true">🏡</span>&nbsp;<span className="defaultHidden" ref={homeText}>Home</span></div>
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
                        <button to="/calendar" className="homeBtnTwo homeBtn" onClick={redirectToCalendar}>
                            <span aria-hidden="true">🗓️</span> 
                            <span className="defaultHidden" ref={calendarText}>Calendar</span>
                        </button>
                        <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true" ref={arrowIconThree}></i>
                    </li>
                    <li>
                        <Link to="/statistics" className="homeBtnThree homeBtn">
                            <span aria-hidden="true">📊</span>
                            <span className="defaultHidden" ref={statisticsText}>Statistics</span>
                        </Link>
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
                        <button onClick={signUserOut} className="homeBtnSix homeBtn">
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
}

export default HomeNavigation;