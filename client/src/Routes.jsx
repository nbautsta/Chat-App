import { useContext } from "react"
import RegisterAndLoginForm from "./RegisterAndLoginForm"
import Chat from "./Chat"
import { UserContext } from "./UserContext"

export default function Routes(){
  const { username, id} = useContext(UserContext);

  if (username){
    return <Chat />
  }
  return(
    <RegisterAndLoginForm />
  )
}