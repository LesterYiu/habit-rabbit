import { useState, useRef } from "react";
import { db, auth } from "./firebase";
import { addDoc, getDocs, collection } from "firebase/firestore";
import uuid from "react-uuid";
import { useEffect, useContext } from "react";
import {format, startOfWeek} from "date-fns";
import { AppContext } from "../Contexts/AppContext";

const NewTask = ({setTaskList, setIsNewTaskClicked}) => {
    
    const [taskName, setTaskName] = useState("");
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [reformattedDeadline, setReformattedDeadline] = useState("");
    const [startDayOfWeek, setStartDayOfWeek] = useState("");
    const [unformattedDeadline, setUnformattedDeadline] = useState("");
    const [firstDayOfWeekUnformatted, setFirstDayOfWeekUnformatted] = useState("");
    const [firstDayOfWeekTimestamp, setFirstDayOfWeekTimestamp] = useState("")
    const [time, setTime] = useState("");
    const [priority, setPriority] = useState("");
    const [taskColour, setTaskColour] = useState("");
    const [isTaskExist, setIsTaskExist] = useState(false);
    const [isDuplicateFound, setIsDuplicateFound] = useState(false);
    const [isCustomTaskSelected, setIsCustomTaskSelected] = useState(false);
    const [isExistingTaskSelected, setIsExistingTaskSelected] = useState(false);
    const [isMaxLabelsReachedCustom, setIsMaxLabelsReachedCustom] = useState(false);
    const [isMaxLabelsReachedExisting, setIsMaxLabelsReachedExisting] = useState(false);

    // For all the custom created labels
    const [labelList, setLabelList] = useState([]);
    // To hold all user-created labels
    const [customExistingLabels, setCustomExistingLabels] = useState([]);

    // useRef variables
    const saveLabelInputEl = useRef(null);
    const taskNameInputEl = useRef(null);
    const taskDescriptionInputEl = useRef(null);
    const taskDueDateInputEl = useRef(null);
    const taskDueTimeInputEl = useRef(null);
    const customTaskInputEl = useRef(null); 
    const existingTaskInputEl = useRef(null);

    // useContext variables
    const {username, userUID} = useContext(AppContext)

    const collectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/ongoingTask`);
    const customLabelsCollectionRef = collection(db, `/users/user-list/${userUID}/${userUID}/customLabels`);

    useEffect(  () => {
        const retrieveCustomCreatedLabels = async () => {
            const existingLabelsData = await getDocs(customLabelsCollectionRef);
            setCustomExistingLabels(existingLabelsData.docs.map((doc) => ({...doc.data(), id: doc.id})));
        }

        retrieveCustomCreatedLabels();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleInputText = (e, setState) => {
        e.preventDefault();
        setState(e.target.value);
    }

    const createTask = async (e) => {
        e.preventDefault();

        // Check to see if user has added the label to labelList.
        if (labelList.length === 0 && customTaskInputEl.current.value) {
            setIsCustomTaskSelected(true);
        } else if (existingTaskInputEl.current.value && labelList.length > 0) {
            setIsCustomTaskSelected(false);
        } else if (labelList.length === 0 && existingTaskInputEl.current.value) {
            setIsExistingTaskSelected(true);
        } else if (customTaskInputEl.current.value && labelList.length > 0) {
            setIsExistingTaskSelected(false);
        }

        // Creates the task and submits to database

        if (taskNameInputEl.current.value && taskDescriptionInputEl.current.value && taskDueDateInputEl.current.value && taskDueTimeInputEl.current.value && labelList.length !== 0) {
            await setIsNewTaskClicked(false);
            await addDoc(collectionRef, 
                { user: {username: username, id: auth.currentUser.uid}, 
                task: {name: taskName, description, time, deadline, reformattedDeadline, startDayOfWeek, unformattedDeadline, firstDayOfWeekUnformatted, firstDayOfWeekTimestamp, priority, taskColour, label: [...labelList], completion: 0, updates:[], timeSpent: {}}, uuid: uuid()});
            const data = await getDocs(collectionRef);
            setTaskList(data.docs.map((doc) => ({...doc.data(), id: doc.id})));
            createReusableTaskLabel(e);
        }
        return;
    }

    const handleDeadline = (e) => {
        e.preventDefault();
        setUnformattedDeadline(new Date(e.target.value));

        const dateString = e.target.value.replace(/([-])/g, '');
        const year = +dateString.substring(0, 4);
        const month = +dateString.substring(4, 6);
        const day = +dateString.substring(6, 8);
        const date = new Date(year, month - 1, day);
        setReformattedDeadline(format(date, 'MMM dd, yyyy'));

        const firstDayOfWeek = startOfWeek(date);
        setStartDayOfWeek(format(firstDayOfWeek, 'MMM dd, yyyy'));
        
        setFirstDayOfWeekUnformatted(format(firstDayOfWeek, 'yyyy-MM-dd'));
        setFirstDayOfWeekTimestamp(new Date(format(firstDayOfWeek, 'yyyy-MM-dd')));

        setDeadline(e.target.value);

    }

    // If the existing labels section is being filled by the user, the existing label input will be required before submitting, and makes the customize label input optional (not required before submission), and vice versa if the user was filling the custom labels section.
    const handleRequiredLabelField = (e) => {
        if (e.target.localName === "select" && e.target.value) {
            customTaskInputEl.current.required = false;
            e.target.required = true;
            customTaskInputEl.current.value = "";

            return false;
        } else if (e.target.localName === "input" && labelList) {
            existingTaskInputEl.current.required = false;
            existingTaskInputEl.current.value = "";

            return false;
        }
    }

    const handleNewTaskLabels = async () => {

        // RestructuredArray will contain list of all saved arrays in the database.

        /* Labels will not be set in state & uploading to the database if all the following criteria apply 
            1. More than 3 labels exist
            2. If an empty string is inputted
            3. If the label exists alreay
            4. If it is duplicated from before
        */
        if (labelList.length === 4) {
            setIsMaxLabelsReachedExisting(false);
            setIsMaxLabelsReachedCustom(true);
            return false;
        }
        const labelsData = await getDocs(customLabelsCollectionRef);
        const existingLabelsArray = (labelsData.docs.map((doc) => ({...doc.data(), id: doc.id})));
        const restructuredArray = existingLabelsArray.map( (labelObject) => {
            return labelObject.taskLabel;
        });

        // If the input value exists in the custom task input collection, return.
        for (let i in restructuredArray) {
            if(restructuredArray[i] === customTaskInputEl.current.value) {
                customTaskInputEl.current.className = 'customTaskError';
                setIsTaskExist(true);
                return false;
            }
        }

        if(labelList.length < 4 && customTaskInputEl.current.value !== "" && !restructuredArray.includes(customTaskInputEl.current.value) && !labelList.includes(customTaskInputEl.current.value)) {
            customTaskInputEl.current.className = '';
            setIsTaskExist(false);
            setLabelList([customTaskInputEl.current.value, ...labelList])
            customTaskInputEl.current.value = "";
        }
    }
    
    const createReusableTaskLabel = async (e) => {
        const checkboxEl = e.target[9]

        if (checkboxEl.checked === true) {
            labelList.forEach( async (label) => {
                await addDoc(customLabelsCollectionRef, {taskLabel: label});
            })
        } else {
            return false;
        }
    }

    const handleExistingTaskLabels = () => {
        setIsExistingTaskSelected(false);
        if (labelList.length === 4) {
            setIsMaxLabelsReachedCustom(false);
            setIsMaxLabelsReachedExisting(true);
            return false;
        } 
        if (existingTaskInputEl.current.value === "") {
            return false;
        } else if (labelList.length > 0) {
            for (let i in labelList) {
                if (existingTaskInputEl.current.value === labelList[i]) {
                    setIsDuplicateFound(true);
                    existingTaskInputEl.current.className = 'existingTaskSelect selectedTaskError';
                    return false;
                }
            }     
        }

        if (labelList.length < 4 && existingTaskInputEl.current.value !== "") {
            setLabelList([existingTaskInputEl.current.value, ...labelList]);
            setIsDuplicateFound(false);
            existingTaskInputEl.current.className = 'existingTaskSelect';
        }

    }

    const removeTaskLabel = (e) => {
        const taskContent = e.target.parentElement.previousSibling.textContent;
        setLabelList(labelList.filter( (i) => i !== taskContent));
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
                            <input type="date" id="date" required onChange={(e) => {handleDeadline(e)}} ref={taskDueDateInputEl}/>
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
                                <div className="createNewLabelBtn" aria-label="create label button" onClick={(e) => {handleNewTaskLabels(e)}}>+</div>
                            </div>
                            {isTaskExist ? <p className="customTaskErrorMsg">This task already exists. Check the existing tasks labels section.</p> : null}
                            {isCustomTaskSelected ? <p className="customTaskErrorMsg">A task label must be selected before proceeding. Please click the + button.</p> : null}
                            {isMaxLabelsReachedCustom ? <p className="customTaskErrorMsg">You can only select 4 task labels per task.</p> : null}
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
                            <div className="existingLabelButtons">
                                <select name="" id="existingLabels" className="existingTaskSelect" required ref={existingTaskInputEl} onChange={(e) => {handleRequiredLabelField(e)}}>
                                    <option value="" selected disabled hidden>Choose Here</option>
                                    <option value="personal">Personal</option>
                                    <option value="school">School</option>
                                    <option value="work">Work</option>
                                    <option value="appointment">Appointment</option>
                                    <option value="exercise">Exercise</option>
                                    <option value="chores">Chores</option>
                                    {customExistingLabels ? customExistingLabels.map((label) => {
                                        return <option key={label.id} value={label.taskLabel}>{label.taskLabel}</option>
                                    }) : null}
                                </select>
                                <div className="createNewLabelBtn" aria-label="create label button" onClick={handleExistingTaskLabels}>+</div>
                            </div>
                            {isDuplicateFound ? <p className="customTaskErrorMsg">This task is already selected.</p> : null}
                            {isExistingTaskSelected ? <p className="customTaskErrorMsg">A task label must be selected before proceeding. Please click the + button.</p> : null}
                            {isMaxLabelsReachedExisting ? <p className="customTaskErrorMsg">You can only select 4 task labels per task.</p> : null}
                        </div>
                        <div className="chosenLabelsSection">
                            <p>Applied Task Labels:</p>
                            {labelList.length > 0 ?
                            labelList.map( (label) => {
                                return (
                                    <div className="appliedTaskLabel" key={uuid()}>
                                        <p>{label}</p>
                                        <div role="button" onClick={removeTaskLabel}>
                                            <span className="sr-only">remove task label</span>
                                            <i className="fa-solid fa-xmark" aria-hidden="true"></i>
                                        </div>
                                    </div>
                                )
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