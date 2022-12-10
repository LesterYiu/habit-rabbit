import uuid from "react-uuid";
import { handleDropDown, handleScroll } from "../utils/globalFunctions";

const SingleDoneTask = ({i, directToTaskDetails, changeToUnfinishedTask, deleteDoneTask}) => {

    return(
        <div className="taskContainer" key={uuid()} style={{background:i.task.taskColour}} onMouseOver={(e) => {handleScroll(e)}} onMouseLeave={(e) =>{handleScroll(e)}}>
            <div className="taskText">
                <button onClick={() => {directToTaskDetails(i)}}>
                    <p className="taskName">{i.task.name.length > 50 ? i.task.name.slice(0, 50) + "..." : i.task.name}</p>
                </button>
                <p className="taskDescription">{i.task.description.length > 50 ? i.task.description.slice(0, 50) + "...": i.task.description}</p>
            </div>
            <div className="taskAdditionalInfo">
                <div className="labelContainer">
                    <p className={i.task.priority}>{i.task.priority}</p>
                    {i.task.label.map( (labelName) => <p key={uuid()} className={labelName}>{labelName}</p>)}
                </div>
                <div className="dueDateContainer">
                    <p>Planned Completion:</p>
                    <p>{i.task.reformattedDeadline}</p>
                </div>
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