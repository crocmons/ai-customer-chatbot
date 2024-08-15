import Chatbot from "@/components/Chatbot";
import ReactGA from "react-ga4"

const MEASUREMENT_ID = "G-GS8VXH6H9X"
ReactGA.initialize(MEASUREMENT_ID)

export default function Home() {
  return (
   <main >
    <Chatbot />
   </main>
  );
}
