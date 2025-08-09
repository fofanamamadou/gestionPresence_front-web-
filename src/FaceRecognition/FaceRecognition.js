// // FaceRecognition.js
// import React, { useEffect, useRef, useState } from "react";
// import * as faceapi from "face-api.js";
// import "./FaceRecognition.css";

// const FaceRecognition = ({ onClose }) => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const loadModels = async () => {
//       const MODEL_URL = "/models"; // à placer dans public/models
//       await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
//       setLoading(false);
//       startVideo();
//     };

//     const startVideo = () => {
//       navigator.mediaDevices
//         .getUserMedia({ video: true })
//         .then((stream) => {
//           videoRef.current.srcObject = stream;
//         })
//         .catch((err) => {
//           console.error("Erreur accès caméra", err);
//         });
//     };

//     loadModels();
//   }, []);

//   const handleVideoPlay = () => {
//     const interval = setInterval(async () => {
//       if (!videoRef.current || videoRef.current.paused) return;

//       const detections = await faceapi.detectAllFaces(
//         videoRef.current,
//         new faceapi.TinyFaceDetectorOptions()
//       );

//       const canvas = canvasRef.current;
//       const displaySize = {
//         width: videoRef.current.videoWidth,
//         height: videoRef.current.videoHeight,
//       };
//       faceapi.matchDimensions(canvas, displaySize);
//       const resizedDetections = faceapi.resizeResults(detections, displaySize);
//       canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
//       faceapi.draw.drawDetections(canvas, resizedDetections);

//       if (detections.length > 0) {
//         console.log("Visage détecté !");
//         // Ici tu peux déclencher un événement de pointage
//       }
//     }, 500);

//     return () => clearInterval(interval);
//   };

//   return (
//     <div className="face-recognition-container">
//       <button className="close-btn" onClick={onClose}>✖</button>
//       {loading ? (
//         <p>Chargement des modèles...</p>
//       ) : (
//         <div className="video-wrapper">
//           <video
//             ref={videoRef}
//             autoPlay
//             muted
//             onPlay={handleVideoPlay}
//             width="640"
//             height="480"
//           />
//           <canvas ref={canvasRef} width="640" height="480" />
//         </div>
//       )}
//     </div>
//   );
// };

// export default FaceRecognition;
