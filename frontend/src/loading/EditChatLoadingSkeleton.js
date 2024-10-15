import { Box, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import React from "react";

export const EditChatLoadingSkeleton = () => {
  return (
    <Box padding="6" boxShadow="lg" bg="white" textAlign="center">
      <SkeletonCircle size="20" />
      <SkeletonText mt="4" noOfLines={8} spacing="4" skeletonHeight="2" />
    </Box>
  );
};
