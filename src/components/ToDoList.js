import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "./firebase";
import { useState, useEffect } from "react";
import uuid from "react-uuid";

const ToDoList = ({userUID}) => {

    const [toDoInput, setToDoInput] = useState('');
    const [toDoList, setToDoList] = useState([]);
    const [isSettingBtnClicked, setIsSettingBtnClicked] = useState(false);

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

        if(e.target.previousSibling.value) {
            await addDoc(toDoListCollectionRef, {task: toDoInput})
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

    return(
    <div className="toDoListSection">
        <div className="toDoListTitleContainer">
            <h2>to-do list</h2>
            <button onClick={() => {setIsSettingBtnClicked(!isSettingBtnClicked)}}>
                <i className="fa-solid fa-ellipsis"></i>
            </button>
        </div>
        <div className="toDoListTasks">
            <ul>
                {toDoList.map( (list) => {
                    return (
                        <div className="toDoTask" key={uuid()}>
                            <li>{list.task}</li>
                            {isSettingBtnClicked ? 
                            <button onClick={() => {handleDeleteDoc(list)}}>
                                <span className="sr-only">Delete to-do task</span>
                                <i className="fa-solid fa-xmark"></i>
                            </button> : null}
                        </div>
                    )
                })}
            </ul>
        </div>
        <form className="toDoInputContainer">
            <input type="text" onChange={(e) => {onTextInputChange(e)}}/>
            <button onClick={handleAddList} onKeyDown={handleAddListKeydown}>+</button>
        </form>
    </div>)
}

export default ToDoList;