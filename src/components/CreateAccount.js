import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { storage } from "./firebase";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";

const CreateAccount = ({setIsAuth, setUsername, setUserUID, setUserPic, userUID}) => {

    const [registerEmail, setRegisterEmail] = useState("");
    const [registerPassword, setRegisterPassword] = useState("");
    const [displayName, setDisplayName] = useState("");
    const [imageUpload, setImageUpload] = useState(null);
    const [isCreatedAcc, setIsCreatedAcc] = useState(false);
    const [isEmailExist, setIsEmailExist] = useState(false);

    const navigate = useNavigate();
    const currentAuth = getAuth();
    const emailRegex =  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    const handleContinueBtn = (e) => {
        e.preventDefault();
        const emailEle = e.target.parentNode[0].value;
        const matchResult = emailRegex.test(emailEle);

        if (matchResult === true && registerPassword.length >= 6) {
            setIsCreatedAcc(!isCreatedAcc);            
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

    return(
        <div className="wrapper">
            {isCreatedAcc === false ?
            <form aria-label="form" name="createAccount">
                <label htmlFor="email">Email</label>
                <input type="text" required onChange={(e) => {setRegisterEmail(e.target.value)}} className={isEmailExist ? "errorInput" : null}/>
                
                {isEmailExist ? <p className="errorEmailMessage">A user with this email address already exists. Please login.</p> : null}

                <label htmlFor="password">Password</label>
                <input type="password" required onChange={(e) => {setRegisterPassword(e.target.value)}}/>

                <button type="submit" onClick={(e) => {handleContinueBtn(e)}}>Continue</button>
            </form> : null}
            {isCreatedAcc ? 
            <form aria-label="form" name="customizeAccount">
                
                <label htmlFor="profilePicture">Profile Picture</label>
                <input type="file" onChange={(e) => {setImageUpload(e.target.files[0])}}/>
                
                <label htmlFor="name">Display Name</label>
                <input type="text" id="name" required onChange={(e) => {setDisplayName(e.target.value)}}/>
                <button type="submit" onClick={(e) => {registerUser(e)}}>Create Account</button>
            </form> : null}
        </div>
    )
}

export default CreateAccount;