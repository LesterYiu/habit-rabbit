import uuid from "react-uuid"
import { handleScroll, handleDropDown } from "../utils/globalFunctions"
import { doc, collection, addDoc, deleteDoc } from "firebase/firestore"
import { db } from "./firebase";

const SearchedSingleTask = ({i, directToTaskDetails, userUID, filterFromReformattedTaskList, searchedTaskList, setSearchedTaskList, reformattedTask, setReformattedTask, setTaskList, taskList}) => {

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

    const deleteTaskSearchedList = async(id, i) => {
        filterFromReformattedTaskList(searchedTaskList, setSearchedTaskList, i);

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
                <button className="finishButton" onClick={(e) => {changeSearchedToFinishedTask(i.id, i, e)}}>Done</button>
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
                            <button onClick={() => {deleteTaskSearchedList(i.id, i)}}>Delete Task</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default SearchedSingleTask;