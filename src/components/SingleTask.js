import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useEffect, useContext } from "react";
import uuid from "react-uuid";
import { AppContext } from "../Contexts/AppContext";
import { db } from "./firebase";
import FocusLock from 'react-focus-lock';

const SingleTask = ({specificTask, directToTaskDetails, changeToFinishedTask, deleteTask, isToDoBtnClicked}) => {

    const [isLate, setIsLate] = useState(specificTask.task.isLate)
    const {userUID} = useContext(AppContext); 
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect( () => {
        checkIfLate();
    }, []);

    const checkIfLate = async () => {
        if(isToDoBtnClicked) {
            let documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`, specificTask.id);
            const today = new Date();
            const taskDeadline = new Date(specificTask.task.deadline.replace(/([-])/g, '/'));
            const deadlineTimeArr = specificTask.task.time.split(":");
            taskDeadline.setHours(deadlineTimeArr[0], deadlineTimeArr[1], 0, 0);
            if(today > taskDeadline) {
                await updateDoc(documentRef, {
                    "task.isLate" : true
                }) 
                setIsLate(true);              
            } else {
                await updateDoc(documentRef, {
                    "task.isLate"  : false
                })
                setIsLate(false);
            }
        }
    }

    return(
        <div className="taskContainer" key={uuid()} tabIndex="-1">
            <div className="taskText">
                <button onClick={() => {directToTaskDetails(specificTask)}}>
                    <p className="taskName">{specificTask.task.name.length > 50 ? specificTask.task.name.slice(0, 50) + "..." : specificTask.task.name}</p>
                </button>
                <p className="taskDescription">{specificTask.task.description.length > 50 ? specificTask.task.description.slice(0, 50) + "...": specificTask.task.description}</p>
            </div>
            <div className="taskAdditionalInfo">
                <div className="labelContainer">
                    <p className={specificTask.task.priority}>{specificTask.task.priority}</p>
                    {specificTask.task.label.map( (labelName) => 
                    <p key={uuid()} className={labelName}>{labelName}</p>)}
                    {isLate ? 
                    <p className="lateLabel">Late</p> : null}
                </div>
                <div className="dueDateContainer">
                    <p>Planned Completion:</p>
                    <p>{specificTask.task.reformattedDeadline}</p>
                </div>
            </div>
            <div className="buttonContainer">
                <button className="finishButton" onClick={(e) => {changeToFinishedTask(specificTask.id, specificTask, e)}}>Done</button>
                <button onClick={() => {setIsDropdownOpen(!isDropdownOpen)}}>
                    <i className="fa-solid fa-angle-down"></i>
                </button>
                {isDropdownOpen ?
                <div className="dropdownOptions">
                    <FocusLock>
                        <ul>
                            <li>
                                <button onClick={() => {directToTaskDetails(specificTask)}}>View Task</button>
                            </li>
                            <li>
                                <button onClick={() => {deleteTask(specificTask.id, specificTask)}}>Delete Task</button>
                            </li>
                        </ul>
                    </FocusLock>
                </div> : null}
            </div>
        </div>
    )
}
export default SingleTask;