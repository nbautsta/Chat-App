import { useContext, useEffect, useState } from "react"
import Avatar from "./Avatar"
import Logo from "./Logo"

export default function Chat(){
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const{username, id} = useContext;
  const [newMessageText, setNewMessageText] = useState('');
  CONST [ messages, setMessages] = useState([]);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000');
    setWs(ws);
    ws.addEventListener('message', handleMessage)
  },[]);

  function showOnlinePeople(peopleArray){
    const people = {};
    peopleArray.forEach(({userId, username}) => {
      people[userId] = username;
    })
    setOnlinePeople(people);
  }

  function handleMessage(ev){
    const messageData = JSON.parse(ev.data);
    if ('online' in messageData){
      showOnlinePeople(messageData.online);
    }
    else{
      console.log({messageData});
    }
  }

  function sendMessage(ev){
    ev.preventDefault();
    ws.send(JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText
    }));
    setNewMessageText('');
    setMessages( prev => ([...prev,{text: newMessageText, isOur:true}]));
  }

  const onlinePeopleExclOurUser = {...onlinePeople};
  delete onlinePeopleExclOurUser[id];

  return (
    <div className="bg-gradient-to-bl from-black via-pink-500 to-purple-400 flex h-screen">
      <div className="bg-black bg-opacity-75 backdrop-filter backdrop-blur-md w-1/3 p-4w-1/3 text-white pl-4 pt-4">
        <Logo />
        {Object.keys(onlinePeopleExclOurUser).map(userId => (
          <div key={userId} onClick={() => setSelectedUserId(userId)} className={"flex items-center gap-2 cursor-pointer pl-4" + (userId === selectedUserId ? 'bg-blue-50' : '')}>
            {userId === selectedUserId && (
              <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>
            )} 
            <div className="flex gap-2 py-2 pl-4 items-center">
              <Avatar username={onlinePeople[userId]} userId={userId} />
              <span className="text-white-800">{onlinePeople[userId]}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col bg-black bg-opacity-70 backdrop-filter backdrop-blur-md w-2/3 p-2 text-white">
        <div className="flex-grow">
          {!selectedUserId && (
            <div className="flex h-full flex-grow items-center justify-center">
              <div className="opacity-30">
                &larr; Select a person from the sidebar
              </div>
            </div>
          )}
        </div>

        {!!selectedUserId && (
          
          <form className="flex gap-2 p-3" onSubmit={sendMessage}>
            <input type="text" placeholder="Type your message here" className="bg-white flex-grow border p-2 rounded-full" value={newMessageText} onChange={ev => setNewMessageText(ev.target.value)}/>
            <button className="bg-blue-500 p-2 text-white rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        )}
        
      </div>
    </div>
  )
}