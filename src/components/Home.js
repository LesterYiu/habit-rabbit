import { Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import { collection, getDocs, deleteDoc, addDoc, doc, getDoc } from "firebase/firestore";
import { useState , useEffect, useContext, useRef} from "react";
import { AppContext } from "../Contexts/AppContext";
import { getHours } from "date-fns";
import uuid from "react-uuid";
import { reformatTaskByDate, disableScrollForModalOn, updateDatabase } from "../utils/globalFunctions";

// Component Imports
import TaskDetails from "./TaskDetails";
import SingleTask from "./SingleTask";
import SingleDoneTask from "./SingleDoneTask";
import DashboardHeader from "./DashboardHeader";
import HomeNavigation from "./HomeNavigation";
import NewTask from "./NewTask";
import SignOutModal from "./SignOutModal";

// Image Imports
import errorMessageOne from "../assets/errorMessageOne.gif";
import errorMessageTwo from "../assets/errorMessageTwo.gif";
import bunnyLoading from "../assets/bunnyLoading.gif";


const Home = () => {

    const [reformattedTask, setReformattedTask] = useState([]);
    const [reformattedDoneTask, setReformattedDoneTask] = useState([]); 
    const [searchedTaskList, setSearchedTaskList] = useState([]);
    const [doneSearchedTaskList, setDoneSearchedTaskList] = useState([]);

    // Sort & Filtered Tasks
    const [filteredTasks, setFilteredTasks] = useState([]);

    const [isSearchBarPopulated, setIsSearchBarPopulated] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [currentUserTime, setCurrentUserTime] = useState("");
    const [isTaskLoaded, setIsTaskLoaded] = useState(true);

    const [isOngoingTaskListZero, setIsOngoingTaskListZero] = useState(false);
    const [isFinishedTaskListZero, setIsFinishedTaskListZero] = useState(false);
    const [isOngoingSearchTaskFound, setIsOngoingSearchTaskFound] = useState(true);
    const [isFinishedSearchTaskFound, setIsFinishedSearchTaskFound] = useState(true);

    const [specificTask, setSpecificTask] = useState([]);

    const isMounted = useRef(false);

    // useContext variables
    const {setIsAuth, isAuth, setUsername, setUserUID, userUID, setUserPic, isNewTaskClicked, setTaskList, taskList, setIsTaskExpanded, isTaskExpanded, doneTaskList, setDoneTaskList, isLateSelected, isPrioritySelected, filteredAndSearchedTask, setFilteredAndSearchedTask, isNavExpanded, isSignOutModalOn, isToDoBtnClicked, isDoneBtnClicked, setIsNewTaskClicked, setIsSignOutModalOn} = useContext(AppContext);

    // Database Collection Reference for user's list of tasks
    const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);
    const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);
    
    const navigate = useNavigate();

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

    useEffect( () => {

        // In situation where user UID token expires / cleared from login

        if(!isMounted.current) {
            isMounted.current = true;
            return;
        }

        if(userUID === "notSignedIn") {
            navigate('/login')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userUID])

    useEffect( () => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // On initial mount, this will collect the tasks under the logged in user's userUID and set it into state to populate the page.
    useEffect( () => {
        getPost();
        setCurrentUserTime(getHours(new Date()));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userUID, setUserUID, doneSearchedTaskList, searchedTaskList, isTaskExpanded]);

    useEffect( () => {
        reformatTaskByDate(taskList, setReformattedTask);
        reformatTaskByDate(doneTaskList, setReformattedDoneTask);
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

    useEffect( () => {
        disableScrollForModalOn(isNewTaskClicked);
        
    }, [isNewTaskClicked])

    useEffect( () => {

        if(isNewTaskClicked && document.body.style.overflow === 'hidden') return;

        disableScrollForModalOn(isNavExpanded);
    },[isNavExpanded])

    const getPost = async () => {
        // data - ongoing tasks, doneData - finished tasks
        const data = await getDocs(collectionRef);
        const doneData = await getDocs(doneCollection);

        // This will layout the docs data in an array with the document id which can be used later to remove each individual doc
        setTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
        setDoneTaskList(doneData.docs.map((doc) => ({...doc.data(), id: doc.id})));

        setIsPageLoading(false);
    }

    // Filters out the user's checked task from the searched task list of tasks. i = specificTask
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

    const handleDropdownTasks = (e) => {
        const iconEl = e.target.children[1];
        const taskMainContainerEl = e.target.offsetParent.nextSibling;
        const directToTaskBtn = taskMainContainerEl.childNodes[0].childNodes[0].childNodes[0];

        if (iconEl.className === "fa-solid fa-caret-up") {
            // If the user wants the tasks to drop down
            iconEl.className = "fa-solid fa-caret-down";
            taskMainContainerEl.className = "taskMainContainer openContainer";
            directToTaskBtn.tabIndex = 0;
        } else if (iconEl.className === "fa-solid fa-caret-down") {
            //  If the user wants the tasks to minimize
            iconEl.className = "fa-solid fa-caret-up";
            taskMainContainerEl.className = "taskMainContainer closedContainer";
            directToTaskBtn.tabIndex = -1;
        }
    }

    const directToTaskDetails = (taskData) => {
        setSpecificTask(taskData);
        setIsTaskExpanded(true);
    }
    

    // Functions relating to individual task components


    
    const changeToFinishedTask = async (id, i) => {
        setIsTaskLoaded(false);
        // Database Collection Reference for user's list of tasks
        const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);
        const currentTask = (await getDoc(postDoc)).data();
        const currentTaskCopy = {...currentTask};
        currentTaskCopy.task.completion = "100";

        // This will move a document from the unfinished task collection into the finished task collection if the checkbox is clicked for the first time. This will also set new pieces of state for both the done and to do sections of the home page, thereby re-rendering both with new information.

        // This will update the state, immediately removing the task from the page to avoid repeated onClick function calls. Afterwards, it will remove the document from the ongoing task collection and add it to the finished task collection and then afterwards, update the state with the unfinished collection. This is triggered by the checkmark on the tasks on the "to do" section.

        if(isLateSelected) {
            changeLateToFinish(i, filteredTasks, setFilteredTasks);
        }

        setTaskList(taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]));

        await updateDatabase(doneCollection, postDoc, setDoneTaskList, currentTaskCopy);
        setIsTaskLoaded(true);
    }

    function changeLateToFinish (dynamicTask, formattedListOfTasks, setStateFunction) {
        setIsTaskLoaded(false);
        const filteredTaskList = [];

        for(let weeklyTasks of formattedListOfTasks) {
            for(let specificTask of weeklyTasks) {
                filteredTaskList.push(specificTask);
            }
        }

        const finalFilteredTaskList = filteredTaskList.filter( (specificTask) => specificTask !== dynamicTask);


        let taskCounter = {};
        finalFilteredTaskList.forEach( (specificTask) => {
            if(taskCounter[specificTask.task.startDayOfWeek]) {
                taskCounter[specificTask.task.startDayOfWeek].push(specificTask);
            } else {
                taskCounter[specificTask.task.startDayOfWeek] = [specificTask];
            }
        })
        

        const taskListArrangedByWeek = Object.values(taskCounter).sort((a,b) => a[0].task.firstDayOfWeekTimestamp - b[0].task.firstDayOfWeekTimestamp);

        const lateTasksArr = [];

        for(let taskWeek of taskListArrangedByWeek) {
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

        reformatTaskByDate(lateTasksArr, setStateFunction);
        setIsTaskLoaded(true);
    }


    // Deletes the task found at the specific document id of the task. Filters out the tasklists to exclude the task selected and re-renders the page with newly filtered array. This is for ongoing task list only
    const deleteTask = async (id, i) => {
        const newTaskList = taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]);
        setTaskList(newTaskList);
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);
        await deleteDoc(postDoc);
    }

    const changeSearchedToFinishedTask = async (id, i) => {
        setIsTaskLoaded(false);
        // Database Collection Reference for user's list of tasks
        const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);
        const currentTask = (await getDoc(postDoc)).data();
        const currentTaskCopy = {...currentTask};
        currentTaskCopy.task.completion = "100";

        // Using the task that the user selects, insert it into the correct corresponding week array for donetasklist and donesearchtasklist
        if(isLateSelected) {
            changeLateToFinish(i, filteredTasks, setFilteredTasks);
            changeLateToFinish(i, filteredAndSearchedTask, setFilteredAndSearchedTask);
        } 
        
        filterFromReformattedTaskList(searchedTaskList, setSearchedTaskList, i);
        filterFromReformattedTaskList(reformattedTask, setReformattedTask, i);

        await addDoc(doneCollection, currentTaskCopy);
        await deleteDoc(postDoc);
        setIsTaskLoaded(true);
    }

    const deleteTaskSearchedList = async(id, i) => {
        filterFromReformattedTaskList(searchedTaskList, setSearchedTaskList, i);

        const newTaskList = taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]);
        setTaskList(newTaskList);
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);
        await deleteDoc(postDoc);
    }

    const changeToUnfinishedTask = async (id, i) => {
        setIsTaskLoaded(false);
        // Database Collection Reference for user's list of tasks
        const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);
        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`);
        const currentTask = (await getDoc(doneDoc)).data();
        const currentTaskCopy = {...currentTask};
        currentTaskCopy.task.completion = "0";

        setDoneTaskList(doneTaskList.filter( (task) => task !== doneTaskList[doneTaskList.indexOf(i)])); 

        await updateDatabase(collectionRef, doneDoc, setTaskList, currentTaskCopy);
        setIsTaskLoaded(true);
    }

    //  Delete tasks for finished task list only.
    const deleteDoneTask = async (id ,i) => {
        const newDoneList = doneTaskList.filter( (task) => task !== doneTaskList[doneTaskList.indexOf(i)]);
        setDoneTaskList(newDoneList);
        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`);
        await deleteDoc(doneDoc);
    }

    const changeSearchedToUnfinishedTask = async (id, i) => {
        setIsTaskLoaded(false);
        // Database Collection Reference for user's list of tasks
        const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);
        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`)
        const currentTask = (await getDoc(doneDoc)).data();
        const currentTaskCopy = {...currentTask};
        currentTaskCopy.task.completion = "0";

        filterFromReformattedTaskList(reformattedDoneTask, setReformattedDoneTask, i);
        filterFromReformattedTaskList(doneSearchedTaskList, setDoneSearchedTaskList, i);

        await addDoc(collectionRef, currentTaskCopy);
        await deleteDoc(doneDoc);
        setIsTaskLoaded(true);
    }

    const deleteTaskSearchedDoneList = async(id, i) => {
        filterFromReformattedTaskList(doneSearchedTaskList, setDoneSearchedTaskList, i);

        const newDoneList = doneTaskList.filter( (task) => task !== doneTaskList[doneTaskList.indexOf(i)]);
        setDoneTaskList(newDoneList);
        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`);
        await deleteDoc(doneDoc);
    }
    
    if(isAuth && isTaskExpanded) {
        return(
            <div className="homePage">
                <HomeNavigation/>
                <TaskDetails specificTask={specificTask} reformattedTask={reformattedTask} reformattedDoneTask={reformattedDoneTask} />
                {isNewTaskClicked ? 
                <>
                    <NewTask/>
                    <div className="overlayBackground" onClick={() => {setIsNewTaskClicked(false)}}></div>
                </>
                : null}
            </div>
        )
    }
    
    if (isAuth && !isSearchBarPopulated) {
        return(
            <>
                <div className="homePage">
                    <HomeNavigation />
                    <div className="homeDashboard homeSection">
                        <div className="dashboardContent">
                            <DashboardHeader currentUserTime={currentUserTime} setIsSearchBarPopulated={setIsSearchBarPopulated} reformattedTask={reformattedTask} reformattedDoneTask={reformattedDoneTask} setSearchedTaskList={setSearchedTaskList} setDoneSearchedTaskList={setDoneSearchedTaskList} setFilteredTasks={setFilteredTasks} filteredTasks={filteredTasks} isPageLoading={isPageLoading}/>
                            <div className="allTasksContainer">
                                {isPageLoading && isToDoBtnClicked && reformattedTask.length === 0 ? 
                                <div className="noTaskFoundContainer loadingContainer">
                                    <p>Now loading...</p>
                                    <div className="lds-ring"><div></div></div>
                                </div> : null}
                                {(isOngoingTaskListZero && isToDoBtnClicked && isPageLoading === false) || (isFinishedTaskListZero && isDoneBtnClicked && isPageLoading === false) || (isLateSelected && filteredTasks.length === 0 && isPageLoading === false && isToDoBtnClicked) ? 
                                <div className="noTaskFoundContainer">
                                    <p>There are currently no outstanding tasks.</p>
                                    <p>Take a sip of tea and relax!</p>
                                    <div className="errorImageContainer">
                                        <img src={errorMessageOne} alt="" />
                                    </div>
                                </div> : null}
                                {(isToDoBtnClicked && isLateSelected) || isPrioritySelected ?
                                Object.keys(filteredTasks).map( (date) => {
                                        return (
                                            <div key={uuid()}>
                                                <div className="taskDeadlineDateContainer">
                                                    <p>{`Week of ${filteredTasks[date][0].task.startDayOfWeek} (${filteredTasks[date].length})`}</p>
                                                    <button className="dropdownBtn" onClick={(e) => {handleDropdownTasks(e)}} tabIndex="0">
                                                        <span className="sr-only">dropdown button</span>
                                                        <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
                                                    </button>
                                                </div>
                                                <div className="taskMainContainer" tabIndex="-1">
                                                    {filteredTasks[date].map( (specificTask) => {
                                                        return (
                                                            <SingleTask specificTask={specificTask} directToTaskDetails={directToTaskDetails} changeToFinishedTask={changeToFinishedTask} deleteTask={deleteTask} key={uuid()} />
                                                        )                     
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    }): null}
                                {isToDoBtnClicked && !isLateSelected && !isPrioritySelected?
                                Object.keys(reformattedTask).map( (date) => {
                                    return (
                                        <div key={uuid()}>
                                            <div className="taskDeadlineDateContainer">
                                                <p>{`Week of ${reformattedTask[date][0].task.startDayOfWeek} (${reformattedTask[date].length})`}</p>
                                                <button className="dropdownBtn" onClick={(e) => {handleDropdownTasks(e)}} tabIndex="0">
                                                    <span className="sr-only">dropdown button</span>
                                                    <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                            <div className="taskMainContainer" tabIndex="-1">
                                                {reformattedTask[date].map( (specificTask) => {
                                                    return (
                                                        <SingleTask specificTask={specificTask} directToTaskDetails={directToTaskDetails} changeToFinishedTask={changeToFinishedTask} deleteTask={deleteTask} key={uuid()} />
                                                    )                     
                                                })}
                                            </div>
                                        </div>
                                    )
                                }) : null}
                                {isDoneBtnClicked ?
                                Object.keys(reformattedDoneTask).map( (date) => {
                                    return(
                                        <div key={uuid()}>
                                            <div className="taskDeadlineDateContainer">
                                                <p>{`Week of ${reformattedDoneTask[date][0].task.startDayOfWeek} (${reformattedDoneTask[date].length})`}</p>
                                                <button className="dropdownBtn" onClick={(e) => {handleDropdownTasks(e)}} tabIndex="0">
                                                    <span className="sr-only">dropdown button</span>
                                                    <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                            <div className="taskMainContainer" tabIndex="-1">
                                            {reformattedDoneTask[date].map( (specificTask) => {
                                                return (
                                                    <SingleDoneTask key={uuid()} specificTask={specificTask} directToTaskDetails={directToTaskDetails} changeToUnfinishedTask={changeToUnfinishedTask} deleteDoneTask={deleteDoneTask}/>
                                                )
                                            })}
                                            </div>
                                        </div>
                                    )
                                }): null}
                            </div>
                        </div>
                    </div>
                    {!isTaskLoaded ?
                    <>
                        <div className="overlayBackground"></div>
                        <div className="loadingOverlayContainer">
                            <div className="loadingContainer">
                                <p>Loading...</p>
                                <div className="imageContainer">
                                    <img src={bunnyLoading} alt="" />
                                </div>
                            </div>
                        </div>
                    </>
                    : null}
                </div>
                {isNewTaskClicked ? 
                <>
                    <NewTask />
                    <div className="overlayBackground" onClick={() => {setIsNewTaskClicked(false)}}></div>
                </>
                : null}
                {isSignOutModalOn ?
                <>
                    <SignOutModal/>
                    <div className="overlayBackground" onClick={() => {setIsSignOutModalOn(false)}}></div>
                </>
                : null}
            </>
        )
    } else if (isAuth && isSearchBarPopulated){
        return(
            <>
                <div className="homePage">
                    <HomeNavigation />
                    <div className="homeDashboard homeSection">
                        <div className="dashboardContent">
                            <DashboardHeader currentUserTime={currentUserTime} setIsSearchBarPopulated={setIsSearchBarPopulated} reformattedTask={reformattedTask} reformattedDoneTask={reformattedDoneTask} setSearchedTaskList={setSearchedTaskList} setDoneSearchedTaskList={setDoneSearchedTaskList} setFilteredTasks={setFilteredTasks} filteredTasks={filteredTasks} isPageLoading={isPageLoading}/>
                            <div className="allTasksContainer">
                            {(isOngoingSearchTaskFound && isToDoBtnClicked && searchedTaskList.length === 0 && !isLateSelected) ||( isFinishedSearchTaskFound && isDoneBtnClicked && doneSearchedTaskList.length === 0 && !isLateSelected) || (filteredAndSearchedTask.length === 0  && isLateSelected) ? 
                                <div className="noTaskFoundContainer">
                                    <p>No results found.</p>
                                    <p>We couldn't find what you're looking for</p>
                                    <div className="errorImageContainer errorImageContainerTwo">
                                        <img src={errorMessageTwo} alt="" />
                                    </div>
                                </div> : null
                            }
                            {isToDoBtnClicked && isLateSelected ?
                            filteredAndSearchedTask.map( (date) => {
                                return(
                                    <div key={uuid()}>
                                        <div className="taskDeadlineDateContainer">
                                            <p>{`Week of ${date[0].task.startDayOfWeek} (${date.length})`}</p>
                                            <button className="dropdownBtn" onClick={(e) => {handleDropdownTasks(e)}} tabIndex="0">
                                                <span className="sr-only">dropdown button</span>
                                                <i className="fa-solid fa-caret-down" aria-hidden="true" ></i>
                                            </button>
                                        </div>
                                        <div className="taskMainContainer" tabIndex="-1">
                                        {date.map( (specificTask) => {
                                            return (
                                                <SingleTask specificTask={specificTask} directToTaskDetails={directToTaskDetails} changeToFinishedTask={changeSearchedToFinishedTask} deleteTask={deleteTaskSearchedList} key={uuid()}/>
                                            )                     
                                        })}
                                        </div>
                                    </div>
                                )
                            }) : null }
                            {isToDoBtnClicked && !isLateSelected && !isPrioritySelected ?
                            searchedTaskList.map( (date) => {
                                return(
                                    <div key={uuid()}>
                                        <div className="taskDeadlineDateContainer">
                                            <p>{`Week of ${date[0].task.startDayOfWeek} (${date.length})`}</p>
                                            <button className="dropdownBtn" onClick={(e) => {handleDropdownTasks(e)}} tabIndex="0">
                                                <span className="sr-only">dropdown button</span>
                                                <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                        <div className="taskMainContainer" tabIndex="-1">
                                        {date.map( (specificTask) => {
                                            return (
                                                <SingleTask specificTask={specificTask} directToTaskDetails={directToTaskDetails} changeToFinishedTask={changeSearchedToFinishedTask} deleteTask={deleteTaskSearchedList} key={uuid()} />
                                            )                     
                                        })}
                                        </div>
                                    </div>
                                )
                            }) : null }
                            {isDoneBtnClicked && !isLateSelected && !isPrioritySelected ?
                            doneSearchedTaskList.map( (date) => {
                                return(
                                    <div key={uuid()}>
                                        <div className="taskDeadlineDateContainer">
                                            <p>{`Week of ${date[0].task.startDayOfWeek} (${date.length})`}</p>
                                            <button className="dropdownBtn" onClick={(e) => {handleDropdownTasks(e)}} tabIndex="0">
                                                <span className="sr-only">dropdown button</span>
                                                <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                        <div className="taskMainContainer" tabIndex="-1">
                                        {date.map( (specificTask) => {
                                            return (
                                                <SingleDoneTask key={uuid()} specificTask={specificTask} directToTaskDetails={directToTaskDetails} changeToUnfinishedTask={changeSearchedToUnfinishedTask} deleteDoneTask={deleteTaskSearchedDoneList} />
                                            )                     
                                        })}
                                        </div>
                                    </div>
                                )
                            }) : null
                            }
                            </div>
                        </div>
                    </div>
                    {!isTaskLoaded ?
                    <>
                        <div className="overlayBackground"></div>
                        <div className="loadingOverlayContainer">
                            <div className="loadingContainer">
                                <p>Loading...</p>
                                <div className="imageContainer">
                                    <img src={bunnyLoading} alt="" />
                                </div>
                            </div>
                        </div>
                    </>
                    : null}
                </div>
                {isNewTaskClicked ? 
                <>
                    <NewTask />
                    <div className="overlayBackground" onClick={() => {setIsNewTaskClicked(false)}}></div>
                </>
                : null}
            </>
        )
    }

    return <Navigate to="/login" replace/>
}

export default Home;