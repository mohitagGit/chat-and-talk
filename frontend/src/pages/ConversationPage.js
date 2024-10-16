import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import {
  Box,
  Card,
  Text,
  Input,
  Button,
  Avatar,
  VStack,
  HStack,
  Flex,
} from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";

import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import UserTyping from "../components/UserTyping";
import { ChatTitle } from "../logics/chatLogic";
import { formatTimeStamp } from "../logics/timeLogic";
import ConversationLoadingSkeleton from "../loading/ConversationLoadingSkeleton";

// Connect to the Node.js backend
var backend_url = "http://localhost:4000";
if (window.location.host === "varta-ls5r.onrender.com") {
  backend_url = "https://varta-ls5r.onrender.com";
}
console.log("backend_url", backend_url);
const socket = io.connect(backend_url);

const ConversationPage = () => {
  const { currentUser } = useAuth();
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [chatData, setChatData] = useState({});
  const [messageToSend, setMessageToSend] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [typingUserName, setTypingUserName] = useState("");

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
    <Flex direction="column" h="100vh" maxW="lg" mx="auto" p={4} bg="lightgray">
      <Card p={4}>
        <BackButton />
        <VStack spacing={1} align="stretch">
          {chatData._id && (
            <HStack spacing={4} p={4} bg="teal" color="white" borderRadius="md">
              <Avatar name={ChatTitle(chatData, currentUser)} />
              <Box fontSize="lg" fontWeight="bold">
                <Link
                  style={{
                    textDecoration: "underline",
                  }}
                  to={`/chats/${chatData._id}/edit`}
                >
                  {ChatTitle(chatData, currentUser)}
                </Link>
                <UserTyping
                  isGroup={chatData.isGroup}
                  typingUserName={typingUserName}
                />
              </Box>
            </HStack>
          )}
          <Box
            bg="white"
            flex="1"
            boxShadow="sm"
            overflowY="auto"
            maxH="70vh"
            minH="70vh"
          >
            {messages.length ? (
              <ScrollableFeed>
                {messages.map((msg, index) => (
                  <HStack
                    key={msg._id}
                    align="flex-start"
                    mb={2}
                    justify={
                      msg.sender._id === currentUser.id
                        ? "flex-end"
                        : "flex-start"
                    }
                  >
                    {/* {
                  const showAvatar = index === 0 || messages[index - 1].user !== message.user
                } */}
                    {msg.sender !== currentUser.id && (
                      <Avatar size="xs" name={msg.sender.name} />
                    )}
                    <VStack
                      align="stretch"
                      bg={
                        msg.sender === currentUser.id ? "blue.100" : "gray.100"
                      }
                      borderRadius="md"
                      p={2}
                    >
                      <Text fontSize="xs">{msg.message}</Text>
                      <Text fontSize="xs" color="gray.500">
                        {formatTimeStamp(msg.updatedAt)}
                      </Text>
                    </VStack>
                  </HStack>
                ))}
              </ScrollableFeed>
            ) : (
              <ConversationLoadingSkeleton />
            )}
          </Box>

          {/* message input box */}
          <HStack spacing={4}>
            <Input
              required
              onKeyUp={(e) => {
                handleEnterKeyPress(e);
              }}
              onChange={(e) => {
                typingHandler(e);
                handleMessageInputChange(e);
              }}
              placeholder="Type your message..."
              bg="white"
              flex="1"
              borderRadius="md"
            />
            <Button colorScheme="teal" onClick={sendMessageHandler}>
              Send
            </Button>
          </HStack>
        </VStack>
      </Card>
    </Flex>
  );
};

export default ConversationPage;
