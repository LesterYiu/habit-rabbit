import { useState } from "react";
import { db, auth } from "./firebase";
import { addDoc, getDocs, collection } from "firebase/firestore";

const NewTask = ({userUID, username, setTaskList, handleInputText, setIsNewTaskClicked}) => {
    
    const [taskName, setTaskName] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [time, setTime] = useState("");

    const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask`);

    const createTask = async (e) => {
        e.preventDefault();
        await setIsNewTaskClicked(false);
        await addDoc(collectionRef, 
            { user: {username: username, id: auth.currentUser.uid}, 
            task: {name: taskName, description, time, deadline}});
        const data = await getDocs(collectionRef);
        setTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
    }
    
    const exitModal = (e) => {
        e.preventDefault();
        setIsNewTaskClicked(false);
    }

    return(
        <form aria-label="form" name="taskForm" className="createTaskForm" onSubmit={(e) => {createTask(e)}}>
            <fieldset>
                <legend><h2>Create a new task</h2> <span aria-hidden="true">🪄</span></legend>
                <div className="formField">
                    <div className="formSection">
                        <label htmlFor="task"><span aria-hidden="true">📝</span>Task Name</label>
                        <input type="text" id="task" onChange={(e) => {handleInputText(e, setTaskName)}} required/>
                    </div>

                    <div className="formSection">
                        <label htmlFor="date"><span aria-hidden="true">📅</span>Date</label>
                        <input type="date" id="date" required onChange={(e) => {handleInputText(e, setDeadline)}}/>
                    </div>

                    <div className="formSection">
                        <label htmlFor="time"><span aria-hidden="true">⏱️</span>Time</label>
                        <input type="time" id="time" required onChange={(e) => {handleInputText(e, setTime)}}/>
                    </div>

                    <div className="formSection">
                        <label htmlFor="description"><span aria-hidden="true">🖥️</span>Description</label>
                        <input type="text" id="description" required onChange={(e) => {handleInputText(e, setDescription)}}/>
                    </div>

                    <div className="formSection">
                        <label htmlFor="label"><span aria-hidden="true">🏷️</span>Labels</label>
                        <input type="text" id="label" required />
                    </div>
                </div>

                <button type="submit" className="submitBtn">Create new task</button>
                <button className="exitButton" onClick={(e) => {exitModal(e)}}><i className="fa-solid fa-circle-xmark" aria-hidden="true"></i><p className="sr-only">Exit Modal</p></button>
            </fieldset>
        </form>
    )
}

export default NewTask;