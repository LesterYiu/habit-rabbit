import {format, getHours} from "date-fns";
import {  doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { useEffect, useState, useRef, useContext} from "react";
import uuid from "react-uuid";
import { debounce } from "../utils/globalFunctions";
import { AppContext } from "../Contexts/AppContext";
import { db } from "./firebase";
import {useToggle} from "../utils/customHooks";

const TaskDetails = ({specificTask, setIsTaskExpanded, setIsSpecificTaskEmpty, isToDoBtnClicked, isDoneBtnClicked, setTaskList, taskList, setDoneTaskList, doneTaskList}) => {

    const [isNewUpdateBtnClicked, setIsNewUpdateBtnClicked] = useState(false);
    const [isLogTimeBtnClicked, setIsLogTimeBtnClicked] = useState(false);
    const [isRangeClicked, setIsRangeClicked] = useState(false);
    const [isDeleteModalOn, setIsDeleteModalOn] = useToggle();
    const [today, setToday] = useState("");
    const [day2, setDay2] = useState("");
    const [day3, setDay3] = useState("");
    const [day4, setDay4] = useState("");
    const [day5, setDay5] = useState("");
    const [day6, setDay6] = useState("");
    const [day7, setDay7] = useState("");

    const [isEnableOn, setIsEnableOn] = useToggle();
    const [isTaskProgressNotUpdated, setIsTaskProgressNotUpdated] = useState(true);

    const isMounted = useRef(false);

    const [taskCompletion, setTaskCompletion] = useState("");
    const [updates, setUpdates] = useState([]);
    const [timeSpent, setTimeSpent] = useState(0);

    const textareaEl = useRef(null)
    const todayEl = useRef(null);
    const day2El = useRef(null);
    const day3El = useRef(null);
    const day4El = useRef(null);
    const day5El = useRef(null);
    const day6El = useRef(null);
    const day7El = useRef(null);

    // useContext variables
    const {userUID, username, userPic} = useContext(AppContext);

    // To get the data from database on mount
    useEffect( () => {
        
        const getUpdateCommentsAndProgress = async () => {
            // If this task is not complete then the data is updated within the ongoing tasks collection
            if(isToDoBtnClicked) {
                const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`, specificTask.id);
                
                const docSnap = await getDoc(documentRef);
                setUpdates(docSnap.data().task.updates);
                
                setTaskCompletion(docSnap.data().task.completion);

            } else if (isDoneBtnClicked) {

                // If this task is complete (different collection) then the data is updated within the finished tasks collection
                const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`, specificTask.id);
                
                const docSnap = await getDoc(documentRef);
                setUpdates(docSnap.data().task.updates);    

                setTaskCompletion(docSnap.data().task.completion);

            }

        }

        getUpdateCommentsAndProgress()

    }, []);
    
    // To handle new updates, this will not run on initial mount

    useEffect( () => {

        if(!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const handleUpdateDocument = async () => {

            if(isToDoBtnClicked) {
                const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`, specificTask.id);
                await updateDoc(documentRef, {
                    "task.updates": updates
                })
            } else if (isDoneBtnClicked) {
                const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`, specificTask.id);
                
                await updateDoc(documentRef, {
                    "task.updates": updates
                })
            }
        }

        const handleUpdateProgress = () => {
            if(isToDoBtnClicked) {
                const handleOngoingTask = async () => {
                    const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`, specificTask.id);

                    await updateDoc(documentRef, {
                        "task.completion": taskCompletion
                    })
                }
                handleOngoingTask();
            } else if (isDoneBtnClicked) {

                const handleFinishedTask = async () => {
                    const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`, specificTask.id);
                    
                    await updateDoc(documentRef, {
                        "task.completion": taskCompletion
                    })
                }
                
                handleFinishedTask();
            }
        }

        handleUpdateDocument();

        if(taskCompletion !== "") {
            handleUpdateProgress();
        }
    }, [updates, taskCompletion])

    // To get dates for log time
    useEffect( () => {
        setIsSpecificTaskEmpty(false);

        // Get dates for logging time
        const today = new Date();
        const day2 = new Date(today);
        const day3 = new Date(today);
        const day4 = new Date(today);
        const day5 = new Date(today);
        const day6 = new Date(today);
        const day7 = new Date(today);
        
        setToday(format(today, 'iii MMM e'));
        setDay2(format(day2.setDate(day2.getDate() + 1), 'iii MMM e'));
        setDay3(format(day3.setDate(day3.getDate() + 2), 'iii MMM e'));
        setDay4(format(day4.setDate(day4.getDate() + 3), 'iii MMM e'));
        setDay5(format(day5.setDate(day5.getDate() + 4), 'iii MMM e'));
        setDay6(format(day6.setDate(day6.getDate() + 5), 'iii MMM e'));
        setDay7(format(day7.setDate(day7.getDate() + 6), 'iii MMM e'));

    }, [setIsSpecificTaskEmpty])

    useEffect( () => {
        let timeout;
        clearTimeout(timeout);

        timeout = setTimeout( () => {
            setIsTaskProgressNotUpdated(false);
        }, 400)
    }, [taskCompletion])

    const handleNewUpdateBtn = () => {
        setIsNewUpdateBtnClicked(!isNewUpdateBtnClicked);
    }

    const handleBackArrowBtn = () => {
        setIsTaskExpanded(false);
    }

    const handleNewComments = async (e) => {
        e.preventDefault();

        const textareaStr = textareaEl.current.value;
        if(textareaStr.length === 0 || textareaStr === null || textareaStr === undefined || textareaStr.indexOf(' ') >= 0) {
            return;
        }
        setIsNewUpdateBtnClicked(!isNewUpdateBtnClicked);

        const updateObj = {
            taskUpdate: textareaEl.current.value,
            date: format(new Date(), 'MMM dd, yyyy'),
            timePublished: (new Date()).getHours(),
            minutesPublished: (new Date()).getMinutes()
        }

        setUpdates([...updates, updateObj]);

    }

    const handleTimeInput = () => {
        setTimeSpent(parseInt(todayEl.current.value) + parseInt(day2El.current.value) + parseInt(day3El.current.value) + parseInt(day4El.current.value) + parseInt(day5El.current.value) + parseInt(day6El.current.value) + parseInt(day7El.current.value));
    }

    const handleOptionsBtn = (e) => {
        const optionContainer = e.target.parentNode.nextSibling;

        if (optionContainer.style.display === "none") {
            optionContainer.style.display = "block";
        } else {
            optionContainer.style.display = "none";
        }
        
    }

    const handleDeleteUpdate = (update) => {
        setUpdates(updates.filter((i) => i !== update));

    }

    const handleProgressBar = (e) => {
        setTaskCompletion(e.target.value);
    }

    const enableEditBtn = () => {
        setIsEnableOn();
        setIsRangeClicked(false);
    }
    
    const deleteTask = async () => {
        if(isToDoBtnClicked) {
            const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`, specificTask.id);
            await deleteDoc(documentRef);
            setTaskList(taskList.filter((i) => i.id !== specificTask.id))
        } else if (isDoneBtnClicked) {
            const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`, specificTask.id);
            await deleteDoc(documentRef);
            setDoneTaskList(doneTaskList.filter( (i) => i.id !== specificTask.id))
        }

        setIsDeleteModalOn();
        setIsTaskExpanded(false);
    }

    return(
        <div className="taskDetails">
            {isTaskProgressNotUpdated ? 
            <div className="pageOverlay">
                <div className="lds-ring"><div></div></div>
            </div>
            : null}
            {isDeleteModalOn ?
                <>
                <div className="deleteModal">
                    <div className="errorIcon">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <div className="errorBackground"></div>
                    </div>
                    <h2>Delete task</h2>
                    <p>Are you sure you want to delete this task? Once deleted, this process cannot be undone.</p>
                    <div className="deleteOptionBtns">
                        <button className="noBtn" onClick={setIsDeleteModalOn}>No, Keep It.</button>
                        <button className="yesBtn" onClick={deleteTask}>Yes, Delete!</button>
                    </div>
                </div>
                <div className="overlayModal"></div>
            </> : null}
            <div className="userLocationBar">
                <div className="userLocationButtons">
                    <button onClick={handleBackArrowBtn}>
                        <i className="fa-solid fa-arrow-left"></i>  
                    </button>
                    <button disabled>
                        <i className="fa-solid fa-arrow-right arrowDisabled"></i>
                    </button>
                </div>
                <p>🏠 <span>Your workspace</span>/ <span>Task Details</span></p>
            </div>
            <div className="taskHeader">
                <div className="taskInformation">
                    <i className="fa-regular fa-clipboard"></i>
                    <div className="taskNameContainer">
                        <p className="label">Task</p>
                        <h1>{specificTask.task.name}</h1>
                    </div>
                    {isEnableOn ? <p className="enableIndicator">Currently Editting</p> : null}
                </div>
                <div className="editContainer">
                    <div className="taskToolBar">
                        <button onClick={enableEditBtn} className="taskBtnContainer">
                            <div className="toolBarCombo">
                                <i className="fa-solid fa-pencil toolBarBtn" aria-hidden="true"></i>
                                {isEnableOn ? 
                                <i className="fa-solid fa-minus toolBarExtension"></i> : null}                                
                            </div>
                            {isEnableOn ? <p>Finish Edit</p> : <p>Edit Task</p>}
                        </button>
                        <button className="taskBtnContainer" onClick={setIsDeleteModalOn}>
                            <i className="fa-solid fa-trash toolBarBtn" aria-hidden="true"></i>
                            <p>Delete task</p>
                        </button>
                    </div>
                    <div className="percentContainer">
                        <p className="label">Percent Complete</p>
                        {isEnableOn ? 
                        <input type="range" defaultValue={taskCompletion} onChange={debounce((e) => handleProgressBar(e), 400)}/> : 
                        <input type="range" value={taskCompletion} onClick={() => {setIsRangeClicked(true)}}/> }
                    </div>
                </div>
            </div>
            {isRangeClicked && !isEnableOn? 
            <div className="errorContainer">
                <p className="percentError">Please click the edit button in order to make changes.</p>
            </div> : null}
            <div className="taskDescription">
                <p className="label">Description</p>
                <p>{specificTask.task.description}</p>
            </div>
            <div className="taskData">
                <div className="taskDates taskInfoContainer">
                    <p className="label">Planned Competion Date</p>
                    <p>{format(new Date(specificTask.task.deadline), 'MMM e')}</p>
                </div>
                <div className="priorityLevel taskInfoContainer">
                    <p className="label">Priority</p>
                    <p>{specificTask.task.priority}</p>
                </div>
            </div>
            <div className="taskLabelContainer taskInfoContainer">
                <p className="label">Labels</p>
                <div className="labelContainer">
                    {specificTask.task.label.map( (label) => {
                        return(
                            <div key={uuid()} >
                                <p>{label}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="updateTaskBtns">
                <button className="updatesBtn" onClick={handleNewUpdateBtn}><i className="fa-solid fa-note-sticky" aria-hidden="true"></i>New Updates</button>
                <button className="logTimeBtn" onClick={() => {setIsLogTimeBtnClicked(!isLogTimeBtnClicked)}}><i className="fa-regular fa-clock" aria-hidden="true"></i>Log Time</button>
            </div>
            <button className="updateTasksContainer" onClick={handleNewUpdateBtn}>
                <p>Start a new update</p>
            </button>
            {isLogTimeBtnClicked ?
            <div className="updateHoursContainer">
                <h2>Enter Hours</h2>
                <form name="logTime" className="logTimeForm">
                    <div className="specificDayContainer">
                        <label htmlFor="howManyHours1" className="sr-only">How many hours on {today}</label>
                        <p aria-hidden="true">{today}</p>
                        <input type="number" id="howManyHours1" ref={todayEl}/>
                    </div>

                    <div className="specificDayContainer">
                        <label htmlFor="howManyHours2" className="sr-only">How many hours on {day2}</label>
                        <p aria-hidden="true">{day2}</p>
                        <input type="number" id="howManyHours2" ref={day2El}/>
                    </div>

                    <div className="specificDayContainer">
                        <label htmlFor="howManyHours3" className="sr-only">How many hours on {day3}</label>
                        <p aria-hidden="true">{day3}</p>
                        <input type="number" id="howManyHours3" ref={day3El}/>
                    </div>

                    <div className="specificDayContainer">
                        <label htmlFor="howManyHours4" className="sr-only">How many hours on {day4}</label>
                        <p aria-hidden="true">{day4}</p>
                        <input type="number" id="howManyHours4" ref={day4El}/>
                    </div>

                    <div className="specificDayContainer">
                        <label htmlFor="howManyHours5" className="sr-only">How many hours on {day5}</label>
                        <p aria-hidden="true">{day5}</p>
                        <input type="number" id="howManyHours5" ref={day5El}/>
                    </div>

                    <div className="specificDayContainer">
                        <label htmlFor="howManyHours6" className="sr-only">How many hours on {day6}</label>
                        <p aria-hidden="true">{day6}</p>
                        <input type="number" id="howManyHours6" ref={day6El}/>
                    </div>

                    <div className="specificDayContainer">
                        <label htmlFor="howManyHours7" className="sr-only">How many hours on {day7}</label>
                        <p aria-hidden="true">{day7}</p>
                        <input type="number" id="howManyHours7" ref={day7El}/>
                    </div>
                </form>
                <div className="logTimeOptionBtns">
                    <button onClick={handleTimeInput}>Log Time</button>
                    <button onClick={() => {setIsLogTimeBtnClicked(!isLogTimeBtnClicked)}}>Cancel</button>
                </div>
            </div> : null}
            {isNewUpdateBtnClicked ?
            <form name="taskDetails" className="taskDetailsForm" onSubmit={(e) => {handleNewComments(e)}}>
                <label htmlFor="taskUpdate" className="sr-only">Provide an update to your task</label>
                <textarea name="taskDetailsDescription" id="taskUpdate" rows="6" ref={textareaEl}></textarea>
                <div className="updateTaskBtnContainer">
                    <button onClick={() => {setIsNewUpdateBtnClicked(!isNewUpdateBtnClicked)}}>Cancel</button>
                    <button type="submit">Submit</button>
                </div>
            </form> : null}
            {updates ? 
            updates.map( (update) => {
                let hours;
                let time;
                if(update.timePublished <= 11) {
                    hours = update.timePublished;
                    time = `${hours}:${update.minutesPublished}AM`
                } else if (update.timePublished === 12) {
                    hours = update.timePublished;
                    time = `${hours}:${update.minutesPublished}PM`                    
                } else if (update.timePublished > 12) {
                    hours = update.timePublished - 12;
                    time = `${hours}:${update.minutesPublished}PM`
                }

                return <div key={uuid()} className="taskCommentContainer">
                            <div className="profilePicContainer">
                                <img src={userPic} alt="" />
                            </div>
                            <div className="commentText">
                                <p className="username">{username}</p>
                                <p>{update.taskUpdate}</p>
                                <p className="timePublished">{`Posted on ${update.date} at ${time}`}</p>
                            </div>
                            <div className="buttonsContainer">
                                <button className="moreOptionsBtn" onClick={handleOptionsBtn}>
                                    <i className="fa-solid fa-ellipsis"></i>
                                </button>
                                <ul className="alterUpdateOption">
                                    <li>
                                        <button>Edit Update</button>
                                    </li>
                                    <li>
                                        <button onClick={() => {handleDeleteUpdate(update)}}>Delete Update</button>
                                    </li>
                                </ul>
                            </div>
                        </div>
            }): null}
        </div>
    )
}

export default TaskDetails;