import { useState } from "react";
import { db, auth } from "./firebase";
import { addDoc, getDocs, collection } from "firebase/firestore";

const NewTask = ({userUID, username, setTaskList, handleInputText, setIsNewTaskClicked}) => {
    
    const [taskName, setTaskName] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [time, setTime] = useState("");

    const collectionRef = collection(db, `/users/user-list/${userUID}`);

    const createTask = async (e) => {
        e.preventDefault();
        await addDoc(collectionRef, 
            {user: {username: username, id: auth.currentUser.uid}, 
            task: {name: taskName, description, time, deadline}});
        const data = await getDocs(collectionRef);
        setTaskList(data.docs.map((doc) => ({...doc.data()})));
    }
    
    const exitModal = (e) => {
        e.preventDefault();
        setIsNewTaskClicked(false);
    }

    return(
        <form aria-label="form" name="taskForm" className="createTaskForm">
            <fieldset>
                <legend>Add a new task</legend>
                <label htmlFor="task">Task</label>
                <input type="text" id="task" onChange={(e) => {handleInputText(e, setTaskName)}}/>

                <label htmlFor="date">Date</label>
                <input type="date" id="date" onChange={(e) => {handleInputText(e, setDeadline)}}/>

                <label htmlFor="time">Time</label>
                <input type="time" id="time" onChange={(e) => {handleInputText(e, setTime)}}/>

                <label htmlFor="description">Description</label>
                <input type="text" id="description" onChange={(e) => {handleInputText(e, setDescription)}}/>

                <label htmlFor="labels">Labels</label>
                <input type="text" id="labels" />

                <button onClick={(e) => {createTask(e)}} className="submitBtn">Create new task</button>
                <button className="exitButton" onClick={(e) => {exitModal(e)}}><i className="fa-solid fa-circle-xmark" aria-hidden="true"></i><p className="sr-only">Exit Modal</p></button>
            </fieldset>
        </form>
    )
}

export default NewTask;