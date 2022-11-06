import {format} from "date-fns";

const TaskDetails = ({specificTask}) => {

    console.log(specificTask.task.label);
    return(
        <div className="taskDetails">
            <div className="userLocationBar">
                <div className="userLocationButtons">
                    <i className="fa-solid fa-arrow-left"></i>
                    <i className="fa-solid fa-arrow-right"></i>
                </div>
                <p>🏠 Your workspace</p>
            </div>
            <div className="taskHeader">
                <div className="taskInformation">
                    <i className="fa-regular fa-clipboard"></i>
                    <div className="taskNameContainer">
                        <p className="label">Task</p>
                        <h1>{specificTask.task.name}</h1>
                    </div>
                </div>
                <div>
                    <p className="label">Percent Complete</p>
                    <input type="range" />
                </div>
            </div>
            <div className="taskDescription">
                <p className="label">Description</p>
                <p>{specificTask.task.description}</p>
            </div>
            <div className="taskData">
                <div className="taskDates taskInfoContainer">
                    <p className="label">Planned Competion Date</p>
                    <p>{format(new Date(specificTask.task.deadline), 'MMM e')}</p>
                </div>
                <div className="priorityLevel taskInfoContainer">
                    <p className="label">Priority</p>
                    <p>{specificTask.task.priority}</p>
                </div>
            </div>
            <div className="taskLabelContainer taskInfoContainer">
                <p className="label">Labels</p>
                <div className="labelContainer">
                    {specificTask.task.label.map( (label) => {
                        return(
                            <p>{label}</p>
                        )
                    })}
                </div>
            </div>
            <div className="updateTaskBtns">
                <button className="updatesBtn"><i className="fa-solid fa-note-sticky" aria-hidden="true"></i>New Updates</button>
                <button className="logTimeBtn"><i className="fa-regular fa-clock" aria-hidden="true"></i>Log Time</button>
            </div>
            <div className="updateTasksContainer">
                <p>Start a new update</p>
            </div>
        </div>
    )
}

export default TaskDetails;