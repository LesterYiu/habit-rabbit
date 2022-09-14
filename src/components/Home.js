import { Link, Navigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { db, auth } from "./firebase";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { useState , useEffect} from "react";

const Home = ({setIsAuth, isAuth, username, setUsername, setUserUID, userUID}) => {

    const [taskName, setTaskName] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [time, setTime] = useState("");
    const [taskList, setTaskList] = useState([]);
    const [isNewTaskClicked, setIsNewTaskClicked] = useState(false);

    useEffect( () => {
        const getPost = async () => {
            const data = await getDocs(collectionRef);
            setTaskList(data.docs.map((doc) => ({...doc.data()})));
        }
        getPost();
    })

    const signUserOut = () => {
        signOut(auth).then( () => {
            localStorage.clear();
            setIsAuth(false);
            setUsername('');
            setUserUID('notSignedIn');
        })
    }

    const handleInputText = (e, setState) => {
        setState(e.target.value);
    }

    const handleNewTask = () => {
        setIsNewTaskClicked(!isNewTaskClicked);
    }

    const collectionRef = collection(db, userUID);

    const createTask = async (e) => {
        e.preventDefault();
        await addDoc(collectionRef, 
            {user: {username: username, id: auth.currentUser.uid}, 
            task: {name: taskName, description, time, deadline}});
    }

    if (isAuth) {
        return(
            <div className="wrapper">
                <p>Good morning, {username}</p>
                <button onClick={handleNewTask}>New Task</button>
                {isNewTaskClicked ? 
                <form aria-label="form" name="taskForm">
                    <label htmlFor="task">Task</label>
                    <input type="text" id="task" onChange={(e) => {handleInputText(e, setTaskName)}}/>

                    <label htmlFor="date">Date</label>
                    <input type="date" id="date" onChange={(e) => {handleInputText(e, setDeadline)}}/>

                    <label htmlFor="time">Time</label>
                    <input type="time" id="time" onChange={(e) => {handleInputText(e, setTime)}}/>

                    <label htmlFor="description">Description</label>
                    <input type="text" id="description" onChange={(e) => {handleInputText(e, setDescription)}}/>
        
                    <button onClick={(e) => {createTask(e)}}>Submit</button>
                </form>
                : null}
                {isAuth ? <button onClick={signUserOut}>Login out</button> : <Link to="/login">Login</Link>}
            </div>
        )
    }
    return <Navigate to="/login" replace/>
}

export default Home;