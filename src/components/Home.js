import HomeNavigation from "./HomeNavigation";
import NewTask from "./NewTask";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "./firebase";
import { collection, getDocs, deleteDoc, doc, addDoc } from "firebase/firestore";
import { useState , useEffect} from "react";
import uuid from "react-uuid";

const Home = ({setIsAuth, isAuth, username, setUsername, setUserUID, userUID, userPic, setUserPic}) => {

    const [taskList, setTaskList] = useState([]);
    const [doneTaskList, setDoneTaskList] = useState([]);
    const [isNewTaskClicked, setIsNewTaskClicked] = useState(false);
    const [isToDoBtnClicked, setIsToDoBtnClicked] = useState(true);
    const [isDoneBtnClicked, setIsDoneBtnClicked] = useState(false);

    /*
    TO DO LIST

    Check if email exists already exists in database earlier
    Upload profile pictures
    Profile customization section
    Filter Arrays,
    Order Tasks in descending urgency (time wise)
    */

    // On initial mount, if the user is signed in, this will set their user information in state.
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

    // On initial mount, this will collect the tasks under the logged in user's userUID and set it into state to populate the page.
    useEffect( () => {

        const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);
        const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);

        const getPost = async () => {
            // data - ongoing tasks, doneData - finished tasks
            const data = await getDocs(collectionRef);
            const doneData = await getDocs(doneCollection);

            // This will layout the docs data in an array with the document id which can be used later to remove each individual doc
            setTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
            setDoneTaskList(doneData.docs.map((doc) => ({...doc.data(), id: doc.id})));
        }
        getPost();
    }, [userUID, setUserUID]);

    const handleInputText = (e, setState) => {
        setState(e.target.value);
    }

    const handleToDoBtn = () => {
        setIsDoneBtnClicked(false);
        setIsToDoBtnClicked(true);
    }

    const handleDoneBtn = () => {
        setIsDoneBtnClicked(true);
        setIsToDoBtnClicked(false);
    }

    // Deletes the task found at the specific document id of the task. Filters out the tasklists to exclude the task selected and re-renders the page with newly filtered array. This is for ongoing task list only
    const deleteTask = async (id, i) => {
        const newTaskList = taskList.filter( (task) => task !== taskList[taskList.indexOf(i)]);
        setTaskList(newTaskList);
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);
        await deleteDoc(postDoc);
    }

    //  Delete tasks for finished task list only.
    const deleteDoneTask = async (id ,i) => {
        const newDoneList = doneTaskList.filter( (task) => task !== doneTaskList[doneTaskList.indexOf(i)]);
        setDoneTaskList(newDoneList);
        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`);
        await deleteDoc(doneDoc);
    }

    const changeTaskStatus = async (id, e, i) => {
        const postDoc = doc(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/${id}`);
        const doneDoc = doc(db, `/users/user-list/${userUID}/${userUID}/finishedTask/${id}`)
        const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask/`);
        const doneCollection = collection(db, `/users/user-list/${userUID}/${userUID}/finishedTask/`);
        if (e.target.checked) {    
            // This will move a document from the unfinished task collection into the finished task collection if the checkbox is clicked for the first time. This will also set new pieces of state for both the done and to do sections of the home page, thereby re-rendering both with new information.
            await addDoc(doneCollection, i);
            await deleteDoc(postDoc);

            const data = await getDocs(collectionRef);
            const doneData = await getDocs(doneCollection);
            setTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
            setDoneTaskList(doneData.docs.map((doc) => ({...doc.data(), id: doc.id})));
        } else {
            await addDoc(collectionRef, i);
            await deleteDoc(doneDoc);

            const data = await getDocs(collectionRef);
            const doneData = await getDocs(doneCollection);
            setTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
            setDoneTaskList(doneData.docs.map((doc) => ({...doc.data(), id: doc.id})));
        }
    }

    if (isAuth) {
        return(
            <>
                <div className="homePage">
                    <HomeNavigation userUID={userUID} username={username} userPic={userPic} setUsername={setUsername} setUserUID={setUserUID} setIsAuth={setIsAuth} setTaskList={setTaskList} setIsNewTaskClicked={setIsNewTaskClicked} />
                    <div className="homeDashboard homeSection">
                        <h1>Good morning, {username}</h1>
                        <p>We have {taskList.length} things on the list today.</p>
                        <div className="taskFilters">
                            <button className={isToDoBtnClicked ? 'toDoTask taskButtonActive' : 'toDoTask'} onClick={handleToDoBtn}>To Do</button>
                            <button className={isDoneBtnClicked ? 'doneTask taskButtonActive' : 'doneTask'} onClick={handleDoneBtn}>Done</button>
                        </div>
                        <div>
                            <button className="filterContainer">
                                <i className="fa-solid fa-sort"></i>
                                <p>Filter</p>
                            </button>
                        </div>
                        {isToDoBtnClicked ?
                        taskList.map((i) => {
                            return (
                                <div className="taskContainer" key={uuid()}>
                                    <input type="checkbox" className="taskCheckbox" onChange={(e) => {changeTaskStatus(i.id, e, i)}}/>
                                    <div className="taskText">
                                        <p className="taskName">{i.task.name}</p>
                                        <p>{i.task.description}</p>
                                    </div>
                                    <button className="exitBtn" onClick={() => {deleteTask(i.id, i)}}>
                                        <span className="sr-only">Remove Task</span>
                                        <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                                    </button>
                                </div>
                            )
                        }) : 
                        doneTaskList.map((i) => {
                            return (
                                <div className="taskContainer" key={uuid()}>
                                    <input type="checkbox" className="taskCheckbox" onChange={(e) => {changeTaskStatus(i.id, e, i)}} defaultChecked/>
                                    <div className="taskText">
                                        <p className="taskName">{i.task.name}</p>
                                        <p>{i.task.description}</p>
                                    </div>
                                    <button className="exitBtn" onClick={() => {deleteDoneTask(i.id, i)}}>
                                        <span className="sr-only">Remove Task</span>
                                        <i className="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </div>
                {isNewTaskClicked ? 
                <>
                    <NewTask handleInputText={handleInputText} userUID={userUID} username={username} setTaskList={setTaskList} setIsNewTaskClicked={setIsNewTaskClicked}/>
                    <div className="overlayBackground"></div>
                </>
                : null}
                
            </>
        )
    }
    return <Navigate to="/login" replace/>
}

export default Home;