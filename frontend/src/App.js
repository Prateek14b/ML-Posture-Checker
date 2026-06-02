import logo from './logo.svg';
import './App.css';
import {useRef, useEffect, useState} from "react";
import {Pose} from "@mediapipe/pose";
import {Camera} from "@mediapipe/camera_utils";
import {drawConnectors, drawLandmarks} from "@mediapipe/drawing_utils"
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

    if (neckAngle < 15 && shoulderDiff < 1) {
        risk = "low-risk";
    }
    else if (
        (neckAngle >= 15 && neckAngle <= 20) ||
        (shoulderDiff >= 1 && shoulderDiff <= 3)
    ) {
        risk = "medium-risk";
    }
    else {
        risk = "high-risk";
    }

    return { risk, issues, angles: {neckAngle: neckAngle.toFixed(1), shoulderDiff: shoulderDiff.toFixed(1)}}; //toFixed(int) is the js equivalent of typecasting int to str, and to a specific number of dp as specified by the value within brackets(1, in this case).
  }


  //constructor to initialise Camera object to draw in webcam feed's frames into Pose object. this is a predefined async function, that waits to hear back if webcam captured new frame via the internal promise function 'pose.send(image: videoElement)
  //constructor to initialise MediaPipe Pose object, which returns coordinate list called postlandmarks. if poselandmarks array exists, then draw canvas appropriately and run our helper functions to set states for feedback, angles, and issues objects!

  //then we encapsulate this entire process within a function because all of this is a sequential set of tasks that must all run FOR EVERY SINGLE CAPTURED FRAME.
  //so, overall, the workflow goes like webcame frame captured by Camera object, then this function runs to produce results, and repeat until camera object's state is closed.
  function startCamera() { 
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
    });

    pose.setOptions({
      modelComplexity: 2, 
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    pose.onResults((results) => { //this callback only fires if the internal 'results' object is populated with the 33 landmark coordinates.
      //now we define what to do if our promise is true and we do have coordinates in our hands; we do 2 things in this case: redraw the canvas with the coordinates so its visible to the user AND mainly classify posture and issues based on our helper functions' logic from earlier.
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      //clear canvas and draw current video frame onto it first.
      ctx.clearRect(0,0,canvas.width, canvas.height);
      ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height); //im assuming this results objects also contains the canvas image

      if (results.poseLandmarks) { //just a guard so that we only proceed if the coordinate list is present in the results object.
        //first we draw the skeleton overlay on top of the video frame on canvas
        drawConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, {color: "#00ff00", lineWidth: 2});
        drawLandmarks(ctx, results.poseLandmarks, { color: "#ff0000", lineWidth: 1, radius: 3});

        //now finally we update states of feedback and posture classification objects based on our helper function.
        const { risk, issues, angles}=classifyPosture(results.poseLandmarks);
        setPosture(risk);
        setFeedback(issues);
        setAngles(angles);
      }
    });

    const camera = new Camera(videoRef.current, { //the Camera object's job is to pipe in the webcam frame into the Pose processing above. Since the Camera class has a callback function that depends on whether a new frame was captured by the webcam, that means as long as the user keeps the webcam running, this runs continuously per new frame like a loop!
      onFrame: async () => {
        await pose.send({image: videoRef.current});
      },
      width: 640,
      height: 480,
    });

    camera.start();
    cameraRef.current=camera;
    setStarted(true);
  }

  function stopCamera() { //this is run when user clicks on the camera button to disable webcam.
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    setStarted(false);
    setPosture(null);
    setFeedback([]);
    setAngles({});
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