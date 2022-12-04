import uuid from "react-uuid"
import { handleScroll } from "../utils/globalFunctions"
import { doc, collection, addDoc, deleteDoc } from "firebase/firestore"
import { db } from "./firebase"

const SearchedSingleTask = ({i, directToTaskDetails, userUID, filterFromReformattedTaskList, searchedTaskList, setSearchedTaskList, reformattedTask, setReformattedTask}) => {

    // Database Collection Reference for user's list of tasks
    const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);

    const changeSearchedToFinishedTask = async (id, i, e) => {
        e.target.disabled = true;
        e.target.innerText = "Updating"
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);

        // Using the task that the user selects, insert it into the correct corresponding week array for donetasklist and donesearchtasklist
                
        filterFromReformattedTaskList(searchedTaskList, setSearchedTaskList, i);
        filterFromReformattedTaskList(reformattedTask, setReformattedTask, i);

        await addDoc(doneCollection, i);
        await deleteDoc(postDoc);

    }

    return(
        <div className="taskContainer" key={uuid()} style={{background:i.task.taskColour}} onMouseOver={(e) => {handleScroll(e)}} onMouseLeave={(e) =>{handleScroll(e)}}>
            {/* <input type="checkbox" className="taskCheckbox" onChange={() => {changeSearchedToFinishedTask(i.id, i)}}/> */}
            <div className="taskText">
                <button onClick={() => {directToTaskDetails(i)}}>
                    <p className="taskName">{i.task.name}</p>
                </button>
                <p className="taskDescription">{i.task.description}</p>
                <div className="labelContainer">
                    <p className={i.task.priority}>{i.task.priority}</p>
                    {i.task.label.map( (labelName) => <p key={uuid()} className={labelName}>{labelName}</p>)}
                </div>
            </div>
            <div className="dueDateContainer">
                <p>Planned Completion:</p>
                <p>{i.task.reformattedDeadline}</p>
            </div>
            {/* <div className="buttonContainer">
                <button onClick={() => {directToTaskDetails(i)}}>
                    <i className="fa-solid fa-ellipsis"></i>
                </button>
                <button className="exitBtn" onClick={() => {deleteTaskSearchedList(i.id, i)}}>
                    <span className="sr-only">Remove Task</span>
                    <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                </button>
            </div> */}
            <div className="buttonContainer buttonHidden">
                <button className="finishButton" onClick={(e) => {changeSearchedToFinishedTask(i.id, i, e)}}>Done</button>
                <button onClick={() => {directToTaskDetails(i)}}>
                    <i className="fa-solid fa-angle-down"></i>
                </button>
                {/* <button className="exitBtn" onClick={() => {deleteTask(i.id, i)}}>
                    <span className="sr-only">Remove Task</span>
                    <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                </button> */}
            </div>
        </div>
    )
}

export default SearchedSingleTask;