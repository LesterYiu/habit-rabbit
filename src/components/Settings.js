import { AppContext } from "../Contexts/AppContext";
import { useContext } from "react";

// Component Imports
import HomeNavigation from "./HomeNavigation";
import NewTask from "./NewTask";

const Settings = () => {

    const {setIsAuth, username, setUsername, setUserUID, userUID, userPic, isNewTaskClicked, setTaskList} = useContext(AppContext);

    return(
        <div className="settingsPage">
            {isNewTaskClicked ? 
            <>
                <NewTask setTaskList={setTaskList}/>
                <div className="overlayBackground"></div>
            </>
            : null}
            <HomeNavigation userUID={userUID} username={username} userPic={userPic} setUsername={setUsername} setUserUID={setUserUID} setIsAuth={setIsAuth}/>
        </div>
    )
}

export default Settings;