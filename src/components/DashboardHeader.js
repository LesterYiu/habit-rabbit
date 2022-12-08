import { debounce } from "../utils/globalFunctions";
import { useState } from "react";

const DashboardHeader = ({currentUserTime, username, isToDoBtnClicked, handleButtonSwitch, setIsDoneBtnClicked, setIsToDoBtnClicked, isDoneBtnClicked, setIsSearchBarPopulated, reformattedTask, reformattedDoneTask, reformatTaskByDate, setSearchedTaskList, setDoneSearchedTaskList}) => {

    const [textInput, setTextInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isFilterModalOn, setIsFilterModalOn] = useState(false);
    const [isSortModalOn, setIsSortModalOn] = useState(false);

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

    const handleFilterAndSortBtn = (e) => {
        if(e.target.textContent === "Filter") {
            setIsFilterModalOn(!isFilterModalOn);
            setIsSortModalOn(false);
        } else if (e.target.textContent === "Sort") {
            setIsSortModalOn(!isSortModalOn);
            setIsFilterModalOn(false);
        }
    }

    return(
        <>
            <h1 className="noWrapText"><span aria-hidden="true" className="phoneHidden">📮</span> Tasks Dashboard <span aria-hidden="true" className="phoneHidden">📮</span></h1>
            {currentUserTime >= 0 && currentUserTime < 12 ? 
            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive day, {username}?&nbsp;🌞</p> : null}
            {currentUserTime >= 12 && currentUserTime < 18 ?
            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive afternoon, {username}? ☕</p> : null}
            {currentUserTime >= 18 ?
            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive night, {username}? 🌙</p> : null}
            <div className="taskFilters">
                <button className={isToDoBtnClicked ? 'toDoTask taskButtonActive' : 'toDoTask'} onClick={handleSearchedOngoingBtn}>Ongoing</button>
                <button className={isDoneBtnClicked ? 'doneTask taskButtonActive' : 'doneTask'} onClick={handleSearchedFinishedBtn}>Finished</button>
            </div>
            <div className="taskFinderContainer">
                <div className="taskListButtons">
                    <div className="buttonRelativePosition">
                        <button className="filterContainer" onClick={(e) => {handleFilterAndSortBtn(e)}}>
                            <i className="fa-solid fa-arrow-down-wide-short"></i>
                            <p>Filter</p>
                        </button>
                        {isFilterModalOn ?
                        <div className="filterModal">
                            <form name="filterForm">
                                <fieldset>
                                    <legend className="sr-only">Choose how to filter your task lists</legend>

                                    <div>
                                        <input type="radio" name="filterOption" id="allTask" defaultChecked/>
                                        <label htmlFor="allTask">All</label>
                                    </div>

                                    <div>
                                        <input type="radio" name="filterOption" id="lateTask"/>
                                        <label htmlFor="lateTask">Late Tasks</label>
                                    </div>
                                </fieldset>
                            </form>
                        </div> : null}
                    </div>
                    <div className="buttonRelativePosition">
                        <button className="filterContainer" onClick={(e) => {handleFilterAndSortBtn(e)}}>
                            <i className="fa-solid fa-sort"></i>
                            <p>Sort</p>
                        </button>
                        {isSortModalOn ?
                        <div className="filterModal">
                            <form name="sortForm">
                                <fieldset>
                                    <legend className="sr-only">Choose how to sort your task lists</legend>

                                    <div>
                                        <input type="radio" name="filterOption" id="allTask" defaultChecked/>
                                        <label htmlFor="allTask">Default</label>
                                    </div>

                                    <div>
                                        <input type="radio" name="filterOption" id="priorityTask"/>
                                        <label htmlFor="priorityTask">Priority</label>
                                    </div>

                                </fieldset>
                            </form>
                        </div> : null}
                    </div>
                </div>
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