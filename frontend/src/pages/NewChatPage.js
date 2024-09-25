import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { CloseIcon } from "@chakra-ui/icons";
import {
  Input,
  Button,
  Stack,
  Box,
  Icon,
  Card,
  InputGroup,
  InputRightElement,
  useToast,
  Heading,
  CardHeader,
  CardBody,
  CardFooter,
} from "@chakra-ui/react";
import BackToHomeButton from "../components/BackToHomeButton";

const NewChatPage = () => {
  const [searchquery, setSearchquery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const searchUser = async () => {
    const currentUser = JSON.parse(localStorage.getItem("current-user"));
    setUsers([]);
    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };

    try {
      const usersList = await axios.get(
        `/api/users/search?query=${searchquery}`,
        config
      );
      console.log(usersList.data.data);
      setUsers(usersList.data.data);
      setLoading(false);

      if (usersList.data.data.length === 0) {
        toast({
          title: "Search Error",
          description: `No result found for keyword "${searchquery}"`,
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
      console.log(errorMessage);
    }
  };

  const createChatHandler = async (user) => {
    const createChatPayload = {
      recipientId: user._id,
    };
    console.log(createChatPayload);

    const currentUser = JSON.parse(localStorage.getItem("current-user"));
    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };

    try {
      const newGroupData = await axios.post(
        `/api/chats`,
        createChatPayload,
        config
      );
      console.log(newGroupData.data.data);
      // setUsers(newGroupData.data.data);
      setLoading(false);
      navigate(`/chats/${newGroupData.data.data._id}/messages`);
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
      console.log(errorMessage);
    }
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      searchUser();
    }
  };

  return (
    <Card>
      <BackToHomeButton />
      <CardHeader>
        <Heading size="md" fontSize="30px">
          New Chat
        </Heading>
      </CardHeader>
      <CardBody>
        <Stack bg="" w="100%" p={4} color="" spacing={5} direction="column">
          <InputGroup size="md">
            <Input
              placeholder="Name or email"
              type={"text"}
              required
              onKeyDown={handleEnterKeyPress}
              onChange={(e) => setSearchquery(e.target.value)}
            />
            <InputRightElement width="4.5rem">
              <Button
                h="1.75rem"
                size="sm"
                colorScheme="teal"
                onClick={() => searchUser()}
              >
                search
              </Button>
            </InputRightElement>
          </InputGroup>
          {users.length
            ? users.map((user, index) => (
                <Stack
                  key={user._id}
                  bg="teal"
                  w="100%"
                  p={3}
                  color="white"
                  spacing={1}
                  direction="column"
                >
                  <Box fontSize="sm">
                    {user.name}({user.email})
                  </Box>
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    size="xs"
                    onClick={() => createChatHandler(user)}
                  >
                    Send Message
                  </Button>
                </Stack>
              ))
            : ""}
        </Stack>
      </CardBody>
      <CardFooter></CardFooter>
    </Card>
  );
};

export default NewChatPage;