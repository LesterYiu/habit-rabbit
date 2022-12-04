export const debounce = (callbackFunction, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout( () => {
            callbackFunction(...args)
        }, delay);
    }
}

export const handleScroll = (e) => {
        const doneBtnContainer = e.target.childNodes[2];

        if(e.type === "mouseover" && e.target.className === "taskContainer"){
            doneBtnContainer.className = 'buttonContainer'
        } else if (e.type === "mouseleave" && e.target.className === "taskContainer"){

            const doneBtn = doneBtnContainer.firstChild;

            if(doneBtn.disabled){
                return;
            }

            doneBtnContainer.className = 'buttonContainer buttonHidden'            
        }
    }
