import { AppContext } from "../Contexts/AppContext.js";
import { useContext } from "react";

// Component Imports
import Calendar from "react-calendar";
import ToDoList from "./ToDoList.js";

const CustomizeTab = () => {

    // useContext variables
    const {userUID} = useContext(AppContext)
    
    return(
        <div className="customizableTabSection">
            <Calendar />
            <ToDoList userUID={userUID}/>   
        </div>
    );
}

export default CustomizeTab;