import Chatbot from "@/components/Chatbot";
import { GoogleAnalytics } from '@next/third-parties/google'

export default function Home() {
  return (
   <main >
    <Chatbot />
    <GoogleAnalytics gaId="G-GS8VXH6H9X" />
   </main>
  );
}
