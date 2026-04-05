export default function Header() {
  return (
    <>
      <div className=" flex items-center justify-between p-6">
        <div className=" items-center max-w-2xl">
          <h1 className="text-2xl font-serif px-3 bg-linear-to-r from-blue-700 via-blue-100 to-blue-700 bg-clip-text text-transparent font-semibold">
            Pixeled
          </h1>
        </div>
        <div className="flex max-w-2xl items-center">
          <div className="flex text-white items-center text-lg p-2 gap-6 mr-24">
            <a className="cursor-pointer hover:text-neutral-300" href="#">
              Home
            </a>
            <a className="cursor-pointer hover:text-neutral-300" href="#">
              About
            </a>
            <a className="cursor-pointer hover:text-neutral-300" href="#">
              Services
            </a>
          </div>
          <button className="flex text-lg font-semibold bg-blue-600 text-neutral-100 cursor-pointer rounded-lg  hover:bg-blue-800 px-4 py-2 tracking-tight ">
            Get Started
          </button>
        </div>
      </div>
    </>
  );
}
