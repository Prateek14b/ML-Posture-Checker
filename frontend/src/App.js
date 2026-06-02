import logo from './logo.svg';
import './App.css';
import {useRef, useEffect, useState} from "react";
import {Pose} from "@mediapipe/pose";
import {Camera} from "@mediapipe/camera_utils";
import {drawConnectors, drawLadmarks} from "@mediapipe/drawing_utils"
import {POSE_CONNECTIONS} from "@mediapipe/pose";

export default function App(){
  const videoRef = useRef(null); // points to the hidden <video> element (webcam feed)
  const canvasRef = useRef(null); //points to <canvas> where we draw the skeleton overlay
  const [started, setStarted] = useState(false); //whether webcam is running
  const [posture, setPosture] = useState(null); //"good", "medium", "high"
  const [feedback, setFeedback] = useState([]); //list of specific issues e.g: ["neck too forward"]
  const [angles, setAngles] = useState({}); //raw angle values to display
  const cameraRef = useRef(null); //holds MediaPipe camera instance so we can stop it 
}
  //from here on, all marked points on the body's canvas
  //are IN COORDINATE AXIS. So, they have an x and y component.

  //to calculate angle b/w 2 points, via arc tan(opp/adj)
  function calculateAngle(point1, point2){
    const dy = point2.y - point1.y;
    const dx = point2.x - point1.x;
    return Math.abs(Math.atan2(dx,dy) * (180/Math.PI));
  }

  function shoulderLevelness(leftShoulder, rightShoulder){
    return Math.abs(leftShoulder.y - rightShoulder.y) * 100;
  }

  // ---POSTURE CLASSIFICATION ---
  function classifyPosture(landmarks){
    //MediaPipe identifies 33 landmarks on the body,
    //and each numbered landmark is preset to a specific
    //part of the body. You can check its docs to be sure which
    // numbers correspond to the shoulders and stuff.

    const nose = landmarks[0];
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftEar = landmarks[7];
    const rightEar = landmarks[8];

    //neck angle - angle b/w ear & shoulder 
    //if head is forward, angle rises!

    const NeckAngle = calculateAngle(
      {x: (leftEar.x + rightEar.x) / 2, y: (leftEar.y + rightEar.y) / 2},
      {x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2}
    );

    const shoulderDiff = shoulderLevelness(leftShoulder, rightShoulder);
    
    const issues = [];
    if (neckAngle > 20) issues.push("Neck too far forward");
    if (shoulderDiff > 3) issues.push("Shoulders uneven");

    let risk;
    if (issues.length===0) risk="low-risk";
    else if (shoulderDiff in Range(0,3) && neckAngle in Range(0,20)) risk="medium-risk"
    else risk="high-risk"

    return { risk, issues, angles: {neckAngle: neckAngle.toFixed(1), shoulderDiff: shoulderDiff.toFixed(1)}}; //toFixed(int) is the js equivalent of typecasting int to str, and to a specific number of dp as specified by the value within brackets(1, in this case).
  }



  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}