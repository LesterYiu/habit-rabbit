import HomeNavigation from "./HomeNavigation";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { useState , useEffect} from "react";
import uuid from "react-uuid";

const Home = ({setIsAuth, isAuth, username, setUsername, setUserUID, userUID, userPic, setUserPic}) => {

    const [taskList, setTaskList] = useState([]);

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
                <HomeNavigation handleInputText={handleInputText} userUID={userUID} username={username} userPic={userPic} setUsername={setUsername} setUserUID={setUserUID} setIsAuth={setIsAuth}/>
                <div className="homeDashboard homeSection">
                    <p>Good morning, {username}</p>
                    {taskList.map((i) => {
                        return <p key={uuid()}>{i.task.name}</p>
                    })}
                </div>
            </div>
        )
    }
    return <Navigate to="/login" replace/>
}

export default Home;