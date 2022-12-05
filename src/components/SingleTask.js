import uuid from "react-uuid"
import { handleScroll } from "../utils/globalFunctions"
import { doc, collection, deleteDoc } from "firebase/firestore"
import { db } from "./firebase"
import { handleDropDown } from "../utils/globalFunctions"

const SingleTask = ({i, directToTaskDetails, updateDatabase, setDoneTaskList, taskList, setTaskList, userUID}) => {

    // Database Collection Reference for user's list of tasks
    const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);

    const changeToFinishedTask = async (id, i) => {

        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);

        // This will move a document from the unfinished task collection into the finished task collection if the checkbox is clicked for the first time. This will also set new pieces of state for both the done and to do sections of the home page, thereby re-rendering both with new information.

        // This will update the state, immediately removing the task from the page to avoid repeated onClick function calls. Afterwards, it will remove the document from the ongoing task collection and add it to the finished task collection and then afterwards, update the state with the unfinished collection. This is triggered by the checkmark on the tasks on the "to do" section.

        setTaskList(taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]));
        await updateDatabase(doneCollection, postDoc, setDoneTaskList, i);
    }

    // Deletes the task found at the specific document id of the task. Filters out the tasklists to exclude the task selected and re-renders the page with newly filtered array. This is for ongoing task list only
    const deleteTask = async (id, i) => {
        const newTaskList = taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]);
        setTaskList(newTaskList);
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);
        await deleteDoc(postDoc);
    }

    return(
        <div className="taskContainer" key={uuid()} style={{background:i.task.taskColour}} onMouseOver={(e) => {handleScroll(e)}} onMouseLeave={(e) =>{handleScroll(e)}}>
            <div className="taskText">
                <button onClick={() => {directToTaskDetails(i)}}>
                    <p className="taskName">{i.task.name.length > 50 ? i.task.name.slice(0, 50) + "..." : i.task.name}</p>
                </button>
                <p className="taskDescription">{i.task.description.length > 50 ? i.task.description.slice(0, 50) + "...": i.task.description}</p>
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
                <button onClick={(e) => {handleDropDown(e)}}>
                    <i className="fa-solid fa-angle-down"></i>
                </button>
                <div className="dropdownOptions hidden">
                    <ul>
                        <li>
                            <button onClick={() => {directToTaskDetails(i)}}>View Task</button>
                        </li>
                        <li>
                            <button>Edit Task</button>
                        </li>
                        <li>
                            <button onClick={() => {deleteTask(i.id, i)}}>Delete Task</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
export default SingleTask;