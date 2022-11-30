import '../styles/App.css';
import { Routes, Route} from "react-router-dom";
import { useState } from 'react';
import { Calendar } from 'react-calendar';
import { AppContext } from '../Contexts/AppContext';
import Statistics from './Statistics';
import Home from './Home';
import CreateAccount from './CreateAccount';
import Login from './Login';
import FrontPage from './FrontPage';
import Settings from './Settings';
import NewTask from './NewTask';
import TaskDetails from './TaskDetails';

function App() {

  const [isAuth, setIsAuth] = useState("true");
  const [username, setUsername] = useState("");
  const [userUID, setUserUID] = useState("notSignedIn");
  const [userPic, setUserPic] = useState("");

  return (
    <AppContext.Provider value={{isAuth, setIsAuth, username, setUsername, userUID, setUserUID, userPic, setUserPic}}>
      <Routes>
        <Route path='/' element={<FrontPage />}/>

        <Route path='/home' element={<Home />}/>

        <Route path='/login' element={<Login />}/>

        <Route path='/create-account' element={<CreateAccount />}/>

        <Route path='/calendar' element={<Calendar/>} />

        <Route path='/statistics' element={<Statistics/>} />

        <Route path='/settings' element={<Settings/>} />

        <Route path='/new-task' element={<NewTask />} />

        <Route path='/task/:taskID' element={<TaskDetails />} />
      </Routes>
    </AppContext.Provider>
  )
}

export default App;
