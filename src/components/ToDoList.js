import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { useState, useEffect } from "react";

const ToDoList = ({userUID}) => {

    const [toDoInput, setToDoInput] = useState('');
    const [toDoList, setToDoList] = useState([]);
    const toDoListCollectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/toDoList/`);

    useEffect( () => {

        const handleInitialMount = async () => {
        const data = await getDocs(toDoListCollectionRef);
        setToDoList(data.docs.map((doc) => ({...doc.data()})));
        }
        handleInitialMount();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const onTextInputChange = (e) => {
        setToDoInput(e.target.value);
    }
    
    const handleAddList = async (e) => {
        if(e.target.previousSibling.value) {
            await addDoc(toDoListCollectionRef, {task: toDoInput})
            setToDoInput('');
            e.target.previousSibling.value = '';

            const data = await getDocs(toDoListCollectionRef);
            setToDoList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
        }
        return;
    }

    console.log(toDoList);
    return(
    <div className="toDoListSection">
        <div className="toDoListTitleContainer">
            <h2>to-do list</h2>
        </div>
        <div className="toDoListTasks">
            <ul>
                {toDoList.map( (list) => {
                    return <li>{list.task}</li>
                })}
            </ul>
        </div>
        <div className="toDoInputContainer">
            <input type="text" onChange={(e) => {onTextInputChange(e)}}/>
            <button onClick={handleAddList}>+</button>
        </div>
    </div>)
}

export default ToDoList;