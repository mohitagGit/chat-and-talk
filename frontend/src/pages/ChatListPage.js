import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  Card,
  CardHeader,
  Heading,
  CardBody,
  Stack,
  CardFooter,
  Avatar,
} from "@chakra-ui/react";
import { chatTitle } from "../logics/chatLogic";

const ChatListPage = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("current-user"));

  const getChatsData = async () => {
    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };

    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/chats",
        config
      );
      setChats(data.data);
      setLoading(false);
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
    }
  };

  const navigateToNewGroup = () => {
    navigate("/chats/group/new");
  };

  const navigateToNewChat = () => {
    navigate("/chats/new");
  };

  const navigateToGroupDetail = (chatId) => {
    navigate(`/chats/${chatId}/edit`);
  };

  const navigateToConvoPage = (chatId) => {
    navigate(`/chats/${chatId}/messages`);
  };

  const logoutHandler = () => {
    localStorage.removeItem("current-user");
    navigate("/");
  };

  useEffect(() => {
    getChatsData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <Heading size="sm" fontSize="20px">
          {currentUser && currentUser.id ? (
            <p>
              LoggedIn: {currentUser.name} ({currentUser.email})
              <Button colorScheme="red" variant="link" onClick={logoutHandler}>
                Logout
              </Button>
            </p>
          ) : (
            ""
          )}
        </Heading>
      </CardHeader>
      <CardBody>
        <Stack
          bg=""
          w="100%"
          p={4}
          color="white"
          spacing={5}
          direction="column"
        >
          <div>
            <Box w="100%" p={4}>
              <Button
                size="lg"
                isLoading={loading}
                colorScheme="teal"
                variant="link"
                pr="20px"
                onClick={navigateToNewGroup}
              >
                New Group
              </Button>
              <Button
                size="lg"
                isLoading={loading}
                colorScheme="teal"
                variant="link"
                onClick={navigateToNewChat}
              >
                New Chat
              </Button>
            </Box>
            {chats.length && (
              <div>
                {chats.map((chat, index) => (
                  <Box key={chat._id} bg="white" w="100%" p={4} color="black">
                    <Box
                      bg="gray"
                      onClick={() => navigateToGroupDetail(chat._id)}
                    >
                      {chat.isGroup ? (
                        <Avatar name={chatTitle(chat)} />
                      ) : (
                        <Avatar />
                      )}{" "}
                      {chatTitle(chat)}
                      {chat.isGroup ? "(Group)" : "(OTO)"}
                    </Box>
                    <Box
                      bg="gray.200"
                      onClick={() => navigateToConvoPage(chat._id)}
                    >
                      {chat.members.map((member, index) => (
                        <div key={member._id}>{member.name}</div>
                      ))}
                    </Box>
                    <Divider />
                  </Box>
                ))}
              </div>
            )}
          </div>
        </Stack>
      </CardBody>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default ChatListPage;
