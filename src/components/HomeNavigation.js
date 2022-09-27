import { auth } from "./firebase";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";

const HomeNavigation = ({ username, userPic, setUsername, setUserUID, setIsAuth, setIsNewTaskClicked, isNewTaskClicked}) => {
    
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

    return(
        <nav className="homeNavigation homeSection">
            <div className="profilePicCont">
                <img src={userPic} alt="" />
            </div>
            <p className="navDisplayName">{username}</p>
            <ul>
                <li>
                    <Link to="/" className="homeBtnOne homeBtn"><span aria-hidden="true">🏠</span> Home</Link>
                </li>
                <li>
                    <Link to="/calendar" className="homeBtnTwo homeBtn"><span aria-hidden="true">🗓️</span> Calendar</Link>
                </li>
                <li>
                    <Link to="/statistics" className="homeBtnThree homeBtn"><span aria-hidden="true">📊</span>Statistics</Link>
                </li>
                <li>
                    <Link to="/settings" className="homeBtnFour homeBtn"><span aria-hidden="true">⚙️</span>Settings</Link>
                </li>
                <li>
                    <button onClick={handleNewTask} className="homeBtnFive homeBtn"><span aria-hidden="true">✨</span>New Task</button>
                </li>
                <li>                    
                    <button onClick={signUserOut} className="homeBtnSix homeBtn"><span aria-hidden="true">🚪</span>Login out</button>
                </li>
            </ul>
        </nav>
    )
}

export default HomeNavigation;