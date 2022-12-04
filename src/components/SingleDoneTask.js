import uuid from "react-uuid";
import { handleScroll } from "../utils/globalFunctions";
import { doc, collection } from "firebase/firestore"
import { db } from "./firebase"

const SingleDoneTask = ({i, directToTaskDetails, userUID, updateDatabase, setTaskList, setDoneTaskList, doneTaskList}) => {

    // Database Collection Reference for user's list of tasks
    const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);

    const changeToUnfinishedTask = async (id, i, e) => {

        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`);

        setDoneTaskList(doneTaskList.filter( (task) => task !== doneTaskList[doneTaskList.indexOf(i)])); 

        await updateDatabase(collectionRef, doneDoc, setTaskList, i);
    }

    return(
        <div className="taskContainer" key={uuid()} style={{background:i.task.taskColour}} onMouseOver={(e) => {handleScroll(e)}} onMouseLeave={(e) =>{handleScroll(e)}}>
            {/* <div className="checkboxContainer">
                <input type="checkbox" className="taskCheckbox taskCheckboxChecked" checked onChange={() => {changeToUnfinishedTask(i.id, i)}}/>
                <i className="fa-solid fa-check" onClick={() => {changeToUnfinishedTask(i.id, i)}}></i>
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
                <div className="buttonContainer buttonHidden">
                    <button className="finishButton" onClick={(e) => {changeToUnfinishedTask(i.id, i, e)}}>Not Done</button>
                    <button onClick={() => {directToTaskDetails(i)}}>
                        <i className="fa-solid fa-angle-down"></i>
                    </button>
                    {/* <button className="exitBtn" onClick={() => {deleteDoneTask(i.id, i)}}>
                        <span className="sr-only">Remove Task</span>
                        <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                    </button> */}
                </div>
                {/* 
            <div className="buttonContainer">
                <button onClick={() => {directToTaskDetails(i)}}>
                    <i className="fa-solid fa-ellipsis"></i>
                </button>
                <button className="exitBtn" onClick={() => {deleteDoneTask(i.id, i)}}>
                    <span className="sr-only">Remove Task</span>
                    <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                </button>
            </div>
                */}
        </div>
    )
}

export default SingleDoneTask;