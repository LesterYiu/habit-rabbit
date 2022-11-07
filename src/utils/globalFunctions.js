export const debounce = (callbackFunction, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout( () => {
            callbackFunction(...args)
        }, delay);
    }
}