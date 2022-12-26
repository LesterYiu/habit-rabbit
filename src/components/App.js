import '../styles/App.css';

import { Routes, Route} from "react-router-dom";
import { useState } from 'react';
import { AppContext } from '../Contexts/AppContext';

// Component Imports
import HabitTracker from './HabitTracker';
import Home from './Home';
import CreateAccount from './CreateAccount';
import Login from './Login';
import FrontPage from './FrontPage';
import Settings from './Settings';
import NewTask from './NewTask';
import TaskDetails from './TaskDetails';
import CalendarSection from './Calendar';
import NotFound from './NotFound';

function App() {

  const [isAuth, setIsAuth] = useState(localStorage.isAuth === "true");
  const [username, setUsername] = useState("");
  const [userUID, setUserUID] = useState("notSignedIn");
  const [userPic, setUserPic] = useState("https://firebasestorage.googleapis.com/v0/b/habit-rabbit-7f5c9.appspot.com/o/default%2FdefaultProfilePicture.png?alt=media&token=09a5a638-8734-4b3a-9e25-18f26425f871");

  // For Navigation + Creating new tasks
  const [isNewTaskClicked, setIsNewTaskClicked] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [doneTaskList, setDoneTaskList] = useState([]);
  const [isTaskExpanded, setIsTaskExpanded] = useState(false);

  // Home Navigation "ongoing tasks" & "finished tasks" toggles
  const [isToDoBtnClicked, setIsToDoBtnClicked] = useState(true);
  const [isDoneBtnClicked, setIsDoneBtnClicked] = useState(false);

  // Nav Expanded
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  // Filter & Modal filter selected
  const [isLateSelected, setIsLateSelected] = useState(false);
  const [isPrioritySelected, setIsPrioritySelected] = useState(false)
  const [filteredAndSearchedTask, setFilteredAndSearchedTask] = useState([]);

  // Signout Modals
    const [isSignOutModalOn, setIsSignOutModalOn] = useState(false);

  return (
    <AppContext.Provider value={{isAuth, setIsAuth, username, setUsername, userUID, setUserUID, userPic, setUserPic, isNewTaskClicked, setIsNewTaskClicked, setTaskList, taskList, setIsTaskExpanded, isTaskExpanded, doneTaskList, setDoneTaskList, isNavExpanded, setIsNavExpanded, isLateSelected, setIsLateSelected, isPrioritySelected, setIsPrioritySelected, setFilteredAndSearchedTask, filteredAndSearchedTask, isSignOutModalOn, setIsSignOutModalOn, isToDoBtnClicked, setIsToDoBtnClicked, isDoneBtnClicked, setIsDoneBtnClicked}}>
      <Routes>
        <Route path='/' element={<FrontPage />}/>

        <Route path='*' element={<NotFound />}/>

        <Route path='/home' element={<Home />}/>

        <Route path='/login' element={<Login />}/>

        <Route path='/create-account' element={<CreateAccount />}/>

        <Route path='/calendar' element={<CalendarSection />} />

        <Route path='/habit-tracker' element={<HabitTracker/>} />

        <Route path='/settings' element={<Settings/>} />

        <Route path='/new-task' element={<NewTask />} />

        <Route path='/task/:taskID' element={<TaskDetails />} />
      </Routes>
    </AppContext.Provider>
  )
}

export default App;
