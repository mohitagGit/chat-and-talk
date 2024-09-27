import { Flex } from "@chakra-ui/react";
import React from "react";

export const NotfoundPage = () => {
  return (
    <Flex direction="column" h="100vh" maxW="lg" mx="auto" p={4} bg="lightgray">
      <div>This page is not available!</div>
    </Flex>
  );
};
