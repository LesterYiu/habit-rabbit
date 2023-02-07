import { useRef, useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";
import { auth, provider } from "./firebase";
import { Navigate, useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { storage } from "./firebase";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { useContext } from "react";
import { AppContext } from "../Contexts/AppContext";
import { Link } from "react-router-dom";

// Image Imports
import logo from "../assets/logo.png";
import profileImage from "../assets/profileImage.png"

const CreateAccount = () => {

    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [imageUpload, setImageUpload] = useState(null);
    const [isCreatedAcc, setIsCreatedAcc] = useState(false);
    const [isEmailExist, setIsEmailExist] = useState(false);
    const [isInvalidSignUp, setIsInvalidSignUp] = useState(false);

    const {setIsAuth, setUsername, setUserUID, userUID, isAuth} = useContext(AppContext)

    const navigate = useNavigate();
    const currentAuth = getAuth();
    const emailEl = useRef(null);

    const emailRegex =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;


    const handleContinueBtn = (e) => {
        e.preventDefault();
        const matchResult = emailRegex.test(emailEl.current.value);
        if(matchResult && registerPassword.length >= 6) {
            setIsCreatedAcc(!isCreatedAcc); 
            setIsInvalidSignUp(false);           
        } else {
            setIsInvalidSignUp(true);
        }
    }

    const registerUser = async (e) => {

        try {
            e.preventDefault();

            const user = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);

            setUserUID(user.user.auth.currentUser.uid);
            
            const imageURL = await uploadPhoto();

            await updateProfile(currentAuth.currentUser, {
                displayName: `${displayName}`, photoURL: `${imageURL}`
            })
            await setUsername(currentAuth.currentUser.displayName);

            setIsAuth(true);
            localStorage.setItem("isAuth", !auth.currentUser.isAnonymous);

            navigate('/home');

        } catch (error) {
            console.log(error.message);
            setIsCreatedAcc(!isCreatedAcc);
            setIsEmailExist(true);
        }        
    }

    const uploadPhoto = async () => {

        if(imageUpload === null) {

            // If no image is selected by the user

            const defaultImage = 'https://firebasestorage.googleapis.com/v0/b/habit-rabbit-7f5c9.appspot.com/o/default%2FdefaultProfilePicture.png?alt=media&token=09a5a638-8734-4b3a-9e25-18f26425f871';
            return defaultImage;
        } else {
            
            // If an image is selected by the user

            const imageRef = ref(storage, `users/profile-pictures/${userUID}/${userUID}`);
            const imageFolderRef = ref(storage, `users/profile-pictures/${userUID}`)
            await uploadBytes(imageRef, imageUpload);
            const imageResponse = await listAll(imageFolderRef);
            const imageURL = await getDownloadURL(imageResponse.items[0]);
            return imageURL;
        }
    }

    const signInWithGoogle = () => {
        signInWithPopup(auth, provider).then( (result) => {

            setIsAuth(!auth.currentUser.isAnonymous);
            localStorage.setItem("isAuth", !auth.currentUser.isAnonymous)
            setUsername(result.user.displayName);
            setUserUID(auth.currentUser.uid);
            navigate('/home');
        })
    }

    if(!isAuth){
        return(
            <div className="createAccountPage">
                <nav>
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
                    <div className="signInSection">
                        <h1>Hello Friend!</h1>
                        <p className="signInText">If you already have an account, please login with your personal information!</p>
                        <Link to="/login" className="signInBtn">Sign In</Link>
                    </div>
                    <div className="createAccountSection">
                        {isCreatedAcc === false ?
                        <div className="wrapper credentialsSection">
                            <h2>Create Account</h2>
                            <div>
                                <button className="googleBtn" onClick={signInWithGoogle}> 
                                    <span className="sr-only">Sign in with Google</span> 
                                    <i className="fa-brands fa-google"></i>
                                </button>
                            </div>
                            <p className="optionText">or use your email for registration:</p>
                            {isEmailExist ? 
                            <p className="errorEmailMessage">A user with this email address already exists. Please login.</p> : null}
                            {isInvalidSignUp ?
                            <div className="wrongCredentialContainer">
                                <p>Invalid Credentials</p>
                                <p>Invalid username or password</p>
                                <ul>
                                    <li>Your email must be a valid email address</li>
                                    <li>Your password must be 6 characters long</li>
                                </ul>
                            </div> : null}
                            <form aria-label="form" name="createAccount" className="formOne">

                                <div className="labelInputContainer">
                                    <label htmlFor="name" className="sr-only">Display Name</label>
                                    <input type="text" id="name" required onChange={(e) => {setDisplayName(e.target.value)}} placeholder="Name"/>
                                    <i className="fa-regular fa-user"></i>
                                </div>

                                <div className="labelInputContainer">
                                    <label htmlFor="email" className="sr-only">Email</label>
                                    <input ref={emailEl} type="text" required onChange={(e) => {setRegisterEmail(e.target.value)}} className={isEmailExist ? "errorInput" : null} placeholder="Email"/>
                                    <i className="fa-regular fa-envelope"></i>
                                </div>

                                <div className="labelInputContainer">
                                    <label htmlFor="password" className="sr-only">Password</label>
                                    <input type="password" required onChange={(e) => {setRegisterPassword(e.target.value)}} placeholder="Password"/>
                                    <i className="fa-solid fa-lock"></i>
                                </div>
                                <button type="submit" className="continueBtn" onClick={(e) => {handleContinueBtn(e)}}>Continue</button>
                            </form>
                        </div>: null}
                        {isCreatedAcc ? 
                        <div className="formTwo">
                            <h2>Welcome {displayName}!</h2>
                            <div className="profileImageContainer">
                                <img src={profileImage} alt="" />
                            </div>
                            <p className="profileImageDirections">Take a minute to personalize your account by setting a profile picture! Don't worry, this step is optional. Once you're ready, click "Create Account".</p>
                            <form aria-label="form" name="customizeAccount">
                                
                                <label htmlFor="profilePicture">
                                    <p>{imageUpload ? "Picture Selected" : "Select Picture"}</p>
                                    {imageUpload ? 
                                    <i className="fa-solid fa-square-check"></i> :
                                    <i className="fa-solid fa-camera"></i>}
                                </label>
                                <input id="profilePicture" type="file" accept="image/png, image/jpg, image/gif, image/jpeg" onChange={(e) => {setImageUpload(e.target.files[0])}}/>
                                
                                <button type="submit" onClick={(e) => {registerUser(e)}}>Create Account</button>
                            </form> 
                        </div>
                        : null}
                    </div>
                </main>
                <footer>
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

            </div>
        )
    }

    return <Navigate to="/home" replace />
}

export default CreateAccount;