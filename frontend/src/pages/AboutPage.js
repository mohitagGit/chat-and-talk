import React from "react";
import {
  Card,
  CardHeader,
  Heading,
  CardBody,
  Stack,
  Flex,
  Link,
} from "@chakra-ui/react";
import BackButton from "../components/BackButton";

function AboutPage() {
  return (
    <Flex direction="column" h="100vh" maxW="lg" mx="auto" p={4} bg="lightgray">
      <Card p={4}>
        <BackButton />
        <CardHeader>
          <Heading size="md" fontSize="30px">
            Vartalaap v1.1.0
          </Heading>
        </CardHeader>
        <CardBody>
          <Stack bg="" w="100%" p={4} color="" spacing={5}>
            <div>
              This Vartalaap app is designed by{" "}
              <Link
                href="https://github.com/mohitagGit"
                color="teal.500"
                isExternal
              >
                Mohit{" "}
              </Link>
              for Audio/Video call and messaging. Developed using ReactJs,
              Chakra-UI, NodeJs and MongoDB
            </div>
          </Stack>
        </CardBody>
      </Card>
    </Flex>
  );
}

export default AboutPage;
