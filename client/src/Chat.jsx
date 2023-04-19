export default function Chat(){
  return (
    <div className="bg-gradient-to-br from-black via-cyan-900 to-violet-900 flex h-screen">
      <div className="bg-black bg-opacity-75 backdrop-filter backdrop-blur-md w-1/3 p-4w-1/3 text-white">
        Contacts
      </div>
      <div className="flex flex-col bg-black bg-opacity-50 backdrop-filter backdrop-blur-md w-2/3 p-2 text-white">
        <div className="flex-grow">
          messages with selected person
        </div>
        <div className="flex gap-2 p-3">
          <input type="text" placeholder="Type your message here" className="bg-white flex-grow border p-2 rounded-full"/>
          <button className="bg-blue-500 p-2 text-white rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}