import { Box, SkeletonText, SkeletonCircle, Stack } from "@chakra-ui/react";
import React from "react";

const ChatLoadingSkeleton = () => {
  return (
    <Stack spacing={8} p={4}>
      <Box display="flex" alignItems="center">
        <SkeletonCircle size="10" mr={4} />
        <SkeletonText noOfLines={2} spacing="4" skeletonHeight="5" w="full" />
      </Box>

      <Box display="flex" alignItems="center">
        <SkeletonCircle size="10" mr={4} />
        <SkeletonText noOfLines={2} spacing="4" skeletonHeight="5" w="full" />
      </Box>

      <Box display="flex" alignItems="center">
        <SkeletonCircle size="10" mr={4} />
        <SkeletonText noOfLines={2} spacing="4" skeletonHeight="5" w="full" />
      </Box>

      <Box display="flex" alignItems="center">
        <SkeletonCircle size="10" mr={4} />
        <SkeletonText noOfLines={2} spacing="4" skeletonHeight="5" w="full" />
      </Box>

      <Box display="flex" alignItems="center">
        <SkeletonCircle size="10" mr={4} />
        <SkeletonText noOfLines={2} spacing="4" skeletonHeight="5" w="full" />
      </Box>

      <Box display="flex" alignItems="center">
        <SkeletonCircle size="10" mr={4} />
        <SkeletonText noOfLines={2} spacing="4" skeletonHeight="5" w="full" />
      </Box>

      <Box display="flex" alignItems="center">
        <SkeletonCircle size="10" mr={4} />
        <SkeletonText noOfLines={2} spacing="4" skeletonHeight="5" w="full" />
      </Box>

      <Box display="flex" alignItems="center">
        <SkeletonCircle size="10" mr={4} />
        <SkeletonText noOfLines={2} spacing="4" skeletonHeight="5" w="full" />
      </Box>
    </Stack>
  );
};

export default ChatLoadingSkeleton;
