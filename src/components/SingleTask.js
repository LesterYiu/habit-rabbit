import uuid from "react-uuid"
import { handleScroll } from "../utils/globalFunctions"
import { doc, collection } from "firebase/firestore"
import { db } from "./firebase"

const SingleTask = ({i, directToTaskDetails, updateDatabase, setDoneTaskList, taskList, setTaskList, userUID}) => {

    // Database Collection Reference for user's list of tasks
    const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);

    const changeToFinishedTask = async (id, i, e) => {

        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);

        // This will move a document from the unfinished task collection into the finished task collection if the checkbox is clicked for the first time. This will also set new pieces of state for both the done and to do sections of the home page, thereby re-rendering both with new information.

        // This will update the state, immediately removing the task from the page to avoid repeated onClick function calls. Afterwards, it will remove the document from the ongoing task collection and add it to the finished task collection and then afterwards, update the state with the unfinished collection. This is triggered by the checkmark on the tasks on the "to do" section.
        
        setTaskList(taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]));
        await updateDatabase(doneCollection, postDoc, setDoneTaskList, i);
    }

    return(
        <div className="taskContainer" key={uuid()} style={{background:i.task.taskColour}} onMouseOver={(e) => {handleScroll(e)}} onMouseLeave={(e) =>{handleScroll(e)}}>
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
            <div className="buttonContainer buttonHidden">
                <button className="finishButton" onClick={(e) => {changeToFinishedTask(i.id, i, e)}}>Done</button>
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
export default SingleTask;