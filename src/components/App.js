import '../styles/App.css';
import { Routes, Route} from "react-router-dom";
import { useState } from 'react';
import { Calendar } from 'react-calendar';
import Statistics from './Statistics';
import Home from './Home';
import CreateAccount from './CreateAccount';
import Login from './Login';
import FrontPage from './FrontPage';
import Settings from './Settings';
import NewTask from './NewTask';

function App() {

  const [isAuth, setIsAuth] = useState(localStorage.isAuth === "true");
  const [username, setUsername] = useState("");
  const [userUID, setUserUID] = useState("notSignedIn");
  const [userPic, setUserPic] = useState("");

  return (
    <Routes>
      <Route path='/' element={<FrontPage isAuth={isAuth}/>}/>

      <Route path='/home' element={<Home setIsAuth={setIsAuth} isAuth={isAuth} username={username} setUsername={setUsername} setUserUID={setUserUID} userUID={userUID} userPic={userPic} setUserPic={setUserPic}/>}/>

      <Route path='/login' element={<Login setIsAuth={setIsAuth} isAuth={isAuth} setUsername={setUsername} setUserUID={setUserUID} setUserPic={setUserPic} />}/>

      <Route path='/create-account' element={<CreateAccount setIsAuth={setIsAuth} setUsername={setUsername} setUserUID={setUserUID} userUID={userUID} setUserPic={setUserPic}/>}/>

      <Route path='/calendar' element={<Calendar/>} />

      <Route path='/statistics' element={<Statistics/>} />

      <Route path='/settings' element={<Settings/>} />

      <Route path='/new-task' element={<NewTask />} />
    </Routes>
  )
}

export default App;
