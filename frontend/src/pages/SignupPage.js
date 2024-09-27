import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Input,
  Button,
  Heading,
  useToast,
  Stack,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Flex,
} from "@chakra-ui/react";

const SignupPage = () => {
  const [userName, setUsername] = useState("");
  const [userEmail, setUseremail] = useState("");
  const [userPass, setUserpass] = useState("");
  const [userConfPass, setUserConfPass] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const submitSignup = async () => {
    if (!userName || !userEmail || !userPass || !userConfPass) {
      toast({
        title: "Signup Error",
        description: "Please fill all the required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (userPass !== userConfPass) {
      toast({
        title: "Signup Error",
        description: "Passwords are not same.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const signupPayload = {
      name: userName,
      email: userEmail,
      password: userPass,
    };
    setLoading(true);
    const config = { headers: { "Content-type": "application/json" } };
    try {
      const userLoginData = await axios.post(
        "/api/users/register",
        signupPayload,
        config
      );
      console.log(userLoginData.data);
      localStorage.setItem(
        "current-user",
        JSON.stringify(userLoginData.data.data)
      );

      toast({
        title: "Registration Successful",
        description: `Welcome to Varta ${userLoginData.data.data.name}`,
        status: "success",
        duration: 5000,
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
        title: "Registration Failed",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const gotoLoginPage = () => {
    navigate("/");
  };

  return (
    <Flex direction="column" h="100vh" maxW="lg" mx="auto" p={4} bg="lightgray">
      <Card>
        <CardHeader>
          <Heading size="md" fontSize="40px">
            @VARTA
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack bg="" w="100%" p={4} color="" spacing={5} direction="column">
            <Input
              placeholder="Your Name"
              type="text"
              required
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              placeholder="Your Email"
              type="email"
              required
              onChange={(e) => setUseremail(e.target.value)}
            />
            <Input
              placeholder="Enter password"
              type="password"
              required
              onChange={(e) => setUserpass(e.target.value)}
            />
            <Input
              placeholder="Confirm password"
              type="password"
              required
              onChange={(e) => setUserConfPass(e.target.value)}
            />
            <Button
              size="lg"
              colorScheme="teal"
              isLoading={loading}
              mt="24px"
              onClick={() => submitSignup()}
            >
              SignUp
            </Button>
            <hr />
            <Button
              size="lg"
              colorScheme="teal"
              mt="24px"
              onClick={gotoLoginPage}
            >
              Login
            </Button>
          </Stack>
        </CardBody>
        <CardFooter></CardFooter>
      </Card>
    </Flex>
  );
};

export default SignupPage;
