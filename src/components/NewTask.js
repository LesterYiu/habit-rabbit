import { useState, useRef } from "react";
import { db, auth } from "./firebase";
import { addDoc, getDocs, collection } from "firebase/firestore";
import uuid from "react-uuid";

const NewTask = ({userUID, username, setTaskList, handleInputText, setIsNewTaskClicked}) => {
    
    const [taskName, setTaskName] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [time, setTime] = useState("");
    const [priority, setPriority] = useState("");
    const [taskColour, setTaskColour] = useState("");
    const [existingLabels, setExistingLabels] = useState("");
    const [labelList, setLabelList] = useState([]);

    const taskNameInputEl = useRef(null);
    const taskDescriptionInputEl = useRef(null);
    const taskDueDateInputEl = useRef(null);
    const taskDueTimeInputEl = useRef(null);
    const customTaskInputEl = useRef(null); 
    const existingTaskInputEl = useRef(null);
    const saveLabelInputEl = useRef(null);

    const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask`);
    const customLabelsCollectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/customLabels`);

    const createTask = async (e) => {
        e.preventDefault();

        if (taskNameInputEl.current.value && taskDescriptionInputEl.current.value && taskDueDateInputEl.current.value && taskDueTimeInputEl.current.value && (customTaskInputEl.current.value || existingTaskInputEl.current.value)) {
            await setIsNewTaskClicked(false);
            await addDoc(collectionRef, 
                { user: {username: username, id: auth.currentUser.uid}, 
                task: {name: taskName, description, time, deadline, priority, taskColour, label: existingLabels}});
            const data = await getDocs(collectionRef);
            setTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
            createReusableTaskLabel();
        }
        return;
    }

    // If the existing labels section is being filled by the user, the existing label input will be required before submitting, and makes the customize label input optional (not required before submission), and vice versa if the user was filling the custom labels section.
    const handleRequiredLabelField = (e) => {
        if (e.target.localName === "select" && e.target.value) {
            customTaskInputEl.current.required = false;
            e.target.required = true;
            customTaskInputEl.current.value = "";

            return false;
        } else if (e.target.localName === "input" && e.target.value) {
            existingTaskInputEl.current.required = false;
            e.target.required = true;
            existingTaskInputEl.current.value = "";

            return false;
        }
    }

    /*
    PSEUDO CODE FOR CREATETASKLABEL

        -on user click on the plus icon, add task label
        - do not let users add more than 3 labels

        if the user selected on save task labels
            - update to task label collection
            - update the labels in the task document

        if the user hasnt selected save task labels
            - do not update the task label collection
            - update the labels in thet ask document

    */

            // flag: still need to finish
    const createTaskLabel = () => {
        if(customTaskInputEl.current.value.length > 0 || customTaskInputEl.current.value.length < 4) {
            setLabelList([customTaskInputEl.current.value, ...labelList])
            customTaskInputEl.current.value = "";
        }
        // console.log(e.target);
        // const taskLabelName = e.target.value;
        // await addDoc(customLabelsCollectionRef, {taskLabel: taskLabelName});
        // e.target.value = "";
    }

    // FLAG STILL NEED TO FINISH
    console.log(labelList);

    const createReusableTaskLabel = () => {
        if (saveLabelInputEl.current.checked === true) {
            console.log('checked');
        }
    }

    const exitModal = () => {
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
                            <input type="text" id="task" onChange={(e) => {handleInputText(e, setTaskName)}} required ref={taskNameInputEl}/>
                        </div>

                        <div className="formSection">
                            <label htmlFor="description">Task Description:</label>
                            <input type="text" id="description" required onChange={(e) => {handleInputText(e, setDescription)}} ref={taskDescriptionInputEl}/>
                        </div>

                        <div className="formSection">
                            <label htmlFor="date">Due Date:</label>
                            <input type="date" id="date" required onChange={(e) => {handleInputText(e, setDeadline)}} ref={taskDueDateInputEl}/>
                        </div>

                        <div className="formSection">
                            <label htmlFor="time">Due Time:</label>
                            <input type="time" id="time" required onChange={(e) => {handleInputText(e, setTime)}} ref={taskDueTimeInputEl}/>
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
                                <input type="text" onChange={(e) => {handleRequiredLabelField(e)}} ref={customTaskInputEl} />
                                <div className="createNewLabelBtn" aria-label="create label button" onClick={(e) => {createTaskLabel(e)}}>+</div>
                            </div>
                            <div className="saveLabelsContainer">
                                <label htmlFor="saveLabel">Would you like to save your task label for future use?</label>
                                <input type="checkbox" id="saveLabel" ref={saveLabelInputEl}/>
                            </div>
                        </div>
                        <div className="orSection">
                            <div className="orSectionBorder"></div>
                            <p className="orSectionText">or</p>
                            <div className="orSectionBorder"></div>
                        </div>
                        <div className="labelSection existingLabelSection">
                            <label htmlFor="existingLabels">Existing Task Labels:</label>
                            <select name="" id="existingLabels" required ref={existingTaskInputEl} onChange={(e) => {
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
                        <div className="labelSection colorSection">
                            <label htmlFor="colorChoice">Task Colour:</label>
                            <input type="color" id="colorChoice" defaultValue="#F6F4F9" onChange={(e) => {setTaskColour(e.target.value)}}/>
                            <div className="colorChoiceHelp">
                                <span aria-hidden="true">ℹ️</span>
                                <p>To choose a colour, simply click the colour block above.</p>
                            </div>
                        </div>
                        <div className="chosenLabelsSection">
                            <p>Applied Task Labels:</p>
                            {labelList.length > 0 ?
                            labelList.map( (label) => {
                                return <p className="appliedTaskLabel" key={uuid()}>{label}</p>
                            })
                            : null}
                        </div>
                    </div>
                    <div className="buttonSection">
                        <div className="cancelBtn" onClick={(e) => {exitModal(e)}} aria-label="Leave Modal">Cancel</div>
                        <button type="submit" className="submitBtn">Create</button>
                    </div>
                </div>
                <button className="exitButton" onClick={(e) => {exitModal(e)}}><i className="fa-solid fa-circle-xmark" aria-hidden="true"></i><p className="sr-only">Exit Modal</p></button>
            </fieldset>
        </form>
    )
}

export default NewTask;