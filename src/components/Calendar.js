import Calendar from "react-calendar";
import { useState } from "react";

const CalendarSection = () => {

    const [currentDate, setCurrentDate] = useState(new Date());

    return(
        <Calendar onChange={setCurrentDate} value={currentDate}/>
    )
}

export default CalendarSection;