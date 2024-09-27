import React from "react";
import { Text } from "@chakra-ui/react";

const UserTyping = ({ isGroup, typingUserName }) => {
  const typingStyle = {
    color: "white",
    fontSize: "10px",
  };
  const typingStyleBlank = {
    color: "teal",
    fontSize: "10px",
  };
  return (
    <>
      {typingUserName ? (
        <Text style={typingStyle}>
          {isGroup ? <>{typingUserName} is typing...</> : <>Typing...</>}
        </Text>
      ) : (
        <Text style={typingStyleBlank}>.</Text>
      )}
    </>
  );
};

export default UserTyping;
