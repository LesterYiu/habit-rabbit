import { useState } from "react";
import { db, auth } from "./firebase";
import { addDoc, getDocs, collection } from "firebase/firestore";

const NewTask = ({userUID, username, setTaskList, handleInputText, setIsNewTaskClicked}) => {
    
    const [taskName, setTaskName] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [time, setTime] = useState("");
    const [priority, setPriority] = useState("");
    const [taskColour, setTaskColour] = useState("");
    const [existingLabels, setExistingLabels] = useState("");
    const [isCustomRequired, setIsCustomRequired] = useState(false);
    const [isExistingRequired, setIsExistingRequired] = useState(false);

    const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask`);

    const createTask = async (e) => {
        e.preventDefault();
        await setIsNewTaskClicked(false);
        await addDoc(collectionRef, 
            { user: {username: username, id: auth.currentUser.uid}, 
            task: {name: taskName, description, time, deadline, priority, taskColour, label: existingLabels}});
        const data = await getDocs(collectionRef);
        setTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
    }

    const handleRequiredLabelField = (e) => {
        // // const customLabelEl = e.target.parentElement.parentElement.firstElementChild.children[1].children[0];
        // console.log(e.target.parentElement.parentElement.parentElement.children[2].children[1]);
        if (e.target.localName === "select" && e.target.value) {
            const customLabelEl = e.target.parentElement.parentElement.firstElementChild.children[1].children[0];

            setIsCustomRequired(false);
            setIsExistingRequired(true);
            customLabelEl.value = "";
        } else if (e.target.localName === "input" && e.target.value) {
            const existingLabelEl = e.target.parentElement.parentElement.parentElement.children[2].children[1];

            setIsCustomRequired(true);
            setIsExistingRequired(false);
            existingLabelEl.value = "";
        }
    }
    
    const exitModal = (e) => {
        e.preventDefault();
        setIsNewTaskClicked(false);
    }

    return(
        <form aria-label="form" name="taskForm" className="createTaskForm" onSubmit={(e) => {createTask(e)}}>
            <fieldset>
                <div className="formPrimarySection">
                    <legend><h2>Create a new task</h2></legend>
                    <div className="formField">
                        <div className="formSection">
                            <label htmlFor="task">Task Name:</label>
                            <input type="text" id="task" onChange={(e) => {handleInputText(e, setTaskName)}} required/>
                        </div>

                        <div className="formSection">
                            <label htmlFor="description">Task Description:</label>
                            <input type="text" id="description" required onChange={(e) => {handleInputText(e, setDescription)}}/>
                        </div>

                        <div className="formSection">
                            <label htmlFor="date">Due Date:</label>
                            <input type="date" id="date" required onChange={(e) => {handleInputText(e, setDeadline)}}/>
                        </div>

                        <div className="formSection">
                            <label htmlFor="time">Due Time:</label>
                            <input type="time" id="time" required onChange={(e) => {handleInputText(e, setTime)}}/>
                        </div>

                        <div className="formSection prioritySection">
                            <p className="paragraphLabel">Priority:</p>
                            <div className="lowPriorityContainer priorityContainer">
                                <label htmlFor="lowPriority">Low</label>
                                <input type="radio" id="lowPriority" name="priority" value="low" onClick={(e) => {setPriority(e.target.value)}} required/>
                            </div>

                            <div className="mediumPriorityContainer priorityContainer">
                                <label htmlFor="mediumPriority">Medium</label>
                                <input type="radio" id="mediumPriority" name="priority" value="medium" onClick={(e) => {setPriority(e.target.value)}}/>
                            </div>

                            <div className="highPriorityContainer priorityContainer">
                                <label htmlFor="highPiority">High</label>
                                <input type="radio" id="highPiority" name="priority" value="high" onClick={(e) => {setPriority(e.target.value)}}/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="formSecondarySection">
                    <div>
                        <div className="labelSection">
                            <label htmlFor="createLabel">Create a Task Label: </label>
                            <div className="createLabelTextContainer">
                                <input type="text" onChange={(e) => {handleRequiredLabelField(e)}} required={isCustomRequired}/>
                                <button>+</button>
                            </div>
                        </div>
                        <div className="orSection">
                            <div className="orSectionBorder"></div>
                            <p className="orSectionText">or</p>
                            <div className="orSectionBorder"></div>
                        </div>
                        <div className="labelSection existingLabelSection">
                            <label htmlFor="existingLabels" required={isExistingRequired}>Existing Task Labels:</label>
                            <select name="" id="existingLabels" required onChange={(e) => {
                                setExistingLabels(e.target.value)
                                handleRequiredLabelField(e)}}>
                                <option value="" selected disabled hidden>Choose Here</option>
                                <option value="personal">Personal</option>
                                <option value="school">School</option>
                                <option value="work">Work</option>
                                <option value="importantDate">Important Date</option>
                                <option value="appointment">Appointment</option>
                                <option value="exercise">Exercise</option>
                                <option value="chores">Chores</option>
                            </select>
                        </div>
                        <div className="labelSection">
                            <label htmlFor="colorChoice">Task Colour:</label>
                            <input type="color" id="colorChoice" defaultValue="#F6F4F9" onChange={(e) => {setTaskColour(e.target.value)}}/>
                            <div className="colorChoiceHelp">
                                <span aria-hidden="true">ℹ️</span>
                                <p>To choose a colour, simply click the colour block above.</p>
                            </div>
                        </div>
                    </div>
                    <div className="buttonSection">
                        <button className="cancelBtn" onClick={(e) => {exitModal(e)}}>Cancel</button>
                        <button type="submit" className="submitBtn">Create</button>
                    </div>
                </div>
                <button className="exitButton" onClick={(e) => {exitModal(e)}}><i className="fa-solid fa-circle-xmark" aria-hidden="true"></i><p className="sr-only">Exit Modal</p></button>
            </fieldset>
        </form>
    )
}

export default NewTask;