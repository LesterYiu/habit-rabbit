import { useState, useEffect, useContext } from "react";
import { AppContext } from "../Contexts/AppContext";

import Calendar from "react-calendar";
import HomeNavigation from "./HomeNavigation";
import NewTask from "./NewTask";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

const CalendarSection = () => {

    const [currentDate, setCurrentDate] = useState(new Date());

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
        getPost();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userUID])

    const getPost = async () => {
        const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);
        const data = await getDocs(collectionRef);
        setTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
    }

    console.log(taskList)
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
                <Calendar onChange={setCurrentDate} value={currentDate} onClickDay={(value) => {console.log(value)}}/>
            </div>
        </div>
    )
}

export default CalendarSection;