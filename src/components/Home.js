import HomeNavigation from "./HomeNavigation";
import NewTask from "./NewTask";
// import CustomizeTab from "./CustomizeTab";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { useState , useEffect, useContext} from "react";
import errorMessageOne from "../assets/errorMessageOne.gif";
import errorMessageTwo from "../assets/errorMessageTwo.gif";
import { AppContext } from "../Contexts/AppContext";
import uuid from "react-uuid";
import { getHours } from "date-fns";
import TaskDetails from "./TaskDetails";
import { debounce } from "../utils/globalFunctions";

const Home = () => {

    const [taskList, setTaskList] = useState([]);
    const [doneTaskList, setDoneTaskList] = useState([]);
    const [reformattedTask, setReformattedTask] = useState([]);
    const [reformattedDoneTask, setReformattedDoneTask] = useState([]); 
    const [searchedTaskList, setSearchedTaskList] = useState([]);
    const [doneSearchedTaskList, setDoneSearchedTaskList] = useState([]);
    const [specificTask, setSpecificTask] = useState([]);

    const [isNewTaskClicked, setIsNewTaskClicked] = useState(false);
    const [isToDoBtnClicked, setIsToDoBtnClicked] = useState(true);
    const [isDoneBtnClicked, setIsDoneBtnClicked] = useState(false);

    const [isSearchBarPopulated, setIsSearchBarPopulated] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [textInput, setTextInput] = useState("");
    const [currentUserTime, setCurrentUserTime] = useState("");

    const [isOngoingTaskListZero, setIsOngoingTaskListZero] = useState(false);
    const [isFinishedTaskListZero, setIsFinishedTaskListZero] = useState(false);
    const [isOngoingSearchTaskFound, setIsOngoingSearchTaskFound] = useState(true);
    const [isFinishedSearchTaskFound, setIsFinishedSearchTaskFound] = useState(true);
    const [isTaskExpanded, setIsTaskExpanded] = useState(false);
    const [isSpecificTaskEmpty, setIsSpecificTaskEmpty] = useState(true);

    // useContext variables
    const {setIsAuth, isAuth, username, setUsername, setUserUID, userUID, userPic, setUserPic} = useContext(AppContext);

    // Database Collection Reference for user's list of tasks
    const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);
    const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);

    // On initial mount, if the user is signed in, this will set their user information in state.
    useEffect( () => {
        onAuthStateChanged( auth, (user) => {
            if (user) {
                setUsername(user.displayName);
                setUserUID(user.auth.currentUser.uid);
                setUserPic(user.photoURL);
                setIsAuth(!user.isAnonymous);
            }
        })
    }, [setUsername, setUserUID, setUserPic, setIsAuth])

    // On initial mount, this will collect the tasks under the logged in user's userUID and set it into state to populate the page.
    useEffect( () => {

        const getPost = async () => {
            // data - ongoing tasks, doneData - finished tasks
            const data = await getDocs(collectionRef);
            const doneData = await getDocs(doneCollection);

            // This will layout the docs data in an array with the document id which can be used later to remove each individual doc
            setTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
            setDoneTaskList(doneData.docs.map((doc) => ({...doc.data(), id: doc.id})));

            setIsPageLoading(false);
        }
        
        getPost();

        setCurrentUserTime(getHours(new Date()));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userUID, setUserUID, doneSearchedTaskList, searchedTaskList]);

    useEffect( () => {
        const reformatTaskList = () => {

            reformatTaskByDate(taskList, setReformattedTask);
            reformatTaskByDate(doneTaskList, setReformattedDoneTask);

        }
        reformatTaskList();
    }, [taskList, doneTaskList]);

    useEffect( () => {

        const checkLength = (list, setState) => {
            if(list.length === 0) {
                setState(true);
            } else {
                setState(false);
            }
        }

        checkLength(reformattedTask, setIsOngoingTaskListZero);
        checkLength(reformattedDoneTask, setIsFinishedTaskListZero);
        checkLength(searchedTaskList, setIsOngoingSearchTaskFound);
        checkLength(doneSearchedTaskList, setIsFinishedSearchTaskFound);

    }, [reformattedTask, reformattedDoneTask, searchedTaskList, doneSearchedTaskList])

    // Sorts the tasks by deadline date
    for (let i in reformattedTask) {
        if(reformattedTask[i] !== undefined) {
            reformattedTask[i].sort((a,b) => a.task.unformattedDeadline - b.task.unformattedDeadline);
        }
    } 

    for (let i in reformattedDoneTask) {
        if(reformattedDoneTask[i] !== undefined) {
            reformattedDoneTask[i].sort((a,b) => a.task.unformattedDeadline - b.task.unformattedDeadline)
        }
    }

    const handleButtonSwitch = (switchToFalse, switchToTrue) => {
        switchToTrue(true);
        switchToFalse(false);
    }

    const reformatTaskByDate = (taskListState, setTaskState) => {
        let taskCounter = {};
        taskListState.forEach( (specificTask) => {
            if(taskCounter[specificTask.task.startDayOfWeek]) {
                taskCounter[specificTask.task.startDayOfWeek].push(specificTask);
            } else {
                taskCounter[specificTask.task.startDayOfWeek] = [specificTask];
            }
        })

        const taskListArrangedByWeek = Object.values(taskCounter).sort((a,b) => a[0].task.firstDayOfWeekTimestamp - b[0].task.firstDayOfWeekTimestamp);

        setTaskState(taskListArrangedByWeek);            
    }


    // Deletes the task found at the specific document id of the task. Filters out the tasklists to exclude the task selected and re-renders the page with newly filtered array. This is for ongoing task list only
    const deleteTask = async (id, i) => {
        const newTaskList = taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]);
        setTaskList(newTaskList);
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);
        await deleteDoc(postDoc);
    }

    //  Delete tasks for finished task list only.
    const deleteDoneTask = async (id ,i) => {
        const newDoneList = doneTaskList.filter( (task) => task !== doneTaskList[doneTaskList.indexOf(i)]);
        setDoneTaskList(newDoneList);
        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`);
        await deleteDoc(doneDoc);
    }

    const changeToFinishedTask = async (id, i) => {
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);

        // This will move a document from the unfinished task collection into the finished task collection if the checkbox is clicked for the first time. This will also set new pieces of state for both the done and to do sections of the home page, thereby re-rendering both with new information.

        // This will update the state, immediately removing the task from the page to avoid repeated onClick function calls. Afterwards, it will remove the document from the ongoing task collection and add it to the finished task collection and then afterwards, update the state with the unfinished collection. This is triggered by the checkmark on the tasks on the "to do" section.

        setTaskList(taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]));

        await addDoc(doneCollection, i);
        await deleteDoc(postDoc);

        const doneData = await getDocs(doneCollection);
        setDoneTaskList(doneData.docs.map((doc) => ({...doc.data(), id: doc.id})));
        
    }

    const changeToUnfinishedTask = async (id, i) => {

        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`)

        setDoneTaskList(doneTaskList.filter( (task) => task !== doneTaskList[doneTaskList.indexOf(i)])); 

        await addDoc(collectionRef, i);
        await deleteDoc(doneDoc);

        const data = await getDocs(collectionRef);
        setTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
    }

    // Filters out the user's checked task from the searched task list of tasks
    const filterFromReformattedTaskList = (reformattedTaskList, setState, i) => {
        let taskArrayContainer = [];

        reformattedTaskList.forEach( (weekArr) => {
            if(!weekArr.includes(i) || weekArr.length > 1) {
                taskArrayContainer.push(weekArr.filter( (task) => {
                    return task !== i;
                }))
            }
        }) 
        
        setState(taskArrayContainer)
    }

    const deleteTaskSearchedList = async(id, i) => {
        filterFromReformattedTaskList(searchedTaskList, setSearchedTaskList, i);

        const newTaskList = taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]);
        setTaskList(newTaskList);
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);
        await deleteDoc(postDoc);
    }

    const deleteTaskSearchedDoneList = async(id, i) => {
        filterFromReformattedTaskList(doneSearchedTaskList, setDoneSearchedTaskList, i);

        const newDoneList = doneTaskList.filter( (task) => task !== doneTaskList[doneTaskList.indexOf(i)]);
        setDoneTaskList(newDoneList);
        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`);
        await deleteDoc(doneDoc);
    }

    const changeSearchedToFinishedTask = async (id, i) => {
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);

        // Using the task that the user selects, insert it into the correct corresponding week array for donetasklist and donesearchtasklist
                
        filterFromReformattedTaskList(searchedTaskList, setSearchedTaskList, i);
        filterFromReformattedTaskList(reformattedTask, setReformattedTask, i);

        await addDoc(doneCollection, i);
        await deleteDoc(postDoc);

    }

    const changeSearchedToUnfinishedTask = async (id, i) => {

        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`)

        filterFromReformattedTaskList(reformattedDoneTask, setReformattedDoneTask, i);
        filterFromReformattedTaskList(doneSearchedTaskList, setDoneSearchedTaskList, i);

        await addDoc(collectionRef, i);
        await deleteDoc(doneDoc);
    }

    const handleDropdownTasks = (e) => {
        const iconEl = e.target;
        const taskMainContainerEl = e.target.offsetParent.nextSibling;
        if (iconEl.className === "fa-solid fa-caret-up") {
            // If the user wants the tasks to drop down
            iconEl.className = "fa-solid fa-caret-down";
            taskMainContainerEl.className = "taskMainContainer openContainer";
        } else if (iconEl.className === "fa-solid fa-caret-down") {
            //  If the user wants the tasks to minimize
            iconEl.className = "fa-solid fa-caret-up";
            taskMainContainerEl.className = "taskMainContainer closedContainer";
        }
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

    const handleSearchForTask = (e) => {

        const userInput = e.target.value;
        const regex = new RegExp(`${userInput}`, "gi");
        setTextInput(userInput);

        matchTaskWithSearch(userInput, regex);

    }

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

    const directToTaskDetails = (taskData) => {
        setSpecificTask(taskData);
        setIsTaskExpanded(true);
    }

    const handleFrontArrowBtn = () => {
        if(specificTask.length === 0) {
            return;
        }
        setIsTaskExpanded(true);
        
    }

    if(isAuth && isTaskExpanded) {
        return(
            <div className="homePage">
                <HomeNavigation setIsNewTaskClicked={setIsNewTaskClicked} />
                <TaskDetails specificTask={specificTask} setIsTaskExpanded={setIsTaskExpanded} setIsSpecificTaskEmpty={setIsSpecificTaskEmpty}/>
                {isNewTaskClicked ? 
                <>
                    <NewTask setTaskList={setTaskList} setIsNewTaskClicked={setIsNewTaskClicked}/>
                    <div className="overlayBackground"></div>
                </>
                : null}
            </div>
        )
    }

    if (isAuth && !isSearchBarPopulated) {
        return(
            <>
                <div className="homePage">
                    <HomeNavigation setIsNewTaskClicked={setIsNewTaskClicked} />
                    <div className="homeDashboard homeSection">
                        <div className="dashboardContent">
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
                            {currentUserTime >= 5 && currentUserTime < 12 ? 
                            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive day, {username}? 🌞</p> : null}
                            {currentUserTime >= 12 && currentUserTime < 18 ?
                            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive afternoon, {username}? ☕</p> : null}
                            {currentUserTime >= 18 && currentUserTime < 5 ?
                            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive night, {username}? 🌙</p> : null}
                            <div className="taskFilters">
                                <button className={isToDoBtnClicked ? 'toDoTask taskButtonActive' : 'toDoTask'} onClick={() => {handleButtonSwitch(setIsDoneBtnClicked, setIsToDoBtnClicked)}}>Ongoing</button>
                                <button className={isDoneBtnClicked ? 'doneTask taskButtonActive' : 'doneTask'} onClick={() => {handleButtonSwitch(setIsToDoBtnClicked, setIsDoneBtnClicked)}}>Finished</button>
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
                            <div className="allTasksContainer">
                                {isPageLoading && isToDoBtnClicked ? 
                                <div className="noTaskFoundContainer loadingContainer">
                                    <p>Now loading...</p>
                                    <div className="lds-ring"><div></div></div>
                                </div> : null
                                }
                                {isOngoingTaskListZero && isToDoBtnClicked && isPageLoading === false? 
                                <div className="noTaskFoundContainer">
                                    <p>There are currently no outstanding tasks.</p>
                                    <p>Take a sip of tea and relax!</p>
                                    <div className="errorImageContainer">
                                        <img src={errorMessageOne} alt="" />
                                    </div>
                                </div> : null
                                }
                                {isFinishedTaskListZero && isDoneBtnClicked && isPageLoading === false?
                                <div className="noTaskFoundContainer">
                                    <p>There is currently nothing in this section!</p>
                                    <p>Take a sip of tea and get back to work!</p>
                                    <div className="errorImageContainer">
                                        <img src={errorMessageOne} alt="" />
                                    </div>
                                </div> : null}
                                {isToDoBtnClicked ?
                                Object.keys(reformattedTask).map( (date) => {
                                    return (
                                        <div key={uuid()}>
                                            <div className="taskDeadlineDateContainer">
                                                <p>{`Week of ${reformattedTask[date][0].task.startDayOfWeek} (${reformattedTask[date].length})`}</p>
                                                <button onClick={(e) => {handleDropdownTasks(e)}}>
                                                    <span className="sr-only">dropdown button</span>
                                                    <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                            <div className="taskMainContainer">
                                                {reformattedTask[date].map( (i) => {
                                                    return (
                                                        <div className="taskContainer" key={uuid()} style={{background:i.task.taskColour}}>
                                                            <input type="checkbox" className="taskCheckbox" onChange={() => {changeToFinishedTask(i.id, i)}}/>
                                                            <div className="taskText">
                                                                <button onClick={() => {directToTaskDetails(i)}}>
                                                                    <p className="taskName">{i.task.name}</p>
                                                                </button>
                                                                <p className="taskDescription">{i.task.description}</p>
                                                                <div className="labelContainer">
                                                                    <p className={i.task.priority}>{i.task.priority}</p>
                                                                    {i.task.label.map( (labelName) => <p key={uuid()} className={labelName}>{labelName}</p>)}
                                                                </div>
                                                            </div>
                                                            <div className="dueDateContainer">
                                                                <p>Planned Completion:</p>
                                                                <p>{i.task.reformattedDeadline}</p>
                                                            </div>
                                                            <div className="buttonContainer">
                                                                <button onClick={() => {directToTaskDetails(i)}}>
                                                                    <i className="fa-solid fa-ellipsis"></i>
                                                                </button>
                                                                <button className="exitBtn" onClick={() => {deleteTask(i.id, i)}}>
                                                                    <span className="sr-only">Remove Task</span>
                                                                    <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )                     
                                                })}
                                            </div>
                                        </div>
                                    )
                                }) : 
                                Object.keys(reformattedDoneTask).map( (date) => {
                                    return(
                                        <div key={uuid()}>
                                            <div className="taskDeadlineDateContainer">
                                                <p>{`Week of ${reformattedDoneTask[date][0].task.startDayOfWeek} (${reformattedDoneTask[date].length})`}</p>
                                                <button onClick={(e) => {handleDropdownTasks(e)}}>
                                                    <span className="sr-only">dropdown button</span>
                                                    <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                            {reformattedDoneTask[date].map( (i) => {
                                                return (
                                                    <div className="taskContainer" key={uuid()} style={{background:i.task.taskColour}}>
                                                        <div className="checkboxContainer">
                                                            <input type="checkbox" className="taskCheckbox taskCheckboxChecked" checked onChange={() => {changeToUnfinishedTask(i.id, i)}}/>
                                                            <i className="fa-solid fa-check" onClick={() => {changeToUnfinishedTask(i.id, i)}}></i>
                                                        </div>
                                                        <div className="taskText">
                                                            <button onClick={() => {directToTaskDetails(i)}}>
                                                                <p className="taskName">{i.task.name}</p>
                                                            </button>
                                                            <p className="taskDescription">{i.task.description}</p>
                                                            <div className="labelContainer">
                                                                <p className={i.task.priority}>{i.task.priority}</p>
                                                                {i.task.label.map( (labelName) => <p key={uuid()} className={labelName}>{labelName}</p>)}
                                                            </div>
                                                        </div>
                                                        <div className="dueDateContainer">
                                                            <p>Planned Completion:</p>
                                                            <p>{i.task.reformattedDeadline}</p>
                                                        </div>
                                                        <div className="buttonContainer">
                                                            <button onClick={() => {directToTaskDetails(i)}}>
                                                                <i className="fa-solid fa-ellipsis"></i>
                                                            </button>
                                                            <button className="exitBtn" onClick={() => {deleteDoneTask(i.id, i)}}>
                                                                <span className="sr-only">Remove Task</span>
                                                                <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                    {/* <CustomizeTab userUID={userUID}/> */}
                </div>
                {isNewTaskClicked ? 
                <>
                    <NewTask setTaskList={setTaskList} setIsNewTaskClicked={setIsNewTaskClicked}/>
                    <div className="overlayBackground"></div>
                </>
                : null}
            </>
        )
    } else if (isAuth && isSearchBarPopulated){

        return(
            <>
                <div className="homePage">
                    <HomeNavigation userUID={userUID} username={username} userPic={userPic} setUsername={setUsername} setUserUID={setUserUID} setIsAuth={setIsAuth} setTaskList={setTaskList} setIsNewTaskClicked={setIsNewTaskClicked} />
                    <div className="homeDashboard homeSection">
                        <div className="dashboardContent">
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
                            {currentUserTime >= 5 && currentUserTime < 12 ? 
                            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive day, {username}? 🌞</p> : null}
                            {currentUserTime >= 12 && currentUserTime < 18 ?
                            <p className="dashboardGreeting dashboardDayGreeting">Ready for another productive afternoon, {username}? ☕</p> : null}
                            {currentUserTime >= 18 && currentUserTime < 5 ?
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
                                    <i className="fa-solid fa-magnifying-glass" aria-hidden="true"></i>
                                    <span className="sr-only">Search</span>
                                    <input type="text" className="searchBarInput" placeholder="Search for task..." onChange={debounce((e) => handleSearchForTask(e), 100)}/>
                                </div>
                            </div>
                            <div className="allTasksContainer">
                            {isOngoingSearchTaskFound && isToDoBtnClicked ? 
                            <div className="noTaskFoundContainer">
                                <p>No results found.</p>
                                <p>We couldn't find what you're looking for</p>
                                <div className="errorImageContainer errorImageContainerTwo">
                                    <img src={errorMessageTwo} alt="" />
                                </div>
                            </div> : null
                            }
                            {isFinishedSearchTaskFound && isDoneBtnClicked ? 
                            <div className="noTaskFoundContainer">
                                <p>No results found.</p>
                                <p>We couldn't find what you're looking for</p>
                                <div className="errorImageContainer errorImageContainerTwo">
                                    <img src={errorMessageTwo} alt="" />
                                </div>
                            </div> : null
                            }
                            {isToDoBtnClicked ?
                            searchedTaskList.map( (date) => {
                                return(
                                    <div key={uuid()}>
                                        <div className="taskDeadlineDateContainer">
                                            <p>{`Week of ${date[0].task.startDayOfWeek} (${date.length})`}</p>
                                            <button onClick={(e) => {handleDropdownTasks(e)}}>
                                                <span className="sr-only">dropdown button</span>
                                                <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                        <div className="taskMainContainer">
                                        {date.map( (i) => {
                                            return (
                                                <div className="taskContainer" key={uuid()} style={{background:i.task.taskColour}}>
                                                    <input type="checkbox" className="taskCheckbox" onChange={() => {changeSearchedToFinishedTask(i.id, i)}}/>
                                                    <div className="taskText">
                                                        <button onClick={() => {directToTaskDetails(i)}}>
                                                            <p className="taskName">{i.task.name}</p>
                                                        </button>
                                                        <p className="taskDescription">{i.task.description}</p>
                                                        <div className="labelContainer">
                                                            <p className={i.task.priority}>{i.task.priority}</p>
                                                            {i.task.label.map( (labelName) => <p key={uuid()} className={labelName}>{labelName}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="dueDateContainer">
                                                        <p>Planned Completion:</p>
                                                        <p>{i.task.reformattedDeadline}</p>
                                                    </div>
                                                    <div className="buttonContainer">
                                                        <button onClick={() => {directToTaskDetails(i)}}>
                                                            <i className="fa-solid fa-ellipsis"></i>
                                                        </button>
                                                        <button className="exitBtn" onClick={() => {deleteTaskSearchedList(i.id, i)}}>
                                                            <span className="sr-only">Remove Task</span>
                                                            <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            )                     
                                        })}
                                        </div>
                                    </div>
                                )
                            }) : 
                            doneSearchedTaskList.map( (date) => {
                                return(
                                    <div key={uuid()}>
                                        <div className="taskDeadlineDateContainer">
                                            <p>{`Week of ${date[0].task.startDayOfWeek} (${date.length})`}</p>
                                            <button onClick={(e) => {handleDropdownTasks(e)}}>
                                                <span className="sr-only">dropdown button</span>
                                                <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                        <div className="taskMainContainer">
                                        {date.map( (i) => {
                                            return (
                                                <div className="taskContainer" key={uuid()} style={{background:i.task.taskColour}}>
                                                    <div className="checkboxContainer">
                                                        <input type="checkbox" className="taskCheckbox taskCheckboxChecked" checked onChange={() => {changeSearchedToUnfinishedTask(i.id, i)}}/>
                                                        <i className="fa-solid fa-check" onClick={() => {changeSearchedToUnfinishedTask(i.id, i)}}></i>
                                                    </div>
                                                    <div className="taskText">
                                                        <button onClick={() => {directToTaskDetails(i)}}>
                                                            <p className="taskName">{i.task.name}</p>
                                                        </button>
                                                        <p className="taskDescription">{i.task.description}</p>
                                                        <div className="labelContainer">
                                                            <p className={i.task.priority}>{i.task.priority}</p>
                                                            {i.task.label.map( (labelName) => <p key={uuid()} className={labelName}>{labelName}</p>)}
                                                        </div>
                                                    </div>
                                                    <div className="dueDateContainer">
                                                        <p>Planned Completion:</p>
                                                        <p>{i.task.reformattedDeadline}</p>
                                                    </div>
                                                    <div className="buttonContainer">
                                                        <button onClick={() => {directToTaskDetails(i)}}>
                                                            <i className="fa-solid fa-ellipsis"></i>
                                                        </button>
                                                        <button className="exitBtn" onClick={() => {deleteTaskSearchedDoneList(i.id, i)}}>
                                                            <span className="sr-only">Remove Task</span>
                                                            <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            )                     
                                        })}
                                        </div>
                                    </div>
                                )
                            }) 
                            }
                            </div>
                        </div>
                    </div>
                    {/* <CustomizeTab/> */}
                </div>
                {isNewTaskClicked ? 
                <>
                    <NewTask setTaskList={setTaskList} setIsNewTaskClicked={setIsNewTaskClicked}/>
                    <div className="overlayBackground"></div>
                </>
                : null}
            </>
        )
    }
    return <Navigate to="/login" replace/>
}

export default Home;