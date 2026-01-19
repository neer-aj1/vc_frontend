import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "./socket";
import { OnlineFriends, IncomingCall } from "./components";

function App() {
  const navigate = useNavigate();

  const socketRef = useRef(null);
  const localVideoRef = useRef(null);
  const localOverlayRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const streamRef = useRef(null);
  const pcRef = useRef(null);
  const currentCallUserRef = useRef(null);

  const [friends, setFriends] = useState([]);
  const [incomingCall, setIncomingCall] = useState(null);
  const [inCall, setInCall] = useState(false);

  /* ---------- MEDIA ---------- */
  const getLocalStream = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    streamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
      localVideoRef.current.srcObject = stream;
    }
  };

  /* ---------- CLEANUP ---------- */
  const cleanupCall = () => {
    if (pcRef.current) {
      pcRef.current.ontrack = null;
      pcRef.current.onicecandidate = null;
      pcRef.current.close();
      pcRef.current = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setInCall(false);
    currentCallUserRef.current = null;

    // 🔑 Force local preview restore
    if (localVideoRef.current && streamRef.current) {
      localVideoRef.current.srcObject = null;
      localVideoRef.current.srcObject = streamRef.current;
    }
  };

  /* ---------- INIT ---------- */
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    socketRef.current = connectSocket();
    getLocalStream();

    return () => {
      cleanupCall();
      socketRef.current?.disconnect();
    };
  }, [navigate]);

  /* ---------- PEER ---------- */
  const createPeerConnection = (remoteUserId) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    streamRef.current.getTracks().forEach((track) =>
      pc.addTrack(track, streamRef.current)
    );

    pc.ontrack = (e) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
      }
    };

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socketRef.current.emit("ice-candidate", {
          to: remoteUserId,
          candidate: e.candidate,
        });
      }
    };

    pc.onconnectionstatechange = () => {
      if (
        pc.connectionState === "disconnected" ||
        pc.connectionState === "failed" ||
        pc.connectionState === "closed"
      ) {
        cleanupCall();
      }
    };

    return pc;
  };

  /* ---------- CALL ---------- */
  const callUser = async (userId) => {
    currentCallUserRef.current = userId;
    setInCall(true);

    pcRef.current = createPeerConnection(userId);

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);

    socketRef.current.emit("call-offer", { to: userId, offer });

    localOverlayRef.current.srcObject = streamRef.current;
  };

  /* ---------- SOCKET ---------- */
  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    socket.on("online-friends", setFriends);
    socket.on("friend-online", (f) => setFriends((p) => [...p, f]));
    socket.on("friend-offline", ({ userId }) =>
      setFriends((p) => p.filter((f) => f.userId !== userId))
    );

    socket.on("call-offer", setIncomingCall);

    socket.on("call-answer", async (answer) => {
      await pcRef.current?.setRemoteDescription(answer);
    });

    socket.on("ice-candidate", async (candidate) => {
      await pcRef.current?.addIceCandidate(candidate);
    });

    socket.on("call-ended", ({ from }) => {
      if (from === currentCallUserRef.current) cleanupCall();
    });

    socket.on("call-rejected", cleanupCall);

    return () => socket.removeAllListeners();
  }, []);

  /* ---------- ACCEPT ---------- */
  const acceptCall = async () => {
    const { fromUserId, offer } = incomingCall;

    currentCallUserRef.current = fromUserId;
    setInCall(true);

    pcRef.current = createPeerConnection(fromUserId);

    await pcRef.current.setRemoteDescription(offer);

    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);

    socketRef.current.emit("call-answer", {
      to: fromUserId,
      answer,
    });

    localOverlayRef.current.srcObject = streamRef.current;
    setIncomingCall(null);
  };

  /* ---------- END ---------- */
  const endCall = () => {
    if (currentCallUserRef.current) {
      socketRef.current.emit("call-ended", {
        to: currentCallUserRef.current,
      });
    }
    cleanupCall();
  };

  return (
    <main className="p-4">
      {!inCall && <OnlineFriends friends={friends} onCall={callUser} />}

      {incomingCall && (
        <IncomingCall
          from={incomingCall.fromUserEmail}
          accept={acceptCall}
          reject={() => setIncomingCall(null)}
        />
      )}

      <div className="relative w-full h-[500px] bg-black overflow-hidden">
  {/* Local full preview (no call) */}
  {!inCall && (
    <video
      ref={localVideoRef}
      autoPlay
      muted
      playsInline
      className="w-full h-full object-cover -scale-x-100"
    />
  )}

  {/* Call UI */}
  {inCall && (
    <>
      {/* Friend video FULL */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover -scale-x-100"
      />

      {/* Local video SMALL */}
      <video
        ref={localOverlayRef}
        autoPlay
        muted
        playsInline
        className="absolute bottom-4 right-4 w-36 h-28 object-cover border-2 border-white rounded-md shadow-lg z-20 -scale-x-100"
      />

      {/* End call button */}
      <button
        onClick={endCall}
        className="absolute bottom-4 left-4 bg-red-600 text-white px-5 py-2 rounded-full shadow-lg z-30 hover:bg-red-700"
      >
        End Call
      </button>
    </>
  )}
</div>

    </main>
  );
}

export default App;
