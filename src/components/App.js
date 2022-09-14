import '../styles/App.scss';
import { Routes, Route} from "react-router-dom";
import { useState } from 'react';
import Home from './Home';
import CreateAccount from './CreateAccount';
import Login from './Login';
import FrontPage from './FrontPage';

function App() {

  // Converts the string "true" to the boolean of true
  const [isAuth, setIsAuth] = useState(localStorage.isAuth === "true");
  const [username, setUsername] = useState(localStorage.displayName);
  const [userUID, setUserUID] = useState("notSignedIn");

  return (
    <Routes>
      <Route path='/' element={<FrontPage />}/>
      <Route path='/home' element={<Home setIsAuth={setIsAuth} isAuth={isAuth} username={username} setUsername={setUsername} setUserUID={setUserUID} userUID={userUID}/>}/>
      <Route path='/login' element={<Login setIsAuth={setIsAuth} setUsername={setUsername} setUserUID={setUserUID}/>}/>
      <Route path='/create-account' element={<CreateAccount />}/>
    </Routes>
  )
}

export default App;
