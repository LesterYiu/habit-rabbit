import { useContext } from "react";
import { AppContext } from "../Contexts/AppContext";
import FocusLock from 'react-focus-lock';
import { useNavigate } from "react-router-dom";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

const SignOutModal = () => {

    const {setIsSignOutModalOn, setIsAuth, setUsername, setUserUID, setIsNavExpanded} = useContext(AppContext);

    const navigate = useNavigate();

    const signUserOut = () => {
        signOut(auth).then( () => {
            setIsAuth(false);
            setUsername('');
            setUserUID('notSignedIn');
            localStorage.clear();
        })
        setIsSignOutModalOn(false);
        setIsNavExpanded(false);
        navigate('/login')
    }

    return(
        <FocusLock>
            <div className="signOutModal">
                <div className="iconContainer">
                    <i className="fa-solid fa-door-open"></i>
                    <div className="errorBackground"></div>
                </div>
                <div className="modalText">
                    <p>Oh no! You're leaving...</p>
                    <p>Are you sure?</p>
                </div>
                <div className="buttonList">
                    <button onClick={() => {setIsSignOutModalOn(false)}}>Stay on page</button>
                    <button onClick={signUserOut}>Yes, Log Me Out</button>
                </div>
            </div>
        </FocusLock>
    )
}

export default SignOutModal;