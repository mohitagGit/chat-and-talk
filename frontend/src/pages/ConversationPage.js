import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Box,
  Card,
  CardHeader,
  Heading,
  CardBody,
  Stack,
  Text,
  Divider,
  CardFooter,
  InputGroup,
  Input,
  InputRightElement,
  Button,
  Avatar,
} from "@chakra-ui/react";
import BackToHomeButton from "../components/BackToHomeButton";
import UserTyping from "../components/UserTyping";
import { chatTitle } from "../logics/chatLogic";

// Connect to the Node.js backend
var backend_url = "http://localhost:4000";
if (window.location.host === "varta-ls5r.onrender.com") {
  backend_url = "https://varta-ls5r.onrender.com";
}
console.log("backend_url", backend_url);
const socket = io(backend_url);

const currentUser = JSON.parse(localStorage.getItem("current-user"));

const ConversationPage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [chatData, setChatData] = useState({});
  const [messageToSend, setMessageToSend] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState("");
  const [typingUserContent, setTypingUserContent] = useState("");

  // to get chat history
  const getChatMessages = async () => {
    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };

    try {
      const userChats = await axios.get(`/api/messages/${chatId}`, config);
      setMessages(userChats.data.data);
      setChatData(userChats.data.chat);
      setLoading(false);
      socket.emit("JOINED_CHAT_ROOM", chatId);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
  };

  // to send a message
  const sendMessageHandler = async () => {
    if (!messageToSend) {
      return false;
    }

    const messagePayload = {
      groupId: chatId,
      message: messageToSend,
    };
    setMessageToSend("");
    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };
    try {
      const { data } = await axios.post(
        "/api/messages",
        messagePayload,
        config
      );
      socket.emit("NEW_MESSAGE_TO_SERVER", data.data); // Send message to server
      setMessages((prevMsgs) => [...prevMsgs, data.data]);
      setLoading(false);
      setMessageSent(true);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
  };

  const handleMessageInputChange = (e) => {
    setMessageToSend(e.target.value);
  };

  // to handle enter key event
  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessageHandler();
    }
  };

  // for triggering typing event
  const typingHandler = (e) => {
    if (!isUserTyping) {
      socket.emit("TYPING", currentUser.name, chatData._id, e.target.value);
      setIsUserTyping(true);
    }

    setTimeout(() => {
      socket.emit("TYPING_STOPPED", chatData._id);
      setIsUserTyping(false);
    }, 2000);
  };

  useEffect(() => {
    getChatMessages();

    // to handle if someone is typing in chat
    socket.on("USER_TYPING", (roomId, name, content) => {
      if (chatId === roomId) {
        setTypingUserName(name);
        setTypingUserContent(content);
        console.log(`${name} is typing...`);
      }
    });

    // to handle if typing in stopped
    socket.on("USER_TYPING_STOPPED", () => {
      setTypingUserName("");
    });

    // to handle new message event
    socket.on("NEW_MESSAGE_TO_CLIENT", ({ messageData }) => {
      if (messageData.sender._id !== currentUser.id) {
        setMessages((prevMsgs) => [...prevMsgs, messageData]);
      }
    });

    return () => {
      socket.off("disconnect");
    };
  }, []);

  return (
    <div>
      <Card>
        <BackToHomeButton />
        <CardHeader>
          {chatData._id && (
            <>
              <Avatar name={chatTitle(chatData)} />
              <Heading size="md">
                <Link
                  style={{
                    textDecoration: "underline",
                    fontWeight: "600",
                  }}
                  to={`/chats/${chatData._id}/edit`}
                >
                  {chatTitle(chatData)}
                </Link>
                <UserTyping
                  isGroup={chatData.isGroup}
                  typingUserName={typingUserName}
                />
              </Heading>
              <Divider />
            </>
          )}
        </CardHeader>

        <CardBody>
          <Stack spacing="4">
            {messages.length ? (
              <div>
                {messages.map((message, index) => (
                  <Box key={message._id}>
                    <Heading size="xs" textTransform="uppercase">
                      {message.sender.name}
                    </Heading>
                    <Text pt="2" fontSize="sm">
                      {message.message}
                    </Text>
                    <Divider />
                  </Box>
                ))}
              </div>
            ) : (
              ""
            )}
          </Stack>
        </CardBody>
        <CardFooter>
          <InputGroup size="md">
            <Input
              placeholder="Enter Message"
              type="text"
              required
              onKeyUp={(e) => {
                handleEnterKeyPress(e);
                handleMessageInputChange(e);
              }}
              onChange={(e) => {
                typingHandler(e);
              }}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                isLoading={loading}
                colorScheme="teal"
                onClick={() => sendMessageHandler()}
              >
                Send
              </Button>
            </InputRightElement>
          </InputGroup>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ConversationPage;
