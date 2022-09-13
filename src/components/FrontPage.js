import { useNavigate } from "react-router-dom";

const FrontPage = () => {

    const navigate = useNavigate();

    const handleButtonClick = () => {
        navigate('/login');
    }

    return(
        <div className="wrapper frontPage">
            <nav>
                <ul>
                    <div className="leftNavigation">
                        <li className="logoContainer">
                            <img src="https://static.thenounproject.com/png/40444-200.png" alt="" />
                        </li>
                        <li className="companyName">Rabit Habbit</li>
                        <li>About Us</li>
                        <li>Source Code</li>
                    </div>
                    <div className="rightNavigation">
                        <li onClick={handleButtonClick}>Login</li>
                        <li>Create Account</li>
                    </div>
                </ul>
            </nav>
            <header>

            </header>
        </div>
    )
}

export default FrontPage;