import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Peer from "simple-peer";
import io from "socket.io-client";
import "../../src/App.css";
import { Box, IconButton } from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import {
  FaVideo,
  FaVideoSlash,
  FaMicrophone,
  FaMicrophoneSlash,
} from "react-icons/fa";
import { Button, Flex, Card, Center, useToast } from "@chakra-ui/react";
import { PhoneIcon } from "@chakra-ui/icons";
import process from "process";
import BackButton from "../components/BackButton";
import incomingCallAudioFile from "../sounds/incoming_call.mp3";
window.process = process;

// Connect to the Node.js backend
var backend_url = "http://localhost:4000";
if (window.location.host === "varta-ls5r.onrender.com") {
  backend_url = "https://varta-ls5r.onrender.com";
}
const socket = io.connect(backend_url);

const VideoCallPage = () => {
  const { currentUser } = useAuth();
  const { chatId } = useParams();
  const [stream, setStream] = useState();
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [receivingCall, setReceivingCall] = useState(false);
  const [caller, setCaller] = useState("");
  const [callerSignal, setCallerSignal] = useState();
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");
  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();
  const callAudioRef = useRef(null);
  const toast = useToast();

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
        if (myVideo.current) {
          myVideo.current.srcObject = currentStream;
        }
      });

    socket.on("RECEIVE_CALL", (data) => {
      console.log("User calling data: ", data);
      if (data.initiator_id !== currentUser.id) {
        setReceivingCall(true);
        setCaller(data.from);
        setName(data.name);
        setCallerSignal(data.signal);
        playIncomingCallAudio();
      }
    });

    socket.on("CALL_DECLINED", (data) => {
      console.log("Call declined by the other user");
      setCallAccepted(false);
      toast({
        title: "Call Declined",
        description: `Call declined by ${data.from}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });

    socket.on("CALL_ENDED", (data) => {
      console.log("Call disconnected by the other user");
      setCallEnded(true);
      toast({
        title: "Call Ended",
        description: `Call ended by ${data.from}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });

    socket.emit("JOINED_CALL_ROOM", chatId);

    // Clean up the stream on page change
    return () => {
      socket.emit("END_CALL", { to: caller, from: currentUser });
      socket.off("RECEIVE_CALL");
      socket.off("CALL_ACCEPTED");
    };
  }, []);

  // to play incoming call audio
  const playIncomingCallAudio = () => {
    if (!callAudioRef.current) {
      callAudioRef.current = new Audio(incomingCallAudioFile);
    }

    callAudioRef.current.loop = true;
    callAudioRef.current.play().catch((error) => {
      console.error("Error playing incoming call sound:", error);
    });
  };

  const pauseIncomingCallAudio = () => {
    if (callAudioRef.current) {
      callAudioRef.current.pause();
      callAudioRef.current.currentTime = 0;
    }
  };

  const callUserHandler = () => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("CALL_USER", {
        userToCall: chatId,
        signalData: data,
        initiator_id: currentUser.id,
        name: currentUser.name,
      });
    });
    peer.on("stream", (remoteStream) => {
      userVideo.current.srcObject = remoteStream;
    });
    socket.on("CALL_ACCEPTED", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
      console.log("Call accepted: ", signal);
    });

    connectionRef.current = peer;
  };

  const answerCall = () => {
    setCallAccepted(true);
    pauseIncomingCallAudio();
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream: stream,
    });
    peer.on("signal", (data) => {
      socket.emit("ANSWER_CALL", { signal: data, to: caller });
    });
    peer.on("stream", (remoteStream) => {
      userVideo.current.srcObject = remoteStream;
    });

    peer.signal(callerSignal);
    connectionRef.current = peer;
  };

  const declineCall = () => {
    // Notify the caller that the call is declined
    socket.emit("DECLINE_CALL", { to: caller, from: currentUser });
    setReceivingCall(false);
    setCallAccepted(false);
    pauseIncomingCallAudio();
  };

  const leaveCall = () => {
    socket.emit("END_CALL", { to: caller, from: currentUser });
    setCallEnded(true);
    connectionRef.current.destroy();
  };

  const toggleAudio = () => {
    if (stream) {
      stream.getAudioTracks()[0].enabled = !audioEnabled;
      setAudioEnabled(!audioEnabled);
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      videoTrack.enabled = !videoEnabled;
      setVideoEnabled(videoTrack.enabled);
    }
  };

  return (
    <Flex direction="column" h="100vh" maxW="lg" mx="auto" p={4} bg="lightgray">
      <Card p={4}>
        <BackButton link={`/chats/${chatId}/edit`} />
        <div className="container">
          <div className="video-container">
            <div className="video">
              {stream && (
                <>
                  <Center>
                    <video
                      playsInline
                      muted
                      ref={myVideo}
                      autoPlay
                      style={{ width: "150px", border: "1px solid black" }}
                    />
                  </Center>
                  <div style={{ textAlign: "center" }}>
                    You: {currentUser.name}
                  </div>
                </>
              )}
            </div>
            <div className="video">
              {callAccepted && !callEnded ? (
                <>
                  <Center>
                    <video
                      playsInline
                      ref={userVideo}
                      autoPlay
                      style={{ width: "auto", border: "1px solid black" }}
                    />
                  </Center>
                  <div style={{ textAlign: "center" }}>{name}</div>
                </>
              ) : null}
            </div>
            <>
              <IconButton
                aria-label="Toggle Audio"
                icon={audioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
                color={audioEnabled ? "teal.500" : "red.500"}
                onClick={toggleAudio}
              />
              <IconButton
                aria-label="Toggle Video"
                icon={videoEnabled ? <FaVideo /> : <FaVideoSlash />}
                color={videoEnabled ? "teal.500" : "red.500"}
                onClick={toggleVideo}
              />
              {/* {callAccepted && !callEnded && (
                <IconButton
                  aria-label="End Call"
                  icon={<FaPhone />}
                  color="red.500"
                  onClick={leaveCall}
                />
              )} */}
            </>
          </div>

          <div className="myId">
            {callAccepted && !callEnded ? (
              <Button
                size="md"
                variant="link"
                colorScheme="red"
                onClick={leaveCall}
              >
                End
              </Button>
            ) : (
              <Button
                color="primary"
                aria-label="call"
                onClick={() => callUserHandler()}
              >
                <PhoneIcon fontSize="large" />
              </Button>
            )}
          </div>
          <div>
            {receivingCall && !callAccepted ? (
              <div className="video-container">
                <Box>
                  <h1>{name} is calling...</h1>
                </Box>
                <Box>
                  <Button colorScheme="green" m={4} onClick={answerCall}>
                    Accept
                  </Button>
                  <Button colorScheme="red" m={4} onClick={declineCall} ml={2}>
                    Decline
                  </Button>
                </Box>
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </Flex>
  );
};

export default VideoCallPage;
