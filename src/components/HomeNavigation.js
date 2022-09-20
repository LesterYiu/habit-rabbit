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
                    <Link to="/"><i className="fa-solid fa-house" aria-hidden="true"></i>Home</Link>
                </li>
                <li>
                    <Link to="/calendar"><i className="fa-solid fa-calendar" aria-hidden="true"></i>Calendar</Link>
                </li>
                <li>
                    <Link to="/statistics"><i className="fa-solid fa-chart-simple" aria-hidden="true"></i>Statistics</Link>
                </li>
                <li>
                    <Link to="/settings"><i className="fa-solid fa-gear" aria-hidden="true"></i>Settings</Link>
                </li>
                <li>
                    <button onClick={handleNewTask}><i className="fa-solid fa-plus" aria-hidden="true"></i>New Task</button>
                </li>
                <li>                    
                    <button onClick={signUserOut}><i className="fa-solid fa-right-from-bracket"></i>Login out</button>
                </li>
            </ul>
        </nav>
    )
}

export default HomeNavigation;