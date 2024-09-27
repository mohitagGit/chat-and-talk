import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Input,
  Button,
  Heading,
  InputGroup,
  InputRightElement,
  useToast,
  Divider,
  Stack,
  Card,
  CardBody,
  CardHeader,
  Flex,
} from "@chakra-ui/react";

const LoginPage = () => {
  const [userEmail, setUseremail] = useState("");
  const [userPass, setUserpass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleShowPass = () => setShowPass(!showPass);

  const submitLogin = async () => {
    if (!userEmail || !userPass) {
      toast({
        title: "Authentication Error",
        description: "Username Password are required",
        status: "error",
        duration: 2500,
        isClosable: true,
      });
      return;
    }

    const loginPayload = {
      email: userEmail,
      password: userPass,
    };
    setLoading(true);
    const config = { headers: { "Content-type": "application/json" } };
    try {
      const userLoginData = await axios.post(
        "/api/users/signin",
        loginPayload,
        config
      );
      console.log(userLoginData.data);
      localStorage.setItem(
        "current-user",
        JSON.stringify(userLoginData.data.data)
      );

      toast({
        title: "Authentication Successful",
        description: `Welcome back ${userLoginData.data.data.name}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
      setLoading(false);
      navigate("/chats");
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage(error.message);
      }
      setLoading(false);
      toast({
        title: "Authentication Failed",
        description: errorMessage,
        status: "error",
        duration: 2500,
        isClosable: true,
      });
    }
  };

  const gotoSignUpPage = () => {
    navigate("/signup");
  };

  const navigateToAbout = () => {
    navigate("/about");
  };

  return (
    <Flex direction="column" h="100vh" maxW="lg" mx="auto" p={4} bg="lightgray">
      <Card>
        <CardHeader>
          <Heading size="md" fontSize="40px" onClick={navigateToAbout}>
            @VARTA
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack bg="" w="100%" p={4} color="" spacing={5} direction="column">
            <Input
              placeholder="Your Email"
              type="email"
              required
              onChange={(e) => setUseremail(e.target.value)}
            />
            <InputGroup size="md">
              <Input
                placeholder="Enter password"
                type={showPass ? "text" : "password"}
                required
                onChange={(e) => setUserpass(e.target.value)}
              />
              <InputRightElement width="4.5rem">
                <Button h="1.75rem" size="sm" onClick={() => handleShowPass()}>
                  {showPass ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            <Button
              size="lg"
              isLoading={loading}
              colorScheme="teal"
              mt="24px"
              onClick={submitLogin}
            >
              Login
            </Button>
            <Divider />
            <Button
              size="lg"
              colorScheme="teal"
              mt="24px"
              onClick={gotoSignUpPage}
            >
              SignUp
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default LoginPage;
