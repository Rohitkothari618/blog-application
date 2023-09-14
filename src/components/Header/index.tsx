import { signIn, signOut, useSession } from "next-auth/react";
import React, { useContext } from "react";
import { BsBell } from "react-icons/bs";
import { FiEdit, FiLogOut } from "react-icons/fi";
import { IoReorderThree } from "react-icons/io5";
import { globalContext } from "../../context/GlobalContextProvider";
import Link from "next/link";
import Image from "next/image";

const Header = () => {
  const { data: session, status } = useSession();
  const { setIsWriteModalOpen } = useContext(globalContext);
  return (
    <header className="flex h-20 w-full flex-row  items-center justify-around border-b-[1px] border-gray-200 bg-white">
      <div>
        <IoReorderThree className="text-2xl text-gray-600" />
      </div>
      <Link href={"/"} className="cursor-pointer select-none text-xl font-thin">
        Ultimate Blog App
      </Link>
      {status === "authenticated" ? (
        <div className="flex items-center space-x-4 ">
          <div>
            <BsBell className="text-2xl text-gray-600" />
          </div>
          <div>
            {session.user?.image && session.user.name && (
              <div className="relative h-10 w-10 rounded-full bg-gray-600">
                <Image
                  src={session.user?.image}
                  alt={session.user?.name}
                  className="rounded-full"
                  fill
                />
              </div>
            )}
          </div>
          <div>
            <button
              onClick={() => setIsWriteModalOpen(true)}
              className="flex items-center space-x-3 rounded-md border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
            >
              <div>Write</div>
              <div>
                <FiEdit className="text-gray-600" />
              </div>
            </button>
          </div>
          <div>
            <button
              onClick={async () => await signOut()}
              className="flex items-center space-x-3 rounded-md border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
            >
              <div>Logout</div>
              <div>
                <FiLogOut className="text-gray-600" />
              </div>
            </button>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => signIn()}
            className="flex items-center space-x-3 rounded-md border border-gray-200 px-4 py-2 transition hover:border-gray-900 hover:text-gray-900 "
          >
            {" "}
            Signin
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
