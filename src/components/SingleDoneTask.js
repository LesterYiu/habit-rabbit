import uuid from "react-uuid";
import { handleDropDown, handleScroll } from "../utils/globalFunctions";

const SingleDoneTask = ({specificTask, directToTaskDetails, changeToUnfinishedTask, deleteDoneTask}) => {

    return(
        <div className="taskContainer" key={uuid()} onMouseOver={(e) => {handleScroll(e)}} onMouseLeave={(e) =>{handleScroll(e)}}>
            <div className="taskText">
                <button onClick={() => {directToTaskDetails(specificTask)}}>
                    <p className="taskName">{specificTask.task.name.length > 50 ? specificTask.task.name.slice(0, 50) + "..." : specificTask.task.name}</p>
                </button>
                <p className="taskDescription">{specificTask.task.description.length > 50 ? specificTask.task.description.slice(0, 50) + "...": specificTask.task.description}</p>
            </div>
            <div className="taskAdditionalInfo">
                <div className="labelContainer">
                    <p className={specificTask.task.priority}>{specificTask.task.priority}</p>
                    {specificTask.task.label.map( (labelName) => <p key={uuid()} className={labelName}>{labelName}</p>)}
                </div>
                <div className="dueDateContainer">
                    <p>Planned Completion:</p>
                    <p>{specificTask.task.reformattedDeadline}</p>
                </div>
            </div>
            <div className="buttonContainer buttonHidden">
                <button className="finishButton" onClick={(e) => {changeToUnfinishedTask(specificTask.id, specificTask, e)}}>Not Done</button>
                <button onClick={(e) => {handleDropDown(e)}}>
                    <i className="fa-solid fa-angle-down"></i>
                </button>
                <div className="dropdownOptions hidden">
                    <ul>
                        <li>
                            <button onClick={() => {directToTaskDetails(specificTask)}}>View Task</button>
                        </li>
                        <li>
                            <button onClick={() => {deleteDoneTask(specificTask.id, specificTask)}}>Delete Task</button>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    )
}

export default SingleDoneTask;