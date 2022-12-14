import { debounce } from "../utils/globalFunctions";
import { useContext, useState } from "react";
import { AppContext } from "../Contexts/AppContext";
import { reformatTaskByDate } from "../utils/globalFunctions";
import { cloneDeep } from "lodash"
import { useEffect } from "react";

const DashboardHeader = ({currentUserTime, isToDoBtnClicked, handleButtonSwitch, setIsDoneBtnClicked, setIsToDoBtnClicked, isDoneBtnClicked, setIsSearchBarPopulated, reformattedTask, reformattedDoneTask, setSearchedTaskList, setDoneSearchedTaskList, filteredTasks, setFilteredTasks}) => {

    const [textInput, setTextInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFilterModalOn, setIsFilterModalOn] = useState(false);
    // const [isSortModalOn, setIsSortModalOn] = useState(false);

    // useContext variables
    const {username, isLateSelected, setIsLateSelected, isPrioritySelected, setIsPrioritySelected, setFilteredAndSearchedTask} = useContext(AppContext);        

    useEffect( () => {
        if(isLateSelected && textInput) {
            const regex = new RegExp(`${textInput}`, "gi");
            matchFilteredTasksWithSearch(textInput, regex)
        }
    }, [isLateSelected])

    const handleSearchForTask = (value) => {
        let timeout;
        clearTimeout(timeout);
        setIsLoading(true);
        timeout = setTimeout( () => {
            const regex = new RegExp(`${value}`, "gi");
            setTextInput(value);
            if(isLateSelected || isPrioritySelected) {
                matchFilteredTasksWithSearch(value, regex);
            } else {
                matchTaskWithSearch(value, regex);
            }
            setIsLoading(false);
        }, 500)
    }

    const matchTaskToUserText = (listOfTasksHolder, listOfTasks, regex) => {
        for (let i in listOfTasks) {
            for (let o in listOfTasks[i]) {
                if (listOfTasks[i][o].task.name.match(regex)) {
                    listOfTasksHolder.push(listOfTasks[i][o])
                }
            }
        }
    }

    const matchTaskWithSearch = (userInputValue, regex) => {
        if (userInputValue === "") {
            setIsSearchBarPopulated(false);
            return false;
        } else {
            let allTaskResults = [];
            let allDoneTaskResults = [];

            setIsSearchBarPopulated(true);
            
            matchTaskToUserText(allTaskResults, reformattedTask, regex);
            matchTaskToUserText(allDoneTaskResults, reformattedDoneTask, regex);

            reformatTaskByDate(allTaskResults, setSearchedTaskList);
            reformatTaskByDate(allDoneTaskResults, setDoneSearchedTaskList);
        }
    }

    const matchFilteredTasksWithSearch = (userInputValue, regex) => {
        if (userInputValue === "") {
            setIsSearchBarPopulated(false);
            return;
        } else {
            let filteredTaskResults = [];

            setIsSearchBarPopulated(true)

            matchTaskToUserText(filteredTaskResults, filteredTasks, regex)
            reformatTaskByDate(filteredTaskResults, setFilteredAndSearchedTask);
        }
    }

    // Updates the UI when user changes task progress then changes tabs without reloading the page
    const handleSearchedOngoingBtn = () => {
        const regex = new RegExp(`${textInput}`, "gi");
        // setIsSortModalOn(false);
        setIsFilterModalOn(false);
        handleButtonSwitch(setIsDoneBtnClicked, setIsToDoBtnClicked);
        matchTaskWithSearch(textInput, regex);
    }

    const handleSearchedFinishedBtn = () => {
        const regex = new RegExp(`${textInput}`, "gi");
        // setIsSortModalOn(false);
        setIsFilterModalOn(false);
        handleButtonSwitch(setIsToDoBtnClicked, setIsDoneBtnClicked)
        matchTaskWithSearch(textInput, regex);
        setIsLateSelected(false)
    }

    const handleFilterBtn = () => {
        setIsFilterModalOn(!isFilterModalOn);
        // setIsSortModalOn(false)
    }

    // const handleSortBtn = () => {
    //     setIsSortModalOn(!isSortModalOn)
    //     setIsFilterModalOn(false);
    // }

    const handleDefaultOption = () => {
        // setIsSortModalOn(false);
        setIsFilterModalOn(false);
        setFilteredTasks([]);

        setIsLateSelected(false);
        setIsPrioritySelected(false);


    }

    const determineWhichArrList = () => {
        let reformattedTasksArr;

        if(isToDoBtnClicked) {
            reformattedTasksArr = reformattedTask;
        } else if (isDoneBtnClicked) {
            reformattedTasksArr = reformattedDoneTask;
        }
        return reformattedTasksArr;
    }
    
    const handleFilterByLate = () => {

        const lateTasksArr = [];
        const reformattedTasksArr = determineWhichArrList();
        setIsLateSelected(!isLateSelected);
        setIsFilterModalOn(false);
        setIsPrioritySelected(false);

        for(let taskWeek of reformattedTasksArr) {
            for(let specificTask of taskWeek) {
                const today = new Date();
                const deadline = new Date(specificTask.task.deadline.replace(/([-])/g, '/'));
                const deadlineTimeArr = specificTask.task.time.split(":");
                deadline.setHours(deadlineTimeArr[0], deadlineTimeArr[1], 0, 0);

                if(today > deadline) {
                    lateTasksArr.push(specificTask);
                }
            }
        }
        reformatTaskByDate(lateTasksArr, setFilteredTasks);
    }

    // const handleFilterByPriority = () => {
    //     const reformattedTasksArr = determineWhichArrList();
    //     const filteredByPriorityArr = cloneDeep(reformattedTasksArr);

        
    //     setIsPrioritySelected(true);
    //     setIsSortModalOn(false);
    //     setIsLateSelected(false);

    //     for(let weeklyTasks of filteredByPriorityArr){
    //         weeklyTasks.sort( (a, b) => a.task.priorityLevel - b.task.priorityLevel)
    //     }

    //     setFilteredTasks(filteredByPriorityArr);
    // }

    return(
        <>
            <h1 className="noWrapText"><span aria-hidden="true" className="phoneHidden">📮</span> Tasks Dashboard <span aria-hidden="true" className="phoneHidden">📮</span></h1>
            {currentUserTime >= 0 && currentUserTime < 12 ? 
            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive day, {username.split(" ")[0]}?&nbsp;🌞</p> : null}
            {currentUserTime >= 12 && currentUserTime < 18 ?
            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive afternoon, {username.split(" ")[0]}? ☕</p> : null}
            {currentUserTime >= 18 ?
            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive night, {username.split(" ")[0]}? 🌙</p> : null}
            <div className="taskFilters">
                <button className={isToDoBtnClicked ? 'toDoTask taskButtonActive' : 'toDoTask'} onClick={handleSearchedOngoingBtn}>Ongoing</button>
                <button className={isDoneBtnClicked ? 'doneTask taskButtonActive' : 'doneTask'} onClick={handleSearchedFinishedBtn}>Finished</button>
            </div>
            <div className="taskFinderContainer">
                <div className="taskListButtons">
                    <div className="buttonRelativePosition">
                        <button className="filterContainer" onClick={handleFilterBtn} disabled={isDoneBtnClicked}>
                            <i className="fa-solid fa-arrow-down-wide-short"></i>
                            <p>Filter</p>
                        </button>
                        {isFilterModalOn ?
                        <div className="filterModal">
                            <form name="filterForm">
                                <fieldset>
                                    <legend className="sr-only">Choose how to filter your task lists</legend>

                                    <div onClick={handleDefaultOption}>
                                        <input type="radio" name="filterOption" id="allTask" checked={!isLateSelected} readOnly/>
                                        <label htmlFor="allTask">All</label>
                                    </div>

                                    <div onClick={handleFilterByLate}>
                                        <input type="radio" name="filterOption" id="lateTask" checked={isLateSelected} readOnly/>
                                        <label htmlFor="lateTask">Late Tasks</label>
                                    </div>
                                </fieldset>
                            </form>
                        </div> : null}
                    </div>
                    {/* <div className="buttonRelativePosition">
                        <button className="filterContainer" onClick={handleSortBtn}>
                            <i className="fa-solid fa-sort"></i>
                            <p>Sort</p>
                        </button>
                        {isSortModalOn ?
                        <div className="filterModal">
                            <form name="sortForm">
                                <fieldset>
                                    <legend className="sr-only">Choose how to sort your task lists</legend>

                                    <div onClick={handleDefaultOption}>
                                        <input type="radio" name="filterOption" id="allTask" checked={!isPrioritySelected} readOnly/>
                                        <label htmlFor="allTask">Default</label>
                                    </div>

                                    <div onClick={handleFilterByPriority}>
                                        <input type="radio" name="filterOption" id="priorityTask" checked={isPrioritySelected} readOnly/>
                                        <label htmlFor="priorityTask">Priority</label>
                                    </div>

                                </fieldset>
                            </form>
                        </div> : null}
                    </div> */}
                </div>
                <div className="searchContainer">
                    <i className="fa-solid fa-magnifying-glass" aria-hidden="true" ></i>
                    <span className="sr-only">Search</span>
                    <input type="text" className="searchBarInput" placeholder="Search for task..." onChange={debounce((e) => handleSearchForTask(e.target.value), 100)}/>
                    {isLoading ? <div className="lds-ring"><div></div></div> : null}
                </div>
            </div>
        </>
    )
}

export default DashboardHeader;