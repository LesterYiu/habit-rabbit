const NewTask = ({handleInputText, setTaskName, setDeadline, setTime, setDescription, createTask}) => {
    return(
        <form aria-label="form" name="taskForm" className="createTaskForm">
            <label htmlFor="task">Task</label>
            <input type="text" id="task" onChange={(e) => {handleInputText(e, setTaskName)}}/>

            <label htmlFor="date">Date</label>
            <input type="date" id="date" onChange={(e) => {handleInputText(e, setDeadline)}}/>

            <label htmlFor="time">Time</label>
            <input type="time" id="time" onChange={(e) => {handleInputText(e, setTime)}}/>

            <label htmlFor="description">Description</label>
            <input type="text" id="description" onChange={(e) => {handleInputText(e, setDescription)}}/>

            <button onClick={(e) => {createTask(e)}}>Submit</button>
        </form>
    )
}

export default NewTask;