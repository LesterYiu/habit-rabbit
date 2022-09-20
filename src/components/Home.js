import HomeNavigation from "./HomeNavigation";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { useState , useEffect} from "react";
import uuid from "react-uuid";

const Home = ({setIsAuth, isAuth, username, setUsername, setUserUID, userUID, userPic, setUserPic}) => {

    const [taskList, setTaskList] = useState([]);

    /*
    TO DO LIST

    Check if email exists already exists in database earlier
    Upload profile pictures
    Profile customization section
    Filter Arrays,
    Order Tasks in descending urgency (time wise)
    */

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
        const collectionRef = collection(db, `/users/user-list/${userUID}`);

        const getPost = async () => {
            const data = await getDocs(collectionRef);
            setTaskList(data.docs.map((doc) => ({...doc.data()})));
        }
        getPost();
    }, [userUID, setUserUID])

    const handleInputText = (e, setState) => {
        setState(e.target.value);
    }

    if (isAuth) {
        return(
            <div className="homePage">
                <HomeNavigation handleInputText={handleInputText} userUID={userUID} username={username} userPic={userPic} setUsername={setUsername} setUserUID={setUserUID} setIsAuth={setIsAuth} setTaskList={setTaskList}/>
                <div className="homeDashboard homeSection">
                    <h1>Good morning, {username}</h1>
                    <p>We have {taskList.length} things on the list today.</p>
                    <div className="taskFilters">
                        <button className="toDoTask taskButtonActive">To Do</button>
                        <button className="doneTask">Done</button>
                    </div>
                    <div>
                        <button className="filterContainer">
                            <i className="fa-solid fa-sort"></i>
                            <p>Filter</p>
                        </button>
                    </div>
                    {taskList.map((i) => {
                        return (
                            <div className="taskContainer" key={uuid()}>
                                <p className="taskName">{i.task.name}</p>
                                <p>{i.task.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
    return <Navigate to="/login" replace/>
}

export default Home;