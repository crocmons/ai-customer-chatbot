'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import loader from "@/public/assets/icons/loader.svg";
import { SignedIn, UserButton } from '@clerk/nextjs';
import botAvatar from "@/public/assets/images/bot.svg"
import send from "@/public/assets/icons/send.svg"

export default function Chatbot() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<
    { role: 'user' | 'bot'; content: string; }[]
  >([]);
  const [isFetching, setIsFetching] = useState(false);
  const [copied, setCopied] = useState('');

  const handleCopy = (content: any) => {
    setCopied(content);
    navigator.clipboard.writeText(content);
    setTimeout(() => {
      setCopied('');
    }, 3000);
  };

  const chatParent = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const domNode = chatParent.current;
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight;
    }
  }, [messages]); // Re-run effect whenever messages change

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: query}]);
    setIsFetching(true);

    try {
      const res = await fetch('https://wr0x09iwb6.execute-api.ap-south-1.amazonaws.com/dev/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text_input: query }),
      });

      const data = await res.json();
      // console.log(data)
      if (data.content) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'bot',
            error:'',
            content: data.content,
          },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: 'bot', content: data.message || data.error || 'An error occurred while fetching data.' }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: 'bot', content: 'Something Went Wrong...Please try again later.' }]);
    } finally {
      setIsFetching(false);
      setQuery('');
    }
  };

  return (
    <div className='mt-14 mx-auto w-1/2 bg-feature-bg bg-center bg-no-repeat z-20 overflow-hidden border border-gray-400 rounded-md p-5'>
      
     <h1 className='blue_gradient text-center text-3xl font-medium mx-auto justify-center items-center'>Your Travel Chatbot AI</h1>
     
    
      <div className='chat_container px-2 my-6'>
        <div className='sm:chat_box' ref={chatParent}>
        <div className='glassmorphism md:text-section my-6 gap-6'>
                    <p>Hi, there , How Can I help you?</p>
                  </div>
          {messages.map((message, index) => (
            <div key={index} className={`sm:my-1 sm:px-2 sm:gap-1 flex flex-col my-8`} ref={index === messages.length - 1 ? lastMessageRef : null}>
              <div className='flex gap-2 py-1'>
               {message.role === 'bot' && (
                <>
                <Image 
                      src={botAvatar}
                      alt='avatar'
                      width={34}
                      height={34}
                    />
              
                    <span className='flex font-bold text-center items-center'>Assistant</span>
                    </>
                  )}
              </div>
              {
                isFetching && !message.content ? 
                      <span>......</span>
                 :
             (
                <>
              {message.role === 'bot' && message.content &&  (
                <div className=' glassmorphism mb-4 sm:px-4'>
                  
                  <div className='md:text-section my-6 gap-6'>
                    <p>{message.content}</p>
                  </div>
                  {message.role === 'bot' && (
                    <span className='copy_btn' onClick={() => handleCopy(message.content)}>
                      <Image
                        src={copied === message.content ? '/assets/icons/tick.svg' : '/assets/icons/copy.svg'}
                        alt='copy'
                        width={16}
                        height={16}
                      />
                    </span>
                  )}
                </div>
              )}
              </>
            )}

              {message.role === 'user' && (
                <div className='self-end flex gap-3 shadow-sm'>
                  <p className='bg-blue-500 text-white font-medium text-md w-full px-5 rounded-2xl py-2 md:py-4 break-words break-all transition-all justify-center md:mx-5 flex-wrap text-wrap flex-shrink'>{message.content}</p>
                  <SignedIn>
                      <div className='items-end mx-auto'>
                        <UserButton afterSignOutUrl='/' />
                      </div>
                    </SignedIn>
                </div>
              )}
              
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)} className='flex w-full mx-auto md:mt-40 bg-feature-bg bg-center bg-no-repeat'>
                  
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            name="prompt"
            className="rounded-lg shadow-[rgba(0,_0,_0,_0.26)_0px_3px_8px] transition-all w-full px-2 outline-none cursor-text py-4 border-b border-gray-400 border-l-2"
            placeholder='Ask Your Query & press enter'
          />
          <button type="submit" className='text-md font-semibold rounded-md items-center mx-auto glassmorphism gap-3 cursor-pointer'>
            {isFetching ? <Image src={loader} alt='loader' width={24} height={24} /> : <Image src={send} alt='send' width={24} height={24} />}
          </button>
        </form>
      </div>
    </div>

  );
}
