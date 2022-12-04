import uuid from "react-uuid";
import { handleScroll } from "../utils/globalFunctions";
import { doc, collection, addDoc, deleteDoc } from "firebase/firestore"
import { db } from "./firebase"

const SearchedDoneSingleTask = ({i, directToTaskDetails, userUID, filterFromReformattedTaskList, reformattedDoneTask, setReformattedDoneTask, doneSearchedTaskList, setDoneSearchedTaskList}) => {

    // Database Collection Reference for user's list of tasks
    const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);

    const changeSearchedToUnfinishedTask = async (id, i, e) => {

        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`)

        filterFromReformattedTaskList(reformattedDoneTask, setReformattedDoneTask, i);
        filterFromReformattedTaskList(doneSearchedTaskList, setDoneSearchedTaskList, i);

        await addDoc(collectionRef, i);
        await deleteDoc(doneDoc);
    }

    return(
        <div className="taskContainer" key={uuid()} style={{background:i.task.taskColour}} onMouseOver={(e) => {handleScroll(e)}} onMouseLeave={(e) =>{handleScroll(e)}}>
            {/* <div className="checkboxContainer">
                <input type="checkbox" className="taskCheckbox taskCheckboxChecked" checked onChange={() => {changeSearchedToUnfinishedTask(i.id, i)}}/>
                <i className="fa-solid fa-check" onClick={() => {changeSearchedToUnfinishedTask(i.id, i)}}></i>
            </div> */}
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
                <button className="exitBtn" onClick={() => {deleteTaskSearchedDoneList(i.id, i)}}>
                    <span className="sr-only">Remove Task</span>
                    <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                </button>
            </div> */}
            <div className="buttonContainer buttonHidden">
                <button className="finishButton" onClick={(e) => {changeSearchedToUnfinishedTask(i.id, i, e)}}>Not Done</button>
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

export default SearchedDoneSingleTask;