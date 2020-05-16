import React, { useState, check, useEffect } from 'react';
import { NodeCameraView } from 'react-native-nodemediaclient';
import axios from 'axios';
import { Text, View, TouchableOpacity } from 'react-native';

import { PERMISSIONS, check, request } from 'react-native-permissions';

const LiveVideo = () => {
  state = {
    isPublish: true,
    publishBtnTitle: '',
  }

  const [cameraGranted, setCameraGranted] = useState(false);
  const handleCameraPermission = async () => {
    const res = await check(PERMISSIONS.IOS.CAMERA);
    if (res === RESULTS.GRANTED) {
      setCameraGranted(true);
    } else if (res === RESULTS.DENIED) {
      const res2 = await request(PERMISSIONS.IOS.CAMERA);
      res2 === RESULTS.GRANTED 
        ? setCameraGranted(true) : setCameraGranted(false);
    }
 };

 useEffect(() => {
  handleCameraPermission();
  }, []);

  return (
    <div>
      {cameraGranted
         ? <Text>Camera Granted! Display in-app camera...</Text> 
        : <Text>Camera Disallowed</Text>
      }
    <NodeCameraView
      style={{height: 400}}
      ref={(vb) => { this.vb = vb; }}
      outputUrl={"rtmp://localhost:8080/live/stream"}
      camera={{ cameraId: 1, cameraFrontMirror: true }}
      audio={{ bitrate: 32000, profile: 1, samplerate: 44100 }}
      video={{
        preset: 12, bitrate: 400000, profile: 1, fps: 15, videoFrontMirror: false,
      }}
      autopreview={true}
    />
    <Button title="request permissions" onPress={requestCameraPermission} />
  <Button
  onPress={() => {
    if (this.state.isPublish) {
      this.setState({ publishBtnTitle: 'Start Publish', isPublish: false });
      this.vb.stop();
    } else {
      this.setState({ publishBtnTitle: 'Stop Publish', isPublish: true });
      this.vb.start();
    }
  }}
    title={this.state.publishBtnTitle}
    color="#841584"
  />
  </div>
  );
};

export default LiveVideo;