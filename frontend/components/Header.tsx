import { UserButton, UserProfile } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import React from "react";

const Header = async () => {
  const { userId } = auth();
  return (
    <div className="bg-gray-200 gradient font-semibold text-md">
      <div className="container mx-auto flex items-center justify-between py-4">
        <Link href="/">Home</Link>
        <div>
          {userId ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <div className="flex gap-4 items-center">
              <Link href={"/sign-up"}>Sign Up</Link>
              <Link href={"/sign-in"}>Sign In</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
