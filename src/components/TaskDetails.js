import {format} from "date-fns";
import {  doc, updateDoc, getDoc, deleteDoc } from "firebase/firestore";
import { useEffect, useState, useRef, useContext} from "react";
import uuid from "react-uuid";
import { debounce } from "../utils/globalFunctions";
import { AppContext } from "../Contexts/AppContext";
import { db } from "./firebase";
import {useToggle} from "../utils/customHooks";
import _ from "lodash";

const TaskDetails = ({specificTask, setIsTaskExpanded, setIsSpecificTaskEmpty, isToDoBtnClicked, isDoneBtnClicked, setTaskList, taskList, setDoneTaskList, doneTaskList}) => {

    const [isNewUpdateBtnClicked, setIsNewUpdateBtnClicked] = useState(false);
    const [isLogTimeBtnClicked, setIsLogTimeBtnClicked] = useState(false);
    const [isRangeClicked, setIsRangeClicked] = useState(false);
    const [isDeleteModalOn, setIsDeleteModalOn] = useToggle();
    const [day1, setDay1] = useState("");
    const [day2, setDay2] = useState("");
    const [day3, setDay3] = useState("");
    const [day4, setDay4] = useState("");
    const [day5, setDay5] = useState("");
    const [day6, setDay6] = useState("");
    const [day7, setDay7] = useState("");
    const [day1Time, setDay1Time] = useState(0);
    const [day2Time, setDay2Time] = useState(0);
    const [day3Time, setDay3Time] = useState(0);
    const [day4Time, setDay4Time] = useState(0);
    const [day5Time, setDay5Time] = useState(0);
    const [day6Time, setDay6Time] = useState(0);
    const [day7Time, setDay7Time] = useState(0);
    const [backBtnCounter, setBackBtnCounter] = useState(0);
    const [frontBtnCounter, setFrontBtnCounter] = useState(0);

    const [taskCompletion, setTaskCompletion] = useState("");
    const [updates, setUpdates] = useState([]);
    const [timeSpent, setTimeSpent] = useState(0);
    const [isTaskProgressNotUpdated, setIsTaskProgressNotUpdated] = useState(true);
    const [isMoreThan24, setIsMoreThan24] = useState(false);

    const [isEnableOn, setIsEnableOn] = useToggle();

    const isMounted = useRef(false);
    const isMountedTwo = useRef(false);

    const textareaEl = useRef(null)

    // useContext variables
    const {userUID, username, userPic} = useContext(AppContext);

    // To get the data from database on mount
    useEffect( () => {
        
        const getUpdateCommentsAndProgress = async () => {
            // If this task is not complete then the data is updated within the ongoing tasks collection

            let documentRef;

            if(isToDoBtnClicked) {
                documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`, specificTask.id);

            } else if (isDoneBtnClicked) {

                // If this task is complete (different collection) then the data is updated within the finished tasks collection
                documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`, specificTask.id);
            }

            const docSnap = await getDoc(documentRef);
            setUpdates(docSnap.data().task.updates);
            
            setTaskCompletion(docSnap.data().task.completion);

        }

        getUpdateCommentsAndProgress()

    }, [isDoneBtnClicked, isToDoBtnClicked, specificTask.id, userUID]);
    
    // To handle new updates, this will not run on initial mount

    useEffect( () => {

        if(!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const handleUpdateDocument = async () => {

            let documentRef;

            if(isToDoBtnClicked) {
                documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`, specificTask.id);
            } else if (isDoneBtnClicked) {
                documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`, specificTask.id);
            }

            await updateDoc(documentRef, {
                "task.updates": updates
            })
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
    }, [updates, taskCompletion, specificTask.id, userUID, isDoneBtnClicked, isToDoBtnClicked])

    // To get dates for log time
    useEffect( () => {
        setIsSpecificTaskEmpty(false);

        setDays(setDay4, setDay3, setDay2, setDay1, setDay5, setDay6, setDay7);

    }, [setIsSpecificTaskEmpty])

    // Handle loading
    useEffect( () => {
        let timeout;
        clearTimeout(timeout);

        timeout = setTimeout( () => {
            setIsTaskProgressNotUpdated(false);
        }, 400)
    }, [taskCompletion])

    // Handles on mount loading of time inputs

    useEffect( () => {

        if(!isMountedTwo.current) {
            isMountedTwo.current = true;
            return;
        }
    
        getDocument([day1, day2, day3, day4, day5, day6, day7],[setDay1Time, setDay2Time, setDay3Time, setDay4Time, setDay5Time, setDay6Time, setDay7Time]);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLogTimeBtnClicked, day1, day2, day3, day4, day5, day6, day7])

    // Called with an array containing all 7 day's dates + an array containing the state function to set a new day time.
    async function getDocument() {
        let documentRef;
        if(isToDoBtnClicked) {
            documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`, specificTask.id);
        } else if (isDoneBtnClicked) {
            documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`, specificTask.id);
        }

        // If the dates on the log time modal match the dates of the hours logged in the database, it will populate the hours.
        const docSnap = await getDoc(documentRef);

        // Array containing all the dates/times logged in from the database
        const timeSpentArr = docSnap.data().task.timeSpent;

        // Array containing all the dates
        const datesArr = arguments[0];

        // Array containing all the log in time state functions
        const setTimeArr = arguments[1];
        

        // Object containing all states, time logged, and dates

        const infoObj = {};

        // If matches of dates from the list of logged times is equal to the a time found on the log time modal, it will be populated, otherwise it will be default to 0
        for(let i in datesArr) {
            infoObj[datesArr[i]] = {setState : setTimeArr[i], time: 0, date: datesArr[i]}
        }

        for(let o in timeSpentArr) {

            if (infoObj[timeSpentArr[o].date] !== undefined) {
                infoObj[timeSpentArr[o].date].time = timeSpentArr[o].time;
            }
        }
        
        for(let i in infoObj) {
            infoObj[i].setState(infoObj[i].time);
        }

        // Handles with the total hours
        let totalTime = 0;
        
        for(let i in timeSpentArr) {
            totalTime = parseInt(totalTime) + parseInt(timeSpentArr[i].time);
        }

        setTimeSpent(totalTime);
    }

    function setDays (setPresentDay, setDayStateMinus1, setDayStateMinus2, setDayStateMinus3, setDayState1, setDayState2, setDayState3, optionalBackDays, optionalFrontDays) {
        
        const selectedDate = optionalFrontDays - optionalBackDays;

        if ((optionalBackDays || optionalFrontDays) && (optionalBackDays - optionalFrontDays !== 0)) {
            const today = new Date();
            setPresentDay(format(today.setDate(today.getDate() + selectedDate), 'iii MMM dd'));
        } else {
            setPresentDay(format(new Date(), 'iii MMM dd'))
        }
        
        function minusDays () {
            for(let i = 0; i < 3; i++) {
                const today = new Date();
                let argumentsArr = [...arguments];
                let counter;

                if (selectedDate !== 0 && !isNaN(selectedDate)) {
                    counter = argumentsArr.indexOf(arguments[i]) + 1 - selectedDate;
                } else {
                    counter = argumentsArr.indexOf(arguments[i]) + 1;
                }

                arguments[i](format(today.setDate(today.getDate() - counter), 'iii MMM dd'));
            }
        }

        function addDays () {
            for(let i = 0; i < 3; i++) {
                const today = new Date();
                let argumentsArr = [...arguments];
                let counter;

                if (selectedDate !== 0 && !isNaN(selectedDate)) {
                    counter = argumentsArr.indexOf(arguments[i]) + 1 + selectedDate;
                } else {
                    counter = argumentsArr.indexOf(arguments[i]) + 1;
                }
    
                arguments[i](format(today.setDate(today.getDate() + counter), 'iii MMM dd'))
            }        
        }

        minusDays(setDayStateMinus1, setDayStateMinus2, setDayStateMinus3);
        addDays(setDayState1, setDayState2, setDayState3);
    }

    const handleNewUpdateBtn = () => {
        setIsNewUpdateBtnClicked(!isNewUpdateBtnClicked);
    }

    const handleBackArrowBtn = () => {
        setIsTaskExpanded(false);
    }

    const handleNewComments = async (e) => {
        e.preventDefault();
        const textareaStr = textareaEl.current.value.replace(/^ +/gm, '');
        if(textareaStr.length === 0 || textareaStr === null || textareaStr === undefined ) {
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
            setTaskList(taskList.filter( (i) => i.id !== specificTask.id))
        } else if (isDoneBtnClicked) {
            const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`, specificTask.id);
            await deleteDoc(documentRef);
            setDoneTaskList(doneTaskList.filter( (i) => i.id !== specificTask.id))
        }
        setIsDeleteModalOn();
        setIsTaskExpanded(false);
    }

    const handleTimeInput = (e, setTimeState) => {
        if(parseInt(e.target.value) > 24 ) {
            setIsMoreThan24(true);
            return;
        }
        setIsMoreThan24(false);
        setTimeState(parseInt(e.target.value));
    }

    /*
    Used to organize and update the time spent on each day

    Put two arrays containing the following:

    Array 1 - contains all the date state variables
    Array 2 - contains all the hours spent state variables
    */

    async function updateTime () {
        let timeArr = [];

        const datesArr = arguments[0];
        const dateTimeArr = arguments[1];

        let documentRef;

        if(isToDoBtnClicked) {
            documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`, specificTask.id);
        } else if (isDoneBtnClicked) {
            documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`, specificTask.id);
        }


        // Find the difference between the locally stored dates/times array from the one on the database. The differences will be placed into a copied version of the database version and then reuploaded onto the database.
        
        for(let i in datesArr) {
            const date = datesArr[i];
            const time = dateTimeArr[i];
            timeArr.push({time, date})
        }

        const docSnap = await getDoc(documentRef);

        const currentTimeSpent = docSnap.data().task.timeSpent;

        const localArr = [];

        for(let i in datesArr) {
            localArr.push({time: dateTimeArr[i], date: datesArr[i]})
        }

        const filteredLocalArr = [];

        localArr.forEach( (obj) => {
            filteredLocalArr.push(obj)
        })

        // This is what goes out of frame
        const difference = (_.differenceWith(currentTimeSpent, filteredLocalArr, _.isEqual));

        timeArr = timeArr.filter( (i) => !isNaN(i.time) && i.time !== undefined && i.time !== null);

        timeArr.push(...difference);

        // Removes duplication of dates object by removing old dates and replaces it with new dates object.
        const uniqueArr = _.unionBy(timeArr, ...difference, "date");

        // Filters out the date objects containing zero to avoid unneccesary uploads.
        const finalArr = uniqueArr.filter((dateObj) => dateObj.time !== 0);

        await updateDoc(documentRef, {
            "task.timeSpent" : finalArr
        })
    }
    
    const submitLoggedTime = () => {
        setIsLogTimeBtnClicked(!isLogTimeBtnClicked);

        updateTime([day1, day2, day3, day4, day5, day6, day7], [day1Time, day2Time, day3Time, day4Time, day5Time, day6Time, day7Time]);
    }

    useEffect( () => {
        setDays(setDay4, setDay3, setDay2, setDay1, setDay5, setDay6, setDay7, backBtnCounter, frontBtnCounter);

    }, [backBtnCounter, frontBtnCounter])

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
                        <input type="range" value={taskCompletion || " "} onChange={debounce((e) => handleProgressBar(e), 400)} onClick={() => {setIsRangeClicked(true)}}/> }
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
                {isLogTimeBtnClicked ?
                <div className="updateHoursContainer">
                    <h2>Enter Hours</h2>
                    <div className="logTimeFlexContainer">
                        <button className="moreDaysBtn" onClick={() => {setBackBtnCounter(backBtnCounter + 1)}}>
                            <i className="fa-solid fa-arrow-left"></i>
                        </button>
                        <form name="logTime" className="logTimeForm">
                            <div className="specificDayContainer">
                                <label htmlFor="howManyHours1" className="sr-only">How many hours on {day1}</label>
                                <p aria-hidden="true">{day1}</p>
                                <input type="number" id="howManyHours1" onChange={(e) => {handleTimeInput(e, setDay1Time)}} value={day1Time}/>
                            </div>

                            <div className="specificDayContainer">
                                <label htmlFor="howManyHours2" className="sr-only">How many hours on {day2}</label>
                                <p aria-hidden="true">{day2}</p>
                                <input type="number" id="howManyHours2" onChange={(e) => {handleTimeInput(e, setDay2Time)}} value={day2Time}/>
                            </div>

                            <div className="specificDayContainer">
                                <label htmlFor="howManyHours3" className="sr-only">How many hours on {day3}</label>
                                <p aria-hidden="true">{day3}</p>
                                <input type="number" id="howManyHours3" onChange={(e) => {handleTimeInput(e, setDay3Time)}} value={day3Time}/>
                            </div>

                            <div className="specificDayContainer">
                                <label htmlFor="howManyHours4" className="sr-only">How many hours on {day4}</label>
                                <p aria-hidden="true">{day4}</p>
                                <input type="number" id="howManyHours4" onChange={(e) => {handleTimeInput(e, setDay4Time)}} value={day4Time}/>
                            </div>

                            <div className="specificDayContainer">
                                <label htmlFor="howManyHours5" className="sr-only">How many hours on {day5}</label>
                                <p aria-hidden="true">{day5}</p>
                                <input type="number" id="howManyHours5" onChange={(e) => {handleTimeInput(e, setDay5Time)}} value={day5Time}/>
                            </div>

                            <div className="specificDayContainer">
                                <label htmlFor="howManyHours6" className="sr-only">How many hours on {day6}</label>
                                <p aria-hidden="true">{day6}</p>
                                <input type="number" id="howManyHours6" onChange={(e) => {handleTimeInput(e, setDay6Time)}} value={day6Time}/>
                            </div>

                            <div className="specificDayContainer">
                                <label htmlFor="howManyHours7" className="sr-only">How many hours on {day7}</label>
                                <p aria-hidden="true">{day7}</p>
                                <input type="number" id="howManyHours7" onChange={(e) => {handleTimeInput(e, setDay7Time)}} value={day7Time}/>
                            </div>
                        </form>
                        <button className="moreDaysBtn" onClick={() => {setFrontBtnCounter(frontBtnCounter + 1)}}>
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                    </div>
                    <p className="totalHours">Total Hours Logged: {timeSpent} {timeSpent <= 1 ? "hour" : "hours"}</p>
                    {isMoreThan24 ? <p className="loggingError">You cannot log more than 24 hours in a day.</p> : null}
                    <div className="logTimeOptionBtns">
                        <button onClick={submitLoggedTime} className="logTimeBtnTwo">Log Time</button>
                        <button onClick={() => {setIsLogTimeBtnClicked(!isLogTimeBtnClicked)}}>Cancel</button>
                    </div>
                </div> : null}
            </div>
            <button className="updateTasksContainer" onClick={handleNewUpdateBtn}>
                <p>Start a new update</p>
            </button>
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