import { AppContext } from "../Contexts/AppContext";
import { useContext, useState, useEffect } from "react";
import { disableScrollForModalOn } from "../utils/globalFunctions";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { Navigate } from "react-router-dom";
import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from "firebase/firestore";
import uuid from "react-uuid";
import { format } from "date-fns";

// Component Imports
import HomeNavigation from "./HomeNavigation";
import NewTask from "./NewTask";
import SignOutModal from "./SignOutModal";

const HabitTracker = () => {

    // Track days for the calendar
    const [dayOne, setDayOne] = useState(getFirstDayOfWeek());
    const [dayTwo, setDayTwo] = useState(getNewDate(1));
    const [dayThree, setDayThree] = useState(getNewDate(2));
    const [dayFour, setDayFour] = useState(getNewDate(3));
    const [dayFive, setDayFive] = useState(getNewDate(4));
    const [daySix, setDaySix] = useState(getNewDate(5));
    const [daySeven, setDaySeven] = useState(getNewDate(6));

    // Form fields
    const [habitName, setHabitName] = useState("");
    const [habitRepeats, setHabitRepeats] = useState("");
    const [habitDays, setHabitDays] = useState([]);
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

        if(isNewTaskClicked && document.body.style.overflow === 'hidden') return;

        disableScrollForModalOn(isNavExpanded);
    },[isNavExpanded]);

    useEffect( () => {
        setIsLoading(true);
        getNewData();
    }, [userUID]);

    useEffect( () => {
        setShownHabits(habitsList.slice(shownHabitsCounter , 4 + shownHabitsCounter));
    }, [habitsList, shownHabitsCounter])

    function getNewDate(daysFromToday){
        const firstDayOfWeek = getFirstDayOfWeek();
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() + daysFromToday);
        return firstDayOfWeek;
    }

    const getWeekday = (date, weekdayFormat) => {
        if(weekdayFormat === "short") {
            const weekday = ["SUN","MON","TUE","WED","THUR","FRI","SAT"];
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
        const completionRepeats = [];

        for(let i = 0; i < habitRepeats; i++) {
            completionRepeats.push(false);
        }

        const doc =
            {user: 
                {username, 
                id: auth.currentUser.uid},
            habit: 
                {name: habitName,
                habitRepeats, 
                habitDays, 
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
            dailyCompletion: completionRepeats}

        const documentRef = await addDoc(collectionRef, doc)
        const documentID = documentRef.id;

        await updateDoc(documentRef, {
            id: documentID
        })
        
        setIsModalOn(false);
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
        const dailyCompletionArr = habitDetails.dailyCompletion;

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
                [`dailyCompletion`] : dailyCompletionArr
            })
            getNewData();
        } else if (!dailyCompletionArr.includes(false)) {
            setIsEditLoading(true);
            const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/habits/`, habitID);
            const weekDay = (format(new Date(), 'iiii')).toLowerCase();
            await updateDoc(documentRef, {
                [`completion.${weekDay}`] : boolean,
                [`dailyCompletion`] : dailyCompletionArr
            })
            getNewData();
        }
    }

    const handleUndoCompletion = async(habitID, habitDetails) => {
        setIsEditLoading(true);
        const documentRef = doc(db, `/users/user-list/${userUID}/${userUID}/habits/`, habitID);
        const dailyCompletionArr = habitDetails.dailyCompletion;
        for(let i in dailyCompletionArr) {
            if(dailyCompletionArr[i]) {
                dailyCompletionArr[i] = false;
            }
        }
        const weekDay = (format(new Date(), 'iiii')).toLowerCase();
        await updateDoc(documentRef, {
            [`completion.${weekDay}`] : false,
            [`dailyCompletion`] : dailyCompletionArr
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
            finishedDays += completionArr.filter(x => x==valueToCount).length;
        }

        const completion = Math.round((finishedDays/denom) * 100);

        if(!completion) return 0;

        return completion;
    }

    const checkDailyProgress = () => {
        const totalHabits = habitsList.length;
        return checkProgress(totalHabits, habitsList, true);
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
                {containerChildNodes.length === 4 ? index.className = "dropdownOptionsTwo" : index.className = classNameOn}
            } 
        }
    }

    const trimHabitLength = (string) => {
        let str = string.slice(0,8);
        str+= "...";
        return str;
    }

    /*
    
    - shownHabits is always equal to 4 habits shown

    - shownHabitsCounter will add by one when down arrow is clicked, and minus by one when up arrow is clicked.

    - if we're at the end of the habitlist arrow, remove down arrow

    - if we're one away from being at the beginning of the habitslist array,make sure only 4 are present

    - if list - shownHabitsCounter === 4, disappear
    */


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
                                    <h2>{`${getDayOfMonth(dayOne)} - ${getDayOfMonth(daySeven)} ${getMonth(daySeven)} ${daySeven.getFullYear()}`}</h2>
                                    <div className="weekCompletionBar">
                                        <div className="completionFill" style={{width: `${checkWeeklyProgress()}%`}}></div>
                                    </div>
                                    <p>{checkWeeklyProgress()}% of weekly goal achieved</p>
                                </div>
                                <ul>
                                    <li>
                                        <button className={getWeekday(dayOne, "short") === getWeekday(new Date(), "short") ? "today" : null}>
                                            <p>{getWeekday(dayOne, "short")}</p>
                                            <p>{getDayOfMonth(dayOne, "short")}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(dayTwo, "short") === getWeekday(new Date(), "short") ? "today" : null}>
                                            <p>{getWeekday(dayTwo, "short")}</p>
                                            <p>{getDayOfMonth(dayTwo, "short")}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(dayThree, "short") === getWeekday(new Date(), "short") ? "today" : null}>
                                            <p>{getWeekday(dayThree, "short")}</p>
                                            <p>{getDayOfMonth(dayThree, "short")}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(dayFour, "short") === getWeekday(new Date(), "short") ? "today" : null}>
                                            <p>{getWeekday(dayFour, "short")}</p>
                                            <p>{getDayOfMonth(dayFour, "short")}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(dayFive, "short") === getWeekday(new Date(), "short") ? "today" : null}>
                                            <p>{getWeekday(dayFive, "short")}</p>
                                            <p>{getDayOfMonth(dayFive, "short")}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(daySix, "short") === getWeekday(new Date(), "short") ? "today" : null}>
                                            <p>{getWeekday(daySix, "short")}</p>
                                            <p>{getDayOfMonth(daySix, "short")}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(daySeven, "short") === getWeekday(new Date(), "short") ? "today" : null}>
                                            <p>{getWeekday(daySeven, "short")}</p>
                                            <p>{getDayOfMonth(daySeven, "short")}</p>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className="buttonContainer">
                                <button className="addHabitBtn" onClick={() => {setIsModalOn(true)}}>
                                    <i className="fa-solid fa-plus" aria-hidden="true"></i>Add Habit
                                </button>
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
                                {habitsList.map( (specificHabit) => {
                                    return(
                                        <div className="taskCompletionTable" key={uuid()}>
                                            <div className="rowIdentifiers">
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
                                <h2>{format(new Date(), 'E, LLL d')}</h2>
                                <div className="dailyCompletionBar">
                                    <div className="completionFill" style={{width: `${checkDailyProgress()}%`}}></div>
                                </div>
                                <p>{checkDailyProgress()}% of daily goal achieved</p>
                            </div>
                            <div className="habitListContainer">
                                {shownHabitsCounter != 0 ?
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
                                        {!habitDetails.completion[getWeekday(new Date(), "long")] ? 
                                        <>
                                            <div className="completionIndicator">
                                                <ul>
                                                    {habitDetails.dailyCompletion.map( (completionBoolean) => {
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

                                <div className="inputContainer">
                                    <label htmlFor="habitDays">Which days does your habit apply to?</label>
                                    <select name="habitDays" id="habitDays" onChange={(e) => {setHabitDays(e.target.value)}} required>
                                        <option value disabled selected>Please choose an option</option>
                                        <option value="monday">Monday</option>
                                        <option value="tuesday">Tuesday</option>
                                        <option value="wednesday">Wednesday</option>
                                        <option value="thursday">Thursday</option>
                                        <option value="friday">Friday</option>
                                        <option value="saturday">Saturday</option>
                                        <option value="sunday">Sunday</option>
                                    </select>
                                </div>
                                
                                {/* <div className="inputContainer">
                                    <label htmlFor="habitColour">Select label colour</label>
                                    <select name="habitColour" id="habitColour" onChange={(e) => {setHabitColor(e.target.value)}} required>
                                        <option value disabled selected>Please choose an option</option>
                                        <option value="red">Red</option>
                                    </select>
                                </div> */}
                            </fieldset>
                            <fieldset>
                                <legend>Select label colour</legend>

                                <label htmlFor="purpleLabel">Purple</label>
                                <input type="radio" id="purpleLabel" name="labelColour" value='#E5D9F7' onChange={(e) => {setHabitColor(e.target.value)}}/>

                                <label htmlFor="pinkLabel">Pink</label>
                                <input type="radio" id="pinkLabel" name="labelColour" value='#FBD3DF' onChange={(e) => {setHabitColor(e.target.value)}}/>
                                
                                <label htmlFor="blueLabel">Blue</label>
                                <input type="radio" id="blueLabel" name="labelColour" value='#A8ADFF' onChange={(e) => {setHabitColor(e.target.value)}}/>

                                <label htmlFor="greenLabel">Green</label>
                                <input type="radio" id="greenLabel" name="labelColour" value='#D8F2D3' onChange={(e) => {setHabitColor(e.target.value)}}/>
                            </fieldset>

                            <button type="submit">Create</button>
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