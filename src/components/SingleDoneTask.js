import uuid from "react-uuid";
import { handleDropDown, handleScroll } from "../utils/globalFunctions";
import { doc, collection, deleteDoc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

const SingleDoneTask = ({i, directToTaskDetails, userUID, updateDatabase, setTaskList, setDoneTaskList, doneTaskList}) => {

    // Database Collection Reference for user's list of tasks
    const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);

    const changeToUnfinishedTask = async (id, i) => {

        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`);
        const currentTask = (await getDoc(doneDoc)).data();
        const currentTaskCopy = {...currentTask};
        currentTaskCopy.task.completion = "0";

        setDoneTaskList(doneTaskList.filter( (task) => task !== doneTaskList[doneTaskList.indexOf(i)])); 

        await updateDatabase(collectionRef, doneDoc, setTaskList, currentTaskCopy);
    }

    //  Delete tasks for finished task list only.
    const deleteDoneTask = async (id ,i) => {
        const newDoneList = doneTaskList.filter( (task) => task !== doneTaskList[doneTaskList.indexOf(i)]);
        setDoneTaskList(newDoneList);
        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`);
        await deleteDoc(doneDoc);
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
                    <button className="finishButton" onClick={(e) => {changeToUnfinishedTask(i.id, i, e)}}>Not Done</button>
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
                                <button onClick={() => {deleteDoneTask(i.id, i)}}>Delete Task</button>
                            </li>
                        </ul>
                    </div>
                </div>
        </div>
    )
}

export default SingleDoneTask;