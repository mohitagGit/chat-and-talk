import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
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
import { chatTitle } from "../logics/chatLogic";

const ConversationPage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [chatData, setChatData] = useState({});
  const [messageToSend, setMessageToSend] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("current-user"));

  const getChatMessages = async () => {
    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };

    try {
      const userChats = await axios.get(
        `http://localhost:4000/api/messages/${chatId}`,
        config
      );
      console.log(userChats.data.data);
      setMessages(userChats.data.data);
      setChatData(userChats.data.chat);
      setLoading(false);
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  const sendMessageHandler = async () => {
    if (!messageToSend) {
      return false;
    }

    const messagePayload = {
      groupId: chatId,
      message: messageToSend,
    };
    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };
    try {
      const userLoginData = await axios.post(
        "http://localhost:4000/api/messages",
        messagePayload,
        config
      );
      console.log(userLoginData.data);
      setLoading(false);
      setMessageSent(true);
      setMessageToSend("");
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      sendMessageHandler();
    }
  };

  useEffect(() => {
    getChatMessages();
  }, [messageSent]);

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
              onKeyDown={handleEnterKeyPress}
              onChange={(e) => setMessageToSend(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
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
