import {format} from "date-fns";
import {  doc, updateDoc, getDoc, deleteDoc, collection, getDocs, addDoc } from "firebase/firestore";
import { useEffect, useState, useRef, useContext} from "react";
import uuid from "react-uuid";
import { debounce, updateDatabase } from "../utils/globalFunctions";
import { AppContext } from "../Contexts/AppContext";
import { db } from "./firebase";
import {useToggle} from "../utils/customHooks";
import _ from "lodash";
import { startOfWeek } from "date-fns/esm";

const TaskDetails = ({specificTask, reformattedTask, reformattedDoneTask}) => {

    // useContext variables
    const {userUID, username, userPic, taskList, setTaskList, setIsTaskExpanded, doneTaskList, setDoneTaskList, isToDoBtnClicked, isDoneBtnClicked} = useContext(AppContext);

    // Due date & time
    const [dueTime, setDueTime] = useState(specificTask.task.time);
    const [dueDate, setDueDate] = useState(specificTask.task.deadline);

    // Toggles
    const [isNewUpdateBtnClicked, setIsNewUpdateBtnClicked] = useState(false);
    const [isLogTimeBtnClicked, setIsLogTimeBtnClicked] = useState(false);
    const [isRangeClicked, setIsRangeClicked] = useState(false);
    const [isDeleteModalOn, setIsDeleteModalOn] = useToggle();
    const [isEnableOn, setIsEnableOn] = useToggle(); 
    const [isTaskProgressNotUpdated, setIsTaskProgressNotUpdated] = useState(true);

    // These will convert the day into the prefered reading format
    const [day1, setDay1] = useState("");
    const [day2, setDay2] = useState("");
    const [day3, setDay3] = useState("");
    const [day4, setDay4] = useState("");
    const [day5, setDay5] = useState("");
    const [day6, setDay6] = useState("");
    const [day7, setDay7] = useState("");
    
    // State relating to the hours spent on the corresponding day
    const [day1Time, setDay1Time] = useState(0);
    const [day2Time, setDay2Time] = useState(0);
    const [day3Time, setDay3Time] = useState(0);
    const [day4Time, setDay4Time] = useState(0);
    const [day5Time, setDay5Time] = useState(0);
    const [day6Time, setDay6Time] = useState(0);
    const [day7Time, setDay7Time] = useState(0);

    // State to track the back/front buttons on the log time modal
    const [backBtnCounter, setBackBtnCounter] = useState(0);
    const [frontBtnCounter, setFrontBtnCounter] = useState(0);
    
    const [updates, setUpdates] = useState([]);
    const [timeSpent, setTimeSpent] = useState(0);
    const [isMoreThan24, setIsMoreThan24] = useState(false);
    const [taskCompletion, setTaskCompletion] = useState(specificTask.task.completion)
    const [isProgressSaved, setIsProgressSaved] = useState(true);

    const isMounted = useRef(false);
    const isMountedTwo = useRef(false);

    // useRef variables
    const textareaEl = useRef(null)

    // To get the data from database on mount
    useEffect( () => {
    
        getUpdateCommentsAndProgress()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isDoneBtnClicked, isToDoBtnClicked, specificTask.id, userUID]);
    
    // To handle new updates, this will not run on initial mount

    useEffect( () => {

        if(!isMounted.current) {
            isMounted.current = true;
            return;
        }

        handleUpdateDocument();

        if(taskCompletion !== "") {
            handleUpdateProgress();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [updates, taskCompletion, specificTask.id, userUID, isDoneBtnClicked, isToDoBtnClicked])

    // To get dates for log time
    useEffect( () => {

        setDays(setDay4, setDay3, setDay2, setDay1, setDay5, setDay6, setDay7);
        
    }, [])

    // Handles on mount loading of time inputs

    useEffect( () => {

        if(!isMountedTwo.current) {
            isMountedTwo.current = true;
            return;
        }
    
        getDocument([day1, day2, day3, day4, day5, day6, day7],[setDay1Time, setDay2Time, setDay3Time, setDay4Time, setDay5Time, setDay6Time, setDay7Time]);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLogTimeBtnClicked, day1, day2, day3, day4, day5, day6, day7])

    // Handle UI change for log time modal
    useEffect( () => {
        setDays(setDay4, setDay3, setDay2, setDay1, setDay5, setDay6, setDay7, backBtnCounter, frontBtnCounter);

    }, [backBtnCounter, frontBtnCounter])

    // Handle updating timestamp for deadline

    useEffect( () => {
        handleUnformattedDeadline();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dueDate, dueTime])

    // Handle loading

    useEffect( () => {
        let timeout;
        clearTimeout(timeout);

        timeout = setTimeout( () => {
            setIsTaskProgressNotUpdated(false);
        }, 400)
    }, [taskCompletion])

    async function handleUpdateDocument() {

        setIsProgressSaved(false);
        
        let documentRef = determineWhichRef(specificTask.id);

        try {
            await updateDoc(documentRef, {
                "task.updates": updates
            })
        } catch {
            const newDocumentRef = await getNewUpdatedRef();    
            await updateDoc(newDocumentRef, {
                "task.updates": updates
            })
        }

        setIsProgressSaved(true)
    }

    async function getUpdateCommentsAndProgress() {
        // If this task is not complete then the data is updated within the ongoing tasks collection

        let documentRef = determineWhichRef(specificTask.id)

        let docSnap;
        try {
            docSnap = await getDoc(documentRef);
        } catch {
            const newDocumentRef = await getNewUpdatedRef();   
            docSnap = await getDoc(newDocumentRef);
        }
        
        setUpdates(docSnap.data().task.updates);
        
    }

    function determineWhichRef(taskID){
        let documentRef;

        for(let arr of reformattedTask) {

            // Determines the correct week to begin looping through to find a match
            if(arr[0].task.firstDayOfWeekUnformatted === specificTask.task.firstDayOfWeekUnformatted) {
                
                for(let singleTask of arr) {
                    
                    // If the current task we are on can be found in the incomplete task list then we can safely determine we will need to make edits from the incomplete collection, not the complete collection
                    if(singleTask.uuid === specificTask.uuid) {
                        documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`, taskID);
                        return documentRef;
                    }
                }
            }
        }

        for(let arr of reformattedDoneTask) {

            if(arr[0].task.firstDayOfWeekUnformatted === specificTask.task.firstDayOfWeekUnformatted) {

                for(let singleTask of arr) {

                    if(singleTask.uuid === specificTask.uuid) {
                        documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`, taskID);
                        return documentRef;
                    }

                }

            }
        }
    }


    // Called with an array containing all 7 day's dates + an array containing the state function to set a new day time.
    async function getDocument() {
        let documentRef = determineWhichRef(specificTask.id);
        // If the dates on the log time modal match the dates of the hours logged in the database, it will populate the hours.
        let docSnap;
        let timeSpentArr;

        try{
            docSnap = await getDoc(documentRef);
            timeSpentArr = docSnap.data().task.timeSpent;
        } catch {
            const newDocumentRef = await getNewUpdatedRef(); 
            docSnap = await getDoc(newDocumentRef);
            // Array containing all the dates/times logged in from the database
            timeSpentArr = docSnap.data().task.timeSpent;
        }

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
            minutesPublished: (new Date()).getMinutes(),
            uuid: uuid()
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

    const handleUnformattedDeadline = async () => {
        const updatedTime = new Date(dueDate.replace(/([-])/g, '/'));
        const dueHours = dueTime.split(':')[0];
        const dueMinutes = dueTime.split(':')[1];
        updatedTime.setHours(dueHours, dueMinutes);

        let documentRef = determineWhichRef(specificTask.id);

        try {
            await updateDoc(documentRef, {
                "task.unformattedDeadline" : updatedTime
            })
        } catch {
            const newDocumentRef = await getNewUpdatedRef();
            await updateDoc(newDocumentRef, {
                "task.unformattedDeadline" : updatedTime
            })
        }
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

        let documentRef = determineWhichRef(specificTask.id);

        // Find the difference between the locally stored dates/times array from the one on the database. The differences will be placed into a copied version of the database version and then reuploaded onto the database.
        
        for(let i in datesArr) {
            const date = datesArr[i];
            const time = dateTimeArr[i];
            timeArr.push({time, date})
        }

        let docSnap;
        let currentTimeSpent;

        try {
            docSnap = await getDoc(documentRef);
            currentTimeSpent = docSnap.data().task.timeSpent;
        } catch {
            const newDocumentRef = await getNewUpdatedRef();  
            docSnap = await getDoc(newDocumentRef);
            currentTimeSpent = docSnap.data().task.timeSpent;
        }

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

        try {
            await updateDoc(documentRef, {
                "task.timeSpent" : finalArr,
            })
        } catch {
            const newDocumentRef = await getNewUpdatedRef();  
            await updateDoc(newDocumentRef, {
                "task.timeSpent" : finalArr,
            })
        }
    }
    
    const submitLoggedTime = () => {
        setIsLogTimeBtnClicked(!isLogTimeBtnClicked);

        updateTime([day1, day2, day3, day4, day5, day6, day7], [day1Time, day2Time, day3Time, day4Time, day5Time, day6Time, day7Time]);
    }

    const resetTime = async () => {

        let documentRef = determineWhichRef(specificTask.id);

        setDay1Time(0)
        setDay2Time(0)
        setDay3Time(0)
        setDay4Time(0)
        setDay5Time(0)
        setDay6Time(0)
        setDay7Time(0)
        setTimeSpent(0);

        try {
            await updateDoc(documentRef, {
                "task.timeSpent" : []
            })
        } catch {
            const newDocumentRef = await getNewUpdatedRef();  
            await updateDoc(newDocumentRef, {
                "task.timeSpent" : []
            })
        }
    }

    const updateTaskName = async (e) => {
        let documentRef = determineWhichRef(specificTask.id);

        specificTask.task.name = e.target.value;

        try{
            await updateDoc(documentRef, {
                "task.name" : e.target.value
            });
        } catch {
            const newDocumentRef = await getNewUpdatedRef();
            await updateDoc(newDocumentRef, {
                "task.name" : e.target.value
            });
        }
    }

    const updateTaskDescription = async(e) => {
        let documentRef = determineWhichRef(specificTask.id);

        specificTask.task.description = e.target.value;

        try {
            await updateDoc(documentRef, {
                "task.description" : e.target.value
            });
        } catch {
            const newDocumentRef = await getNewUpdatedRef();
            await updateDoc(newDocumentRef, {
                "task.description" : e.target.value
            });
        }
    }

    const updatePriority = async(e) => {
        let documentRef = determineWhichRef(specificTask.id);

        specificTask.task.priority = e.target.value;
        let priorityLevel;

        if(e.target.value === "low") {
            priorityLevel = 1;
        } else if (e.target.value === "medium") {
            priorityLevel = 2;
        } else {
            priorityLevel = 3;
        }

        try {
            await updateDoc(documentRef, {
                "task.priority" : e.target.value,
                "task.priorityLevel" : priorityLevel
            });
        } catch {
            const newDocumentRef = await getNewUpdatedRef();
            await updateDoc(newDocumentRef, {
                "task.priority" : e.target.value,
                "task.priorityLevel" : priorityLevel
            });
        }
    }

    const updateDate = async (e) => {
        let documentRef = determineWhichRef(specificTask.id);
        setDueDate(e.target.value);

        const dateString = e.target.value.replace(/([-])/g, '');
        const year = +dateString.substring(0, 4);
        const month = +dateString.substring(4, 6);
        const day = +dateString.substring(6, 8);
        const date = new Date(year, month - 1, day);

        const reformattedDeadline = format(date, 'MMM dd, yyyy');
        specificTask.task.reformattedDeadline = reformattedDeadline;

        const firstDayOfWeek = startOfWeek(date);
        const firstDayOfWeekUnformatted = format(firstDayOfWeek, 'yyyy-MM-dd');
        const firstDayOfWeekTimestamp = new Date(format(firstDayOfWeek, 'yyyy-MM-dd'));
        const startDayOfWeek = format(firstDayOfWeek, 'MMM dd, yyyy');
        const deadline = e.target.value;

        try {
            await updateDoc(documentRef, {
                "task.deadline" : deadline,
                "task.firstDayOfWeekUnformatted" : firstDayOfWeekUnformatted,
                "task.firstDayOfWeekTimestamp" : firstDayOfWeekTimestamp,
                "task.reformattedDeadline" : reformattedDeadline,
                "task.startDayOfWeek": startDayOfWeek,
            });
        } catch {
            const newDocumentRef = await getNewUpdatedRef();
            await updateDoc(newDocumentRef, {
                "task.deadline" : deadline,
                "task.firstDayOfWeekUnformatted" : firstDayOfWeekUnformatted,
                "task.firstDayOfWeekTimestamp" : firstDayOfWeekTimestamp,
                "task.reformattedDeadline" : reformattedDeadline,
                "task.startDayOfWeek": startDayOfWeek,
            });
        }
    }

    const convertArmyToStandardTime = (time) => {
        const timeArr = time.split(":");
        const hourTime = parseInt(timeArr[0]);

        if (hourTime > 12){
            timeArr[0] = timeArr[0] - 12;
            return timeArr.join(":")
        } else if (hourTime === 0){
            timeArr[0] = 12;
            return timeArr.join(":")
        } else {
            return time;
        }
    }

    const updateTimeInput = async (e) => {
        let documentRef = determineWhichRef(specificTask.id);
        setDueTime(e.target.value);
        specificTask.task.time = e.target.value;

        try {
            await updateDoc(documentRef, {
                "task.time" : e.target.value,
            })
        } catch {
            const newDocumentRef = await getNewUpdatedRef();
            await updateDoc(newDocumentRef, {
                "task.time" : e.target.value,
            })
        }
    }

    const toggleEditComments = (e) => {
        let commentParagraphEl = e.target.offsetParent.offsetParent.childNodes[1].childNodes[1];
        let commentInputEl = e.target.offsetParent.offsetParent.childNodes[1].childNodes[2];
        let ulEl = e.target.parentNode.parentNode;
        if(e.target.textContent === "Edit Update") {
            ulEl.style.display = "none";
            let doneEditingBtn = e.target.parentNode.nextSibling.firstChild;
            e.target.className = "hiddenUpdate";
            commentParagraphEl.className = "hiddenUpdate";
            commentInputEl.className = "";
            doneEditingBtn.className = "";
        } else if (e.target.textContent === "Done Editing"){
            let editBtn = e.target.parentNode.previousSibling.firstChild;
            ulEl.style.display = "none";
            e.target.className = "hiddenUpdate";
            commentInputEl.className = "hiddenUpdate";
            editBtn.className = "";
            commentParagraphEl.className = "";
        }

    }

    const updateComment = async (e, updateObj) => {
        let documentRef = determineWhichRef(specificTask.id);
        let commentParagraphEl = e.target.previousSibling;
        let inputInfo = e.target.value;
        const updatesArr = [...updates];
        for(let property of updatesArr) {
            if(property.uuid === updateObj.uuid){
                property.taskUpdate = inputInfo;
            }
        }
        commentParagraphEl.textContent = e.target.value;
        try {
            await updateDoc(documentRef, {
                "task.updates" : updatesArr
            })
        } catch {
            const newDocumentRef = await getNewUpdatedRef();
            await updateDoc(newDocumentRef, {
                "task.updates" : updatesArr
            })           
        }
    }

    const convertTimeToStandard = (update) => {
        // When time is given seperate (hours and minutes are seperated), convert to standard time format
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

        return time;
    }

    const handleProgressBar = async (e) => {
        setTaskCompletion(e.target.value);
    }

    async function handleUpdateProgress() {

        setIsProgressSaved(false);

        let documentRef = determineWhichRef(specificTask.id);

        // determines which collection the task is located in
        const taskCollectionName = documentRef.path.split("/")[4];

        if(taskCompletion === "100" && taskCollectionName === "ongoingTask") {

            // Stops duplicates from being added into our data after the user flips the progress bar continuously while updating it appropriately
            for(let task of doneTaskList) {
                if(task.uuid === specificTask.uuid) {

                    const newDocumentRef = await getNewUpdatedRef();

                    const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);
                    const updatedTask = {...specificTask};
                    updatedTask.task.completion = "100";
                    await addDoc(doneCollection, updatedTask)
                    await deleteDoc(newDocumentRef);
                    const data = await getDocs(doneCollection);
                    setDoneTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
                    setIsProgressSaved(true)
                    return
                }
            }

            const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);
            const updatedTask = {...specificTask};
            updatedTask.task.completion = "100";
            const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${updatedTask.id}`);
            await updateDatabase(doneCollection, postDoc, setDoneTaskList, updatedTask);
            setIsProgressSaved(true);
            return;

        } else if (taskCompletion !== "100" && taskCollectionName === "finishedTask") {

            const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);
            const updatedTask = {...specificTask};
            updatedTask.task.completion = taskCompletion;
            const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${updatedTask.id}`);
            await updateDatabase(collectionRef, doneDoc, setTaskList, updatedTask);
            setIsProgressSaved(true);
            return;
        }

        try {
            await updateDoc(documentRef, {
                "task.completion" : taskCompletion
            })
        } catch {
            const newDocumentRef = await getNewUpdatedRef();
            const newCollectionName = newDocumentRef.path.split("/")[4]; 

            if(newCollectionName === "ongoingTask" && taskCompletion !== "100") {
                const updatedTask = {...specificTask};
                updatedTask.task.completion = taskCompletion;

                await updateDoc(newDocumentRef, {
                    "task.completion" : taskCompletion
                })
                setIsProgressSaved(true);
            } else if (newCollectionName === "finishedTask" && taskCompletion !== "100") {

                const ongoingCollectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);
                const updatedTask = {...specificTask};
                updatedTask.task.completion = taskCompletion;
                await addDoc(ongoingCollectionRef, updatedTask)
                await deleteDoc(newDocumentRef);
                const data = await getDocs(ongoingCollectionRef);
                setTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
                setIsProgressSaved(true);
                return
                
            }
        }
    }

    // This is used to get a new collection reference of the current task that is shown on the UI. This is only used after the initial change of data from one collection to another.
    const getNewUpdatedRef = async () => {
        const ongoingCollectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);
        const doneCollectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);

        const updatedOngoingTasksRef = await getDocs(ongoingCollectionRef);

        const updatedDoneTasksRef = await getDocs(doneCollectionRef);

        const updatedUnfinishedTask = updatedOngoingTasksRef.docs.map((doc) => ({...doc.data(), id: doc.id}));  
    
        const updatedDoneTasks = updatedDoneTasksRef.docs.map((doc) => ({...doc.data(), id: doc.id}));  

        let newDocRef;

        for(let task of updatedUnfinishedTask) {
            if(task.uuid === specificTask.uuid) {
                newDocRef = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`, task.id);
                return newDocRef;
            }
        }

        for(let task of updatedDoneTasks) {
            if(task.uuid === specificTask.uuid) {
                newDocRef = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`, task.id);
                return newDocRef;                
            }
        }
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
            <div className="taskHeader">
                <div className="taskInformation">
                    <i className="fa-regular fa-clipboard"></i>
                    <div className="taskNameContainer">
                        <p className="label">Task</p>
                        {isEnableOn ? <input type="text" defaultValue={specificTask.task.name} onChange={debounce( (e) => {updateTaskName(e)}, 300)}/> : <h1>{specificTask.task.name}</h1>}
                    </div>
                </div>
                <div className="editContainer">
                    <div className="taskToolBar">
                        <button onClick={enableEditBtn} className="taskBtnContainer taskBtnContainerOne">
                            <div className="toolBarCombo">
                                <i className="fa-solid fa-pencil toolBarBtn" aria-hidden="true"></i>
                                {isEnableOn ? 
                                <i className="fa-solid fa-minus toolBarExtension"></i> : null}                                
                            </div>
                            {isEnableOn ? <p>Finish Edit</p> : <p>Edit Task</p>}
                        </button>
                        <button className="taskBtnContainer" onClick={setIsDeleteModalOn}>
                            <i className="fa-solid fa-trash toolBarBtn" aria-hidden="true"></i>
                            <p>Delete Task</p>
                        </button>
                    </div>
                    <div className="rangeDiv">
                        <p className="label">Task Completion</p>
                        {isEnableOn ? 
                        <input type="range" defaultValue={taskCompletion} onChange={debounce((e) => handleProgressBar(e), 300)}/> : 
                        <input type="range" value={taskCompletion || "0"} onChange={debounce((e) => handleProgressBar(e), 300)} onClick={() => {setIsRangeClicked(true)}}/> }
                    </div>
                </div>
            </div>
            {isRangeClicked && !isEnableOn? 
            <p className="percentError">Please click the edit button in order to make changes.</p> :
            <div className="optionalMessageFiller"></div>}
            {isProgressSaved ? 
            <div className="optionalMessageFiller"></div> : 
            <div className="savingMessageContainer">
                <div className="lds-ring"><div></div></div>
                <p className="savingStatusMessage">Currently saving...</p>
            </div>}
            <div className="taskDescription">
                <p className="label">Description</p>
                {isEnableOn ? <textarea defaultValue={specificTask.task.description} onChange={debounce((e) => {updateTaskDescription(e)}, 300)} rows="1"></textarea> : <p className="descriptionParagraph">{specificTask.task.description}</p>}
            </div>
            <div className="taskData">
                <div className="taskDates taskInfoContainer">
                    <p className="label">Due Date</p>
                    {isEnableOn ? 
                    <input type="date" onChange={debounce((e) => {updateDate(e)}, 300)} defaultValue={specificTask.task.deadline}/> : 
                    <p className="plannedCompletionPara">{specificTask.task.reformattedDeadline}</p>}
                </div>
                <div className="dueTimeLabel taskInfoContainer">
                    <p className="label">Due Time</p>
                    {isEnableOn ? 
                    <input type="time" defaultValue={specificTask.task.time} onChange={(e) => {updateTimeInput(e)}}/> :
                    <p className="dueTimeParagraph">{parseInt(specificTask.task.time.replace(/([:])/g, '')) > 1159 ? `${convertArmyToStandardTime(specificTask.task.time)} PM` : `${convertArmyToStandardTime(specificTask.task.time)} AM` }</p>}
                </div>
                <div className="priorityLevel taskInfoContainer">
                    <p className="label">Priority</p>
                    {isEnableOn ? 
                    <form name="selectPriority">
                        <select onChange={debounce(updatePriority, 300)} defaultValue={specificTask.task.priority}>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </form>: 
                    <p className="priorityParagraph">{specificTask.task.priority}</p>}
                </div>
                <div className="taskInfoContainer dueTimeLabel">
                    <p className="label">Task Completion</p>
                    <p className="taskCompletionPara">{taskCompletion}%</p>
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
                                <p aria-hidden="true" className="todayContainerTitle">{day4}</p>
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
                        <button className="resetBtn" onClick={resetTime}>Reset Time</button>
                        <button onClick={() => {setIsLogTimeBtnClicked(!isLogTimeBtnClicked)}} className="cancelBtn">Cancel</button>
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

                return <div key={uuid()} className="taskCommentContainer">
                            <div className="profilePicContainer">
                                <img src={userPic} alt="" />
                            </div>
                            <div className="commentText">
                                <p className="username">{username}</p>
                                <p>{update.taskUpdate}</p>
                                <input type="text" className="hiddenUpdate" onChange={debounce( (e) => {updateComment(e, update)}, 300)} defaultValue={update.taskUpdate}/>
                                <p className="timePublished">{`Posted on ${update.date} at ${convertTimeToStandard(update)}`}</p>
                            </div>
                            <div className="buttonsContainer">
                                <button className="moreOptionsBtn" onClick={handleOptionsBtn}>
                                    <i className="fa-solid fa-ellipsis"></i>
                                </button>
                                <ul className="alterUpdateOption">
                                    <li>
                                        <button onClick={(e) => {toggleEditComments(e)}}>Edit Update</button>
                                    </li>
                                    <li>
                                        <button className="hiddenUpdate" onClick={(e) => {toggleEditComments(e)}}>Done Editing</button>
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