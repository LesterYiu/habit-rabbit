import { Navigate, useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import { collection, getDocs, deleteDoc, addDoc, doc, getDoc } from "firebase/firestore";
import { useState , useEffect, useContext, useRef} from "react";
import { AppContext } from "../Contexts/AppContext";
import { getHours } from "date-fns";
import uuid from "react-uuid";

// Component Imports
import TaskDetails from "./TaskDetails";
import SingleTask from "./SingleTask";
import SingleDoneTask from "./SingleDoneTask";
import DashboardHeader from "./DashboardHeader";
import HomeNavigation from "./HomeNavigation";
import NewTask from "./NewTask";

// Image Imports
import errorMessageOne from "../assets/errorMessageOne.gif";
import errorMessageTwo from "../assets/errorMessageTwo.gif";

const Home = () => {

    const [doneTaskList, setDoneTaskList] = useState([]);
    const [reformattedTask, setReformattedTask] = useState([]);
    const [reformattedDoneTask, setReformattedDoneTask] = useState([]); 
    const [searchedTaskList, setSearchedTaskList] = useState([]);
    const [doneSearchedTaskList, setDoneSearchedTaskList] = useState([]);
    const [specificTask, setSpecificTask] = useState([]);

    // const [isNewTaskClicked, setIsNewTaskClicked] = useState(false);
    const [isToDoBtnClicked, setIsToDoBtnClicked] = useState(true);
    const [isDoneBtnClicked, setIsDoneBtnClicked] = useState(false);

    const [isSearchBarPopulated, setIsSearchBarPopulated] = useState(false);
    const [isPageLoading, setIsPageLoading] = useState(true);
    const [currentUserTime, setCurrentUserTime] = useState("");

    const [isOngoingTaskListZero, setIsOngoingTaskListZero] = useState(false);
    const [isFinishedTaskListZero, setIsFinishedTaskListZero] = useState(false);
    const [isOngoingSearchTaskFound, setIsOngoingSearchTaskFound] = useState(true);
    const [isFinishedSearchTaskFound, setIsFinishedSearchTaskFound] = useState(true);
    const [isTaskExpanded, setIsTaskExpanded] = useState(false);
    const [isSpecificTaskEmpty, setIsSpecificTaskEmpty] = useState(true);

    const isMounted = useRef(false);

    // useContext variables
    const {setIsAuth, isAuth, username, setUsername, setUserUID, userUID, userPic, setUserPic, isNewTaskClicked, setTaskList, taskList} = useContext(AppContext);

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

    const updateDatabase = async (collectionType, postDocType, finishedStateSet, i) => {

        /*
        - collectionType = which collection to add data to
        - postDocType = doc in current collection we want to delete
        - finishedSetState = state function to update UI to add to opposite collection (ex: if we remove from finished section, then we update state on unfinished section)
        */

        await addDoc(collectionType, i);
        await deleteDoc(postDocType);

        const data = await getDocs(collectionType);
        finishedStateSet(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
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

    const directToTaskDetails = (taskData) => {
        setSpecificTask(taskData);
        setIsTaskExpanded(true);
    }
    

    // Functions relating to individual task components

    const changeToFinishedTask = async (id, i) => {

        // Database Collection Reference for user's list of tasks
        const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);
        const currentTask = (await getDoc(postDoc)).data();
        const currentTaskCopy = {...currentTask};
        currentTaskCopy.task.completion = "100";

        // This will move a document from the unfinished task collection into the finished task collection if the checkbox is clicked for the first time. This will also set new pieces of state for both the done and to do sections of the home page, thereby re-rendering both with new information.

        // This will update the state, immediately removing the task from the page to avoid repeated onClick function calls. Afterwards, it will remove the document from the ongoing task collection and add it to the finished task collection and then afterwards, update the state with the unfinished collection. This is triggered by the checkmark on the tasks on the "to do" section.

        setTaskList(taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]));
        await updateDatabase(doneCollection, postDoc, setDoneTaskList, currentTaskCopy);
    }

    // Deletes the task found at the specific document id of the task. Filters out the tasklists to exclude the task selected and re-renders the page with newly filtered array. This is for ongoing task list only
    const deleteTask = async (id, i) => {
        const newTaskList = taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]);
        setTaskList(newTaskList);
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);
        await deleteDoc(postDoc);
    }

    const changeSearchedToFinishedTask = async (id, i) => {

        // Database Collection Reference for user's list of tasks
        const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);
        const currentTask = (await getDoc(postDoc)).data();
        const currentTaskCopy = {...currentTask};
        currentTaskCopy.task.completion = "100";

        // Using the task that the user selects, insert it into the correct corresponding week array for donetasklist and donesearchtasklist
                
        filterFromReformattedTaskList(searchedTaskList, setSearchedTaskList, i);
        filterFromReformattedTaskList(reformattedTask, setReformattedTask, i);

        await addDoc(doneCollection, currentTaskCopy);
        await deleteDoc(postDoc);

    }

    const deleteTaskSearchedList = async(id, i) => {
        filterFromReformattedTaskList(searchedTaskList, setSearchedTaskList, i);

        const newTaskList = taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]);
        setTaskList(newTaskList);
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);
        await deleteDoc(postDoc);
    }

    const changeToUnfinishedTask = async (id, i) => {
        
        // Database Collection Reference for user's list of tasks
        const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);
        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`);
        const currentTask = (await getDoc(doneDoc)).data();
        const currentTaskCopy = {...currentTask};
        currentTaskCopy.task.completion = "0";

        setDoneTaskList(doneTaskList.filter( (task) => task !== doneTaskList[doneTaskList.indexOf(i)])); 

        await updateDatabase(collectionRef, doneDoc, setTaskList, currentTaskCopy);
    }

    //  Delete tasks for finished task list only.
    const deleteDoneTask = async (id ,i) => {
        const newDoneList = doneTaskList.filter( (task) => task !== doneTaskList[doneTaskList.indexOf(i)]);
        setDoneTaskList(newDoneList);
        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`);
        await deleteDoc(doneDoc);
    }

    const changeSearchedToUnfinishedTask = async (id, i) => {

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
                <HomeNavigation setIsTaskExpanded={setIsTaskExpanded} isTaskExpanded={isTaskExpanded}/>
                <TaskDetails specificTask={specificTask} setIsTaskExpanded={setIsTaskExpanded} setIsSpecificTaskEmpty={setIsSpecificTaskEmpty} isToDoBtnClicked={isToDoBtnClicked} isDoneBtnClicked={isDoneBtnClicked} setDoneTaskList={setDoneTaskList} doneTaskList={doneTaskList} reformattedTask={reformattedTask} reformattedDoneTask={reformattedDoneTask} updateDatabase={updateDatabase}/>
                {isNewTaskClicked ? 
                <>
                    <NewTask/>
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
                    <HomeNavigation setIsTaskExpanded={setIsTaskExpanded} isTaskExpanded={isTaskExpanded}/>
                    <div className="homeDashboard homeSection">
                        <div className="dashboardContent">
                            <DashboardHeader currentUserTime={currentUserTime} username={username} isToDoBtnClicked={isToDoBtnClicked} handleButtonSwitch={handleButtonSwitch} setIsDoneBtnClicked={setIsDoneBtnClicked} setIsToDoBtnClicked={setIsToDoBtnClicked} isDoneBtnClicked={isDoneBtnClicked} setIsSearchBarPopulated={setIsSearchBarPopulated} reformattedTask={reformattedTask} reformattedDoneTask={reformattedDoneTask} reformatTaskByDate={reformatTaskByDate} setSearchedTaskList={setSearchedTaskList} setDoneSearchedTaskList={setDoneSearchedTaskList}/>
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
                                                <button className="dropdownBtn" onClick={(e) => {handleDropdownTasks(e)}}>
                                                    <span className="sr-only">dropdown button</span>
                                                    <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                            <div className="taskMainContainer">
                                                {reformattedTask[date].map( (specificTask) => {
                                                    return (
                                                        <SingleTask specificTask={specificTask} directToTaskDetails={directToTaskDetails} changeToFinishedTask={changeToFinishedTask} deleteTask={deleteTask} key={uuid()}/>
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
                                                <button className="dropdownBtn" onClick={(e) => {handleDropdownTasks(e)}}>
                                                    <span className="sr-only">dropdown button</span>
                                                    <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
                                                </button>
                                            </div>
                                            {reformattedDoneTask[date].map( (specificTask) => {
                                                return (
                                                    <SingleDoneTask key={uuid()} specificTask={specificTask} directToTaskDetails={directToTaskDetails} changeToUnfinishedTask={changeToUnfinishedTask} deleteDoneTask={deleteDoneTask}/>
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
                    <NewTask />
                    <div className="overlayBackground"></div>
                </>
                : null}
            </>
        )
    } else if (isAuth && isSearchBarPopulated){

        return(
            <>
                <div className="homePage">
                    <HomeNavigation setIsTaskExpanded={setIsTaskExpanded} isTaskExpanded={isTaskExpanded}/>
                    <div className="homeDashboard homeSection">
                        <div className="dashboardContent">
                            <DashboardHeader specificTask={specificTask} setIsTaskExpanded={setIsTaskExpanded} isSpecificTaskEmpty={isSpecificTaskEmpty} currentUserTime={currentUserTime} username={username} isToDoBtnClicked={isToDoBtnClicked} handleButtonSwitch={handleButtonSwitch} setIsDoneBtnClicked={setIsDoneBtnClicked} setIsToDoBtnClicked={setIsToDoBtnClicked} isDoneBtnClicked={isDoneBtnClicked} setIsSearchBarPopulated={setIsSearchBarPopulated} reformattedTask={reformattedTask} reformattedDoneTask={reformattedDoneTask} reformatTaskByDate={reformatTaskByDate} setSearchedTaskList={setSearchedTaskList} setDoneSearchedTaskList={setDoneSearchedTaskList}/>
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
                                            <button className="dropdownBtn" onClick={(e) => {handleDropdownTasks(e)}}>
                                                <span className="sr-only">dropdown button</span>
                                                <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                        <div className="taskMainContainer">
                                        {date.map( (specificTask) => {
                                            return (
                                                <SingleTask specificTask={specificTask} directToTaskDetails={directToTaskDetails} changeToFinishedTask={changeSearchedToFinishedTask} deleteTask={deleteTaskSearchedList} key={uuid()}/>
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
                                            <button className="dropdownBtn" onClick={(e) => {handleDropdownTasks(e)}}>
                                                <span className="sr-only">dropdown button</span>
                                                <i className="fa-solid fa-caret-down" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                        <div className="taskMainContainer">
                                        {date.map( (specificTask) => {
                                            return (
                                                <SingleDoneTask key={uuid()} specificTask={specificTask} directToTaskDetails={directToTaskDetails} changeToUnfinishedTask={changeSearchedToUnfinishedTask} deleteDoneTask={deleteTaskSearchedDoneList}/>
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
                    <NewTask />
                    <div className="overlayBackground"></div>
                </>
                : null}
            </>
        )
    }
    return <Navigate to="/login" replace/>
}

export default Home;