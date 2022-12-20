import { AppContext } from "../Contexts/AppContext";
import { useContext, useState } from "react";
import { useEffect } from "react";
import { disableScrollForModalOn } from "../utils/globalFunctions";

import HomeNavigation from "./HomeNavigation";
import NewTask from "./NewTask";
import SignOutModal from "./SignOutModal";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { Navigate } from "react-router-dom";
import { addDoc, collection, deleteDoc, getDocs } from "firebase/firestore";
import uuid from "react-uuid";
import { format } from "date-fns";

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
    
    // Full List of Data
    const [habitsList, setHabitsList] = useState([]);

    const {setIsAuth, isAuth, username, setUsername, setUserUID, userUID, userPic, isNewTaskClicked, isSignOutModalOn, isNavExpanded, setUserPic, setIsNewTaskClicked} = useContext(AppContext);

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
        getNewData();
    }, [userUID])

    function getNewDate(daysFromToday){
        const firstDayOfWeek = getFirstDayOfWeek();
        firstDayOfWeek.setDate(firstDayOfWeek.getDate() + daysFromToday);
        return firstDayOfWeek;
    }

    const getWeekday = (date) => {
        const weekday = ["SUN","MON","TUE","WED","THUR","FRI","SAT"];
        return weekday[date.getDay()];
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
        await addDoc(collectionRef, 
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
                sunday: false}})

        setIsModalOn(false);
        getNewData();
    }

    const getNewData = async () => {
        const data = await getDocs(collectionRef);
        setHabitsList(data.docs.map((doc) => ({...doc.data(), id: doc.id})))
    }

    function getFirstDayOfWeek () {
        const date = new Date();
        const day = date.getDay();
        const diff = date.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(date.setDate(diff));
    }

    const handleMarkComplete = async (habitID, habitDetails) => {
    }

    const handleDeleteHabit = async(habitID, habitDetails) => {
        // const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/habits/${habitID}`);
        // await deleteDoc(postDoc);

        // const newHabitList = taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]);
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
                    <div className="overlayBackground signoutOverlay"></div>
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
                                        <div className="completionFill"></div>
                                    </div>
                                    <p>0% achieved</p>
                                </div>
                                <ul>
                                    <li>
                                        <button className={getWeekday(dayOne) === getWeekday(new Date()) ? "today" : null}>
                                            <p>{getWeekday(dayOne)}</p>
                                            <p>{getDayOfMonth(dayOne)}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(dayTwo) === getWeekday(new Date()) ? "today" : null}>
                                            <p>{getWeekday(dayTwo)}</p>
                                            <p>{getDayOfMonth(dayTwo)}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(dayThree) === getWeekday(new Date()) ? "today" : null}>
                                            <p>{getWeekday(dayThree)}</p>
                                            <p>{getDayOfMonth(dayThree)}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(dayFour) === getWeekday(new Date()) ? "today" : null}>
                                            <p>{getWeekday(dayFour)}</p>
                                            <p>{getDayOfMonth(dayFour)}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(dayFive) === getWeekday(new Date()) ? "today" : null}>
                                            <p>{getWeekday(dayFive)}</p>
                                            <p>{getDayOfMonth(dayFive)}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(daySix) === getWeekday(new Date()) ? "today" : null}>
                                            <p>{getWeekday(daySix)}</p>
                                            <p>{getDayOfMonth(daySix)}</p>
                                        </button>
                                    </li>
                                    <li>
                                        <button className={getWeekday(daySeven) === getWeekday(new Date()) ? "today" : null}>
                                            <p>{getWeekday(daySeven)}</p>
                                            <p>{getDayOfMonth(daySeven)}</p>
                                        </button>
                                    </li>
                                </ul>
                            </div>
                            <div className="buttonContainer">
                                <button className="addHabitBtn" onClick={() => {setIsModalOn(true)}}>
                                    <i className="fa-solid fa-plus" aria-hidden="true"></i>Add Habit
                                </button>
                            </div>
                        </div>
                        <div className="habitContentTwo">
                            <div className="dailyDetails">
                                <h2>{format(new Date(), 'E, LLL d')}</h2>
                                <div className="dailyCompletionBar">
                                    <div className="completionFill"></div>
                                </div>
                                <p>0% of daily goal achieved</p>
                            </div>
                            <div className="habitListContainer">
                            {habitsList.map( (habitDetails) => {
                                return(
                                    <div className="habitContainer">
                                        <div className="habitDetails">
                                            <p>{habitDetails.habit.name}</p>
                                            <i className="fa-solid fa-ellipsis-vertical"></i>
                                        </div>
                                        <button>
                                            Mark Complete
                                        </button>
                                    </div>
                                )
                            })}
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
                                    <input type="number" id="habitAmount" onChange={(e) => {setHabitRepeats(e.target.value)}} required/>
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
                                
                                <div className="inputContainer">
                                    <label htmlFor="habitColour">Select label colour</label>
                                    <select name="habitColour" id="habitColour" onChange={(e) => {setHabitColor(e.target.value)}} required>
                                        <option value disabled selected>Please choose an option</option>
                                        <option value="red">Red</option>
                                    </select>
                                </div>

                                <div className="formField">

                                </div>

                                <button type="submit">Create</button>
                            </fieldset>
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