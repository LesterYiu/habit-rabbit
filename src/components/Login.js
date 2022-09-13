import { auth, provider } from "./firebase";
import { signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Login = ({setIsAuth}) => {

    const navigate = useNavigate();

    const signInWithGoogle = () => {
        signInWithPopup(auth, provider).then( (result) => {
            localStorage.setItem("isAuth", true);
            setIsAuth(true);
            navigate('/');
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