import { useEffect, useState } from "react"
import uuid from "react-uuid"
import { handleScroll } from "../utils/globalFunctions"
import { handleDropDown } from "../utils/globalFunctions"

const SingleTask = ({specificTask, directToTaskDetails, changeToFinishedTask, deleteTask}) => {

    const [isLate, setIsLate] = useState(false);

    useEffect( () => { 
        const today = new Date();

        const deadline = new Date(specificTask.task.deadline.replace(/([-])/g, '/'));
        const deadlineTimeArr = specificTask.task.time.split(":");
        deadline.setHours(deadlineTimeArr[0], deadlineTimeArr[1], 0, 0);

        if(today > deadline) {
            setIsLate(true);
        }
    }, [specificTask.task.deadline, specificTask.task.time])

    return(
        <div className="taskContainer" key={uuid()} onMouseOver={(e) => {handleScroll(e)}} onMouseLeave={(e) =>{handleScroll(e)}}>
            <div className="taskText">
                <button onClick={() => {directToTaskDetails(specificTask)}}>
                    <p className="taskName" onMouseOver={(e) => {e.target.className = "taskName hoverOverTask"}} onMouseLeave={(e) => {e.target.className = "taskName"}}>{specificTask.task.name.length > 50 ? specificTask.task.name.slice(0, 50) + "..." : specificTask.task.name}</p>
                </button>
                <p className="taskDescription">{specificTask.task.description.length > 50 ? specificTask.task.description.slice(0, 50) + "...": specificTask.task.description}</p>
            </div>
            <div className="taskAdditionalInfo">
                <div className="labelContainer">
                    <p className={specificTask.task.priority}>{specificTask.task.priority}</p>
                    {specificTask.task.label.map( (labelName) => 
                    <p key={uuid()} className={labelName}>{labelName}</p>)}
                    {isLate? 
                    <p className="lateLabel">Late</p> : null}
                </div>
                <div className="dueDateContainer">
                    <p>Planned Completion:</p>
                    <p>{specificTask.task.reformattedDeadline}</p>
                </div>
            </div>
            <div className="buttonContainer buttonHidden">
                <button className="finishButton" onClick={(e) => {changeToFinishedTask(specificTask.id, specificTask, e)}}>Done</button>
                <button onClick={(e) => {handleDropDown(e)}}>
                    <i className="fa-solid fa-angle-down"></i>
                </button>
                <div className="dropdownOptions hidden">
                    <ul>
                        <li>
                            <button onClick={() => {directToTaskDetails(specificTask)}}>View Task</button>
                        </li>
                        <li>
                            <button>Edit Task</button>
                        </li>
                        <li>
                            <button onClick={() => {deleteTask(specificTask.id, specificTask)}}>Delete Task</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
export default SingleTask;