import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
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
  IconButton,
  HStack,
  VStack,
  Flex,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";
import BackButton from "../components/BackButton";
import { ChatTitle, ChatDescription, IsGroupAdmin } from "../logics/chatLogic";
import { EditChatLoadingSkeleton } from "../loading/EditChatLoadingSkeleton";

const EditChatPage = () => {
  const { currentUser, checkUserAuth } = useAuth();
  const { chatId } = useParams();
  const [chatData, setChatData] = useState({});
  const [searchUserList, setSearchUserList] = useState([]);
  const [searchquery, setSearchquery] = useState("");
  const [newSelectedUsers, setNewSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMade, setEditMade] = useState(false);
  const navigate = useNavigate();

  const getChatData = async () => {
    setLoading(true);
    const config = {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
      },
    };

    try {
      const { data } = await axios.get(`/api/chats/${chatId}`, config);
      setChatData(data);
      setLoading(false);
    } catch (error) {
      console.log(error.message);
      setLoading(false);
      checkUserAuth(error.status);
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
        `/api/chats/${chatId}/remove-member`,
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
        `/api/users/search?query=${searchquery}`,
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
        `/api/chats/${chatId}/add-member`,
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

  const navigateToAudioCall = () => {
    navigate(`/call/${chatId}/audio`);
  };

  const navigateToVideoCall = () => {
    navigate(`/call/${chatId}/video`);
  };

  useEffect(() => {
    getChatData();
    setEditMade(false);
  }, [editMade]);

  return (
    <Flex direction="column" h="100vh" maxW="lg" mx="auto" p={4} bg="lightgray">
      <Card p={4}>
        <BackButton link={`/chats/${chatId}/messages`} />
        {chatData._id ? (
          <>
            <CardHeader textAlign="center">
              <Avatar name={ChatTitle(chatData, currentUser)} />
              <Heading size="sm" fontSize="20px">
                {ChatTitle(chatData, currentUser)}
              </Heading>
              <Text fontSize="sm">
                {ChatDescription(chatData, currentUser)}
              </Text>
              <Button onClick={navigateToAudioCall}>Audio</Button>
              <Button onClick={navigateToVideoCall}>Video</Button>
              <Divider />
            </CardHeader>
            <CardBody>
              <Stack bg="" w="100%" p={2} color="" spacing={3}>
                {chatData.isGroup && chatData.members.length && (
                  <>
                    <Heading size="sm" fontSize="18px">
                      {chatData.members.length} Members
                    </Heading>
                    <Divider />
                    {chatData.members.map((member, index) => (
                      <HStack
                        bg="gray.50"
                        key={member._id}
                        p={2}
                        borderRadius="md"
                        boxShadow="sm"
                      >
                        <Avatar size="xs" name={member.name} />
                        <VStack align="start" spacing={0} w="100%">
                          <Text fontSize="sm">
                            {member.name} {<>({member.email})</>}
                          </Text>
                          <Text fontSize="xs">
                            {member._id === chatData.admin._id
                              ? "Admin"
                              : "Member"}
                          </Text>
                        </VStack>
                        {IsGroupAdmin(chatData, currentUser) &&
                          member._id !== currentUser.id &&
                          member._id !== chatData.admin._id && (
                            <IconButton
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              size="xs"
                              onClick={() => removeMemberHandler(member)}
                              aria-label="Remove user"
                            />
                          )}
                      </HStack>
                    ))}
                  </>
                )}
              </Stack>
            </CardBody>
            {chatData.isGroup && (
              <CardFooter>
                {newSelectedUsers.length ? (
                  <Stack w="100%" p={4} spacing={5} direction="row">
                    {newSelectedUsers.map((selUser) => (
                      <>
                        <Avatar key={selUser._id} name={selUser.name}>
                          <AvatarBadge boxSize="1.25em" bg="gray"></AvatarBadge>
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
          </>
        ) : (
          <EditChatLoadingSkeleton />
        )}
      </Card>
    </Flex>
  );
};

export default EditChatPage;
