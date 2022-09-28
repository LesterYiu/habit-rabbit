import Calendar from "react-calendar";
import ToDoList from "./ToDoList.js";

const CustomizeTab = ({userUID}) => {
    return(
        <div className="customizableTabSection">
            <Calendar />
            <ToDoList userUID={userUID}/>   
        </div>
    );
}

export default CustomizeTab;