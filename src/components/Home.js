import HomeNavigation from "./HomeNavigation";
import { Link, Navigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { db, auth } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { useState , useEffect} from "react";
import uuid from "react-uuid";

const Home = ({setIsAuth, isAuth, username, setUsername, setUserUID, userUID}) => {

    const [taskList, setTaskList] = useState([]);

    useEffect( () => {
        const collectionRef = collection(db, `/users/user-list/${userUID}`);

        const getPost = async () => {
            const data = await getDocs(collectionRef);
            setTaskList(data.docs.map((doc) => ({...doc.data()})));
        }

        setUserUID(localStorage.userUID)
        getPost();
        
    }, [setUserUID, userUID])

    const signUserOut = () => {
        signOut(auth).then( () => {
            localStorage.clear();
            setIsAuth(false);
            setUsername('');
            setUserUID('notSignedIn');
        })
    }

    const handleInputText = (e, setState) => {
        setState(e.target.value);
    }

    if (isAuth) {
        return(
            <div className="homePage">
                <HomeNavigation handleInputText={handleInputText} userUID={userUID} username={username}/>
                <div className="homeDashboard homeSection">
                    <p>Good morning, {username}</p>
                    {taskList.map((i) => {
                        return <p key={uuid()}>{i.task.name}</p>
                    })}
                </div>

                {/* {isAuth ? <button onClick={signUserOut}>Login out</button> : <Link to="/login">Login</Link>} */}
            </div>
        )
    }
    return <Navigate to="/login" replace/>
}

export default Home;