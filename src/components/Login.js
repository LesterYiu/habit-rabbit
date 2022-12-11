import { auth, provider } from "./firebase";
import { getAuth, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../Contexts/AppContext";
import { useState } from "react";
import logo from "../assets/logo.png";

const Login = () => {

    const navigate = useNavigate();
    const {setIsAuth, setUsername, setUserUID, setUserPic, isAuth} = useContext(AppContext)

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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

    const handleSignIn = (e, email, password) => {
        e.preventDefault();
        const auth = getAuth();
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in 
            navigate('/home');
        })
        .catch((error) => {
            const errorMessage = error.message;
            console.log(errorMessage)
        });
    }

    if(!isAuth) {
        return(
            <>
                <nav className="loginNav">
                    <Link to="/"> 
                        <div className="logoSection">
                            <div className="imageContainer">
                                <img src={logo} alt="" />
                            </div>
                            <p>Habit Rabbit</p>
                        </div>
                    </Link>
                </nav>
                <main>
                    <div className="loginPage">
                        <div className="loginSection">
                            <div className="wrapper loginFlex">
                                <h1>Sign In</h1>
                                <button className="googleBtn" onClick={signInWithGoogle}> 
                                    <span className="sr-only">Sign in with Google</span> 
                                    <i className="fa-brands fa-google"></i>
                                </button>
                                <p className="optionText">or use your email to login:</p>
                                <form aria-label="form" name="signIn">
                                    <div className="labelInputContainer">
                                        <label htmlFor="email" className="sr-only">Email</label>
                                        <input type="email" id="email" onChange={(e) => {setEmail(e.target.value)}} placeholder="Email"/>
                                        <i className="fa-regular fa-envelope"></i>
                                    </div>

                                    <div className="labelInputContainer">
                                        <label htmlFor="password" className="sr-only">Password</label>
                                        <input type="password" id="password" onChange={(e) => {setPassword(e.target.value)}} placeholder="Password"/>
                                        <i className="fa-solid fa-lock"></i>
                                    </div>

                                    <button type="submit" onClick={(e) => {handleSignIn(e, email, password)}}>Login</button>
                                </form>
                            </div>
                        </div>
                        <div className="toLoginSection">
                            <div className="wrapper">
                                <h2>Hello Friend!</h2>
                                <p>If you don't already have an account, please create an account with your personal information!</p>
                                <Link to="/create-account" className="redirectToCreateBtn">Create an Account</Link>
                            </div>
                        </div>
                    </div>
                </main>
                <footer className="loginFooter">
                    <div className="wrapper">
                        <ul>
                            <li>
                                <p>©2022 Habit Rabbit Labs, Inc.</p>
                            </li>
                            <li className="creditFooterLink">
                                <p>Made by <a href="https://github.com/LesterYiu" target="_blank" rel="noreferrer">Lester Yiu</a></p>
                            </li>
                        </ul>
                    </div>
                </footer>
            </>
        )
    } 

    return <Navigate to="/home" replace />
}

export default Login;