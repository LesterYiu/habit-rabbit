import { useContext, useEffect } from "react";
import { AppContext } from "../Contexts/AppContext";
import { Link } from "react-router-dom";
import { disableScrollForModalOn } from "../utils/globalFunctions";

// Component Imports
import NavigationBar from "./NavigationBar";
import FrontPageSlideMenu from "./FrontPageSlideMenu";

// Image Imports
import pageNotFound from "../assets/pageNotFound.png";

const NotFound = () => {
    
    const {isAuth, setIsNavExpanded, isNavExpanded} = useContext(AppContext);

    useEffect( () => {
        disableScrollForModalOn(isNavExpanded)
    }, [isNavExpanded])

    return(
        <div className="notFoundPage">
            <NavigationBar isAuth={isAuth} setIsNavExpanded={setIsNavExpanded} isNavExpanded={isNavExpanded}/>
            <main>
                <div className="wrapper notFoundFlex">
                    <div className="imageContainer">
                        <img src={pageNotFound} alt="" />
                    </div>
                    <div className="notFoundText">
                        <h1>Page not found</h1>
                        <p>Either this page doesnt exist, or you don't have access to this page</p>
                    </div>
                    <Link to="/" className="goBackHomeBtn">
                        Go back to homepage 
                        <i className="fa-solid fa-arrow-right" aria-hidden="true"></i>
                    </Link>
                </div>
            </main>

            {isNavExpanded ?
            <>
                <FrontPageSlideMenu setIsNavExpanded={setIsNavExpanded}/> 
                <div className="overlayBackground" onClick={() => {setIsNavExpanded(false)}}></div>
            </>
            : null
            }
        </div>
    )
}

export default NotFound;