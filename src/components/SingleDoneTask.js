import { useState } from "react";
import uuid from "react-uuid";
import FocusLock from 'react-focus-lock';

const SingleDoneTask = ({specificTask, directToTaskDetails, changeToUnfinishedTask, deleteDoneTask}) => {

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
                    {specificTask.task.label.map( (labelName) => <p key={uuid()} className={labelName}>{labelName}</p>)}
                </div>
                <div className="dueDateContainer">
                    <p>Planned Completion:</p>
                    <p>{specificTask.task.reformattedDeadline}</p>
                </div>
            </div>
            <div className="buttonContainer">
                <button className="finishButton" onClick={(e) => {changeToUnfinishedTask(specificTask.id, specificTask, e)}}>Not Done</button>
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
                                <button onClick={() => {deleteDoneTask(specificTask.id, specificTask)}}>Delete Task</button>
                            </li>
                        </ul>
                    </FocusLock>
                </div>
                : null}
            </div>
        </div>
    )
}

export default SingleDoneTask;