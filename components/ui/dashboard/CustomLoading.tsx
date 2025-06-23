"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { companyInfo } from "@/lib/companyInfo";


export const CustomLoading = () => {
    const [messageIndex, setMessageIndex] = useState(0);
    const [showDots, setShowDots] = useState('');
    const [showSlowNetworkMessage, setShowSlowNetworkMessage] = useState(false);
  
    // Network-focused messages that rotate
    const networkMessages = [
      { primary: "Connecting...", secondary: "Establishing secure connection" },
      { primary: "Loading data", secondary: "Fetching from servers..." },
      { primary: "Almost there!", secondary: "Syncing your content" },
      { primary: "Just a moment", secondary: "Optimizing your experience" },
    ];
  
    // Slow network message
    const slowNetworkMessage = {
      primary: "Taking longer than usual",
      secondary: "Your network connection appears to be slow"
    };
  
    // Animate dots for loading effect
    useEffect(() => {
      const dotsInterval = setInterval(() => {
        setShowDots(prev => {
          if (prev === '...') return '';
          return prev + '.';
        });
      }, 500);
  
      return () => clearInterval(dotsInterval);
    }, []);
  
    // Show slow network message after 3 seconds
    useEffect(() => {
      const slowNetworkTimer = setTimeout(() => {
        setShowSlowNetworkMessage(true);
      }, 3000);
  
      return () => clearTimeout(slowNetworkTimer);
    }, []);
  
    // Rotate messages every 3 seconds (but stop rotating if slow network message is shown)
    useEffect(() => {
      if (showSlowNetworkMessage) return;
  
      const messageInterval = setInterval(() => {
        setMessageIndex(prev => (prev + 1) % networkMessages.length);
      }, 3000);
  
      return () => clearInterval(messageInterval);
    }, [showSlowNetworkMessage]);
  
    // Determine which message to show
    const currentMessage = showSlowNetworkMessage ? slowNetworkMessage : networkMessages[messageIndex];
  
    return (
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center bg-white/95">
        {/* Animated logo with network pulse effect */}
        <div className="relative mb-6">
          <div className="animate-bounce">
            <Image
              src="/assets/images/loadingAvatar.svg"
              width={60}
              height={60}
              style={{ objectFit: "cover" }}
              alt={`${companyInfo.name} logo`}
              className="w-[60px] h-[60px] relative z-10"
            />
          </div>
          {/* Network pulse rings - change color for slow network */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-[80px] h-[80px] border-2 rounded-full animate-ping opacity-30 ${
              showSlowNetworkMessage ? 'border-orange-200' : 'border-blue-200'
            }`}></div>
            <div className={`absolute w-[100px] h-[100px] border-2 rounded-full animate-ping opacity-20 animation-delay-200 ${
              showSlowNetworkMessage ? 'border-orange-100' : 'border-blue-100'
            }`}></div>
          </div>
        </div>
  
        {/* Dynamic network-focused messaging */}
        <div className="leading-tight flex flex-col text-center max-w-xs">
          <span className={`font-[600] text-[24px] mb-1 ${
            showSlowNetworkMessage ? 'text-orange-600' : 'text-black'
          }`}>
            {currentMessage.primary}{showDots}
          </span>
          <span className={`text-sm font-[400] mb-4 ${
            showSlowNetworkMessage ? 'text-orange-500' : 'text-[#475367]'
          }`}>
            {currentMessage.secondary}
          </span>
          
          {/* Network activity indicator */}
          <div className="flex text-sm items-center justify-center space-x-1 opacity-60">
            <div className="flex space-x-1">
              <div className={`w-2 h-2 rounded-full animate-pulse ${
                showSlowNetworkMessage ? 'bg-orange-400' : 'bg-blue-400'
              }`}></div>
              <div className={`w-2 h-2 rounded-full animate-pulse animation-delay-200 ${
                showSlowNetworkMessage ? 'bg-orange-400' : 'bg-blue-400'
              }`}></div>
              <div className={`w-2 h-2 rounded-full animate-pulse animation-delay-400 ${
                showSlowNetworkMessage ? 'bg-orange-400' : 'bg-blue-400'
              }`}></div>
            </div>
            <span className={`text-xs ml-2 ${
              showSlowNetworkMessage ? 'text-orange-500' : 'text-[#475367]'
            }`}>
              {showSlowNetworkMessage ? 'Slow connection detected' : 'Connecting to servers'}
            </span>
          </div>
        </div>
  
        <style jsx>{`
          .animation-delay-200 {
            animation-delay: 0.2s;
          }
          .animation-delay-400 {
            animation-delay: 0.4s;
          }
        `}</style>
      </div>
    );
  };