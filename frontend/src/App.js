import { getUserFromToken } from "./utils/auth";

function App() {
  const user = getUserFromToken();
  const isLoggedIn = !!user;
  const isAdmin = user?.isAdmin;

  return (
    <div className="App">
      Home Page
      {/* Temp code to test and display login status */}
      {isLoggedIn && (
        <div>
          <p>Welcome back!</p>
    </div>    
      )}
      {/* Temp code to test and display admin privileges */}
      {isAdmin && (
        <div>
          <p>You have admin privileges.</p> 
        </div>
      )}
    </div>
  );
}

export default App;
