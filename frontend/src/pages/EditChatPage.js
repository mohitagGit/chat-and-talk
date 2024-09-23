import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
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
  AvatarBadge,
  Icon,
  Checkbox,
} from "@chakra-ui/react";
import BackToHomeButton from "../components/BackToHomeButton";
import { chatTitle, chatDescription, isGroupAdmin } from "../logics/chatLogic";

const EditChatPage = () => {
  const { chatId } = useParams();
  const [chatData, setChatData] = useState({});
  const [searchUserList, setSearchUserList] = useState([]);
  const [searchquery, setSearchquery] = useState("");
  const [newSelectedUsers, setNewSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMade, setEditMade] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("current-user"));

  const getChatData = async () => {
    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };

    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/chats/${chatId}`,
        config
      );
      setChatData(data);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
  };

  const removeMemberHandler = async (userTobeRemoved) => {
    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };

    const removeUserPayload = {
      userId: userTobeRemoved._id,
    };
    try {
      await axios.put(
        `http://localhost:4000/api/chats/${chatId}/remove-member`,
        removeUserPayload,
        config
      );
      setEditMade(true);
      setLoading(false);
      setSearchUserList([]);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
  };

  const filterExistingMembers = (userList) => {
    const filteredUsers = userList.map((item1) => {
      const match = chatData.members.find((item2) => item2._id === item1._id);
      if (match) {
        return { ...item1, existing: true };
      } else {
        return { ...item1, existing: false };
      }
    });
    setSearchUserList(filteredUsers);
  };

  const searchUser = async () => {
    const currentUser = JSON.parse(localStorage.getItem("current-user"));
    setSearchUserList([]);
    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };

    try {
      const usersList = await axios.get(
        `http://localhost:4000/api/users/search?query=${searchquery}`,
        config
      );
      console.log(usersList.data.data);
      filterExistingMembers(usersList.data.data);
      setNewSelectedUsers([]);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
  };

  const addMemberHandler = async (userTobeRemoved) => {
    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };

    const addUserPayload = {
      userId: userTobeRemoved._id,
    };
    try {
      await axios.put(
        `http://localhost:4000/api/chats/${chatId}/add-member`,
        addUserPayload,
        config
      );
      setEditMade(true);
      setLoading(false);
      setSearchUserList([]);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
    }
  };

  const handleEnterKeyPress = (event) => {
    if (event.key === "Enter") {
      searchUser();
    }
  };

  useEffect(() => {
    getChatData();
    setEditMade(false);
  }, [editMade]);

  return (
    <div>
      {chatData._id ? (
        <Card>
          <BackToHomeButton />
          <CardHeader>
            <Avatar name={chatTitle(chatData)} />
            <Heading size="sm" fontSize="20px">
              {chatTitle(chatData)}
            </Heading>
            <Text fontSize="sm">{chatDescription(chatData)}</Text>
            <Divider />
          </CardHeader>
          <CardBody>
            <Stack bg="" w="100%" p={4} color="" spacing={5}>
              <div>
                {chatData.isGroup ? (
                  <Heading size="sm" fontSize="18px">
                    Members
                  </Heading>
                ) : (
                  ""
                )}
                {chatData.isGroup &&
                  chatData.members.map((member, index) => (
                    <Box key={member._id}>
                      <Text fontSize="sm">
                        {member.name} {<>({member.email})</>}
                        {member._id === chatData.admin ? <>(A)</> : ""}
                      </Text>
                      {isGroupAdmin(chatData) &&
                        member._id !== currentUser.id &&
                        member._id !== chatData.admin && (
                          <Button
                            h="1.75rem"
                            size="xs"
                            colorScheme="red"
                            isLoading={loading}
                            onClick={() => removeMemberHandler(member)}
                          >
                            Remove
                          </Button>
                        )}
                      <Divider />
                    </Box>
                  ))}
              </div>
            </Stack>
          </CardBody>
          {chatData.isGroup && (
            <CardFooter>
              {newSelectedUsers.length ? (
                <Stack w="100%" p={4} spacing={5} direction="row">
                  {newSelectedUsers.map((selUser) => (
                    <>
                      <Avatar key={selUser._id} name={selUser.name}>
                        <AvatarBadge boxSize="1.25em" bg="gray">
                          {/* <Icon as={CloseIcon} /> */}
                        </AvatarBadge>
                      </Avatar>
                    </>
                  ))}
                </Stack>
              ) : (
                ""
              )}
              <Stack
                bg=""
                w="100%"
                p={4}
                color=""
                spacing={5}
                direction="column"
              >
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
                      colorScheme="green"
                      onClick={() => searchUser()}
                    >
                      search
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {searchUserList.length
                  ? searchUserList.map((user, index) => (
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
                        {!user.existing && (
                          <Button
                            colorScheme="green"
                            size="xs"
                            variant="outline"
                            onClick={() => addMemberHandler(user)}
                          >
                            Add
                          </Button>
                        )}
                      </Stack>
                    ))
                  : ""}
              </Stack>
            </CardFooter>
          )}
        </Card>
      ) : (
        <Card>Invalid Chat!</Card>
      )}
    </div>
  );
};

export default EditChatPage;
