"use client";
import React, { useEffect, useState } from "react";
import useDevice from "@/app/libs/useDevice";

export function TouchPad({ device }) {
  const [swipeDirection, setSwipeDirection] = useState("");
  const [cornerClick, setCornerClick] = useState("");
  const [doubleClick, setDoubleClick] = useState(false);

  const { sendDeviceCommand } = useDevice(device);

  let touchStartX = 0;
  let touchStartY = 0;
  /* 
  useEffect(() => {
    const preventDefault = (e) => e.preventDefault();

    document.addEventListener("touchmove", preventDefault, { passive: false });

    return () => {
      document.removeEventListener("touchmove", preventDefault);
    };
  }, []); */

  const handleTouchStart = (e) => {
    e.preventDefault(); // Prevent scrolling

    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  };

  const handleTouchMove = (e) => {
    e.preventDefault(); // Prevent scrolling

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

  useEffect(() => {
    switch (swipeDirection) {
      case "Swipe Right":
        sendDeviceCommand("nextTrack");
        break;
      case "Swipe Left":
        sendDeviceCommand("previousTrack");
        break;
      case "Swipe Up":
        sendDeviceCommand("volumeUp");

        break;
      case "Swipe Down":
        sendDeviceCommand("volumeDown");
        break;
      default:
        break;
    }

    if (cornerClick) {
      console.warn("No config found on corner click - Warn");
      //sendDeviceCommand("play");
    }

    if (doubleClick) {
      sendDeviceCommand("playStateHandler");
    }
  }, [swipeDirection, cornerClick, doubleClick, device]);

  return (
    <section
      id="touchPad"
      className="absolute bottom-0 left-0 flex h-full w-full max-w-full min-h-[15.75rem] max-h-52 flex-col items-center justify-center rounded-t-full border-[2px] border-t-[40px] border-r-[40px] border-l-[40px] border-[#c9c9c93e] mx-auto bg-white text-xl font-semibold"
    />
  );
}
