import React from "react";
import { Text } from "@chakra-ui/react";

const UserTyping = ({ isGroup, typingUserName }) => {
  const typingStyle = {
    color: "gray",
    fontSize: "10px",
    padding: "5px",
  };
  return (
    <>
      {typingUserName ? (
        <Text style={typingStyle}>
          {isGroup ? <>{typingUserName} is typing...</> : <>Typing...</>}
          {/* {typingUserName} is typing {typingUserContent} */}
        </Text>
      ) : (
        <Text style={typingStyle}>.</Text>
      )}
    </>
  );
};

export default UserTyping;
