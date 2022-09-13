import { Link } from "react-router-dom";
import Login from "./Login";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";

const Home = ({setIsAuth, isAuth}) => {

    const signUserOut = () => {
        signOut(auth).then( () => {
            localStorage.clear();
            setIsAuth(false);
        })
    }

    return(
            <div className="wrapper">
                <p>Home</p>
                {/* {isAuth ? <button onClick={signUserOut}>Login out</button> : <Link to="/login">Login</Link>} */}
            </div>
    )
}

export default Home;