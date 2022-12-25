import { AppContext } from "../Contexts/AppContext";
import { useContext, useState, useEffect, useRef } from "react";
import { disableScrollForModalOn } from "../utils/globalFunctions";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { Navigate } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import uuid from "react-uuid";
import { format, startOfWeek } from "date-fns";
import {cloneDeep} from "lodash";

// Component Imports
import HomeNavigation from "./HomeNavigation";
import NewTask from "./NewTask";
import SignOutModal from "./SignOutModal";

const HabitTracker = () => {

    // Track days for the calendar
    const [dayCounter, setDayCounter] = useState(format(new Date(), 'i') - 1);
    const [selectedDay, setSelectedDay] = useState(getNewDate(format(new Date(), 'i') - 1))

    // Form fields
    const [habitName, setHabitName] = useState("");
    const [habitRepeats, setHabitRepeats] = useState("");
    const [habitColor, setHabitColor] = useState("");

    // Toggles
    const [isModalOn, setIsModalOn] = useState(false);

    // Loading on mount
    const [isLoading, setIsLoading] = useState(false);

    // Loading for changes
    const [isEditLoading, setIsEditLoading] = useState(false);
    
    // Full List of Data
    const [habitsList, setHabitsList] = useState([]);

    // Shown Habits on Habit List Slide
    const [shownHabits, setShownHabits] = useState([]);
    const [shownHabitsCounter, setShownHabitsCounter] = useState(0);

    // Shown Habits on Dashboard
    const [shownDashboardHabits, setShownDashboardHabits] = useState([]);
    const [shownDashboardCount, setShownDashboardCount] = useState(0);

    // Media Queries
    const [isMediumScreen, setIsMediumScreen] = useState(false);

    // Submit Btn Ref
    const submitBtn = useRef(null);

    const {setIsAuth, isAuth, username, setUsername, setUserUID, userUID, userPic, isNewTaskClicked, isSignOutModalOn, isNavExpanded, setUserPic, setIsNewTaskClicked, setIsSignOutModalOn} = useContext(AppContext);

    // Collection Reference
    const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/habits/`);

    // Check for authenticataion
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
        disableScrollForModalOn(isModalOn);
    }, [isModalOn])

    useEffect( () => {
        disableScrollForModalOn(isNewTaskClicked);
        
    }, [isNewTaskClicked])

    useEffect( () => {

        if(isNewTaskClicked && document.body.style.overflow === 'hidden') return;

        disableScrollForModalOn(isNavExpanded);
    },[isNavExpanded, isNewTaskClicked]);

    useEffect( () => {
        setIsLoading(true);
        getNewData();
        // eslint-disable-next-line
    }, [userUID]);

    // Handles UI changes for list of habits on daily habit list
    useEffect( () => {
        if(!isMediumScreen) {
            setShownHabits(habitsList.slice(shownHabitsCounter , 4 + shownHabitsCounter));
        } else {
            setShownHabits(habitsList)
        }
    }, [habitsList, shownHabitsCounter, isMediumScreen])

    // Handles UI changes for the list of habits on dashboard
    useEffect( () => {
        setShownDashboardHabits(habitsList.slice(shownDashboardCount, 5 + shownDashboardCount));
    }, [habitsList, shownDashboardCount]);

    useEffect( () => {
        updateCurrWeekCompletion();
        // eslint-disable-next-line
    }, [habitsList])

    useEffect( () => {

        if(isNewTaskClicked && document.body.style.overflow === 'hidden') return;

        disableScrollForModalOn(isNavExpanded);
    },[isNavExpanded])

    const updateCurrWeekCompletion = async () => {
        if(habitsList.length === 0) return

        const updatedCurrBeginWeek = format(startOfWeek(new Date(), {weekStartsOn: 1}), 'E, LLL d');
        const savedBeginWeek = habitsList[0].beginCurrWeek;

        if (updatedCurrBeginWeek !== savedBeginWeek) {
            
            const habitsListCopy = cloneDeep(habitsList)

            for(let habit of habitsListCopy) {
                const {dailyCompletion, completion, id} = habit;

                for(let week in dailyCompletion) {
                    let dayArr = dailyCompletion[week];

                    const newDayArr =  dayArr.map( (fraction) => fraction = false)

                    dailyCompletion[week] = newDayArr;
                }

                for(let i in completion) {
                    completion[i] = false;
                }

                habit.beginCurrWeek = format(startOfWeek(new Date(), {weekStartsOn: 1}), 'E, LLL d');

                const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/habits/${id}`);
                await updateDoc(documentRef, habit)
            }
        }
    }

    useEffect(() => {
        const media = window.matchMedia('(max-width: 975px)');
        const listener = () => setIsMediumScreen(media.matches);
        listener();
        window.addEventListener('resize', listener);

        return () => window.removeEventListener('resize', listener);
    }, [isMediumScreen]);

    function getNewDate(daysFromToday){
        const firstDayOfWeek = getFirstDayOfWeek();
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() + daysFromToday);
        return firstDayOfWeek;
    }

    const getWeekday = (date, weekdayFormat) => {
        if(weekdayFormat === "short") {
            const weekday = ["Sun","Mon","Tue","Wed","Thur","Fri","Sat"];
            return weekday[date.getDay()];
        } else if (weekdayFormat === "long") {
            const weekday = ["sunday","monday","tuesday","wednesday","thursday","friday","saturday"];
            return weekday[date.getDay()];
        }
    }

    const getDayOfMonth = (date) => {
        return date.getDate();
    }

    const getMonth = (date) => {
        const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];

        return month[date.getMonth()];
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        submitBtn.current.disabled = true;
        
        const completionRepeats = {};
        let count = 0;

        while(count < 7) {
            if(!completionRepeats[getWeekday(getNewDate(count), "long")]) {
                completionRepeats[getWeekday(getNewDate(count), "long")] = [];
            }
            count++;
        }
        
        for(let index in completionRepeats) {
            for(let i = 0; i < habitRepeats; i++) {
                completionRepeats[index].push(false);
            }
        }

        const doc =
            {user: 
                {username, 
                id: auth.currentUser.uid},
            habit: 
                {name: habitName,
                habitRepeats, 
                habitColor, 
                uuid: uuid()},
            completion: 
                {monday: false, 
                tuesday: false, 
                wednesday: false, 
                thursday: false, 
                friday: false,
                saturday: false,
                sunday: false},
            dailyCompletion: completionRepeats,
            beginCurrWeek: format(startOfWeek(new Date(), {weekStartsOn: 1}), 'E, LLL d')}

        const documentRef = await addDoc(collectionRef, doc)
        const documentID = documentRef.id;

        await updateDoc(documentRef, {
            id: documentID
        })
        
        setIsModalOn(false);
        submitBtn.current.disabled = true;
        getNewData();
    }

    const getNewData = async () => {
        const data = await getDocs(collectionRef);
        setHabitsList( data.docs.map((doc) => ({...doc.data(), id: doc.id})));
        setIsLoading(false);
        setIsEditLoading(false);
    }

    function getFirstDayOfWeek () {
        const date = new Date();
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }

    const handleMarkComplete = async (habitID, boolean, habitDetails) => {
        const dailyCompletionArr = habitDetails.dailyCompletion[getWeekday(selectedDay, "long")];

        for(let i = 0; i < dailyCompletionArr.length; i++) {
            if(dailyCompletionArr[i] === false) {
                dailyCompletionArr[i] = true;
                break;
            }
        }

        // If daily completions are not finished
        if(dailyCompletionArr.includes(false)) {
            setIsEditLoading(true);
            const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/habits/`, habitID);
            await updateDoc(documentRef, {
                [`dailyCompletion.${getWeekday(selectedDay, "long")}`] : dailyCompletionArr
            })
            getNewData();
        } else if (!dailyCompletionArr.includes(false)) {
            setIsEditLoading(true);
            const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/habits/`, habitID);
            const weekDay = (format(selectedDay, 'iiii')).toLowerCase();
            await updateDoc(documentRef, {
                [`completion.${weekDay}`] : boolean,
                [`dailyCompletion.${getWeekday(selectedDay, "long")}`] : dailyCompletionArr
            })
            getNewData();
        }
    }

    const handleUndoCompletion = async(habitID, habitDetails) => {
        // setIsEditLoading(true);
        const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/habits/`, habitID);
        const dailyCompletionArr = habitDetails.dailyCompletion[getWeekday(selectedDay, "long")];
        for(let i in dailyCompletionArr) {
            if(dailyCompletionArr[i]) {
                dailyCompletionArr[i] = false;
            }
        }

        const weekDay = (format(selectedDay, 'iiii')).toLowerCase();
        await updateDoc(documentRef, {
            [`completion.${weekDay}`] : false,
            [`dailyCompletion.${weekDay}`] : dailyCompletionArr
        })
        getNewData();
    }

    const handleDeleteHabit = async(habitID, habitDetails) => {
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/habits/${habitID}`);
        await deleteDoc(postDoc);

        const newHabitList = habitsList.filter( (habit) => habit !== habitsList[habitsList.indexOf(habitDetails)]);

        setHabitsList(newHabitList);

        if(shownHabitsCounter > 0) {
            setShownHabitsCounter(shownHabitsCounter - 1);
        }
    }

    const checkProgress = (denom, objectToLoop, valueToCount) => {
        let finishedDays = 0;
        
        for(let prop of objectToLoop) {
            const completionArr = Object.values(prop.completion);
            finishedDays += completionArr.filter(x => x===valueToCount).length;
        }

        const completion = Math.round((finishedDays/denom) * 100);

        if(!completion) return 0;

        return completion;
    }

    const checkDailyProgress = () => {
        const denominator = [];

        for(let habit of habitsList) {
            const selectedDayTaskPercent = habit.dailyCompletion[getWeekday(selectedDay, "long")];
            
            for(let fractionCompletion of selectedDayTaskPercent) {
                denominator.push(fractionCompletion)
            }
        }
        const numerator = denominator.filter( (x) => x===true).length;

        const weekProgress = Math.round((numerator/denominator.length) * 100);
        
        if(weekProgress) {
            return weekProgress;
        } else {
            return 0;
        }
    }

    const checkWeeklyProgress = () => {
        const totalHabits = habitsList.length * 7;
        return checkProgress(totalHabits, habitsList, true);
    }

    const handleHabitDropdown = (e) => {
        let containerChildNodes = e.target.offsetParent.childNodes;
        let classNameOn = "dropdownOptions";
        let classNameOff = "dropdownOptions hidden";

        for(let index of containerChildNodes) {
            if (index.className === classNameOn || index.className === "dropdownOptionsTwo") {
                index.className = classNameOff
            } else if (index.className === classNameOff){
                if(containerChildNodes.length === 4) {
                    index.className = "dropdownOptionsTwo"
                } else {
                    index.className = classNameOn
                }
            } 
        }
    }

    const trimHabitLength = (string) => {

        if(string.length >= 15) {
            let str = string.slice(0,15);
            str+= "...";
            return str;
        } else {
            return string;
        }
    }
    const handlePrevDayBtn = () => {
        if(dayCounter === 0) return;
        setDayCounter(dayCounter - 1);
        setSelectedDay(getNewDate(dayCounter - 1))
    }

    const handleNextDayBtn = () => {
        if(dayCounter === 6) return;
        setDayCounter(dayCounter + 1);
        setSelectedDay(getNewDate(dayCounter + 1))
    }

    const changeDashboardTask = (number, setCountState) => {
        if(habitsList.length === 1 ) return;
        setCountState(number);
    }

    if(isAuth) {
        return(
            <div className="habitPage">
                {isNewTaskClicked ? 
                    <>
                        <NewTask />
                        <div className="overlayBackground overlayBackgroundTwo" onClick={() => {setIsNewTaskClicked(false)}}></div>
                    </>
                : null}
                {isSignOutModalOn ?
                <>
                    <SignOutModal/>
                    <div className="overlayBackground signoutOverlay" onClick={() => {setIsSignOutModalOn(false)}}></div>
                </> 
                : null }
                <HomeNavigation userUID={userUID} username={username} userPic={userPic} setUsername={setUsername} setUserUID={setUserUID} setIsAuth={setIsAuth}/>
                <div className="habitTrackingContent">
                    <div className="habitFlexContainer">
                        <div className="habitContentOne">
                            <div className="userGreetingText">
                                <h1>Hey there, {username}</h1>
                                <p>Let's get productive!</p>
                            </div>
                            <div className="habitCalendar">
                                <div className="weeklyHabitDetails">
                                    <h2>{`${getDayOfMonth(getFirstDayOfWeek())} - ${getDayOfMonth(getNewDate(6))} ${getMonth(getNewDate(6))} ${getNewDate(6).getFullYear()}`}</h2>
                                    <div className="weekCompletionBar">
                                        <div className="completionFill" style={{width: `${checkWeeklyProgress()}%`}}></div>
                                    </div>
                                    <p>{checkWeeklyProgress()}% of weekly goal achieved</p>
                                </div>
                                <ul>
                                    <li>
                                        <button className={getWeekday(getFirstDayOfWeek(), "short") === getWeekday(selectedDay, "short") ? "today" : null}>
                                            <p>{getWeekday(getFirstDayOfWeek(), "short")}</p>
                                            <p>{getDayOfMonth(getFirstDayOfWeek(), "short")}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(getNewDate(1), "short") === getWeekday(selectedDay, "short") ? "today" : null}>
                                            <p>{getWeekday(getNewDate(1), "short")}</p>
                                            <p>{getDayOfMonth(getNewDate(1), "short")}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(getNewDate(2), "short") === getWeekday(selectedDay, "short") ? "today" : null}>
                                            <p>{getWeekday(getNewDate(2), "short")}</p>
                                            <p>{getDayOfMonth(getNewDate(2), "short")}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(getNewDate(3), "short") === getWeekday(selectedDay, "short") ? "today" : null}>
                                            <p>{getWeekday(getNewDate(3), "short")}</p>
                                            <p>{getDayOfMonth(getNewDate(3), "short")}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(getNewDate(4), "short") === getWeekday(selectedDay, "short") ? "today" : null}>
                                            <p>{getWeekday(getNewDate(4), "short")}</p>
                                            <p>{getDayOfMonth(getNewDate(4), "short")}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(getNewDate(5), "short") === getWeekday(selectedDay, "short") ? "today" : null}>
                                            <p>{getWeekday(getNewDate(5), "short")}</p>
                                            <p>{getDayOfMonth(getNewDate(5), "short")}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(getNewDate(6), "short") === getWeekday(selectedDay, "short") ? "today" : null}>
                                            <p>{getWeekday(getNewDate(6), "short")}</p>
                                            <p>{getDayOfMonth(getNewDate(6), "short")}</p>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className="buttonContainer">
                                <button className="addHabitBtn" onClick={() => {setIsModalOn(true)}}>
                                    <i className="fa-solid fa-plus" aria-hidden="true"></i>Add Habit
                                </button>
                                {shownDashboardCount === 0 ?
                                <div className="dashboardButtons">
                                    <button disabled>
                                        <span className="sr-only">Show previous dashboard habits</span>
                                        <i className="fa-solid fa-circle-arrow-up arrowIcon disabledArrow" aria-hidden="true"></i>
                                    </button>
                                    <button onClick={() => {changeDashboardTask(shownDashboardCount + 1, setShownDashboardCount)}}>
                                        <span className="sr-only">Show next dashboard habits</span>
                                        <i className={habitsList.length <= 5 ? "fa-solid fa-circle-arrow-down arrowIcon disabledArrow" : "fa-solid fa-circle-arrow-down arrowIcon"} aria-hidden="true"></i>
                                    </button> 
                                </div> : 
                                <div className="dashboardButtons">
                                    <button onClick={() => {changeDashboardTask(shownDashboardCount - 1, setShownDashboardCount)}}>
                                        <span className="sr-only">Show previous dashboard habits</span>
                                        <i className="fa-solid fa-circle-arrow-up arrowIcon" aria-hidden="true"></i>
                                    </button>
                                    <button onClick={() => {changeDashboardTask(shownDashboardCount + 1, setShownDashboardCount)}} disabled={shownDashboardHabits.length + shownDashboardCount === habitsList.length ? true : false}>
                                        <span className="sr-only">Show next dashboard habits</span>
                                        <i className={shownDashboardHabits.length + shownDashboardCount === habitsList.length ? "fa-solid fa-circle-arrow-down arrowIcon disabledArrow" : "fa-solid fa-circle-arrow-down arrowIcon"} aria-hidden="true"></i>
                                    </button>
                                </div>}
                            </div>
                            {isLoading ?
                            <div className="loadingContainer">
                                <div className="lds-ring"><div></div></div>
                            </div> :
                            <div className="habitCalendarBreakdown">
                                {isEditLoading ?
                                <div className="loadingContainer">
                                    <div className="lds-ring"><div></div></div>
                                </div>
                                : null}
                                {habitsList.length ? 
                                <table className="tableHeaders">
                                    <tbody>
                                        <tr>
                                            <th>Mon</th>
                                            <th>Tue</th>
                                            <th>Wed</th>
                                            <th>Thur</th>
                                            <th>Fri</th>
                                            <th>Sat</th>
                                            <th>Sun</th>
                                        </tr>
                                    </tbody>
                                </table> : 
                                <div className="habitListError">
                                    <p>Nothing here yet. Click "Add Habit" to start!</p>
                                </div>}
                                {shownDashboardHabits.map( (specificHabit) => {
                                    return(
                                        <div className="taskCompletionTable" key={uuid()}>
                                            <div className="rowIdentifiers">
                                                <i className="fa-solid fa-circle" aria-hidden="true" style={{color: `${specificHabit.habit.habitColor}`}}></i>
                                                <p>{specificHabit.habit.name.length > 8 ? trimHabitLength(specificHabit.habit.name) : specificHabit.habit.name}</p>
                                            </div>
                                            <table className="fillInTable">
                                                <tbody>
                                                    <tr>
                                                        <td style={specificHabit.completion.monday ? {backgroundColor: `${specificHabit.habit.habitColor}`} : null}></td>
                                                        <td style={specificHabit.completion.tuesday ? {backgroundColor: `${specificHabit.habit.habitColor}`} : null}></td>
                                                        <td style={specificHabit.completion.wednesday ? {backgroundColor: `${specificHabit.habit.habitColor}`} : null}></td>
                                                        <td style={specificHabit.completion.thursday ? {backgroundColor: `${specificHabit.habit.habitColor}`} : null}></td>
                                                        <td style={specificHabit.completion.friday ? {backgroundColor: `${specificHabit.habit.habitColor}`} : null}></td>
                                                        <td style={specificHabit.completion.saturday ? {backgroundColor: `${specificHabit.habit.habitColor}`} : null}></td>
                                                        <td style={specificHabit.completion.sunday ? {backgroundColor: `${specificHabit.habit.habitColor}`} : null}></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    )
                                })}
                            </div>
                            }
                        </div>
                        <div className="habitContentTwo">
                            <div className="dailyDetails">
                                <div className="dailyDateContainer">
                                    <h2>{format(selectedDay, 'E, LLL d')}</h2>
                                    <div>
                                        <button onClick={handlePrevDayBtn}>
                                            <i className="fa-solid fa-arrow-left" aria-hidden="true"></i>
                                        </button>
                                        <button onClick={handleNextDayBtn}>
                                            <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                                        </button>
                                    </div>
                                </div>
                                <div className="dailyCompletionBar">
                                    <div className="completionFill" style={{width: `${checkDailyProgress()}%`}}></div>
                                </div>
                                <p>{checkDailyProgress()}% of daily goal achieved</p>
                            </div>
                            <div className="habitListContainer">
                                {shownHabitsCounter !== 0 ?
                                <div className="showMoreContainer">
                                    <button onClick={() => {setShownHabitsCounter(shownHabitsCounter - 1)}}>
                                        <span className="sr-only">Show previous habits</span>
                                        <i className="fa-solid fa-circle-arrow-up" aria-hidden="true"></i>
                                    </button> 
                                </div> : 
                                <div className="showMoreContainer"></div>}
                                {isEditLoading ?
                                <div className="overlayLoading">
                                    <div className="lds-ring"><div></div></div>
                                </div>
                                : null}
                                {shownHabits.map( (habitDetails) => {
                                return(
                                    <div className="habitContainer" style={{borderLeft:`4px solid ${habitDetails.habit.habitColor}`}} key={uuid()}>
                                        <div className="habitDetails">
                                            <p>{habitDetails.habit.name.length > 8 ? trimHabitLength(habitDetails.habit.name) : habitDetails.habit.name}</p>
                                            <button onClick={handleHabitDropdown}>
                                                <i className="fa-solid fa-ellipsis-vertical" aria-hidden="true"></i>
                                            </button>
                                        </div>
                                        {!habitDetails.completion[getWeekday(selectedDay, "long")] ? 
                                        <>
                                            <div className="completionIndicator">
                                                <ul>
                                                    {habitDetails.dailyCompletion[getWeekday(selectedDay, "long")].map( (completionBoolean) => {
                                                        return <li className="completionBox" key={uuid()} style={completionBoolean ? {backgroundColor: `${habitDetails.habit.habitColor}`} : null}></li>
                                                    })}
                                                </ul>
                                            </div>
                                            <button className="markAsCompleteBtn" onClick={() => {handleMarkComplete(habitDetails.id, true, habitDetails)}}>Mark Complete</button>
                                        </>: 
                                        <div className="completedDiv">
                                            <p><i className="fa-solid fa-check" aria-hidden="true"></i>Completed</p>
                                            <button onClick={() => {handleUndoCompletion(habitDetails.id, habitDetails)}}>Undo</button>    
                                        </div>}
                                        <div className="dropdownOptions hidden">
                                            <ul>
                                                <li>
                                                    <button>Edit Habit</button>
                                                </li>
                                                <li>
                                                    <button onClick={() => {handleDeleteHabit(habitDetails.id, habitDetails)}}>Delete Habit</button>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )})}
                                {habitsList.length > 4 && habitsList.length - shownHabitsCounter !== 4 ?
                                <div className="showMoreContainer">
                                    <button onClick={() => {setShownHabitsCounter(shownHabitsCounter + 1)}}>
                                        <span className="sr-only">Show more habits</span>
                                        <i className="fa-solid fa-circle-arrow-down" aria-hidden="true"></i>
                                    </button> 
                                </div> :
                                <div className="showMoreContainer"></div>}
                            </div>
                        </div>
                    </div>
                </div>
                {isModalOn ?
                <>
                    <div className="createHabitModal">
                        <button onClick={() => {setIsModalOn(false)}} className="exitHabitModalBtn">
                            <div className="sr-only">Close Modal</div>
                            <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                        </button>
                        <form aria-label="form" name="createHabitForm" onSubmit={(e) => {handleFormSubmit(e)}}>
                            <fieldset>
                                <legend>
                                    <h2>Create a Habit</h2>
                                </legend>

                                <div className="inputContainer">
                                    <label htmlFor="habitName">Habit Name:</label>
                                    <input type="text" id="habitName" onChange={(e) => {setHabitName(e.target.value)}} required/>
                                </div>

                                <div className="inputContainer">
                                    <label htmlFor="habitAmount">How many times per day?</label>
                                    <input type="number" id="habitAmount" onChange={(e) => {setHabitRepeats(e.target.value)}} required min="1" max="8"/>
                                </div>

                            </fieldset>
                            <fieldset className="labelColourContainer">
                                <legend>Select label colour</legend>

                                <label htmlFor="purpleLabel" className="sr-only">Purple</label>
                                <input type="radio" id="purpleLabel" name="labelColour" value='#E5D9F7' className="purpleLabel" onChange={(e) => {setHabitColor(e.target.value)}}/>

                                <label htmlFor="pinkLabel" className="sr-only">Pink</label>
                                <input type="radio" id="pinkLabel" name="labelColour" value='#FBD3DF' className="pinkLabel" onChange={(e) => {setHabitColor(e.target.value)}}/>
                                
                                <label htmlFor="blueLabel" className="sr-only">Blue</label>
                                <input type="radio" id="blueLabel" name="labelColour" value='#A8ADFF' className="blueLabel" onChange={(e) => {setHabitColor(e.target.value)}}/>

                                <label htmlFor="greenLabel" className="sr-only">Green</label>
                                <input type="radio" id="greenLabel" name="labelColour" value='#D8F2D3' className="greenLabel" onChange={(e) => {setHabitColor(e.target.value)}}/>

                                <label htmlFor="orangeLabel" className="sr-only">Orange</label>
                                <input type="radio" id="orangeLabel" name="labelColour" value='#FBE7CD' className="orangeLabel" onChange={(e) => {setHabitColor(e.target.value)}}/>

                                <label htmlFor="redLabel" className="sr-only">Red</label>
                                <input type="radio" id="redLabel" name="labelColour" value='#fbc0c0' className="redLabel" onChange={(e) => {setHabitColor(e.target.value)}}/>

                                <label htmlFor="yellowLabel" className="sr-only">Yellow</label>
                                <input type="radio" id="yellowLabel" name="labelColour" value='#f8f3ad' className="yellowLabel" onChange={(e) => {setHabitColor(e.target.value)}}/>
                            </fieldset>

                            <div className="btnContainer">
                                <div className="cancelBtn" onClick={() => {setIsModalOn(false)}} aria-label="Leave Modal">Cancel</div>
                                <button type="submit" ref={submitBtn}>Create</button>
                            </div>
                        </form>
                    </div>
                    <div className="overlayBackground" onClick={() => {setIsModalOn(false)}}></div>
                </>
                : null}
            </div>
        )
    }

    return <Navigate to="/login" replace/>
}

export default HabitTracker;