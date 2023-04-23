import Avatar from "./Avatar.jsx";

export default function Contact({id,username,onClick,selected,online}) {
  return (
    <div key={id} onClick={() => onClick=(id)} className={"flex items-center gap-2 cursor-pointer pl-4" + (selected ? 'bg-purple-50' : '')}>
      {selected && (
        <div className="w-1 bg-purple-800 h-10 rounded-r-md bg-opacity-40"></div>
      )} 
      <div className="flex gap-2 py-2 pl-4 items-center">
        <Avatar online={online}  username={username} userId={id} />
        <span className="text-white-800">{username}</span>
      </div>
    </div>
  );
}