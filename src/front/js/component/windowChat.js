import React from "react";
import ChatHeader from "./chatHeader";
import ChatMessages from "./chatMessages";
import ChatInput from "./chatInput";


export const WindowChat = () => {
  return (
    <div className="flex flex-column w-100 vh-100">
      <ChatHeader/>
      <ChatMessages/>
      <ChatInput/>
    </div>
  );
};