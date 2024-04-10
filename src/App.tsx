import "./App.css";
import { useState, useEffect, useRef } from "react";
import doorbell from './mixkit-home-standard-ding-dong-109.wav'
import { FaArrowDown,FaArrowUp,FaPause,FaPlay } from "react-icons/fa";
import { BsFillSkipEndFill } from "react-icons/bs";
import { LuTimerReset } from "react-icons/lu";
interface ClockProps {
  curr: number;
}
interface IncProps {
  inc: boolean;
}

function Clock({ curr }: ClockProps) {
  let minutes = Math.floor(curr / 60);
  let seconds = curr - minutes * 60;
  let display = String(minutes<10?'0'+String(minutes):minutes) + ":" + String(seconds<10?'0'+String(seconds):seconds);

  return <div id="time-left">{display}</div>;
}

function App() {
  const displayId = useRef<number|undefined>();

  const [breakL, setBreakL] = useState(5);
  const [sessionL, setSessionL] = useState(25);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState("Session");
  const [time, setTime] = useState(25 * 60);

  const audio=(document.getElementById("beep") as HTMLAudioElement);
  function playSound() {
    audio.play();
  }

  function startStop() {
    setIsActive((previous) => {
      return !previous;
    });

  }

  function reset() {
    setBreakL(() => 5);
    setSessionL(() => 25);
    setCurrentPhase(() => "Session");
    setIsActive(() => false);
    setTime(() => 25 * 60);
    audio?.pause();
    audio.currentTime = 0;
  }

  useEffect(() => {
    const display = setInterval(() => {
      if (isActive) {
        setTime((prev) => {
          if (prev == 0) {
            playSound();
            setCurrentPhase((prevPhase) => {
              if (prevPhase == "Session") {
                return "Break";
              } else {
                return "Session";
              }
            });
            if (currentPhase == "Break") {
              return sessionL * 60;
            } else {
              return breakL * 60;
            }
          } else {
            return prev - 1;
          }
        });
      } else {
        clearInterval(displayId.current);
      }
    }, 1000);
    displayId.current = display;
    return () => {
      clearInterval(displayId.current);
    };
  }, [isActive, breakL, currentPhase, sessionL]);

  useEffect(() => {
    if(currentPhase=="Break"){
      document.body.style.backgroundColor='#456990';
      document.querySelector('.b')?.classList.add('btnwhenbreak');
      document.querySelector('.s')?.classList.add('btnwhenbreak');
    }
    else{
      document.body.style.backgroundColor = 'initial';
      document.querySelector('.b')?.classList.remove('btnwhenbreak');
      document.querySelector('.s')?.classList.remove('btnwhenbreak');
    }
  },[currentPhase]);

  function incBreak({inc}:IncProps) {
    if (!isActive) {
      let increase = inc ? 1 : -1;
      setBreakL((prev) => {
        if (prev == 1 && increase == -1) {
          return 1;
        } else if (prev == 60 && increase == 1) {
          return 60;
        }
        return prev + increase;
      });

      if (currentPhase == "Break") {
        setTime((prev) => {
          if (prev >= 60*60 && increase == 1) {
            return prev;
          } else if (prev <=60 && increase == -1) {
            return prev;
          }
          return (breakL + increase) * 60;
        });
      }
    }
  }

  function incSession({ inc }: IncProps) {
    if (!isActive) {
      let increase = inc ? 1 : -1;
      setSessionL((prev) => {
        if (prev == 1 && increase == -1) {
          return 1;
        } else if (prev == 60 && increase == 1) {
          return 60;
        }
        return prev + increase;
      });

      if (currentPhase == "Session") {
        setTime((prev) => {
          if (prev >= 60 * 60 && increase == 1) {
            return prev;
          } else if (prev <= 1 * 60 && increase == -1) {
            return prev;
          }
          return (sessionL + increase) * 60;
        });
      }
    }
  }
  const skip=()=>{
      setCurrentPhase((prevPhase) => {
        if (prevPhase == "Session") {
          return "Break";
        } else {
          return "Session";
        }
      });
      if (currentPhase == "Break") {
        setTime(sessionL * 60);
      } else {
        setTime(breakL * 60);
      }
  }

  return (
    <div className="container">
      <h1>Pomodoro Clock</h1>
      <div className="bs">
        <div className="b">
          <label id="break-label">Break Length</label>
          <div className="break-display">
            <button id="break-decrement" onClick={() => {incBreak({ inc: false });}}><FaArrowDown/></button>
            <label id="break-length">{String(breakL)}</label>
            <button id="break-increment" onClick={() => { incBreak({ inc: true });}}><FaArrowUp/></button>
          </div>
        </div>

        <div className="s">
          <label id="session-label">Session Length</label>
          <div className="session-display">
            <button id="session-decrement" onClick={() => {incSession({ inc: false });}}><FaArrowDown/></button>
            <label id="session-length">{String(sessionL)}</label>
            <button id="session-increment" onClick={() => { incSession({ inc: true });}}><FaArrowUp/></button>
          </div>
        </div>
      </div>
      <div className="timer">
        <label id="timer-label">{currentPhase}</label>
        <Clock curr={time} />
        <audio id="beep" src={doorbell}></audio>
        <div className="st">
          <button id="start_stop" onClick={startStop}>{isActive ? <FaPause/> : <FaPlay/>}</button>
          <button id="skip" onClick={skip}><BsFillSkipEndFill/></button>
          <button id="reset" onClick={reset}><LuTimerReset /></button>
        </div>
      </div>
    </div>
  );
}

export default App;

