import { Box, SkeletonText, SkeletonCircle, Stack } from "@chakra-ui/react";
import React from "react";

const ConversationLoadingSkeleton = () => {
  return (
    <Stack spacing={6} p={4}>
      <Box display="flex" alignItems="center">
        <SkeletonCircle size="12" mr={4} />
        <Box flex="1">
          <SkeletonText noOfLines={1} skeletonHeight="4" w="40%" mb={2} />
          <SkeletonText noOfLines={1} skeletonHeight="3" w="60%" />
        </Box>
      </Box>

      <Box display="flex" alignItems="center">
        <SkeletonCircle size="12" mr={4} />
        <Box flex="1">
          <SkeletonText noOfLines={1} skeletonHeight="4" w="40%" mb={2} />
          <SkeletonText noOfLines={1} skeletonHeight="3" w="60%" />
        </Box>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="flex-end">
        <SkeletonCircle size="12" mr={4} />
        <Box flex="1">
          <SkeletonText noOfLines={1} skeletonHeight="4" w="40%" mb={2} />
          <SkeletonText noOfLines={1} skeletonHeight="3" w="60%" />
        </Box>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="flex-end">
        <SkeletonCircle size="12" mr={4} />
        <Box flex="1">
          <SkeletonText noOfLines={1} skeletonHeight="4" w="40%" mb={2} />
          <SkeletonText noOfLines={1} skeletonHeight="3" w="60%" />
        </Box>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="flex-end">
        <SkeletonCircle size="12" mr={4} />
        <Box flex="1">
          <SkeletonText noOfLines={1} skeletonHeight="4" w="40%" mb={2} />
          <SkeletonText noOfLines={1} skeletonHeight="3" w="60%" />
        </Box>
      </Box>

      <Box display="flex" alignItems="center" justifyContent="flex-end">
        <SkeletonCircle size="12" mr={4} />
        <Box flex="1">
          <SkeletonText noOfLines={1} skeletonHeight="4" w="40%" mb={2} />
          <SkeletonText noOfLines={1} skeletonHeight="3" w="60%" />
        </Box>
      </Box>
    </Stack>
  );
};

export default ConversationLoadingSkeleton;
