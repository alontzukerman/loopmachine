import React, { useContext, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { TimeInSeconds } from "../context";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import StopIcon from "@material-ui/icons/Stop";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import SentimentDissatisfiedRoundedIcon from "@material-ui/icons/SentimentDissatisfiedRounded";
import SentimentSatisfiedRoundedIcon from "@material-ui/icons/SentimentSatisfiedRounded";
import FiberManualRecordOutlinedIcon from "@material-ui/icons/FiberManualRecordOutlined";
import FiberManualRecordTwoToneIcon from '@material-ui/icons/FiberManualRecordTwoTone';
import { eventBus } from "../EventBus";
import Recorder from "../Recorder";

function ControlPanel({ handleState }) {
  const [start, setStart] = useState(false); // on/off state
  const [toggle, setToggle] = useState(false); // toggle control panel
  const [isRecording, setIsRecording] = useState(false); // is recording on/off
  const [record, setRecord] = useState(null); 
  // const [myRecords, setMyRecords] = useState([]);

  const recordRef = useRef(null); // record element ref

  const time = useContext(TimeInSeconds); // get context

  const startRecord = () => { // on start recording
    // set settings
    let rec = null;
    const constraints = { audio: true, video: true };
    navigator.mediaDevices
      .getDisplayMedia(constraints)
      .then((stream) => {
        const audioContext = new window.AudioContext();
        const input = audioContext.createMediaStreamSource(stream);
        rec = new Recorder(input, { numChannels: 1 }); 
        rec.record(); // start record
        setRecord(rec);
      })
      .catch((err) => {
        setIsRecording(false);
        console.log(err);
      });
  };

  const stopRecord = () => { // on stop recording
    record.stop();
    record.exportWAV((blob) => {
      let blobUrl = URL.createObjectURL(blob);
      // console.log(blobUrl);
      let date = Date.now();
      let newRecord = { record: blobUrl, date: date };
      eventBus.dispatch("newRecord", { newRecord }); // send new record 

    });
  };

  const handleClick = (bool) => { // handle start,stop,reset 
    if (!bool && bool === start) { // reset pads and time when pause and clicked reset
      time.setTimeInSeconds(0);
      eventBus.dispatch("resetPads", { message: "reset pads" });
    }
    if (bool !== start) { // handle play and pause
      setStart(bool);
      handleState(bool);
    }
  };
  const setAllPads = (bool) => { // send event to turn on/off all pads
    eventBus.dispatch("setPadsOn", { message: bool });
  };
  const handleToggle = () => { // handle toggle 
    // console.log(toggle);
    setToggle(!toggle);
  };

  const handleRecord = () => { // handle record button
    isRecording ? stopRecord() : startRecord();
    setIsRecording(!isRecording);
  };

  return (
    <StyledPanel toggle={toggle}>
      <TogglePanel onClick={() => handleToggle()}>
        {toggle ? (
          <ExpandMoreIcon fontSize="large" />
        ) : (
          <ExpandLessIcon fontSize="large" />
        )}
      </TogglePanel>
      <PanelButtons>
        <StyledIcons>
          <IconDiv onClick={() => handleClick(!start)}>
            {start ? (
              <PauseIcon fontSize="large" />
            ) : (
              <PlayArrowIcon fontSize="large" />
            )}
          </IconDiv>
          <IconDiv onClick={() => handleClick(false)}>
            <StopIcon fontSize="large" />
          </IconDiv>
          <IconDiv onClick={() => setAllPads(false)}>
            <SentimentDissatisfiedRoundedIcon />
          </IconDiv>
          <IconDiv onClick={() => setAllPads(true)}>
            <SentimentSatisfiedRoundedIcon />
          </IconDiv>
          <IconDiv onClick={() => handleRecord()}>
            {isRecording ? (
              <FiberManualRecordTwoToneIcon />
            ) : (
              <FiberManualRecordOutlinedIcon  fontSize="small" />
            )}
          </IconDiv>
        </StyledIcons>
        <Time>{`00:0${time.timeInSeconds.toFixed(0)}`}</Time>
      </PanelButtons>
      <audio ref={recordRef} />
    </StyledPanel>
  );
}

// styled components

const StyledPanel = styled.div`
  height: 100px;
  width: 100%;
  background-color: rgba(100, 100, 100, 0.6);
  color: #f9f9f9;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: absolute;
  bottom: 0;
  transition: transform 0.2s ease;
  transform: ${(props) =>
    props.toggle ? "translateY(0)" : "translateY(90px)"};
  @media (max-width: 480px) {
    & > div:nth-child(2) {
      flex-direction: column-reverse ;
    }
  }
`;

const TogglePanel = styled.div`
  cursor: pointer;
  height: 40px;
  width: 40px;
  margin-top: -30px;
`;
const PanelButtons = styled.div`
  height: 90px;
  width: 95%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const StyledIcons = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
const IconDiv = styled.div`
  cursor: pointer;
  height: 40px;
  width: 40px;
  display: flex;
  background-color: rgb(139, 82, 82);
  border-radius: 50%;
  margin-right: 10px;
  justify-content: center;
  align-items: center;
  &:hover {
    background-color: rgb(119, 53, 53);
  }
`;

const Time = styled.div`
  height: 40px;
  width: 150px;
  font-size: 1.5em;
  font-weight: bold;
  letter-spacing: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgb(139, 82, 82);
  border-radius: 5px;
`;
export default ControlPanel;
