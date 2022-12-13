import '../styles/App.css';

import { Routes, Route} from "react-router-dom";
import { useState } from 'react';
import { AppContext } from '../Contexts/AppContext';

// Component Imports
import Statistics from './Statistics';
import Home from './Home';
import CreateAccount from './CreateAccount';
import Login from './Login';
import FrontPage from './FrontPage';
import Settings from './Settings';
import NewTask from './NewTask';
import TaskDetails from './TaskDetails';
import CalendarSection from './Calendar';

function App() {

  const [isAuth, setIsAuth] = useState(localStorage.isAuth === "true");
  const [username, setUsername] = useState("");
  const [userUID, setUserUID] = useState("notSignedIn");
  const [userPic, setUserPic] = useState("");

  // For Navigation + Creating new tasks
  const [isNewTaskClicked, setIsNewTaskClicked] = useState(false);
  const [taskList, setTaskList] = useState([]);
  const [isTaskExpanded, setIsTaskExpanded] = useState(false);

  return (
    <AppContext.Provider value={{isAuth, setIsAuth, username, setUsername, userUID, setUserUID, userPic, setUserPic, isNewTaskClicked, setIsNewTaskClicked, setTaskList, taskList, setIsTaskExpanded, isTaskExpanded}}>
      <Routes>
        <Route path='/' element={<FrontPage />}/>

        <Route path='/home' element={<Home />}/>

        <Route path='/login' element={<Login />}/>

        <Route path='/create-account' element={<CreateAccount />}/>

        <Route path='/calendar' element={<CalendarSection />} />

        <Route path='/statistics' element={<Statistics/>} />

        <Route path='/settings' element={<Settings/>} />

        <Route path='/new-task' element={<NewTask />} />

        <Route path='/task/:taskID' element={<TaskDetails />} />
      </Routes>
    </AppContext.Provider>
  )
}

export default App;
