import { collection, getDocs } from "firebase/firestore";
import { useEffect, useContext } from "react";
import { AppContext } from "../Contexts/AppContext";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { auth, db } from "./firebase";
import { useState } from "react";
import { onAuthStateChanged } from "firebase/auth";

const TaskDetails = () => {

    // useContext variables
    const {setIsAuth, isAuth, setUsername, setUserUID, userUID, setUserPic} = useContext(AppContext);

    const {taskID} = useParams();

    const [isCorrectUser, setIsCorrectUser] = useState(null);
    const [taskDoc, setTaskDoc] = useState([]);

    const navigate = useNavigate();
    const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask`);
    const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);
    useEffect( () => {

        onAuthStateChanged( auth, (user) => {
            if (user) {
                setUsername(user.displayName);
                setUserUID(user.auth.currentUser.uid);
                setUserPic(user.photoURL);
                setIsAuth(!user.isAnonymous);
            }
        })
    }, [setUsername, setUserUID, setUserPic, setIsAuth])

    useEffect( () => {
        const getTaskData = async () => {
            const data = await getDocs(collectionRef);
            const taskList = data.docs.map((doc) => ({...doc.data(), id: doc.id}));
            
            // If users access task data of another user, redirect

            for(let task in taskList) {

                if(taskList[task].id === taskID) {
                    setTaskDoc(taskList[task])
                    setIsCorrectUser(true);
                    return;
                }

                navigate("/home");
            }
        }
        getTaskData();
    }, [userUID]);

    
    if (isAuth && isCorrectUser) {
        return(
        <div className="taskDetails">

        </div>)
    } else if (isAuth && isCorrectUser === null) {
        return(<div className="lds-ring"><div></div></div>)
    }
    
    return <Navigate to="/login" replace/>
}

export default TaskDetails;