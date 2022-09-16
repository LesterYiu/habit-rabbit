import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Login = ({setIsAuth, setUsername, setUserUID, setUserPic, isAuth}) => {

    const navigate = useNavigate();

    const signInWithGoogle = () => {
        signInWithPopup(auth, provider).then( (result) => {

            setIsAuth(!auth.currentUser.isAnonymous);
            localStorage.setItem("isAuth", !auth.currentUser.isAnonymous)

            setUsername(result.user.displayName);
            setUserUID(auth.currentUser.uid);
            setUserPic(auth.currentUser.photoURL);
            navigate('/home');
        })
    }

    if(!isAuth) {
        return(
            <div className="wrapper">
                <div className="loginPage">
                    <p>Sign In With Google to Continue</p>
                    <button className="login-with-google-btn" onClick={signInWithGoogle}> Sign in with Google </button>
                </div>
                <Link to="/create-account">Create an Account</Link>
            </div>
        )
    } 

    return <Navigate to="/home" replace />
}

export default Login;