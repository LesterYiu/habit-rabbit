import { auth } from "./firebase";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useContext, useRef, useState } from "react";
import { AppContext } from "../Contexts/AppContext";
import { useNavigate } from "react-router-dom";

const HomeNavigation = ({setIsNewTaskClicked, setIsTaskExpanded, isTaskExpanded, setIsSearchBarPopulated, navPaddingDiv}) => {

    // useContext variables
    const {setIsAuth, username, setUsername, setUserUID, userPic} = useContext(AppContext)

    const [isNavExpanded, setIsNavExpanded] = useState(false);

    const homeText = useRef(null);
    const newTaskText = useRef(null);
    const calendarText = useRef(null);
    const statisticsText = useRef(null);
    const settingsText = useRef(null);
    const logOutText = useRef(null);

    const navEl = useRef(null);
    const ulOneEl = useRef(null);
    const ulTwoEl = useRef(null);
    const profileTextEl = useRef(null);
    const profileInfoContainerEl = useRef(null);

    const navigate = useNavigate();

    const handleNewTask = () => {
        setIsNewTaskClicked(true);
    }

    const signUserOut = () => {
        signOut(auth).then( () => {
            setIsAuth(false);
            setUsername('');
            setUserUID('notSignedIn');
            localStorage.clear();
        })
    }

    const redirectToHome = () => {
        if(isNavExpanded === true) {
            setIsNavExpanded(false)
            handleNavToggleBtn()
        }

        if(isTaskExpanded === undefined) return

        if(isTaskExpanded) {
            setIsTaskExpanded(false);
        } else {
            setIsTaskExpanded(true);
            navigate('/home');
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
        navPaddingDiv.current.className = "navExpandedPadding";
        navEl.current.className = "homeNavigation homeSection";
        profileTextEl.current.className = "profileInfoText"
        profileInfoContainerEl.current.className = "profileInfoContainer";

        homeText.current.className = "expandedButtonText";
        newTaskText.current.className = "expandedButtonText";
        calendarText.current.className = "expandedButtonText";
        statisticsText.current.className = "expandedButtonText";
        settingsText.current.className = "expandedButtonText";
        logOutText.current.className = "expandedButtonText";

        ulOneEl.current.className =  "";
        ulTwoEl.current.className = "accountButtons";
    }

    const handleShrinkBtn = () => {
        navPaddingDiv.current.className = "";
        navEl.current.className = "homeNavigation homeSection minimizedNav";
        profileTextEl.current.className = "profileInfoText defaultHidden";
        profileInfoContainerEl.current.className = "profileInfoContainer minimizedInfoContainer";

        homeText.current.className = "expandedButtonText defaultHidden";
        newTaskText.current.className = "expandedButtonText defaultHidden";
        calendarText.current.className = "expandedButtonText defaultHidden";
        statisticsText.current.className = "expandedButtonText defaultHidden";
        settingsText.current.className = "expandedButtonText defaultHidden";
        logOutText.current.className = "expandedButtonText defaultHidden";

        ulOneEl.current.className =  "minimizedUl";
        ulTwoEl.current.className = "minimizedUl accountButtons";
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
                        <p className="navDisplayName">{username}</p>
                    </div>
                </div>
                <ul className="minimizedUl" ref={ulOneEl}>
                    <li>
                        <button onClick={redirectToHome} className="homeBtnOne homeBtn">
                            <div><span aria-hidden="true">🏡</span>&nbsp;<span className="defaultHidden" ref={homeText}>Home</span></div>
                            <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true"></i>                        
                        </button>
                    </li>
                    <li>
                        <button onClick={handleNewTask} className="homeBtnFive homeBtn"><span aria-hidden="true">✨</span>&nbsp;<span className="defaultHidden" ref={newTaskText}>New&nbsp;Task</span></button>
                        <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true" ></i>
                    </li>
                    <li>
                        <Link to="/calendar" className="homeBtnTwo homeBtn"><span aria-hidden="true">🗓️</span> <span className="defaultHidden" ref={calendarText}>Calendar</span></Link>
                        <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true"></i>
                    </li>
                    <li>
                        <Link to="/statistics" className="homeBtnThree homeBtn"><span aria-hidden="true">📊</span><span className="defaultHidden" ref={statisticsText}>Statistics</span></Link>
                        <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true"></i>
                    </li>
                </ul>
                <ul className="minimizedUl accountButtons" ref={ulTwoEl}>
                    <li>
                        <Link to="/settings" className="homeBtnFour homeBtn"><span aria-hidden="true">⚙️</span><span className="defaultHidden" ref={settingsText}>Settings</span></Link>
                        <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true"></i>
                    </li>
                    <li>                    
                        <button onClick={signUserOut} className="homeBtnSix homeBtn"><span aria-hidden="true">🚪</span><span className="defaultHidden" ref={logOutText}>Logout</span></button>
                        <i className="fa-solid fa-chevron-right defaultHidden" aria-hidden="true"></i>
                    </li>
                </ul>
                <button className="expandBtn" onClick={handleNavToggleBtn}>
                    <span className="sr-only">Expand navigation</span>
                    {!isNavExpanded ? 
                    <i className="fa-solid fa-chevron-right"></i> : 
                    <i className="fa-solid fa-chevron-left"></i>}
                </button>
            </nav>
            {isNavExpanded ? <div className="overlayBackground"></div> : null}
        </>
    )
}

export default HomeNavigation;