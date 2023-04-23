import axios from "axios";
import { useContext, useState } from "react";
import { UserContext } from "./UserContext";

export default function RegisterAndLoginForm(){
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogInOrRegister, setIsLoginOrRegister] = useState('login');
  const {setUsername:setLoggedInUsername, setId} = useContext(UserContext);

  async function handleSubmit(ev){
    ev.preventDefault();
    const url = isLogInOrRegister === 'register' ? 'register':'login';
    const {data} = await axios.post(url, {username, password});
    setLoggedInUsername(username);
    setId(data.id);
  }

  return (
    <div className="bg-gradient-to-br from-black via-cyan-900 to-violet-900 h-screen flex flex-col items-center justify-center">
      <div className="bg-opacity-60 backdrop-blur-lg p-10 rounded-lg">
        <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
          <input value={username} onChange={ev => setUsername(ev.target.value)} className="block w-full rounded-full mb-2 pl-5 pt-2 pb-2 focus:outline-none" type="text" placeholder="username" />
          <input value={password} onChange={ev => setPassword(ev.target.value)}className="block w-full rounded-full mb-2 pl-5 pt-2 pb-2 focus:outline-none" type="password" placeholder="password"/>
          <button className="bg-blue-500 text-white block w-36 rounded-full p-2 mt-5 mx-auto">
            {isLogInOrRegister === 'register' ? 'Register' : 'Login'}
          </button>
          <div className="text-center text-white mt-2">
          {isLogInOrRegister === 'register' && (
            <div>
              Already a member?
              <button className="ml-1 underline" onClick={() => setIsLoginOrRegister('login')}>
                Login here.
              </button>
            </div>
          )}
          {isLogInOrRegister === 'login' && (
            <div>
              Don't have an account?
              <button className="ml-1 underline" onClick={() => setIsLoginOrRegister('register')}>
                Register.
              </button>
            </div>
          )}
        </div>
        </form>
      </div>
    </div>


  )
}
