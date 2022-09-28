import heroBanner from "../assets/heroBanner.png";
import NavigationBar from "./NavigationBar";

const FrontPage = ({isAuth}) => {
    return(
        <div className="frontPage">
            <NavigationBar isAuth={isAuth}/>
            <header>
                <div className="wrapper">
                    <div className="flexHeader">
                        <div className="heroInfo heroContainer">
                            <h1>Say goodbye to unfulfilled New Year's resolutions!</h1>
                            <p>We’re more than just a simple productivity app. Habit Rabbit eliminates the complexity of tracking habits, and busy agendas.</p>
                            <button className="heroBtn">Join Today!</button>
                        </div>
                        <div className="heroImageContainer heroContainer">
                            <img src={heroBanner} alt="" />
                        </div>
                    </div>
                </div>
            </header>
        </div>
    )
}

export default FrontPage;