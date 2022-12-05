import { debounce } from "../utils/globalFunctions";
import { useEffect, useState } from "react";

const DashboardHeader = ({specificTask, setIsTaskExpanded, isSpecificTaskEmpty, currentUserTime, username, isToDoBtnClicked, handleButtonSwitch, setIsDoneBtnClicked, setIsToDoBtnClicked, isDoneBtnClicked, setIsSearchBarPopulated, reformattedTask, reformattedDoneTask, reformatTaskByDate, setSearchedTaskList, setDoneSearchedTaskList}) => {

    const [textInput, setTextInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleFrontArrowBtn = () => {
        if(specificTask.length === 0) {
            return;
        }
        setIsTaskExpanded(true);
    }

    const handleSearchForTask = (e) => {
        let timeout;
        clearTimeout(timeout);
        setIsLoading(true);
        timeout = setTimeout( () => {
            const userInput = e.target.value;
            const regex = new RegExp(`${userInput}`, "gi");
            setTextInput(userInput);
            matchTaskWithSearch(userInput, regex);
            setIsLoading(false);
        }, 500)
    }

    const matchTaskWithSearch = (userInputValue, regex) => {
        if (userInputValue === "") {
            setIsSearchBarPopulated(false)
            return false;
        } else {
            let allTaskResults = [];
            let allDoneTaskResults = [];

            setIsSearchBarPopulated(true);
            
            const matchTaskToUserText = (listOfTasksHolder, listOfTasks) => {
                for (let i in listOfTasks) {
                    for (let o in listOfTasks[i]) {
                        if (listOfTasks[i][o].task.name.match(regex)) {
                            listOfTasksHolder.push(listOfTasks[i][o])
                        }
                    }
                }
            }
            matchTaskToUserText(allTaskResults, reformattedTask);
            matchTaskToUserText(allDoneTaskResults, reformattedDoneTask);

            reformatTaskByDate(allTaskResults, setSearchedTaskList);
            reformatTaskByDate(allDoneTaskResults, setDoneSearchedTaskList);
        }
    }

    // Updates the UI when user changes task progress then changes tabs without reloading the page
    const handleSearchedOngoingBtn = () => {
        const regex = new RegExp(`${textInput}`, "gi");
        handleButtonSwitch(setIsDoneBtnClicked, setIsToDoBtnClicked);
        matchTaskWithSearch(textInput, regex);
    }

    const handleSearchedFinishedBtn = () => {
        const regex = new RegExp(`${textInput}`, "gi");
        handleButtonSwitch(setIsToDoBtnClicked, setIsDoneBtnClicked)
        matchTaskWithSearch(textInput, regex);
    }

    return(
        <>
            <div className="userLocationBar">
                <div className="userLocationButtons">
                    <button disabled>
                        <i className="fa-solid fa-arrow-left arrowDisabled"></i>
                    </button>
                    <button onClick={handleFrontArrowBtn} disabled={isSpecificTaskEmpty}>
                        <i className={isSpecificTaskEmpty ? "fa-solid fa-arrow-right arrowDisabled" : "fa-solid fa-arrow-right"}></i>
                    </button>
                </div>
                <p>🏠 <span>Your workspace</span></p>
            </div>
            <h1><span aria-hidden="true">📮</span> Tasks Dashboard <span aria-hidden="true">📮</span></h1>
            {currentUserTime >= 0 && currentUserTime < 12 ? 
            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive day, {username}? 🌞</p> : null}
            {currentUserTime >= 12 && currentUserTime < 18 ?
            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive afternoon, {username}? ☕</p> : null}
            {currentUserTime >= 18 ?
            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive night, {username}? 🌙</p> : null}
            <div className="taskFilters">
                <button className={isToDoBtnClicked ? 'toDoTask taskButtonActive' : 'toDoTask'} onClick={handleSearchedOngoingBtn}>Ongoing</button>
                <button className={isDoneBtnClicked ? 'doneTask taskButtonActive' : 'doneTask'} onClick={handleSearchedFinishedBtn}>Finished</button>
            </div>
            <div className="taskFinderContainer">
                <button className="filterContainer">
                    <i className="fa-solid fa-sort"></i>
                    <p>Filter</p>
                </button>
                <div className="searchContainer">
                    <i className="fa-solid fa-magnifying-glass" aria-hidden="true" ></i>
                    <span className="sr-only">Search</span>
                    <input type="text" className="searchBarInput" placeholder="Search for task..." onChange={debounce((e) => handleSearchForTask(e), 100)}/>
                    {isLoading ? <div className="lds-ring"><div></div></div> : null}
                </div>
            </div>
        </>
    )
}

export default DashboardHeader;