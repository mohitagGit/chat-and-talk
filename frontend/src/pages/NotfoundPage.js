import { Card, Flex } from "@chakra-ui/react";
import React from "react";
import BackToHomeButton from "../components/BackToHomeButton";

export const NotfoundPage = () => {
  return (
    <Flex direction="column" h="100vh" maxW="lg" mx="auto" p={4} bg="lightgray">
      <Card p={4}>
        <BackToHomeButton />
        <div>404</div>
        <div>This page is not available!</div>
      </Card>
    </Flex>
  );
};
