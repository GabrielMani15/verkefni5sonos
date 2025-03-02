"use client";
import React, { useEffect, useState } from "react";

export function TouchPad({ currentDevice, apiService, onTogglePlayPause }) {
  const [swipeDirection, setSwipeDirection] = useState("");
  const [cornerClick, setCornerClick] = useState("");
  const [doubleClick, setDoubleClick] = useState(false);
  let touchStartX = 0;
  let touchStartY = 0;

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];
    const diffX = touch.clientX - touchStartX;
    const diffY = touch.clientY - touchStartY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        setSwipeDirection("Swipe Right");
      } else {
        setSwipeDirection("Swipe Left");
      }
    } else {
      if (diffY > 0) {
        setSwipeDirection("Swipe Down");
      } else {
        setSwipeDirection("Swipe Up");
      }
    }
  };

  const handleTouchEnd = () => {
    setSwipeDirection("");
  };

  const handleClick = (e) => {
    const touchPad = e.currentTarget;
    const rect = touchPad.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const threshold = 50; 

    if (clickX < threshold && clickY < threshold) {
      setCornerClick("Top Left");
    } else if (clickX > rect.width - threshold && clickY < threshold) {
      setCornerClick("Top Right");
    } else if (clickX < threshold && clickY > rect.height - threshold) {
      setCornerClick("Bottom Left");
    } else if (
      clickX > rect.width - threshold &&
      clickY > rect.height - threshold
    ) {
      setCornerClick("Bottom Right");
    }

    setTimeout(() => {
      setCornerClick("");
    }, 1000); 
  };

  const handleDoubleClick = () => {
    setDoubleClick(true);
    setTimeout(() => setDoubleClick(false), 300);
  };

  useEffect(() => {
    const touchPad = document.getElementById("touchPad");
    touchPad.addEventListener("touchstart", handleTouchStart);
    touchPad.addEventListener("touchmove", handleTouchMove);
    touchPad.addEventListener("touchend", handleTouchEnd);
    touchPad.addEventListener("click", handleClick);
    touchPad.addEventListener("dblclick", handleDoubleClick);

    return () => {
      touchPad.removeEventListener("touchstart", handleTouchStart);
      touchPad.removeEventListener("touchmove", handleTouchMove);
      touchPad.removeEventListener("touchend", handleTouchEnd);
      touchPad.removeEventListener("click", handleClick);
      touchPad.removeEventListener("dblclick", handleDoubleClick);
    };
  }, []);

  const handleChange = async (command) => {
    await apiService.sendDeviceCommand(currentDevice, command);
  };

  useEffect(() => {
    console.log("Touch connected to:", currentDevice);

    switch (swipeDirection) {
      case "Swipe Right":
        console.log("Action for Swipe Right");
        handleChange("nextTrack");
        break;
      case "Swipe Left":
        console.log("Action for Swipe Left");
        handleChange("previousTrack");
        break;
      case "Swipe Up":
        console.log("Action for Swipe Up");
        handleChange("volumeUp");

        break;
      case "Swipe Down":
        console.log("Action for Swipe Down");
        handleChange("volumeDown");
        break;
      default:
        break;
    }

    const test = async () => {
      await apiService.sendDeviceCommand(
        currentDevice,
        "play",
        undefined,
        "x-sonos-spotify:spotify%3atrack%3a2AI6kH6ogznIwt4JKDWy05?sid=9&flags=8224&sn=1"
      );
    };

    if (cornerClick) {
      console.log(`Corner clicked: ${cornerClick}`);
      console.warn("No config found on corner click - Warn");
      test();
    }

    if (doubleClick) {
      console.log("Double Click detected!");
      onTogglePlayPause();
    }
  }, [swipeDirection, cornerClick, doubleClick, currentDevice]);

  return (
    <section
      id="touchPad"
      className="relative my-3 flex h-full w-full min-h-[8.75rem] max-h-52 animate-pulse flex-col items-center justify-center rounded-[0.563rem] border-2 border-[#7c7c7c3e] bg-[#FAFAFA] text-xl font-semibold"
    >
      {swipeDirection || cornerClick || (doubleClick ? "Double Clicked!" : "")}
    </section>
  );
}
