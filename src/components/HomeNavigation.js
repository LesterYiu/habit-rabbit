import { useState } from "react";
import { db, auth } from "./firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";
import { signOut } from "firebase/auth";
import NewTask from "./NewTask";

const HomeNavigation = ({handleInputText, userUID, username, userPic, setUsername, setUserUID, setIsAuth, setTaskList}) => {
    
    const [isNewTaskClicked, setIsNewTaskClicked] = useState(false);
    const [taskName, setTaskName] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [time, setTime] = useState("");

    const handleNewTask = () => {
        setIsNewTaskClicked(!isNewTaskClicked);
    }

    const collectionRef = collection(db, `/users/user-list/${userUID}`);

    const createTask = async (e) => {
        e.preventDefault();
        await addDoc(collectionRef, 
            {user: {username: username, id: auth.currentUser.uid}, 
            task: {name: taskName, description, time, deadline}});
        const data = await getDocs(collectionRef);
        setTaskList(data.docs.map((doc) => ({...doc.data()})));
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
            {isNewTaskClicked ? <NewTask handleInputText={handleInputText} setTaskName={setTaskName} setDeadline={setDeadline} setTime={setTime} setDescription={setDescription} createTask={createTask}/>: null}
        </nav>
    )
}

export default HomeNavigation;