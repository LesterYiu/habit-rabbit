export const debounce = (callbackFunction, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout( () => {
            callbackFunction(...args)
        }, delay);
    }
}

export const handleScroll = (e) => {
        const doneBtnContainer = e.target.childNodes[2];
        if((e.type === "pointerenter" || e.type === "mouseover") && e.target.className === "taskContainer"){
            doneBtnContainer.className = 'buttonContainer'
        } else if (e.type === "pointerleave" && e.target.className === "taskContainer"){

            const doneBtn = doneBtnContainer.firstChild;

            if(doneBtn.disabled){
                return;
            }

            doneBtnContainer.className = 'buttonContainer buttonHidden'            
        }
}

export const handleDropDown = (e) => {
    const dropdownContainer = e.target.parentNode.parentNode.children[2];

    if(dropdownContainer.className === "dropdownOptions hidden") {
        dropdownContainer.className = "dropdownOptions";
    } else {
        dropdownContainer.className = "dropdownOptions hidden";
    }
}

export const reformatTaskByDate = (taskListState, setTaskState) => {
    // Sorts every date by completion week (start of week)
    let taskCounter = {};
    taskListState.forEach( (specificTask) => {
        if(taskCounter[specificTask.task.startDayOfWeek]) {
            taskCounter[specificTask.task.startDayOfWeek].push(specificTask);
        } else {
            taskCounter[specificTask.task.startDayOfWeek] = [specificTask];
        }
    })

    const taskListArrangedByWeek = Object.values(taskCounter).sort((a,b) => a[0].task.firstDayOfWeekTimestamp - b[0].task.firstDayOfWeekTimestamp);

    // Sorts every date by deadline date from most recent to latest while also sorting via task due time.
    for(let weeklyTasks of taskListArrangedByWeek) {
        weeklyTasks.sort( (a , b) => {
            const taskADeadline = new Date(a.task.deadline.replace(/([-])/g, '/'));
            const taskBDeadline = new Date(b.task.deadline.replace(/([-])/g, '/'));

            if (a.task.deadline.replace(/([-])/g, '/') === b.task.deadline.replace(/([-])/g, '/')) {
                return taskADeadline < taskBDeadline? -1 : 1
            }  else {
                return taskADeadline < taskBDeadline ? -1 : 1
            }
        }
    )}
    
    setTaskState(taskListArrangedByWeek);            
}