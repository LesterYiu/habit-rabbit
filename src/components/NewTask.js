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

        await setIsNewTaskClicked(false);
        await addDoc(collectionRef, 
            {user: {username: username, id: auth.currentUser.uid}, 
            task: {name: taskName, description, time, deadline}});
        const data = await getDocs(collectionRef);
        await setTaskList(data.docs.map((doc) => ({...doc.data()})));
    }
    
    const exitModal = (e) => {
        e.preventDefault();
        setIsNewTaskClicked(false);
    }

    return(
        <form aria-label="form" name="taskForm" className="createTaskForm" onSubmit={(e) => {createTask(e)}}>
            <fieldset>
                <legend>Add a new task</legend>
                <label htmlFor="task">Task</label>
                <input type="text" id="task" onChange={(e) => {handleInputText(e, setTaskName)}} required/>

                <label htmlFor="date">Date</label>
                <input type="date" id="date" required onChange={(e) => {handleInputText(e, setDeadline)}}/>

                <label htmlFor="time">Time</label>
                <input type="time" id="time" required onChange={(e) => {handleInputText(e, setTime)}}/>

                <label htmlFor="description">Description</label>
                <input type="text" id="description" required onChange={(e) => {handleInputText(e, setDescription)}}/>

                <label htmlFor="labels">Labels</label>
                <input type="text" id="labels" required />

                <button type="submit" className="submitBtn">Create new task</button>
                <button className="exitButton" onClick={(e) => {exitModal(e)}}><i className="fa-solid fa-circle-xmark" aria-hidden="true"></i><p className="sr-only">Exit Modal</p></button>
            </fieldset>
        </form>
    )
}

export default NewTask;