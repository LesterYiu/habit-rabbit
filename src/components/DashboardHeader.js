import { debounce } from "../utils/globalFunctions";

const DashboardHeader = ({specificTask, setIsTaskExpanded, isSpecificTaskEmpty, currentUserTime, username, isToDoBtnClicked, handleButtonSwitch, setIsDoneBtnClicked, setIsToDoBtnClicked, isDoneBtnClicked, handleSearchForTask, textInput, matchTaskWithSearch}) => {

    const handleFrontArrowBtn = () => {
        if(specificTask.length === 0) {
            return;
        }
        setIsTaskExpanded(true);
        
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
                </div>
            </div>
        </>
    )
}

export default DashboardHeader;