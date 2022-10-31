import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";
import { useState, useEffect, useRef } from "react";
import uuid from "react-uuid";

const ToDoList = ({userUID}) => {

    const [toDoInput, setToDoInput] = useState('');
    const [toDoList, setToDoList] = useState([]);
    const [isSettingBtnClicked, setIsSettingBtnClicked] = useState(false);

    const taskInputEl = useRef(false);
    const addTaskButtonEl = useRef(false);
    const removeInputButtonEl = useRef(false);

    const toDoListCollectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/toDoList/`);

    useEffect( () => {

        const handleInitialMount = async () => {
            const data = await getDocs(toDoListCollectionRef);
            setToDoList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
        }
        handleInitialMount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userUID]);

    const onTextInputChange = (e) => {
        setToDoInput(e.target.value);
    }
    
    const handleAddList = async (e) => {
        e.preventDefault();

        handleAddButton(e);

        if(e.target.previousSibling.value) {
            await addDoc(toDoListCollectionRef, {task: toDoInput, finished: false})
            setToDoInput('');
            e.target.previousSibling.value = '';

            const data = await getDocs(toDoListCollectionRef);
            setToDoList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
        }
        
        return;
    }

    const handleAddListKeydown = async (e) => {
        e.preventDefault();

        if(e.target.previousSibling.value && e.code === "Enter") {
            await addDoc(toDoListCollectionRef, {task: toDoInput})
            setToDoInput('');
            e.target.previousSibling.value = '';

            const data = await getDocs(toDoListCollectionRef);
            setToDoList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
        }
        return;
    }

    const handleDeleteDoc = async (i) => {
        const toDoListTaskRef = doc(db, `/users/user-list/${userUID}/${userUID}/toDoList/${i.id}`);

        const newFilteredList = toDoList.filter( (task) => {
            return task !== toDoList[toDoList.indexOf(i)];
        })
        setToDoList(newFilteredList);

        await deleteDoc(toDoListTaskRef)
    }

    const handleCheckInput = async (e, i) => {

        const toDoListTaskRef = doc(db, `/users/user-list/${userUID}/${userUID}/toDoList/${i.id}`);

        if (i.finished === false) {
            // If the user is checking off a task as complete
            await updateDoc(toDoListTaskRef, {task: i.task, finished: true});
        } else {
            // If the user is checking off a task as incomplete
            await updateDoc(toDoListTaskRef, {task: i.task, finished: false});
        }

        const data = await getDocs(toDoListCollectionRef);
        setToDoList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
    }  

    const handleAddButton = (e) => {
        e.preventDefault();
        switch (taskInputEl.current.className) {
            case "":
                console.log("working")
                taskInputEl.current.className = "inputOn";
                addTaskButtonEl.current.className = "";
                removeInputButtonEl.current.className = "buttonOff";
                break;
            case "inputOn":
                taskInputEl.current.className = "";
                addTaskButtonEl.current.className = "buttonOff";
                removeInputButtonEl.current.className = "";                
        }
    }

    return(
    <div className="toDoListSection">
        <div>
            <div className="toDoListTitleContainer">
                <h2>daily to-do list</h2>
                <button onClick={() => {setIsSettingBtnClicked(!isSettingBtnClicked)}}>
                    <i className="fa-solid fa-ellipsis"></i>
                </button>
            </div>
            <div className="toDoListTasks">
                <ul>
                    {toDoList.map( (list) => {
                        return (
                            <div className="toDoTaskWidget" key={uuid()}>
                                <li>
                                    <input onChange={(e) => {handleCheckInput(e, list)}} type="checkbox" checked={list.finished}/>
                                    <p>{list.task}</p>
                                    {isSettingBtnClicked ? 
                                    <button onClick={() => {handleDeleteDoc(list)}}>
                                        <span className="sr-only">Delete to-do task</span>
                                        <i className="fa-solid fa-xmark"></i>
                                    </button> : null}
                                </li>
                            </div>
                        )
                    })}
                </ul>
            </div>
        </div>
        <form className="toDoInputContainer">
            <input type="text" onChange={(e) => {onTextInputChange(e)}} ref={taskInputEl}/>
            <button className="buttonOff" onClick={handleAddList} onKeyDown={handleAddListKeydown} ref={addTaskButtonEl}>+</button>
            <button onClick={handleAddList} onKeyDown={handleAddListKeydown} ref={removeInputButtonEl}>🗒️</button>
        </form>
    </div>)
}

export default ToDoList;