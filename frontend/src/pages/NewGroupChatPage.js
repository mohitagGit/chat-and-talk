import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { CloseIcon } from "@chakra-ui/icons";
import {
  Input,
  Button,
  Stack,
  Avatar,
  AvatarBadge,
  Checkbox,
  Icon,
  Card,
  InputGroup,
  InputRightElement,
  useToast,
  Heading,
  CardHeader,
  CardBody,
  CardFooter,
  Flex,
  Box,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import BackToHomeButton from "../components/BackToHomeButton";

const NewGroupChatPage = () => {
  const { currentUser } = useAuth();
  const [searchquery, setSearchquery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newSelectedUsers, setNewSelectedUsers] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupBio, setNewGroupBio] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const searchUser = async () => {
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
      setNewSelectedUsers([]);
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

  const handleCreateGroup = async () => {
    if (!newGroupName || !newSelectedUsers.length) {
      return false;
    }
    const memberIds = newSelectedUsers.map((item) => item._id);
    const createGroupPayload = {
      name: newGroupName,
      description: newGroupBio,
      members: memberIds,
    };
    console.log(createGroupPayload);

    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };

    try {
      const newGroupData = await axios.post(
        `/api/chats/create-group`,
        createGroupPayload,
        config
      );
      console.log(newGroupData.data.data);
      setUsers(newGroupData.data.data);
      setNewSelectedUsers([]);
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      setErrorMessage(error.message);
      setLoading(false);
      console.log(errorMessage);
    }
  };

  const handleSelectUser = (isChecked, user) => {
    if (isChecked) {
      setNewSelectedUsers((prevUsers) => [...prevUsers, user]);
    } else {
      setNewSelectedUsers((prevUsers) =>
        prevUsers.filter((iUser) => user._id !== iUser._id)
      );
    }
  };

  const handleCancelGroup = () => {
    navigate("/chats");
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      searchUser();
    }
  };

  return (
    <Flex direction="column" h="100vh" maxW="lg" mx="auto" p={4} bg="lightgray">
      <Card p={4}>
        <Box boxShadow="sm" borderRadius="sm">
          <BackToHomeButton />
          <CardHeader>
            <Heading size="md" fontSize="30px">
              New Group
            </Heading>
          </CardHeader>
          <CardBody>
            <Stack bg="" w="100%" p={4} color="" spacing={5} direction="column">
              <Input
                placeholder="Enter group name"
                type="text"
                variant="flushed"
                required
                onChange={(e) => setNewGroupName(e.target.value)}
              />
              <Input
                placeholder="Enter description (optional)"
                type="text"
                variant="flushed"
                onChange={(e) => setNewGroupBio(e.target.value)}
              />
            </Stack>
            {newSelectedUsers.length ? (
              <>
                <Stack w="100%" p={4} spacing={5} direction="row">
                  {newSelectedUsers.map((selUser) => (
                    <>
                      <Avatar key={selUser._id} name={selUser.name}>
                        <AvatarBadge boxSize="1.25em" bg="gray">
                          <Icon as={CloseIcon} />
                        </AvatarBadge>
                      </Avatar>
                    </>
                  ))}
                </Stack>
                <Stack w="100%" p={4} spacing={5} direction="row">
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    onClick={handleCreateGroup}
                  >
                    Create Group
                  </Button>
                  <Button
                    colorScheme="teal"
                    variant="outline"
                    onClick={handleCancelGroup}
                  >
                    Cancel
                  </Button>
                </Stack>
              </>
            ) : (
              ""
            )}
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
                      <Checkbox
                        onChange={(e) =>
                          handleSelectUser(e.target.checked, user)
                        }
                      >
                        {index + 1}. {user.name}({user.email})
                      </Checkbox>
                    </Stack>
                  ))
                : ""}
            </Stack>
          </CardBody>
          <CardFooter></CardFooter>
        </Box>
      </Card>
    </Flex>
  );
};

export default NewGroupChatPage;
