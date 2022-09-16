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
    const [imageUpload, setImageUpload] = useState("");
    const [isCreatedAcc, setIsCreatedAcc] = useState(false);

    const navigate = useNavigate();
    const currentAuth = getAuth();

    const stepOneRegister = async (e) => {
        try {
            e.preventDefault();

            const user = await createUserWithEmailAndPassword(auth, registerEmail, registerPassword);

            setUserUID(user.user.auth.currentUser.uid);

            setIsCreatedAcc(!isCreatedAcc);

        } catch (error) {
            console.log(error.message);
        }        
    }

    const stepTwoRegister = async (e) => {
        e.preventDefault();

        const imageURL = await uploadPhoto();

        await updateProfile(currentAuth.currentUser, {
            displayName: `${displayName}`, photoURL: `${imageURL}`
        })
        await setUsername(currentAuth.currentUser.displayName);

        setIsAuth(true);
        localStorage.setItem("isAuth", !auth.currentUser.isAnonymous);

        navigate('/home');
    }

    const uploadPhoto = async () => {

        if(imageUpload === null) return;

        const imageRef = ref(storage, `users/profile-pictures/${userUID}/${userUID}`);
        const imageFolderRef = ref(storage, `users/profile-pictures/${userUID}`)
        await uploadBytes(imageRef, imageUpload);
        const imageResponse = await listAll(imageFolderRef);
        const imageURL = await getDownloadURL(imageResponse.items[0]);

        return imageURL;
    }

    return(
        <div className="wrapper">
            {isCreatedAcc === false ?
            <form aria-label="form" name="createAccount">
                <label htmlFor="email">Email</label>
                <input type="email" required onChange={(e) => {setRegisterEmail(e.target.value)}}/>

                <label htmlFor="password">Password</label>
                <input type="password" required onChange={(e) => {setRegisterPassword(e.target.value)}}/>

                <button onClick={(e) => {stepOneRegister(e)}}>Continue</button>
            </form> : null}
            {isCreatedAcc ? 
            <form aria-label="form" name="customizeAccount">
                
                <label htmlFor="profilePicture">Profile Picture</label>
                <input type="file" onChange={(e) => {setImageUpload(e.target.files[0])}}/>
                
                <label htmlFor="name">Display Name</label>
                <input type="text" id="name" required onChange={(e) => {setDisplayName(e.target.value)}}/>
                <button onClick={(e) => {stepTwoRegister(e)}}>Create Account</button>
            </form> : null}
        </div>
    )
}

export default CreateAccount;