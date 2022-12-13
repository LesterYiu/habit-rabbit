import { useState, useEffect, useContext } from "react";
import { AppContext } from "../Contexts/AppContext";

import Calendar from "react-calendar";
import HomeNavigation from "./HomeNavigation";
import NewTask from "./NewTask";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { format, startOfWeek } from "date-fns/esm";
import uuid from "react-uuid";

// Image Imports
import errorMessageOne from "../assets/errorMessageOne.gif";

const CalendarSection = () => {

    const [currentDate, setCurrentDate] = useState(new Date());
    const [reformattedTaskList, setReformattedTaskList] = useState([]);
    const [selectedTaskDate, setSelectedTaskDate] = useState(new Date());
    const [selectedWeekTasks, setSelectedWeekTasks] = useState([]);
    const [allDatesArray, setAllDatesArr] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const {setIsAuth, username, setUsername, setUserUID, userUID, setUserPic, userPic, isNewTaskClicked, setTaskList, taskList} = useContext(AppContext);

    // Check for authen
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
        setIsLoading(true);
        getPost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userUID])

    useEffect( () => {
        reformatTaskByDate(taskList, setReformattedTaskList);
        handleDates()
    }, [taskList])

    useEffect( () => {
        handleSelectedWeek()
        // eslint-disable-next-line
    }, [reformattedTaskList, selectedTaskDate])

    const getPost = async () => {
        const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);
        const data = await getDocs(collectionRef);
        setTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));

        setIsLoading(false);
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

        for(let weeklyTasks of taskListArrangedByWeek) {
            weeklyTasks.sort( (taskDeadlineA , taskDeadlineB) => new Date(taskDeadlineA.task.deadline.replace(/([-])/g, '/')) - new Date(taskDeadlineB.task.deadline.replace(/([-])/g, '/')));
        }  
        
        setTaskState(taskListArrangedByWeek);    
    }

    const handleSelectedWeek = () => {
        setSelectedWeekTasks([]);

        reformattedTaskList.forEach( (taskWeekList) => {
            const firstDayOfWeekOfTask = taskWeekList[0].task.firstDayOfWeekUnformatted;
            const firstDayOfWeekForSelected = format(startOfWeek(selectedTaskDate), 'yyyy-MM-dd');
            if(firstDayOfWeekOfTask === firstDayOfWeekForSelected) {
                setSelectedWeekTasks(taskWeekList);
            } else {
                return;
            }
        }) 
    }

    const handleDates = () => {
        let allDatesArr = [];
        for(let specificTask of taskList) {
            allDatesArr.push(format(new Date(specificTask.task.deadline.replace(/([-])/g, '/')), 'yyyy/MM/dd'))
        }
        setAllDatesArr(allDatesArr)
    }

    return(
        <div className="calendarPage">
            {isNewTaskClicked ? 
            <>
                <NewTask />
                <div className="overlayBackground"></div>
            </>
            : null}
            <HomeNavigation userUID={userUID} username={username} userPic={userPic} setUsername={setUsername} setUserUID={setUserUID} setIsAuth={setIsAuth}/>
            <div className="calendarSection">
                <Calendar onChange={setCurrentDate} value={currentDate} onClickDay={(value) => {setSelectedTaskDate(value)}} tileContent={({ date }) => allDatesArray.includes(format(date, 'yyyy/MM/dd')) ? <i className="fa-solid fa-circle" aria-hidden="true"></i> : null} calendarType={"US"}/>
            </div>
            <div className="overallTaskOverview">
                <h2>{format(startOfWeek(new Date()), 'yyyy/MM/dd') === format(startOfWeek(selectedTaskDate), 'yyyy/MM/dd') ? "This Week" : `Week of ${format(startOfWeek(selectedTaskDate), 'MMM dd, yyyy')}`}</h2>
                <div className="displayTasksSection"> 
                    {selectedWeekTasks.length && !isLoading ?
                    selectedWeekTasks.map( (specificTask) => {
                        return (
                            <div className={`${specificTask.task.priority} taskContainer`} key={uuid()}>
                                <p className="taskName">{specificTask.task.name}</p>
                                <div className="deadlineSection">
                                    <i className="fa-regular fa-clock"></i>
                                    <p>{specificTask.task.reformattedDeadline}</p>
                                </div>
                                <div className="labelContainer">
                                    <p className="labelParagraph">{specificTask.task.priority}</p>
                                    {specificTask.task.label.map( (singleLabel) => {
                                        return(<p className="labelParagraph" key={uuid()}>{singleLabel}</p>)
                                    })}
                                </div>
                                <div className="progressContainer">
                                    <div className="progressBar">
                                        <div className="progressColor" style={{width: `${specificTask.task.completion}%`}}></div>
                                    </div>
                                    <p>{`${specificTask.task.completion}%`}</p>
                                </div>
                            </div>
                        )
                    }) : null}
                    {!isLoading && !selectedWeekTasks.length ?<div className="noResultsFound">
                        <p>There are currently no outstanding tasks.</p>
                        <p>Take a sip of tea and relax!</p>
                        <div className="errorImageContainer">
                            <img src={errorMessageOne} alt="" />
                        </div>    
                    </div> : null}
                    {isLoading ? 
                    <div className="loadingContainer">
                        <p>Now loading...</p>
                        <div className="lds-ring"><div></div></div>
                    </div> : null
                    }
                </div>
            </div>
        </div>
    )
}

export default CalendarSection;