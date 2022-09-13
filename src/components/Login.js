import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = ({setIsAuth, setUsername, setUserUID}) => {

    const navigate = useNavigate();

    const signInWithGoogle = () => {
        signInWithPopup(auth, provider).then( (result) => {

            // Sets the values locally to allow users to stay logged in 
            localStorage.setItem("isAuth", true);
            setIsAuth(true);

            localStorage.setItem("displayName", result.user.displayName)
            setUsername(result.user.displayName);

            localStorage.setItem("userUID", auth.currentUser.uid);
            setUserUID(auth.currentUser.uid);

            navigate('/home');
        })
    }
    return(
        <div className="wrapper">
            <div className="loginPage">
                <p>Sign In With Google to Continue</p>
                <button className="login-with-google-btn" onClick={signInWithGoogle}> Sign in with Google </button>
            </div>
        </div>
    )
}

export default Login;