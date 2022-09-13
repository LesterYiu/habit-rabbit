import '../styles/App.scss';
import { Routes, Route} from "react-router-dom";
import { useState } from 'react';
import Home from './Home';
import CreateAccount from './CreateAccount';
import Login from './Login';
import FrontPage from './FrontPage';

function App() {
  const [isAuth, setIsAuth] = useState(false);

  return (
    <Routes>
      <Route path='/' element={<FrontPage />}/>
      <Route path='/home' element={<Home setIsAuth={setIsAuth} isAuth={isAuth}/>}/>
      <Route path='/login' element={<Login setIsAuth={setIsAuth}/>}/>
      <Route path='/create-account' element={<CreateAccount />}/>
    </Routes>
  )
}

export default App;
