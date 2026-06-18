'use client';
import { RoundedCheckIcon, StarIcon } from '@/public/assets/svg';
import React from 'react';
import { FiMic, FiSend } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import { RxArrowTopRight } from 'react-icons/rx';
import { TbArrowsDiagonalMinimize2 } from 'react-icons/tb';
import { Transition } from './transition';

const features: string[] = [
  'Get immediate responses to questions about platform features and workflows.',
  'Learn how to complete tasks such as placing orders, managing bookings, or updating inventory records.',
  'Access assistance anytime without searching through manuals or documentation.',
  'Help new staff learn the system more quickly with conversational guidance.',
];

function ChatMockup() {
  return (
    <div className="rounded-2xl border border-[#FFFFFF1F] bg-[#FFFFFF0A] backdrop-blur-md p-4 lg:p-5 shadow-custom_shadow_2 w-full">
      {/* header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#FFFFFF14]">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-[#6D4AE0] flex items-center justify-center">
            <StarIcon />
          </div>
          <p className="text-white font-medium text-sm lg:text-base">Hospira AI</p>
        </div>
        <div className="flex items-center space-x-3 text-[#C0AFF7]">
          <TbArrowsDiagonalMinimize2 className="text-lg" />
          <IoClose className="text-lg" />
        </div>
      </div>

      {/* messages */}
      <div className="space-y-4 py-5 text-left">
        <div className="flex flex-col items-end">
          <div className="bg-[#6D4AE0] text-white text-xs lg:text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
            Where do I manage my suppliers?
          </div>
          <span className="text-[10px] text-[#A99BD6] mt-1">1:52pm</span>
        </div>

        <div className="flex flex-col items-start">
          <div className="bg-[#FFFFFF0F] text-[#E7E0FB] text-xs lg:text-sm rounded-2xl rounded-tl-sm px-4 py-3 max-w-[88%] space-y-2">
            <p>You can manage all your suppliers from the Inventory module.</p>
            <p>Go to Inventory → Supplier Management to add suppliers, update contacts, and view purchase history.</p>
          </div>
          <div className="mt-2 flex items-center space-x-2 bg-[#FFFFFF14] rounded-full pl-2 pr-3 py-1 w-fit">
            <RxArrowTopRight className="text-[#C0AFF7] text-sm" />
            <span className="text-[11px] text-[#E7E0FB]">Supplier Manager</span>
          </div>
          <span className="text-[10px] text-[#A99BD6] mt-1">1:52pm</span>
        </div>

        <div className="flex flex-col items-end">
          <div className="bg-[#6D4AE0] text-white text-xs lg:text-sm rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%]">
            Where do I manage my suppliers?
          </div>
          <span className="text-[10px] text-[#A99BD6] mt-1">1:52pm</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="bg-[#FFFFFF0F] rounded-full px-4 py-3 flex items-center space-x-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C0AFF7] animate-bounce [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#C0AFF7] animate-bounce [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#C0AFF7] animate-bounce" />
          </div>
          <span className="text-[11px] text-[#A99BD6]">Thinking...</span>
        </div>
      </div>

      {/* prompt input */}
      <div className="rounded-2xl border border-[#FFFFFF14] bg-[#FFFFFF08] p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-[#C0AFF7] text-xs">
            <StarIcon />
            <span>Today&apos;s prompts</span>
          </div>
          <span className="text-xs text-[#C0AFF7]">
            <span className="text-white font-medium">2 of 10</span> Used
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#A99BD6]">How can i help you today</p>
          <div className="flex items-center space-x-2">
            <button className="h-8 w-8 rounded-full bg-[#FFFFFF1A] flex items-center justify-center text-white" aria-label="voice input">
              <FiMic className="text-sm" />
            </button>
            <button className="h-8 w-8 rounded-full bg-[#6D4AE0] flex items-center justify-center text-white" aria-label="send message">
              <FiSend className="text-sm" />
            </button>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-[#8B7CC0] mt-3">
        HOSPIRA only responds to hospitality and HOBWISE-related questions. Enter to send · Voice available
      </p>
    </div>
  );
}

export default function HospiraAI() {
  return (
    <section className="font-satoshi px-6 lg:px-12 py-8 lg:py-12">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C0B45] via-[#241065] to-[#160a36] px-6 lg:px-14 py-10 lg:py-16">
        <div className="absolute -top-24 -right-24 h-80 w-80 rounded-full bg-[#6D4AE0] opacity-20 blur-3xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center relative">
          <Transition>
            <div className="text-left space-y-6">
              <div className="flex items-center w-fit space-x-2 text-white bg-[#FFFFFF14] border border-[#FFFFFF26] px-4 py-1.5 rounded-full text-xs">
                <StarIcon />
                <p className="font-normal">New · AI Powered</p>
              </div>
              <h2 className="text-[28px] lg:text-[44px] lg:leading-[52px] font-bricolage_grotesque font-bold text-white">
                Meet <span className="text-[#9F7CFE]">Hospira</span> - Your Hospitality AI Assistant
              </h2>
              <p className="text-[#C9BEEC] text-sm lg:text-base">
                Need help navigating the platform? Looking for guidance on placing orders, managing reservations, checking inventory, or using specific
                features? Simply ask.
              </p>
              <div className="space-y-4 pt-2">
                {features.map((each) => (
                  <div key={each} className="flex items-start space-x-3">
                    <RoundedCheckIcon />
                    <p className="text-[#D8D0F2] text-sm lg:text-base">{each}</p>
                  </div>
                ))}
              </div>
            </div>
          </Transition>

          <Transition>
            <ChatMockup />
          </Transition>
        </div>
      </div>
    </section>
  );
}
