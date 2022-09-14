import { useState } from "react";
import { db, auth } from "./firebase";
import { addDoc, collection } from "firebase/firestore";

const HomeNavigation = ({handleInputText, userUID, username}) => {
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
    }

    return(
        <nav className="homeNavigation homeSection">
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
        </nav>
    )
}

export default HomeNavigation;