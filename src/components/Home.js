import { Link } from "react-router-dom";
// import Login from "./Login";
import { signOut } from "firebase/auth";
import { db, auth } from "./firebase";
import { addDoc, collection } from "firebase/firestore";

import { useState , useEffect} from "react";
import { getDocs } from "firebase/firestore";

const Home = ({setIsAuth, isAuth, username, setUsername, setUserUID, userUID}) => {

    const [taskList, setTaskList] = useState([]);

    const signUserOut = () => {
        signOut(auth).then( () => {
            localStorage.clear();
            setIsAuth(false);
            setUsername('');
            setUserUID('notSignedIn');
        })
    }

    const collectionRef = collection(db, userUID);

    const createTask = async (e) => {
        e.preventDefault();
        await addDoc(collectionRef, {username: username, id: auth.currentUser.uid});
    }

    useEffect( () => {
        const getPost = async () => {
            const data = await getDocs(collectionRef);
            console.log(data.docs[0].data());
        }

        getPost();
    })

    return(
            <div className="wrapper">
                <p>Good morning, {username}</p>
                <p>Create a new task</p>
                <form>
                    <label htmlFor="task">Task</label>
                    <input type="text" id="task"/>
                    <button onClick={(e) => {createTask(e)}}>Submit</button>
                </form>
                {isAuth ? <button onClick={signUserOut}>Login out</button> : <Link to="/login">Login</Link>}
            </div>
    )
}

export default Home;