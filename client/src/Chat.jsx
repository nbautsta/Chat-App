import { useContext, useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import Logo from "./Logo";
import {UserContext} from "./UserContext.jsx";
import {uniqBy} from "lodash";
import axios from "axios";


export default function Chat(){
  const [ws,setWs] = useState(null);
  const [onlinePeople,setOnlinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText,setNewMessageText] = useState('');
  const [messages,setMessages] = useState([]);
  const {username,id,setId,setUsername} = useContext(UserContext);
  const divUnderMessages = useRef();

  useEffect(() => {
    connectToWs();
  }, [selectedUserId]);
  function connectToWs() {
    const ws = new WebSocket('ws://localhost:4000');
    setWs(ws);
    ws.addEventListener('message', handleMessage);
    ws.addEventListener('close', () => {
      setTimeout(() => {
        console.log('Disconnected. Trying to reconnect.');
        connectToWs();
      }, 1000);
    });
  }

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({userId,username}) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  }

  function handleMessage(ev) {
    const messageData = JSON.parse(ev.data);
    console.log({ev,messageData});
    if ('online' in messageData) {
      showOnlinePeople(messageData.online);
    } else if ('text' in messageData) {
      if (messageData.sender === selectedUserId) {
        setMessages(prev => ([...prev, {...messageData}]));
      }
    }
  }

  function sendMessage(ev){
    ev.preventDefault();
    ws.send(JSON.stringify({
        recipient: selectedUserId,
        text: newMessageText
    }));
    setNewMessageText('');
    setMessages( prev => ([...prev,{text: newMessageText, sender: id, recipient: selectedUserId, _id:Date.now(),}]));
  }

  useEffect(()=> {
    const div = divUnderMessages.current;
    if(div){
      div.scrollIntoView({behavior:'smooth', block:'end'})
    }
  },[messages])

  useEffect(() => {
    if (selectedUserId) {
      axios.get('/messages/'+selectedUserId).then(res => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  const onlinePeopleExclOurUser = {...onlinePeople};
  delete onlinePeopleExclOurUser[id];

  const messagesWithoutDupes = uniqBy (messages, '_id');

  return (
    <div className="bg-no-repeat bg-cover bg-center flex h-screen" style={{ backgroundImage: "url('/images/bg.jpg')" }}>
      <div className="bg-black bg-opacity-75 backdrop-filter backdrop-blur-md w-1/3 p-4w-1/3 text-white pl-4 pt-4">
        <Logo />
        {Object.keys(onlinePeopleExclOurUser).map(userId => (
          <div key={userId} onClick={() => setSelectedUserId(userId)} className={"flex items-center gap-2 cursor-pointer pl-4" + (userId === selectedUserId ? 'bg-purple-50' : '')}>
            {userId === selectedUserId && (
              <div className="w-1 bg-purple-800 h-10 rounded-r-md bg-opacity-40"></div>
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
          {!!selectedUserId && (
              <div className="relative h-full">
                <div className="overflow-y-scroll absolute top-0 left-0 right-0 bottom-2">
                {messagesWithoutDupes.map(message => (
                  <div key={message._id} className={(message.sender === id ? 'text-right': 'text-left')}>
                    <div className={"text-left inline-block p-2 my-2 rounded-full text-sm " +(message.sender === id ? 'bg-purple-800 text-white':'bg-black bg-opacity-85 text-white')}>
                      {message.text}
                    </div>
                  </div>
                ))}
                    <div ref={divUnderMessages}></div>
                </div>
              </div>
          )}
        </div>

        {!!selectedUserId && (
          
          <form className="flex gap-2 p-3" onSubmit={sendMessage}>
            <input type="text" placeholder="Type your message here" className="bg-transparent bg-white flex-grow border border-gray-300 border-opacity-50 p-2 pl-5 rounded-full text-white-500 focus:outline-none" value={newMessageText} onChange={ev => setNewMessageText(ev.target.value)}/>
            <button className="bg-purple-800 bg-opacity-40 p-2 rounded-full">
              
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