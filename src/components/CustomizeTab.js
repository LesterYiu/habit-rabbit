import Calendar from "react-calendar";
import ToDoList from "./ToDoList.js";
import { AppContext } from "../Contexts/AppContext.js";
import { useContext } from "react";

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