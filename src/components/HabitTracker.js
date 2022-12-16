import { AppContext } from "../Contexts/AppContext";
import { useContext } from "react";
import { useEffect } from "react";
import { disableScrollForModalOn } from "../utils/globalFunctions";

import HomeNavigation from "./HomeNavigation";
import NewTask from "./NewTask";
import SignOutModal from "./SignOutModal";

const HabitTracker = () => {

    const {setIsAuth, username, setUsername, setUserUID, userUID, userPic, isNewTaskClicked, isSignOutModalOn, isNavExpanded} = useContext(AppContext);

    useEffect( () => {

        if(isNewTaskClicked && document.body.style.overflow === 'hidden') return;

        disableScrollForModalOn(isNavExpanded);
    },[isNavExpanded])

    return(
        <div className="habitPage">
            {isNewTaskClicked ? 
                <>
                    <NewTask />
                    <div className="overlayBackground overlayBackgroundTwo"></div>
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
                <h1>My Habits</h1>
            </div>
        </div>
    )
}

export default HabitTracker;