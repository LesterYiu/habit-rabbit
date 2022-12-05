import { auth } from "./firebase";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import { useContext } from "react";
import { AppContext } from "../Contexts/AppContext";
import { useNavigate } from "react-router-dom";

const HomeNavigation = ({setIsNewTaskClicked, setIsTaskExpanded, isTaskExpanded}) => {

    // useContext variables
    const {setIsAuth, username, setUsername, setUserUID, userPic} = useContext(AppContext)

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
        if(isTaskExpanded) {
            setIsTaskExpanded(false);
        } else {
            navigate('/home');
        }
    }
    
    return(
        <nav className="homeNavigation homeSection">
            <div className="profileInfoContainer">
                <div className="profilePicCont">
                    <img src={userPic ? userPic : null} alt="" />
                </div>
                <div className="profileInfoText">
                    <p className="profileWelcome">Good Day👋</p>
                    <p className="navDisplayName">{username}</p>
                </div>
            </div>
            <p className="homeNavSubsection">Main Navigation</p>
            <ul>
                <li>
                    <button onClick={redirectToHome} className="homeBtnOne homeBtn">
                        <div><span aria-hidden="true">🏠</span> Home</div>
                        <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>                        
                    </button>
                </li>
                <li>
                    <button onClick={handleNewTask} className="homeBtnFive homeBtn"><span aria-hidden="true">✨</span>New Task</button>
                    <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                </li>
                <li>
                    <Link to="/calendar" className="homeBtnTwo homeBtn"><span aria-hidden="true">🗓️</span> Calendar</Link>
                    <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                </li>
                <li>
                    <Link to="/statistics" className="homeBtnThree homeBtn"><span aria-hidden="true">📊</span>Statistics</Link>
                    <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                </li>
            </ul>
            <p className="homeNavSubsection">Settings & Logout</p>
            <ul>
                <li>
                    <Link to="/settings" className="homeBtnFour homeBtn"><span aria-hidden="true">⚙️</span>Settings</Link>
                    <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                </li>
                <li>                    
                    <button onClick={signUserOut} className="homeBtnSix homeBtn"><span aria-hidden="true">🚪</span>Logout</button>
                    <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                </li>
            </ul>
        </nav>
    )
}

export default HomeNavigation;