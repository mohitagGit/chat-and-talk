import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardHeader,
  Heading,
  CardBody,
  CardFooter,
  Avatar,
  Text,
  VStack,
  HStack,
  Spacer,
  Input,
} from "@chakra-ui/react";
import { chatTitle } from "../logics/chatLogic";
import { formatTimeStamp } from "../logics/timeLogic";

const ChatListPage = () => {
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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
      const { data } = await axios.get("/api/chats", config);
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
        <Heading size="sm" fontSize="20px" textAlign="center">
          {currentUser && currentUser.id ? (
            <Text fontSize="sm">
              {currentUser.name} ({currentUser.email}){" "}
              <Button
                colorScheme="red"
                size="sm"
                variant="link"
                onClick={logoutHandler}
              >
                Logout
              </Button>
            </Text>
          ) : (
            ""
          )}
        </Heading>
      </CardHeader>
      <CardBody>
        <VStack
          align="stretch"
          spacing={4}
          p={4}
          bg="gray.50"
          borderRadius="md"
          w="100%"
          maxW="lg"
          mx="auto"
          boxShadow="md"
        >
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg="white"
            mb={4}
            borderRadius="md"
            boxShadow="sm"
          />
          {chats.length &&
            chats.map((chat) => (
              <HStack
                key={chat._id}
                w="100%"
                p={4}
                bg="white"
                borderRadius="md"
                boxShadow="sm"
                _hover={{ bg: "gray.100", cursor: "pointer" }}
                onClick={() => navigateToConvoPage(chat._id)}
              >
                <Avatar name={chatTitle(chat)} />
                <VStack align="start" spacing={1} w="100%">
                  <HStack w="100%">
                    <Text fontWeight="bold">{chatTitle(chat)}</Text>
                    <Spacer />
                    <Text fontSize="sm" color="gray.500">
                      {chat.lastMessage
                        ? formatTimeStamp(chat.lastMessage.updatedAt)
                        : formatTimeStamp(chat.createdAt)}
                    </Text>
                  </HStack>
                  <HStack w="100%">
                    {chat.lastMessage ? (
                      <Text fontSize="sm" color="gray.600" isTruncated>
                        {chat.lastMessage.sender._id === currentUser.id
                          ? "You: "
                          : chat.lastMessage.sender.name + ": "}
                        {chat.lastMessage.message}
                      </Text>
                    ) : (
                      <Text fontSize="sm">
                        <i>Click to start conversation</i>
                      </Text>
                    )}
                    <Spacer />
                    {/* {chat.unread > 0 && (
                    <Badge colorScheme="blue">{chat.unread}</Badge>
                  )} */}
                  </HStack>
                </VStack>
              </HStack>
            ))}
        </VStack>
      </CardBody>
      <CardFooter>
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
      </CardFooter>
    </Card>
  );
};

export default ChatListPage;
